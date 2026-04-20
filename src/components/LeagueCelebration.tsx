import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Medal, Star, Target, TrendingUp, Zap, BarChart3, ChevronRight, Award, Crown } from 'lucide-react';
import { Player, Match } from '../types';

interface LeagueCelebrationProps {
  players: Player[];
  matches: Match[];
  onClose: () => void;
}

export default function LeagueCelebration({ players, matches, onClose }: LeagueCelebrationProps) {
  const winners = useMemo(() => players.slice(0, 3), [players]);
  
  const getInsights = (playerId: string) => {
    const playerScores = matches.map(m => m.scores.find(s => s.playerId === playerId)?.rankScore || 0);
    const actualPoints = matches.map(m => m.scores.find(s => s.playerId === playerId)?.pointsScored || 0);
    
    return {
      peakPoints: Math.max(...actualPoints),
      avgPoints: playerScores.reduce((a, b) => a + b, 0) / matches.length,
      consistency: Math.round((playerScores.filter(s => s > 0).length / matches.length) * 100),
      topFinishes: playerScores.filter(s => s >= 12).length, // 1st or 2nd place finishes
    };
  };

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto bg-slate-950 flex flex-col items-center">
      {/* Cinematic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[160px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[160px] animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0,transparent_100%)]"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl px-4 py-20 flex flex-col items-center gap-16">
        {/* Victory Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-amber-400/10 border border-amber-400/20 rounded-full mb-4">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em]">Season Finale Concluded</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white italic uppercase tracking-tighter leading-none" style={{ fontFamily: 'Verdana, sans-serif' }}>
            HALL OF FAME
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.4em] max-w-lg mx-auto">
            Honoring the legends who dominated the 74-match gauntlet
          </p>
        </motion.div>

        {/* The Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full items-end">
          {/* Silver - 2nd */}
          {winners[1] && (
            <WinnerCard 
              player={winners[1]} 
              rank={2} 
              insights={getInsights(winners[1].id)}
              delay={0.2}
            />
          )}

          {/* Gold - 1st */}
          {winners[0] && (
            <WinnerCard 
              player={winners[0]} 
              rank={1} 
              insights={getInsights(winners[0].id)}
              delay={0}
            />
          )}

          {/* Bronze - 3rd */}
          {winners[2] && (
            <WinnerCard 
              player={winners[2]} 
              rank={3} 
              insights={getInsights(winners[2].id)}
              delay={0.4}
            />
          )}
        </div>

        {/* Close Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          onClick={onClose}
          className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:text-white"
        >
          Return to Arena
        </motion.button>
      </div>
    </div>
  );
}

interface WinnerCardProps {
  player: Player;
  rank: number;
  insights: any;
  delay: number;
}

function WinnerCard({ player, rank, insights, delay }: WinnerCardProps) {
  const isGold = rank === 1;
  const isSilver = rank === 2;
  const isBronze = rank === 3;

  const themes = {
    1: "from-amber-400 via-yellow-500 to-amber-600",
    2: "from-slate-300 via-slate-400 to-slate-500",
    3: "from-orange-700 via-orange-800 to-amber-900"
  };

  const borderThemes = {
    1: "border-amber-400/30",
    2: "border-slate-400/30",
    3: "border-orange-900/30"
  };

  const Icons = {
    1: Crown,
    2: Medal,
    3: Award
  };

  const RankIcon = Icons[rank as keyof typeof Icons];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.8, type: "spring" }}
      className={`relative group ${isGold ? 'order-first md:order-none' : ''}`}
    >
      {/* Halo Effect */}
      <div className={`absolute -inset-4 bg-gradient-to-t ${themes[rank as keyof typeof themes]} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-1000`}></div>

      <div className={`relative bg-slate-900/40 backdrop-blur-xl border ${borderThemes[rank as keyof typeof borderThemes]} rounded-[40px] p-8 overflow-hidden flex flex-col items-center text-center shadow-2xl`}>
        {/* Rank Badge */}
        <div className={`w-16 h-16 bg-gradient-to-br ${themes[rank as keyof typeof themes]} rounded-2xl flex items-center justify-center shadow-xl mb-6 transform -rotate-6 group-hover:rotate-0 transition-transform`}>
          <RankIcon className="w-8 h-8 text-black" />
        </div>

        <div className="space-y-1 mb-8">
          <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${
            isGold ? 'text-amber-400' : isSilver ? 'text-slate-400' : 'text-orange-400'
          }`}>
            {rank === 1 ? 'Ultimate Champion' : rank === 2 ? 'Elite Contender' : 'Bronze Gladiator'}
          </p>
          <h2 className="text-3xl font-black text-white italic transition-all group-hover:scale-105">{player.name}</h2>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Trophy className={`w-4 h-4 ${isGold ? 'text-amber-400' : 'text-slate-500'}`} />
            <span className="text-2xl font-black font-mono tracking-tighter text-white">
              {player.totalScore}
            </span>
          </div>
        </div>

        {/* Detailed Insights */}
        <div className="w-full grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <Target className="w-4 h-4 text-blue-400 mb-2 mx-auto" />
            <p className="text-white text-lg font-black font-mono leading-none">{insights.peakPoints}</p>
            <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mt-1">Peak PR</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <Star className="w-4 h-4 text-yellow-400 mb-2 mx-auto" />
            <p className="text-white text-lg font-black font-mono leading-none">{insights.topFinishes}</p>
            <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mt-1">Podiums</p>
          </div>
        </div>

        <div className="w-full bg-white/5 rounded-2xl p-4 border border-white/5 space-y-3">
          <div className="flex justify-between items-center text-[9px] uppercase tracking-widest font-black">
             <span className="text-slate-500">Stability Rating</span>
             <span className="text-emerald-400">{insights.consistency}%</span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${insights.consistency}%` }}
               transition={{ delay: delay + 1, duration: 1 }}
               className={`h-full bg-gradient-to-r ${themes[rank as keyof typeof themes]}`}
             />
          </div>
          <div className="flex justify-between items-center text-[9px] uppercase tracking-widest font-black">
             <span className="text-slate-500">Efficiency Index</span>
             <span className="text-blue-400">{insights.avgPoints.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
