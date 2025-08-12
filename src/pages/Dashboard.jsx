import { useAuth } from '../context/AuthContext';
import { RequestForm } from "../components/RequestForm"
import { RequestsTable } from '../components/RequestsTable';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-2">Welcome, {user?.email}</p>
      <RequestForm/>
      <RequestsTable/>
    </div>
  );
}
