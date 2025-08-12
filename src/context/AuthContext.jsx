// src/context/AuthContext.jsx
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
  const [profile, setProfile] = useState(null);   // Firestore user doc (name, role, ...)
  const [loading, setLoading] = useState(true);   // Inicial/loading state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setLoading(true);
      try {
        if (u) {
          setUser(u);
          // traer perfil desde Firestore (colección 'users')
          const userRef = doc(db, 'users', u.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setProfile(userSnap.data());
          } else {
            // si no existe doc, dejar profile null (o crear uno si lo deseas)
            setProfile(null);
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

  // wrapper para login con email
  const signIn = (email, password) => signInWithEmailAndPassword(auth, email, password);

  // wrapper para login con Google: si es primera vez, crea doc en 'users'
  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const u = result.user;
    if (!u) return result;

    const userRef = doc(db, 'users', u.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      // crea perfil mínimo para usuarios Google (role por defecto 'client')
      const newProfile = {
        name: u.displayName || '',
        email: u.email || '',
        role: 'client', // o 'user' según tu convención
        createdAt: new Date()
      };
      await setDoc(userRef, newProfile);
      setProfile(newProfile);
    } else {
      setProfile(userSnap.data());
    }

    return result;
  };

  const signOutUser = () => signOut(auth);

  // función para refrescar el profile (útil después de editar datos desde Admin)
  const refreshProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      setProfile(userSnap.exists() ? userSnap.data() : null);
    } catch (err) {
      console.error('refreshProfile error:', err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,            // firebase user object (has email, uid, etc.)
    profile,         // firestore doc data (has name, role, etc.)
    loading,
    signIn,
    signInWithGoogle,
    signOutUser,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook para usar el contexto más fácil
export const useAuth = () => useContext(AuthContext);
