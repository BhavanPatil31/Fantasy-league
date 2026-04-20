import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from './firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginMode: 'admin' | 'spectator' | null;
  signIn: (mode: 'admin' | 'spectator') => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginMode, setLoginMode] = useState<'admin' | 'spectator' | null>(null);

  useEffect(() => {
    // Try to restore loginMode from localStorage
    const savedMode = localStorage.getItem('dbc_login_mode') as 'admin' | 'spectator' | null;
    if (savedMode) setLoginMode(savedMode);

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const signIn = async (mode: 'admin' | 'spectator') => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    setLoginMode(mode);
    localStorage.setItem('dbc_login_mode', mode);
  };

  const logOut = async () => {
    await signOut(auth);
    setLoginMode(null);
    localStorage.removeItem('dbc_login_mode');
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginMode, signIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
