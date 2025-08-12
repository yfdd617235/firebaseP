import { useAuth } from '../context/AuthContext';
import { RequestsTable } from "../components/RequestsTable"
import { UserRegister } from "../components/UserRegister"

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-red-500">Admin Dashboard</h1>
      <p className="mt-2">Welcome, {user?.email} — You have admin privileges.</p>
      <UserRegister/>
      <RequestsTable/>
    </div>
  );
}
