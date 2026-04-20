import React from 'react';
import { Player, Match } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, TrendingUp, Award, Zap, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface PlayerDetailsModalProps {
  player: Player;
  matches: Match[];
  onClose: () => void;
}

export default function PlayerDetailsModal({ player, matches, onClose }: PlayerDetailsModalProps) {
  // Extract all scores for this player across matches
  const history = matches
    .filter(m => m.scores.find(s => s.playerId === player.id))
    .reverse() // Oldest to newest
    .map(m => {
      const score = m.scores.find(s => s.playerId === player.id)!;
      return {
        matchName: m.matchTitle || `M${m.matchNumber}`,
        points: score.pointsScored,
        rankPoints: score.rankScore,
        date: new Date(m.date).toLocaleDateString([], { month: 'short', day: 'numeric' })
      };
    });

  const totalPoints = history.reduce((acc, h) => acc + h.points, 0);
  const avgPoints = history.length ? Math.round(totalPoints / history.length) : 0;
  const bestPoints = history.length ? Math.max(...history.map(h => h.points)) : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-slate-900 border border-white/10 rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative"
      >
        {/* Header Branding Background */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-[60px] -z-10"></div>
        
        {/* Top Navbar */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl font-black text-white shadow-lg shadow-blue-500/20">
              {player.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">{player.name}</h2>
              <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                <Award className="w-3 h-3 text-amber-400" />
                DBC Professional Seat • Current Rank #{player.currentRank || '--'}
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Stats Column */}
            <div className="lg:col-span-4 space-y-6">
               <div className="grid grid-cols-1 gap-4">
                  {[
                    { label: 'Total Points', value: totalPoints, icon: Activity, color: 'text-blue-400' },
                    { label: 'Match Average', value: avgPoints, icon: Zap, color: 'text-purple-400' },
                    { label: 'Personal Best', value: bestPoints, icon: Award, color: 'text-amber-400' },
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/5 rounded-3xl p-6">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{stat.label}</p>
                       <div className="flex items-center justify-between">
                          <span className="text-2xl font-black font-mono text-white tracking-tight">{stat.value}</span>
                          <stat.icon className={`w-5 h-5 ${stat.color} opacity-30`} />
                       </div>
                    </div>
                  ))}
               </div>

               {/* Recent Form List */}
               <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                  <h3 className="text-[11px] font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    Last 5 Match Scores
                  </h3>
                  <div className="space-y-3">
                     {[...history].reverse().slice(0, 5).map((h, i) => (
                       <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                          <span className="text-xs font-bold text-slate-400">{h.matchName}</span>
                          <span className="font-mono font-bold text-slate-200">{h.points}</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Right Chart Column */}
            <div className="lg:col-span-8 flex flex-col gap-6">
               {/* Performance Chart */}
               <div className="bg-white/5 border border-white/5 rounded-[40px] p-8 flex-1 min-h-[400px] flex flex-col">
                  <div className="flex items-center justify-between mb-10">
                    <div>
                      <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Season Progression</h3>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Real-time Performance Metrics</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={history}>
                        <defs>
                          <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis 
                          dataKey="matchName" 
                          stroke="#475569" 
                          fontSize={10} 
                          tickLine={false}
                          axisLine={false}
                          dy={10}
                        />
                        <YAxis 
                          stroke="#475569" 
                          fontSize={10} 
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(val) => `${val}`}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#0f172a', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '16px',
                            fontSize: '12px'
                          }}
                          itemStyle={{ color: '#fff', padding: '0' }}
                          labelStyle={{ fontWeight: 'bold', marginBottom: '4px', color: '#64748b' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="points" 
                          stroke="#3b82f6" 
                          strokeWidth={4}
                          fillOpacity={1} 
                          fill="url(#colorPoints)" 
                          animationDuration={1500}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
               </div>

               {/* Footnote */}
               <div className="flex items-center gap-4 px-6">
                 <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center">
                         <Activity className="w-3 h-3 text-blue-400" />
                      </div>
                    ))}
                 </div>
                 <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-normal max-w-xs">
                   Performance graph shows raw points scored per fixture, tracking consistency across the DBC Fantasy season.
                 </p>
               </div>
            </div>

            {/* Full History Section */}
            <div className="lg:col-span-12">
               <div className="bg-white/5 border border-white/5 rounded-[40px] p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Full Match History</h3>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Complete Seasonal Breakdown</p>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">
                          <th className="py-4 px-4">Date</th>
                          <th className="py-4">Fixture</th>
                          <th className="py-4 text-right">Raw Score</th>
                          <th className="py-4 px-4 text-right">League Pts</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {[...history].reverse().map((h, i) => (
                          <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="py-4 px-4 text-xs font-mono text-slate-500">{h.date}</td>
                            <td className="py-4 text-sm font-bold text-slate-200">{h.matchName}</td>
                            <td className="py-4 text-right font-mono font-bold text-blue-400">{h.points}</td>
                            <td className="py-4 px-4 text-right font-mono font-bold text-emerald-400">+{h.rankPoints}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
