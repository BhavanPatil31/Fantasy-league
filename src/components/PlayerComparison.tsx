import React, { useState, useMemo, useEffect } from 'react';
import { Player, Match } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, TrendingUp, TrendingDown, ChevronRight, Zap, Target, Activity, AlertCircle, Bot, Sparkles, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { getPlayerInsights, ComparisonInsights } from '../services/geminiService';

interface PlayerComparisonProps {
  players: Player[];
  matches: Match[];
}

const TOTAL_SEASON_MATCHES = 74; // Updated as per user request

export default function PlayerComparison({ players, matches }: PlayerComparisonProps) {
  const [playerAId, setPlayerAId] = useState<string | null>(null);
  const [playerBId, setPlayerBId] = useState<string | null>(null);
  const [aiInsights, setAiInsights] = useState<ComparisonInsights | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const playerA = players.find(p => p.id === playerAId);
  const playerB = players.find(p => p.id === playerBId);

  const playerAHistory = useMemo(() => {
    if (!playerA) return [];
    return [...matches]
      .filter(m => m.scores.find(s => s.playerId === playerA.id))
      .reverse()
      .map(m => m.scores.find(s => s.playerId === playerA.id)!.rankScore);
  }, [playerA, matches]);

  const playerBHistory = useMemo(() => {
    if (!playerB) return [];
    return [...matches]
      .filter(m => m.scores.find(s => s.playerId === playerB.id))
      .reverse()
      .map(m => m.scores.find(s => s.playerId === playerB.id)!.rankScore);
  }, [playerB, matches]);

  const comparisonData = useMemo(() => {
    if (!playerA || !playerB) return null;

    const getHistory = (playerId: string) => {
      return [...matches]
        .filter(m => m.scores.find(s => s.playerId === playerId))
        .reverse()
        .map(m => m.scores.find(s => s.playerId === playerId)!.rankScore);
    };

    const historyA = getHistory(playerA.id);
    const historyB = getHistory(playerB.id);

    const matchesRemaining = Math.max(0, TOTAL_SEASON_MATCHES - matches.length);
    const gap = Math.abs(playerA.totalScore - playerB.totalScore);
    const leader = playerA.totalScore >= playerB.totalScore ? playerA : playerB;
    const trailing = leader === playerA ? playerB : playerA;
    
    // Consistency calculation (Standard Deviation approx)
    const getConsistency = (hist: number[]) => {
      if (hist.length === 0) return 0;
      const avg = hist.reduce((a, b) => a + b, 0) / hist.length;
      const variance = hist.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / hist.length;
      return 100 - Math.min(100, Math.sqrt(variance) * 10); // Simple score out of 100
    };

    const chartData = matches.slice(0, 5).reverse().map((m, i) => ({
      name: m.matchTitle || `M${m.matchNumber}`,
      [playerA.name]: m.scores.find(s => s.playerId === playerA.id)?.rankScore || 0,
      [playerB.name]: m.scores.find(s => s.playerId === playerB.id)?.rankScore || 0,
    }));

    return {
      gap,
      leader,
      trailing,
      matchesRemaining,
      neededAvg: matchesRemaining > 0 ? (gap / matchesRemaining).toFixed(1) : 'N/A',
      consistencyA: getConsistency(historyA),
      consistencyB: getConsistency(historyB),
      chartData,
      trendA: historyA.length >= 2 ? historyA[historyA.length - 1] - historyA[historyA.length - 2] : 0,
      trendB: playerBHistory.length >= 2 ? playerBHistory[playerBHistory.length - 1] - playerBHistory[playerBHistory.length - 2] : 0,
      historyA: playerAHistory,
      historyB: playerBHistory,
    };
  }, [playerA, playerB, matches, playerAHistory, playerBHistory]);

  const triggerAiAnalysis = async () => {
    if (!playerA || !playerB || !comparisonData) return;
    
    setLoadingAi(true);
    try {
      const insights = await getPlayerInsights(
        playerA.name,
        playerB.name,
        comparisonData.historyA,
        comparisonData.historyB,
        comparisonData.matchesRemaining,
        comparisonData.gap,
        comparisonData.neededAvg
      );
      setAiInsights(insights);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    // Reset AI insights when players change
    setAiInsights(null);
  }, [playerAId, playerBId]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Selector Header */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 sm:p-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/10 blur-[60px] pointer-events-none"></div>
           
           {/* Player A Selection */}
           <div className="flex-1 w-full text-center md:text-right space-y-4">
              <select 
                value={playerAId || ''} 
                onChange={(e) => setPlayerAId(e.target.value)}
                className="w-full max-w-xs bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold appearance-none cursor-pointer hover:border-blue-500/50 transition-all text-center md:text-right"
              >
                <option value="" disabled>Select Player 1</option>
                {players.filter(p => p.id !== playerBId).map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {playerA && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex md:flex-row-reverse items-center gap-4 justify-center md:justify-start">
                   <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-2xl font-black text-blue-400">
                     {playerA.name[0]}
                   </div>
                   <div className="text-right">
                      <p className="text-2xl font-black text-white">{playerA.totalScore} Pts</p>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-blue-500">Active Challenger</p>
                   </div>
                </motion.div>
              )}
           </div>

           {/* VS Badge */}
           <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-full bg-slate-900 border-2 border-white/10 flex items-center justify-center shadow-2xl relative z-10">
                 <Swords className="w-6 h-6 text-slate-500" />
              </div>
              <div className="absolute inset-0 bg-blue-500/20 blur-[20px] rounded-full scale-150 animate-pulse"></div>
           </div>

           {/* Player B Selection */}
           <div className="flex-1 w-full text-center md:text-left space-y-4">
              <select 
                value={playerBId || ''} 
                onChange={(e) => setPlayerBId(e.target.value)}
                className="w-full max-w-xs bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold appearance-none cursor-pointer hover:border-purple-500/50 transition-all text-center md:text-left"
              >
                <option value="" disabled>Select Player 2</option>
                {players.filter(p => p.id !== playerAId).map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {playerB && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 justify-center md:justify-start">
                   <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-2xl font-black text-purple-400">
                     {playerB.name[0]}
                   </div>
                   <div>
                      <p className="text-2xl font-black text-white">{playerB.totalScore} Pts</p>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-purple-500">Active Challenger</p>
                   </div>
                </motion.div>
              )}
           </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!comparisonData ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white/5 rounded-[40px] border border-dashed border-white/10"
          >
             <Swords className="w-12 h-12 text-slate-700 mx-auto mb-4" />
             <p className="text-slate-500 uppercase tracking-widest font-bold text-xs italic">Select two warriors to begin performance profiling</p>
          </motion.div>
        ) : (
          <motion.div 
            key={`${playerAId}-${playerBId}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Visual Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {/* Consistency Card */}
               <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-[32px] p-8">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                    <Activity className="w-3 h-3 text-emerald-400" /> Consistency Index
                  </h3>
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                           <span className="text-blue-400">{playerA?.name}</span>
                           <span className="text-white">{Math.round(comparisonData.consistencyA)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                           <motion.div initial={{ width: 0 }} animate={{ width: `${comparisonData.consistencyA}%` }} className="h-full bg-blue-500" />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                           <span className="text-purple-400">{playerB?.name}</span>
                           <span className="text-white">{Math.round(comparisonData.consistencyB)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                           <motion.div initial={{ width: 0 }} animate={{ width: `${comparisonData.consistencyB}%` }} className="h-full bg-purple-500" />
                        </div>
                     </div>
                  </div>
               </div>

               {/* Relative Performance Chart */}
               <div className="lg:col-span-2 bg-white/5 backdrop-blur-lg border border-white/10 rounded-[32px] p-8">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Recent Match Pts Comparison</h3>
                  <div className="h-48 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={comparisonData.chartData}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                           <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                           <YAxis hide />
                           <Tooltip 
                              cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                              contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                           />
                           <Bar dataKey={playerA?.name || ''} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                           <Bar dataKey={playerB?.name || ''} fill="#a855f7" radius={[4, 4, 0, 0]} />
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
               </div>
            </div>

            {/* Gemini AI Intelligence Section */}
            <div className="bg-slate-900 border border-blue-500/20 rounded-[40px] p-8 sm:p-12 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 blur-[100px] pointer-events-none"></div>
               <div className="relative z-10">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                     <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                           <Bot className="w-8 h-8" />
                        </div>
                        <div>
                           <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Gemini Intelligence</h2>
                           <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">Deep Learning Performance Analysis</p>
                        </div>
                     </div>
                     {!aiInsights && !loadingAi && (
                        <button 
                          onClick={triggerAiAnalysis}
                          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 flex items-center gap-2 group/btn"
                        >
                          <Sparkles className="w-4 h-4 group-hover/btn:animate-pulse" />
                          Generate Insights
                        </button>
                     )}
                  </div>

                  {loadingAi && (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                       <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse font-mono">Crunching performance matrices...</p>
                    </div>
                  )}

                  <AnimatePresence>
                    {aiInsights && (
                       <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="grid grid-cols-1 md:grid-cols-2 gap-8"
                       >
                          <div className="space-y-8">
                             <div>
                                <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                  <TrendingUp className="w-3 h-3" /> Trend Analysis
                                </h4>
                                <p className="text-sm text-slate-300 leading-relaxed font-medium">{aiInsights.trends}</p>
                             </div>
                             <div>
                                <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                  <Activity className="w-3 h-3" /> Consistency Evaluation
                                </h4>
                                <p className="text-sm text-slate-300 leading-relaxed font-medium">{aiInsights.consistency}</p>
                             </div>
                          </div>
                          <div className="space-y-8">
                             <div>
                                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                  <Target className="w-3 h-3" /> Projections & Outlook
                                </h4>
                                <p className="text-sm text-slate-300 leading-relaxed font-medium">{aiInsights.projection}</p>
                             </div>
                             <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
                                <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                                  <Zap className="w-3 h-3 text-yellow-400" /> Showdown Summary
                                </h4>
                                <p className="text-sm text-slate-100 italic leading-relaxed font-bold">"{aiInsights.summary}"</p>
                             </div>
                          </div>
                       </motion.div>
                    )}
                  </AnimatePresence>
               </div>
            </div>

            {/* AI Predictions & Insights Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* Future Outlook */}
               <div className="bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-blue-500/20 rounded-[40px] p-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-5">
                    <Target className="w-32 h-32" />
                  </div>
                  <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-8 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Strategic Outlook</h3>
                  
                  <div className="space-y-8">
                     <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-blue-400 border border-white/10">
                           <Zap className="w-6 h-6" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Climb Rate Required</p>
                           <p className="text-xl font-bold text-white tracking-tight">
                              {comparisonData.leader === playerA ? playerB?.name : playerA?.name} needs <span className="text-emerald-400">+{comparisonData.neededAvg} avg</span> league pts
                           </p>
                           <p className="text-[10px] text-slate-400 uppercase font-medium mt-1">To bridge the {comparisonData.gap}pt gap in {comparisonData.matchesRemaining} remaining matches</p>
                        </div>
                     </div>

                     <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-amber-400 border border-white/10">
                           <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Performance Trend</p>
                           <div className="flex gap-4">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-300">{playerA?.name}:</span>
                                {comparisonData.trendA > 0 ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingDown className="w-3 h-3 text-rose-400" />}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-300">{playerB?.name}:</span>
                                {comparisonData.trendB > 0 ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingDown className="w-3 h-3 text-rose-400" />}
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Comparative Insights */}
               <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 flex flex-col justify-center">
                  <div className="space-y-6">
                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                       <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-2 underline decoration-emerald-400/30 underline-offset-4">Competitive Advantage</span>
                       <p className="text-sm text-slate-300 font-medium leading-relaxed">
                         <span className="text-white font-bold">{comparisonData.leader?.name}</span> is currently dominating the showdown with a <span className="text-white font-black">{comparisonData.gap} pt lead</span>. 
                         Their consistency index is <span className={comparisonData.consistencyA >= comparisonData.consistencyB ? 'text-blue-400' : 'text-purple-400'}>superior</span>, making them harder to overtake in short-range fixtures.
                       </p>
                    </div>

                    <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-3xl">
                       <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest block mb-2 underline decoration-rose-400/30 underline-offset-4">Critical Warning</span>
                       <p className="text-sm text-slate-300 font-medium leading-relaxed">
                         <span className="text-white font-bold">{comparisonData.trailing?.name}</span> must improve their average to <span className="text-rose-400 font-black">{comparisonData.neededAvg} pts</span> per match to reclaim the lead before season end. Current trends suggest an immediate strategic pivot is required.
                       </p>
                    </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
