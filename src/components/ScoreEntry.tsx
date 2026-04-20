import React, { useState, useEffect } from 'react';
import { Player, Match, Fixture } from '../types';
import { Save, AlertCircle, CheckCircle2, UserPlus, Zap, Trash2 } from 'lucide-react';
import { collection, addDoc, updateDoc, doc, writeBatch, serverTimestamp, onSnapshot, query, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'motion/react';
import { calculateRankScores } from '../lib/scoreUtils';

interface ScoreEntryProps {
  players: Player[];
  matches: Match[];
  contestId: string;
}

export default function ScoreEntry({ players, matches, contestId }: ScoreEntryProps) {
  const [matchTitle, setMatchTitle] = useState('');
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [playerPoints, setPlayerPoints] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If no players, allow adding them (initial setup)
  const [newPlayerName, setNewPlayerName] = useState('');
  
  const [matchToDelete, setMatchToDelete] = useState<Match | null>(null);

  const handleConfirmDeleteMatch = async () => {
    if (!matchToDelete) return;
    setSubmitting(true);
    try {
      const batch = writeBatch(db);
      
      // 1. Subtract scores from players
      matchToDelete.scores.forEach(score => {
        const playerRef = doc(db, `contests/${contestId}/players`, score.playerId);
        const player = players.find(p => p.id === score.playerId);
        if (player) {
          batch.update(playerRef, {
            totalScore: Math.max(0, player.totalScore - score.rankScore)
          });
        }
      });
      
      // 2. Delete the match document
      const matchDocRef = doc(db, `contests/${contestId}/matches`, matchToDelete.id);
      batch.delete(matchDocRef);
      
      await batch.commit();
      setMatchToDelete(null);
      handleReset();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e.message || 'Deletion failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddPlayer = async () => {
    if (!newPlayerName.trim()) return;
    try {
      await addDoc(collection(db, `contests/${contestId}/players`), {
        name: newPlayerName.trim(),
        totalScore: 0,
        lastMatchScore: 0,
        currentRank: 0
      });
      setNewPlayerName('');
    } catch (e) {
      setError('Failed to add player');
    }
  };

  const handleSelectMatch = (match: Match) => {
    setSelectedMatchId(match.id);
    setMatchTitle(match.matchTitle || `Match ${match.matchNumber}`);
    
    // Map existing scores to the points state
    const points: Record<string, number> = {};
    match.scores.forEach(s => {
      points[s.playerId] = s.pointsScored;
    });
    setPlayerPoints(points);
  };

  const handleReset = () => {
    setSelectedMatchId(null);
    setMatchTitle('');
    setPlayerPoints({});
  };

  const handlePointsChange = (playerId: string, value: string) => {
    const points = parseInt(value) || 0;
    setPlayerPoints(prev => ({ ...prev, [playerId]: points }));
  };

  const handleSubmit = async () => {
    if (!matchTitle.trim()) {
      setError('Please enter a match title (e.g. CSK vs RCB)');
      return;
    }

    if (Object.keys(playerPoints).length < players.length) {
      setError('Please enter points for all players');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // 1. Prepare data
      const scoresToProcess = players.map(p => ({
        playerId: p.id,
        playerName: p.name,
        pointsScored: playerPoints[p.id] || 0
      }));

      // 2. Perform ranking logic locally (Serverless/Static Friendly)
      const processedResults = calculateRankScores(scoresToProcess);

      // 3. Update Firestore (Batch Write)
      const batch = writeBatch(db);
      const existingMatch = selectedMatchId ? matches.find(m => m.id === selectedMatchId) : null;
      
      // Update players
      processedResults.forEach((res: any) => {
        const playerRef = doc(db, `contests/${contestId}/players`, res.playerId);
        const player = players.find(p => p.id === res.playerId);
        if (player) {
          // If updating, find the difference between old and new rank points
          let oldRankScore = 0;
          if (existingMatch) {
            const oldScoreRecord = existingMatch.scores.find(s => s.playerId === res.playerId);
            if (oldScoreRecord) oldRankScore = oldScoreRecord.rankScore;
          }

          batch.update(playerRef, {
            totalScore: Math.max(0, player.totalScore - oldRankScore + res.rankScore),
            lastMatchScore: res.rankScore,
            previousRank: player.currentRank || 0,
            currentRank: res.actualRank
          });
        }
      });

      // Match document update or create
      if (selectedMatchId) {
        const matchDocRef = doc(db, `contests/${contestId}/matches`, selectedMatchId);
        batch.update(matchDocRef, {
          matchTitle: matchTitle.trim(),
          scores: processedResults,
          updatedAt: serverTimestamp()
        });
      } else {
        const matchDocRef = doc(collection(db, `contests/${contestId}/matches`));
        batch.set(matchDocRef, {
          matchNumber: matches.length + 1,
          matchTitle: matchTitle.trim(),
          date: new Date().toISOString(),
          scores: processedResults,
          createdAt: serverTimestamp()
        });
      }

      await batch.commit();
      
      setSuccess(true);
      setMatchTitle('');
      setSelectedMatchId(null);
      setPlayerPoints({});
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] -mr-32 -mt-32"></div>
        
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-3 relative">
          <Save className="w-6 h-6 text-blue-400" />
          Update Match Results
        </h2>
        <p className="text-slate-400 text-xs uppercase tracking-widest mb-8 font-medium">Capture points for all participating players</p>

        <div className="mb-10 p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-[32px] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 blur-[40px] -ml-16 -mt-16"></div>
          <div className="flex justify-between items-center mb-6 relative">
            <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] flex items-center gap-2">
              <Zap className="w-3 h-3" />
              Match Results
            </h3>
            {selectedMatchId && (
              <button 
                onClick={handleReset}
                className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest"
              >
                Reset Form
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
            {matches.length > 0 ? (
              [...matches].reverse().map((match) => (
                <div key={match.id} className="relative group/btn">
                  <button
                    onClick={() => handleSelectMatch(match)}
                    className={`w-full py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                      selectedMatchId === match.id
                        ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20'
                        : 'bg-slate-900/50 text-slate-400 border-white/5 hover:border-white/20 hover:text-slate-200'
                    }`}
                  >
                    {match.matchTitle || `Match ${match.matchNumber}`}
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setMatchToDelete(match);
                    }}
                    className={`absolute -top-2.5 -right-2.5 w-7 h-7 bg-rose-600 text-white rounded-full flex items-center justify-center z-20 shadow-xl hover:bg-rose-500 hover:scale-110 active:scale-95 transition-all outline-none border border-white/20 ${
                      selectedMatchId === match.id ? 'opacity-100' : 'opacity-0 group-hover/btn:opacity-100 sm:opacity-0 sm:group-hover/btn:opacity-100'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center border-2 border-dashed border-white/5 rounded-2xl">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">No match results yet</p>
              </div>
            )}
          </div>
          
          <div className="pt-8 border-t border-white/5">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
              {selectedMatchId ? 'Selected Match Fixture' : 'Enter Match Fixture'}
            </h4>
            <input
              type="text"
              value={matchTitle}
              onChange={(e) => setMatchTitle(e.target.value)}
              placeholder="Match Name (e.g. MI vs KKR)"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 placeholder:text-slate-700 focus:outline-none focus:border-blue-500/50 transition-all text-sm font-bold text-slate-100"
            />
          </div>
        </div>

        {players.length < 8 && (
          <div className="mb-8 p-6 bg-purple-500/5 backdrop-blur-md border border-purple-500/20 rounded-2xl relative">
            <h3 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-4">Registration • {players.length} / 8 Players</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="New Player Name..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 transition-all text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}
              />
              <button 
                onClick={handleAddPlayer}
                className="bg-white text-slate-950 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition-colors flex items-center gap-2"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>
        ) }

        <div className="space-y-3 relative">
          <div className="grid grid-cols-12 gap-4 px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <div className="col-span-8">Player Identification</div>
            <div className="col-span-4 text-right">Points Scored</div>
          </div>
          
          {players.map((player) => (
            <div key={player.id} className="grid grid-cols-12 gap-4 items-center p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-white/[0.08] transition-all group">
              <div className="col-span-8 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] font-bold text-slate-500 group-hover:border-white/30 transition-colors">
                  {player.name.substring(0, 2).toUpperCase()}
                </div>
                <span className="font-semibold text-slate-200">{player.name}</span>
              </div>
              <div className="col-span-4">
                <input
                  type="number"
                  value={playerPoints[player.id] || ''}
                  onChange={(e) => handlePointsChange(player.id, e.target.value)}
                  placeholder="0"
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-right font-mono font-bold text-slate-100 focus:outline-none focus:border-blue-500/50 focus:bg-black transition-all"
                />
              </div>
            </div>
          ))}

          {players.length > 0 && (
            <div className="pt-8 flex flex-col gap-4">
              {error && (
                <div className="flex items-center gap-3 text-rose-400 bg-rose-400/5 backdrop-blur-md border border-rose-400/20 p-4 rounded-2xl text-xs font-medium">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-3 text-emerald-400 bg-emerald-400/5 backdrop-blur-md border border-emerald-400/20 p-4 rounded-2xl text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  Match validation successful. Scores integrated into leaderboard.
                </div>
              )}
              <button
                disabled={submitting}
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-5 rounded-2xl font-bold text-sm uppercase tracking-[0.2em] hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 mt-4"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Finalize Match Results
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Match Deletion Modal */}
      {matchToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-white/10 rounded-[40px] p-10 w-full max-w-md shadow-2xl text-center"
          >
             <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-400">
               <Trash2 className="w-8 h-8" />
             </div>
             <h3 className="text-2xl font-bold mb-2 text-white">Delete Match?</h3>
             <p className="text-slate-400 text-sm mb-8">This will permanently remove <span className="text-white font-bold">"{matchToDelete.matchTitle || `Match ${matchToDelete.matchNumber}`}"</span> and roll back all associated player scores. This cannot be undone.</p>
             
             <div className="flex gap-3">
               <button 
                 onClick={() => setMatchToDelete(null)}
                 className="flex-1 px-6 py-4 rounded-xl text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all"
               >
                 Go Back
               </button>
               <button 
                 onClick={handleConfirmDeleteMatch}
                 className="flex-1 bg-rose-600 text-white px-6 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-rose-500 transition-all shadow-lg shadow-rose-600/20"
               >
                 Confirm Delete
               </button>
             </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
