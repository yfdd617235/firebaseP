import { useAuth } from '../context/AuthContext';
import { RequestForm } from "../components/RequestForm"
import { RequestsTable } from '../components/RequestsTable';

export default function Dashboard() {
  const { profile } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-2">Welcome, {profile?.email}</p>
      <RequestForm/>
      <RequestsTable/>
    </div>
  );
}
