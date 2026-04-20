import { useState, useMemo } from 'react';
import { Player, Match } from '../types';
import { TrendingUp, TrendingDown, Minus, User, Award, Hash, Zap, Trophy, ChevronLeft, Sparkles, PartyPopper } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PlayerDetailsModal from './PlayerDetailsModal';
import LeagueCelebration from './LeagueCelebration';

interface DashboardProps {
  players: Player[];
  matches: Match[];
  onBack: () => void;
  contestName: string;
}

const TOTAL_SEASON_MATCHES = 74;

export default function Dashboard({ players, matches, onBack, contestName }: DashboardProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const topPlayer = players[0];
  const totalMatches = matches.length;
  
  const isSeasonComplete = totalMatches >= TOTAL_SEASON_MATCHES;

  // Auto-show celebration once when milestone hit (you could persist this in localstorage)
  useMemo(() => {
    if (isSeasonComplete) {
      const shown = localStorage.getItem(`celebration_shown_${contestName}`);
      if (!shown) {
        setShowCelebration(true);
        localStorage.setItem(`celebration_shown_${contestName}`, 'true');
      }
    }
  }, [isSeasonComplete, contestName]);

  return (
    <div className="space-y-8">
      {/* Season Finale Banner */}
      {isSeasonComplete && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border border-amber-400/30 rounded-[32px] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-amber-500/10"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://picsum.photos/seed/celebrate/1920/1080')] opacity-5 mix-blend-overlay"></div>
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-amber-400 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
               <PartyPopper className="w-8 h-8 text-black" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-amber-100 uppercase italic tracking-tighter" style={{ fontFamily: 'Verdana, sans-serif' }}>Season Finale Reached</h2>
              <p className="text-amber-400/60 text-[10px] font-black uppercase tracking-widest">All {TOTAL_SEASON_MATCHES} matches have been recorded. A champion has risen.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowCelebration(true)}
            className="relative z-10 bg-amber-400 hover:bg-amber-300 text-black px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Watch Hall of Fame
          </button>
        </motion.div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Players', value: players.length, icon: User, color: 'text-purple-400' },
          { label: 'Matches Played', value: totalMatches, icon: Zap, color: 'text-blue-400' },
          { label: 'Season Leader', value: topPlayer?.name || 'N/A', icon: Award, color: 'text-amber-400' },
          { label: 'Avg Points/Match', value: totalMatches ? Math.round(players.reduce((acc, p) => acc + p.totalScore, 0) / (players.length * totalMatches)) : 0, icon: Hash, color: 'text-emerald-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/[0.08] transition-all transform hover:-translate-y-1">
            <p className="text-slate-400 text-xs mb-1 uppercase tracking-widest font-semibold">{stat.label}</p>
            <div className="flex items-center justify-between">
              <p className={`text-2xl font-bold ${stat.color === 'text-amber-400' ? stat.color : 'text-slate-100'}`}>
                {stat.value}
              </p>
              <stat.icon className={`w-5 h-5 opacity-40 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ChevronLeft className="w-5 h-5 text-slate-400" />
            </button>
            <h2 className="text-lg font-bold flex items-center gap-3">
              <Trophy className="w-5 h-5 text-amber-400" />
              {contestName} Standings
            </h2>
          </div>
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Season</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                <th className="px-6 py-4">Rank</th>
                <th className="py-4">Player</th>
                <th className="py-4 text-center">Trend</th>
                <th className="py-4 text-center">Current</th>
                <th className="py-4 text-center">Last</th>
                <th className="px-6 py-4 text-right">Total Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {players.map((player, index) => {
                const rank = index + 1;
                const trend = player.previousRank ? player.previousRank - rank : 0;
                const isTop = rank === 1;
                
                // Get current (latest) and last (previous) match results
                const currentMatch = matches[0];
                const lastMatch = matches[1];
                
                const currentMatchData = currentMatch?.scores.find(s => s.playerId === player.id);
                const lastMatchData = lastMatch?.scores.find(s => s.playerId === player.id);

                return (
                  <tr 
                    key={player.id} 
                    onClick={() => setSelectedPlayer(player)}
                    className={`group transition-colors cursor-pointer ${isTop ? 'bg-amber-400/5' : 'hover:bg-white/[0.02]'}`}
                  >
                    <td className="px-6 py-4">
                      <span className={`text-lg font-bold font-mono ${
                        rank === 1 ? 'text-amber-400' : 
                        rank === 2 ? 'text-slate-200' : 
                        rank === 3 ? 'text-slate-400' : 
                        'text-slate-500'
                      }`}>
                        {rank < 10 ? `0${rank}` : rank}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] border transition-colors ${
                          isTop ? 'bg-amber-400/20 border-amber-400/30 text-amber-400' : 'bg-slate-800 border-white/10 text-slate-400 group-hover:border-white/30'
                        }`}>
                          {player.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className={`font-semibold ${isTop ? 'text-slate-100' : 'text-slate-300'}`}>
                          {player.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <div className="flex items-center justify-center gap-1 font-mono text-xs">
                        {trend > 0 ? (
                          <span className="text-emerald-400">▲ {trend}</span>
                        ) : trend < 0 ? (
                          <span className="text-rose-400">▼ {Math.abs(trend)}</span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 text-center font-mono text-sm text-slate-100">
                       {currentMatchData ? currentMatchData.rankScore : '—'}
                    </td>
                    <td className="py-4 text-center font-mono text-sm text-slate-500">
                       {lastMatchData ? lastMatchData.rankScore : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-xl font-bold font-mono tracking-tight transition-colors ${
                        isTop ? 'text-amber-400' : 'text-slate-100'
                      }`}>
                        {player.totalScore}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {players.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/20 font-mono italic">
                    No player data found. Add players via the Entry tab.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Player Details Modal */}
      {selectedPlayer && (
        <PlayerDetailsModal 
          player={selectedPlayer} 
          matches={matches} 
          onClose={() => setSelectedPlayer(null)} 
        />
      )}

      {/* Hall of Fame Celebration */}
      <AnimatePresence>
        {showCelebration && (
          <LeagueCelebration 
            players={players} 
            matches={matches} 
            onClose={() => setShowCelebration(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
