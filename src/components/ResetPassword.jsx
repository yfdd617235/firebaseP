import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '../config/firebase';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleReset = async (e) => {
    e.preventDefault();
    const oobCode = searchParams.get('oobCode');
    if (!oobCode) {
      setError('Invalid or missing reset code.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setMessage('Password reset successfully. You can now log in.');
    } catch (err) {
      setError('Error resetting password: ' + err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-sm p-6 bg-white border rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold">Reset Password</h3>
        <form onSubmit={handleReset} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="new-password" className="text-sm font-medium">New Password</label>
            <input
              id="new-password"
              type="password"
              className="border rounded px-3 py-2"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="confirm-password" className="text-sm font-medium">Confirm Password</label>
            <input
              id="confirm-password"
              type="password"
              className="border rounded px-3 py-2"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>
          <button
            type="submit"
            className="w-full border rounded px-4 py-2 font-medium bg-blue-600 text-white hover:bg-blue-700"
          >
            Reset Password
          </button>
        </form>
        {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
};