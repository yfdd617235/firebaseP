// import { useState } from 'react';
// import { useAuth } from '../context/AuthContext';

// export const UserLogin = () => {
//   const { user, profile, signIn, signInWithGoogle, signOutUser, loading } = useAuth();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState(null);

//   const onLogin = async () => {
//     setError(null);
//     try {
//       await signIn(email, password);
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-50">
//       <div className="w-full max-w-sm p-6 bg-white border rounded-lg shadow-sm">
//         {loading ? (
//           <p className="text-center text-gray-500">Loading...</p>
//         ) : user ? (
//           <div className="space-y-4 text-center">
//             <h3 className="text-lg font-semibold">
//               Welcome, {profile?.name || user.email}
//             </h3>
//             <p className="text-sm text-gray-600">
//               Role: {profile?.role || 'No role assigned'}
//             </p>
//             <button
//               onClick={() => signOutUser()}
//               className="w-full border rounded px-4 py-2 font-medium hover:bg-gray-100"
//             >
//               Logout
//             </button>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold">Login</h3>

//             <div className="flex flex-col gap-1">
//               <label className="text-sm font-medium">Email</label>
//               <input
//                 type="email"
//                 className="border rounded px-3 py-2"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="Enter your email"
//               />
//             </div>

//             <div className="flex flex-col gap-1">
//               <label className="text-sm font-medium">Password</label>
//               <input
//                 type="password"
//                 className="border rounded px-3 py-2"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="Enter your password"
//               />
//             </div>

//             <button
//               onClick={onLogin}
//               className="w-full border rounded px-4 py-2 font-medium hover:bg-gray-100"
//             >
//               Login
//             </button>

//             <div className="relative flex items-center">
//               <span className="flex-grow border-t"></span>
//               <span className="px-2 text-sm text-gray-500">or</span>
//               <span className="flex-grow border-t"></span>
//             </div>

//             <button
//               onClick={() => signInWithGoogle().catch((e) => setError(e.message))}
//               className="w-full border rounded px-4 py-2 font-medium hover:bg-gray-100"
//             >
//               Sign in with Google
//             </button>
//           </div>
//         )}

//         {error && (
//           <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
//         )}
//       </div>
//     </div>
//   );
// };

import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';

export const UserLogin = () => {
  const { user, profile, signIn, signInWithGoogle, signOutUser, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const emailInputRef = useRef(null);

  // Map Firebase error codes to user-friendly messages
  const getFriendlyErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Invalid email format. Please enter a valid email.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'auth/invalid-credential':
        return 'Invalid credentials. Please check your email and password.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  // Validate email format
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Validate password (minimum 6 characters, Firebase default)
  const isValidPassword = (password) => password.length >= 6;

  const onLogin = async (e) => {
    e.preventDefault(); // Prevent form submission
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!isValidPassword(password)) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setError(null);
    setIsLoadingAction(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(getFriendlyErrorMessage(err.code));
    } finally {
      setIsLoadingAction(false);
    }
  };

  const onResetPassword = async (e) => {
    e.preventDefault();
    if (!isValidEmail(resetEmail)) {
      setError('Please enter a valid email address for password reset.');
      return;
    }
    setError(null);
    setResetMessage(null);
    setIsLoadingAction(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage('Password reset email sent. Check your inbox.');
      setResetEmail('');
    } catch (err) {
      setError(getFriendlyErrorMessage(err.code));
    } finally {
      setIsLoadingAction(false);
    }
  };

  const toggleResetPassword = () => {
    setIsResettingPassword(!isResettingPassword);
    setError(null);
    setResetMessage(null);
    setResetEmail('');
    if (!isResettingPassword) {
      setTimeout(() => emailInputRef.current?.focus(), 0); // Focus email input
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
            {/* <button
              onClick={() => signOutUser()}
              disabled={isLoadingAction}
              className="w-full border rounded px-4 py-2 font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {isLoadingAction ? 'Logging out...' : 'Logout'}
            </button> */}
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{isResettingPassword ? 'Reset Password' : 'Login'}</h3>

            {isResettingPassword ? (
              <form onSubmit={onResetPassword} className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="reset-email" className="text-sm font-medium">Email</label>
                  <input
                    id="reset-email"
                    type="email"
                    ref={emailInputRef}
                    className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your email"
                    aria-describedby="reset-error"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoadingAction}
                  className="w-full border rounded px-4 py-2 font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {isLoadingAction ? 'Sending...' : 'Send Reset Email'}
                </button>
                <button
                  type="button"
                  onClick={toggleResetPassword}
                  className="w-full text-sm text-blue-600 hover:underline"
                >
                  Back to Login
                </button>
              </form>
            ) : (
              <form onSubmit={onLogin} className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <input
                    id="email"
                    type="email"
                    ref={emailInputRef}
                    className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    aria-describedby="login-error"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="password" className="text-sm font-medium">Password</label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      aria-describedby="login-error"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="mr-2"
                    onChange={(e) => {
                      // Optional: Implement Firebase persistence if needed
                      // e.g., setPersistence(auth, e.target.checked ? browserLocalPersistence : browserSessionPersistence)
                    }}
                  />
                  <label htmlFor="remember-me" className="text-sm text-gray-600">Remember me</label>
                </div>
                <button
                  type="submit"
                  disabled={isLoadingAction}
                  className="w-full border rounded px-4 py-2 font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {isLoadingAction ? 'Logging in...' : 'Login'}
                </button>
                <button
                  type="button"
                  onClick={toggleResetPassword}
                  className="w-full text-sm text-blue-600 hover:underline"
                >
                  Forgot Password?
                </button>
                <div className="relative flex items-center">
                  <span className="flex-grow border-t"></span>
                  <span className="px-2 text-sm text-gray-500">or</span>
                  <span className="flex-grow border-t"></span>
                </div>
                <button
                  type="button"
                  onClick={() => signInWithGoogle().catch((e) => setError(getFriendlyErrorMessage(e.code)))}
                  disabled={isLoadingAction}
                  className="w-full border rounded px-4 py-2 font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {isLoadingAction ? 'Signing in...' : 'Sign in with Google'}
                </button>
              </form>
            )}
          </div>
        )}

        {(error || resetMessage) && (
          <p
            id={error ? 'login-error' : 'reset-error'}
            className={`mt-4 text-sm text-center ${error ? 'text-red-600' : 'text-green-600'}`}
          >
            {error || resetMessage}
          </p>
        )}
      </div>
    </div>
  );
};