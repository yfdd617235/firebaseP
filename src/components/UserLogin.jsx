import { useState, useEffect } from 'react';
import { auth, googleProvider, db } from '../config/firebase';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export const UserLogin = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null);
  const [name, setName] = useState('');

  // Detectar cambios en el usuario logueado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        // Obtener rol desde Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
          setName(userDoc.data().name);
        } else {
          setRole('No role assigned');
        }
      } else {
        setCurrentUser(null);
        setRole(null);
        setName(null);
      }
    });
    return unsubscribe;
  }, []);

  const loginUser = async () => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  const loginWithGoogle = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(err.message);
    }
  };

  const logoutUser = async () => {
    setError(null);
    try {
      await signOut(auth);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto' }}>
      {currentUser ? (
        <>
          <h3>Welcome, {name || currentUser.email}</h3>
          <p>Role: {role}</p>
          <button onClick={logoutUser}>Logout</button>
        </>
      ) : (
        <>
          <h3>Login</h3>
          <input 
            placeholder="Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
          />
          <input 
            placeholder="Password" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
          />
          <button onClick={loginUser}>Login</button>
          <hr />
          <button onClick={loginWithGoogle}>Sign in with Google</button>
        </>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};
