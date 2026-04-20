import React, { useState } from 'react';
import { Match } from '../types';
import { Trophy, Calendar, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MatchHistoryProps {
  matches: Match[];
}

export default function MatchHistory({ matches }: MatchHistoryProps) {
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Trophy className="w-12 h-12 text-slate-700 mb-4" />
        <p className="text-slate-500 uppercase tracking-widest font-bold text-xs">No matches recorded in this league yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Match History</h2>
          <p className="text-slate-400 text-xs uppercase tracking-widest font-medium">Detailed breakdown of all seasonal fixtures</p>
        </div>
        <div className="bg-blue-600/10 border border-blue-500/20 px-4 py-2 rounded-xl">
          <span className="text-blue-400 font-bold text-sm tracking-tight">{matches.length} Matches Total</span>
        </div>
      </div>

      <div className="space-y-4">
        {matches.map((match) => (
          <div key={match.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] overflow-hidden transition-all hover:bg-white/[0.08]">
            <button 
              onClick={() => setExpandedMatchId(expandedMatchId === match.id ? null : match.id)}
              className="w-full p-8 text-left flex items-center justify-between gap-6"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex flex-col items-center justify-center border border-white/10 shadow-lg group-hover:border-white/30 transition-colors">
                  <span className="text-[10px] font-black text-slate-500 uppercase">Match</span>
                  <span className="text-xl font-bold text-white">{match.matchNumber}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-100 mb-1">{match.matchTitle || 'Untitled Match'}</h3>
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-500 uppercase tracking-widest">
                     <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(match.date).toLocaleDateString()}</span>
                     <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {match.scores.length} Participants</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="hidden sm:block text-right">
                   <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Top Scorer</p>
                   <p className="font-bold text-white tracking-tight">{[...match.scores].sort((a,b) => b.pointsScored - a.pointsScored)[0].playerName}</p>
                </div>
                <div className="text-slate-400">
                  {expandedMatchId === match.id ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                </div>
              </div>
            </button>

            <AnimatePresence>
              {expandedMatchId === match.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-8 pb-8"
                >
                  <div className="pt-6 border-t border-white/10">
                    <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
                       <div className="col-span-1">Pos</div>
                       <div className="col-span-5">Player</div>
                       <div className="col-span-3 text-right">Fantasy Pts</div>
                       <div className="col-span-3 text-right">Rank Award</div>
                    </div>
                    <div className="space-y-2">
                      {[...match.scores].sort((a,b) => b.pointsScored - a.pointsScored).map((score, idx) => (
                        <div key={score.playerId} className={`grid grid-cols-12 gap-4 items-center p-4 rounded-2xl ${idx < 3 ? 'bg-white/10' : 'bg-white/5'} border border-white/5`}>
                           <div className="col-span-1">
                              <span className={`font-mono font-bold ${idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-700' : 'text-slate-500'}`}>
                                {idx + 1}
                              </span>
                           </div>
                           <div className="col-span-5 flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-400">
                                {score.playerName.substring(0,2).toUpperCase()}
                              </div>
                              <span className="font-bold text-slate-200 text-sm">{score.playerName}</span>
                           </div>
                           <div className="col-span-3 text-right font-mono font-bold text-slate-400">
                              {score.pointsScored}
                           </div>
                           <div className="col-span-3 text-right">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black ${idx === 0 ? 'bg-amber-400/20 text-amber-400' : 'bg-white/5 text-slate-400'}`}>
                                +{score.rankScore}
                              </span>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
