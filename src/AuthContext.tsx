import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth } from './firebase';

// Initialize persistence
setPersistence(auth, browserLocalPersistence).catch(err => {
  console.error("Persistence error:", err);
});

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginMode: 'admin' | 'spectator' | null;
  error: string | null;
  signIn: (mode: 'admin' | 'spectator', useRedirect?: boolean) => Promise<void>;
  logOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginMode, setLoginMode] = useState<'admin' | 'spectator' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to restore loginMode from localStorage
    const savedMode = localStorage.getItem('dbc_login_mode') as 'admin' | 'spectator' | null;
    if (savedMode) setLoginMode(savedMode);

    // Check for redirect result
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        // Result is handled by onAuthStateChanged
      }
    }).catch(err => {
      console.error("Redirect error:", err);
      setError("Redirect Login Failed: " + err.message);
    });

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    }, (err) => {
      console.error("Auth state change error:", err);
      setError(err.message);
      setLoading(false);
    });
    return unsub;
  }, []);

  const signIn = async (mode: 'admin' | 'spectator', useRedirect = false) => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      
      // Persist the intended mode before redirect if needed
      if (useRedirect) {
        localStorage.setItem('dbc_login_mode', mode);
        await signInWithRedirect(auth, provider);
        return;
      }

      await signInWithPopup(auth, provider);
      setLoginMode(mode);
      localStorage.setItem('dbc_login_mode', mode);
    } catch (err: any) {
      console.error("Sign in error:", err);
      if (err.code === 'auth/unauthorized-domain') {
        setError("Domain Not Authorized: Please add your Vercel URL to authorized domains in Firebase Console.");
      } else if (err.code === 'auth/popup-blocked') {
        setError("Popup Blocked: Browser blocked the login. Retrying with Redirect...");
        // Auto-fallback
        localStorage.setItem('dbc_login_mode', mode);
        const provider = new GoogleAuthProvider();
        await signInWithRedirect(auth, provider);
      } else {
        setError(err.message || "Failed to sign in");
      }
    }
  };

  const logOut = async () => {
    await signOut(auth);
    setLoginMode(null);
    localStorage.removeItem('dbc_login_mode');
    setError(null);
  };

  const clearError = () => setError(null);

  const contextValue = React.useMemo(() => ({
    user, loading, loginMode, error, signIn, logOut, clearError
  }), [user, loading, loginMode, error]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
