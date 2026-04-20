import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Shield, User, ArrowRight, Zap, Target, AlertTriangle, XCircle } from 'lucide-react';
import { useAuth } from '../AuthContext';

export default function Login() {
  const { signIn, error, clearError } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[150px]"></div>
      </div>

      <div className="w-full max-w-6xl relative z-10 flex flex-col gap-12">
        {/* Branding Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-[24px] flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/20 mb-6">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white italic uppercase tracking-tighter" style={{ fontFamily: 'Verdana, sans-serif' }}>
            DBC FANTASY
          </h1>
          <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.4em] max-w-md mx-auto leading-relaxed">
            Choose your gateway to the premier DBC gaming arena
          </p>
        </motion.div>

        {/* Global Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -10 }}
              animate={{ height: 'auto', opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -10 }}
              className="max-w-xl mx-auto w-full mb-8"
            >
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-start gap-4 shadow-xl">
                 <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-rose-200 text-xs font-bold uppercase tracking-widest mb-1 italic">Security / Auth Warning</p>
                    <p className="text-rose-400/80 text-[11px] font-medium leading-relaxed mb-3">
                      {error}
                    </p>
                    <button 
                      onClick={() => signIn('spectator', true)}
                      className="text-[9px] font-black uppercase tracking-widest bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 px-3 py-1.5 rounded-lg border border-rose-500/30 transition-all flex items-center gap-2"
                    >
                      <Zap className="w-3 h-3" />
                      Try Redirect Login (Fallback)
                    </button>
                 </div>
                 <button 
                  onClick={clearError}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                 >
                    <XCircle className="w-4 h-4 text-slate-500" />
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dual Login Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
          
          {/* Admin Panel */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-orange-500/10 rounded-[48px] blur-2xl group-hover:opacity-100 opacity-0 transition-opacity"></div>
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[48px] p-10 h-full flex flex-col items-center text-center relative overflow-hidden group-hover:border-rose-500/30 transition-all">
               <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
                 <Shield className="w-48 h-48" />
               </div>
               
               <div className="w-16 h-16 bg-rose-500/20 rounded-2xl flex items-center justify-center text-rose-400 mb-8 border border-rose-500/20 group-hover:scale-110 transition-transform">
                 <Shield className="w-8 h-8" />
               </div>
               
               <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">League Commissioner</h3>
               <p className="text-slate-400 text-sm leading-relaxed mb-10 max-w-[280px]">
                 Administrative access for creating contests, entering match points, and managing player rosters.
               </p>
               
               <div className="mt-auto w-full">
                 <button 
                  onClick={() => signIn('admin')}
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-rose-600/20 group/btn"
                 >
                   Admin Login
                   <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                 </button>
                 <p className="mt-4 text-[9px] text-slate-500 uppercase tracking-widest font-bold">Authorized Personnel Only</p>
               </div>
            </div>
          </motion.div>

          {/* User Panel */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-[48px] blur-2xl group-hover:opacity-100 opacity-0 transition-opacity"></div>
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[48px] p-10 h-full flex flex-col items-center text-center relative overflow-hidden group-hover:border-blue-500/30 transition-all">
               <div className="absolute top-0 left-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
                 <Target className="w-48 h-48" />
               </div>

               <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mb-8 border border-blue-500/20 group-hover:scale-110 transition-transform">
                 <User className="w-8 h-8" />
               </div>
               
               <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">Arena Challenger</h3>
               <p className="text-slate-400 text-sm leading-relaxed mb-10 max-w-[280px]">
                 Spectator and player access. View leaderboards, analyze performance trends, and compare rivals.
               </p>

               <div className="mt-auto w-full">
                 <button 
                  onClick={() => signIn('spectator')}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 group/btn"
                 >
                   Enter Arena
                   <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                 </button>
                 <p className="mt-4 text-[9px] text-slate-500 uppercase tracking-widest font-bold">Open Access • Live Real-time Stats</p>
               </div>
            </div>
          </motion.div>

        </div>

        {/* Footer Info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-6 text-slate-600">
             <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Real-time Data</span>
             </div>
             <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
             <div className="flex items-center gap-2">
                <Target className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Predictive AI</span>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
