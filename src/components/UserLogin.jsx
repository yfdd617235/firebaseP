import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const UserLogin = () => {
  const { user, profile, signIn, signInWithGoogle, signOutUser, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const onLogin = async () => {
    setError(null);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-sm p-6 bg-white border rounded-lg shadow-sm">
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : user ? (
          <div className="space-y-4 text-center">
            <h3 className="text-lg font-semibold">
              Welcome, {profile?.name || user.email}
            </h3>
            <p className="text-sm text-gray-600">
              Role: {profile?.role || 'No role assigned'}
            </p>
            <button
              onClick={() => signOutUser()}
              className="w-full border rounded px-4 py-2 font-medium hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Login</h3>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                className="border rounded px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                className="border rounded px-3 py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            <button
              onClick={onLogin}
              className="w-full border rounded px-4 py-2 font-medium hover:bg-gray-100"
            >
              Login
            </button>

            <div className="relative flex items-center">
              <span className="flex-grow border-t"></span>
              <span className="px-2 text-sm text-gray-500">or</span>
              <span className="flex-grow border-t"></span>
            </div>

            <button
              onClick={() => signInWithGoogle().catch((e) => setError(e.message))}
              className="w-full border rounded px-4 py-2 font-medium hover:bg-gray-100"
            >
              Sign in with Google
            </button>
          </div>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
        )}
      </div>
    </div>
  );
};
