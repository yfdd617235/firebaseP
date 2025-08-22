import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, googleProvider } from '../config/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);         // Firebase Auth user
  const [profile, setProfile] = useState(null);   // Firestore user doc (name, role, uid, ...)
  const [loading, setLoading] = useState(true);   // Inicial/loading state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setLoading(true);
      try {
        if (u) {
          setUser(u);
          const userRef = doc(db, 'users', u.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setProfile({
              uid: u.uid, // Incluir uid en profile
              ...userSnap.data()
            });
          } else {
            // Perfil por defecto para nuevos usuarios
            const defaultProfile = {
              uid: u.uid,
              role: 'client',
              email: u.email || '',
              name: u.displayName || '',
              createdAt: new Date()
            };
            await setDoc(userRef, defaultProfile);
            setProfile(defaultProfile);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('AuthContext:onAuthStateChanged error:', err);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signIn = (email, password) => signInWithEmailAndPassword(auth, email, password);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const u = result.user;
      if (!u) return result;

      const userRef = doc(db, 'users', u.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        const newProfile = {
          uid: u.uid,
          name: u.displayName || '',
          email: u.email || '',
          role: 'client',
          createdAt: new Date()
        };
        await setDoc(userRef, newProfile);
        setProfile(newProfile);
      } else {
        setProfile({
          uid: u.uid,
          ...userSnap.data()
        });
      }
      return result;
    } catch (err) {
      console.error('signInWithGoogle error:', err);
      throw err;
    }
  };

  const signOutUser = () => signOut(auth);

  const refreshProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      setProfile(userSnap.exists() ? { uid: user.uid, ...userSnap.data() } : null);
    } catch (err) {
      console.error('refreshProfile error:', err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signInWithGoogle,
    signOutUser,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);