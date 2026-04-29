import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { Trophy, Plus, LogOut, Search, Settings, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

interface Contest {
  id: string;
  name: string;
  creatorId: string;
  createdAt: any;
}

interface ContestSelectorProps {
  onSelect: (contest: Contest) => void;
}

export default function ContestSelector({ onSelect }: ContestSelectorProps) {
  const { user, logOut, loginMode } = useAuth();
  const [contests, setContests] = useState<Contest[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [contestToDelete, setContestToDelete] = useState<Contest | null>(null);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);

  const isAdminMode = loginMode === 'admin';

  useEffect(() => {
    if (!user) return;

    // If Admin mode, only show my contests. If Spectator mode, show everything.
    const q = query(collection(db, 'contests'), orderBy('createdAt', 'desc'));
      
    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contest));
      
      // Filter list if admin mode (show only what I created)
      const filteredList = isAdminMode 
        ? list.filter(c => c.creatorId === user?.uid)
        : list;

      setContests(filteredList);
      setLoading(false);
    }, (error) => {
      console.error("Contest listener error:", {
        code: error.code,
        message: error.message,
        userId: user?.uid,
        email: user?.email
      });
    });
    return unsub;
  }, [isAdminMode, user]);

  const handleCreate = async () => {
    if (!newName.trim() || !user) return;
    try {
      await addDoc(collection(db, 'contests'), {
        name: newName.trim(),
        creatorId: user.uid,
        createdAt: serverTimestamp(),
      });
      setNewName('');
      setShowCreate(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirmDelete = async () => {
    if (!contestToDelete) return;
    try {
      await deleteDoc(doc(db, 'contests', contestToDelete.id));
      setContestToDelete(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight uppercase" style={{ fontFamily: 'Verdana, sans-serif' }}>FANTASY LEAGUE</h2>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Select an active contest or initiate a new league</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10 shadow-lg">
            <img src={user?.photoURL || null} alt="" className="w-6 h-6 rounded-full border border-white/20" />
            <span className="text-xs font-bold text-slate-300">{user?.displayName?.split(' ')[0]}</span>
          </div>
          <button onClick={logOut} className="p-2.5 bg-rose-500/10 text-rose-400 rounded-full hover:bg-rose-500 hover:text-white transition-all">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 bg-white/5 rounded-[32px] animate-pulse border border-white/5"></div>
          ))
        ) : (
          <>
            {/* Create Contest Card - ADMIN ONLY */}
            {isAdminMode && (
          <button 
            onClick={() => setShowCreate(true)}
            className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 flex flex-col items-center justify-center gap-4 hover:bg-white/[0.08] hover:border-blue-500/50 transition-all border-dashed"
          >
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 group-hover:text-blue-400">New League</span>
          </button>
        )}

        {contests.map((contest) => (
          <motion.div
            key={contest.id}
            onClick={() => onSelect(contest)}
            onKeyDown={(e) => e.key === 'Enter' && onSelect(contest)}
            tabIndex={0}
            role="button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 text-left hover:bg-white/[0.08] hover:border-white/20 transition-all relative overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[40px] -mr-16 -mt-16"></div>
            <Trophy className="w-8 h-8 text-amber-400 mb-6 group-hover:scale-110 transition-transform" />
            
            {contest.creatorId === user?.uid && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setContestToDelete(contest);
                }}
                className="absolute top-6 right-6 p-2 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-full transition-all focus:outline-none"
                aria-label="Delete League"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <h3 className="text-xl font-bold text-slate-100 mb-2 truncate">{contest.name}</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              {contest.creatorId === user?.uid ? 'Admininstrator' : 'Spectator'}
            </p>
          </motion.div>
        ))}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {contestToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-white/10 rounded-[40px] p-10 w-full max-w-md shadow-2xl relative overflow-hidden text-center"
          >
             <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-400">
               <Trash2 className="w-8 h-8" />
             </div>
             <h3 className="text-2xl font-bold mb-2">Delete League?</h3>
             <p className="text-slate-400 text-sm mb-8">This will permanently remove <span className="text-white font-bold underline">"{contestToDelete.name}"</span> and all its match data. This action cannot be undone.</p>
             
             <div className="flex gap-3">
               <button 
                 onClick={() => setContestToDelete(null)}
                 className="flex-1 px-6 py-4 rounded-xl text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all"
               >
                 Go Back
               </button>
               <button 
                 onClick={handleConfirmDelete}
                 className="flex-1 bg-rose-600 text-white px-6 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-rose-500 transition-all shadow-lg shadow-rose-600/20"
               >
                 Confirm Delete
               </button>
             </div>
          </motion.div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-white/10 rounded-[40px] p-10 w-full max-w-md shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 blur-[100px] -ml-32 -mt-32"></div>
            <h3 className="text-2xl font-bold mb-2 relative">Initialize League</h3>
            <p className="text-slate-400 text-xs uppercase tracking-widest mb-8 font-medium">Assign a title to your new invitational</p>
            
            <input
              autoFocus
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="League Name (e.g. Pro Open 2024)"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all mb-6"
            />
            
            <div className="flex gap-3 relative">
              <button 
                onClick={() => setShowCreate(false)}
                className="flex-1 px-6 py-4 rounded-xl text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreate}
                className="flex-1 bg-white text-slate-950 px-6 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Create
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
