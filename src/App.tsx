/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { Player, Match } from './types';
import Dashboard from './components/Dashboard';
import ScoreEntry from './components/ScoreEntry';
import MatchHistory from './components/MatchHistory';
import PlayerComparison from './components/PlayerComparison';
import Analytics from './components/Analytics';
import ContestSelector from './components/ContestSelector';
import Login from './components/Login';
import { AuthProvider, useAuth } from './AuthContext';
import { LayoutDashboard, PlusCircle, BarChart3, Trophy, LogOut, Loader2, User, Zap, Swords, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function AppContent() {
  const { user, loading: authLoading, logOut, loginMode } = useAuth();
  const [selectedContest, setSelectedContest] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'compare' | 'entry' | 'charts'>('dashboard');
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedContest) {
      setPlayers([]);
      setMatches([]);
      return;
    }

    setLoading(true);
    // Listen to players in specific contest
    const qPlayers = query(collection(db, `contests/${selectedContest.id}/players`), orderBy('totalScore', 'desc'));
    const unsubPlayers = onSnapshot(qPlayers, (snapshot) => {
      const playerList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player));
      setPlayers(playerList);
    }, (error) => {
      console.error("Player listener error:", error);
    });

    // Listen to matches in specific contest
    const qMatches = query(collection(db, `contests/${selectedContest.id}/matches`), orderBy('matchNumber', 'desc'));
    const unsubMatches = onSnapshot(qMatches, (snapshot) => {
      const matchList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
      setMatches(matchList);
      setLoading(false);
    }, (error) => {
      console.error("Match listener error:", error);
      if (error.code === 'permission-denied') {
        // Handle gracefully
      }
    });

    return () => {
      unsubPlayers();
      unsubMatches();
    };
  }, [selectedContest, user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (!selectedContest) {
    return (
      <div className="min-h-screen bg-slate-950 relative overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/2 -right-40 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
        <ContestSelector onSelect={setSelectedContest} />
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Leaderboard', icon: LayoutDashboard },
    { id: 'history', label: 'History', icon: Zap },
    { id: 'compare', label: 'Versus', icon: Swords },
    { id: 'entry', label: 'Match Entry', icon: PlusCircle, adminOnly: true },
    { id: 'charts', label: 'Analytics', icon: BarChart3 },
  ];

  const isAdmin = loginMode === 'admin' && (selectedContest.creatorId === user.uid || user.email === 'bhavanspatil2004@gmail.com');

  const filteredTabs = tabs.filter(t => !t.adminOnly || isAdmin);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500/30 overflow-hidden relative">
      {/* Background Blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 -right-40 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedContest(null)}>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">{selectedContest.name}</h1>
                <p className="text-slate-400 text-[10px] uppercase tracking-widest font-medium">
                   {isAdmin ? 'Administrator Mode' : 'Spectator Access'}
                </p>
              </div>
            </div>
            
            <nav className="flex items-center gap-1 sm:gap-4">
              {filteredTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${
                      activeTab === tab.id 
                        ? 'bg-white text-slate-950 shadow-lg' 
                        : 'text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
              
              <button
                onClick={logOut}
                className="p-2.5 rounded-full bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/5"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-500">Syncing Arena Data</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <Dashboard players={players} matches={matches} onBack={() => setSelectedContest(null)} contestName={selectedContest.name} />}
              {activeTab === 'history' && <MatchHistory matches={matches} />}
              {activeTab === 'compare' && <PlayerComparison players={players} matches={matches} />}
              {activeTab === 'entry' && isAdmin && <ScoreEntry players={players} matches={matches} contestId={selectedContest.id} />}
              {activeTab === 'charts' && <Analytics players={players} matches={matches} />}
            </motion.div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

