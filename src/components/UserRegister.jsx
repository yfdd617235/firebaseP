import { useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const UserRegister = () => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');

  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Detectar usuario actual y rol
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        setCurrentUserRole(userDoc.exists() ? userDoc.data().role : null);
      } else {
        setCurrentUser(null);
        setCurrentUserRole(null);
      }
    });
    return unsubscribe;
  }, []);

  const registerUser = async () => {
    setError(null);
    setMessage(null);
    try {
      if (currentUserRole !== 'admin') {
        setError('Only admins can register new users.');
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        name,
        company,
        phone,
        address,
        email,
        role
      });

      setMessage('User registered successfully!');
      setName('');
      setCompany('');
      setPhone('');
      setAddress('');
      setEmail('');
      setPassword('');
      setRole('user');

    } catch (err) {
      setError(err.message);
    }
  };

  if (!currentUser || currentUserRole !== 'admin') {
    return <p style={{ color: 'red' }}>Only admins can register new users.</p>;
  }

  return (
    <div style={{ maxWidth: 400, margin: 'auto' }}>
      <h3>Register new user</h3>
      <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
      <input placeholder="Company" value={company} onChange={e => setCompany(e.target.value)} />
      <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
      <input placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} />
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <select value={role} onChange={e => setRole(e.target.value)}>
        <option value="user">User</option>
        <option value="admin">Admin</option>
        <option value="provider">Provider</option>
      </select>
      <button onClick={registerUser}>Register User</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}
    </div>
  );
};
