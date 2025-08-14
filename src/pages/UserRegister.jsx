import { useState, useEffect } from "react";
import { auth, db } from "../config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export const UserRegister = () => {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client"); // Cambiado de "user" a "client"
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const { profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && profile && profile.role !== "admin") {
      setError("Only admins can register new users.");
    }
  }, [profile, loading]);

  const registerUser = async () => {
    setError(null);
    setMessage(null);
    try {
      if (profile?.role !== "admin") {
        setError("Only admins can register new users.");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userData = {
        uid: user.uid, // Incluir uid en el documento
        name,
        company,
        phone,
        address,
        email,
        role,
        createdAt: new Date()
      };

      console.log("Registering user with UID:", user.uid, "Data:", userData); // Depuración

      await setDoc(doc(db, "users", user.uid), userData);

      setMessage("User registered successfully!");
      setName("");
      setCompany("");
      setPhone("");
      setAddress("");
      setEmail("");
      setPassword("");
      setRole("client"); // Cambiado de "user" a "client"
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!profile || profile.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-red-600">Only admins can register new users.</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-lg p-6 bg-white border rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-center">
          Register New User
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border rounded px-3 py-2"
              placeholder="Enter full name"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Company</label>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="border rounded px-3 py-2"
              placeholder="Enter company name"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border rounded px-3 py-2"
              placeholder="Enter phone number"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Address</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="border rounded px-3 py-2"
              placeholder="Enter address"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded px-3 py-2"
              placeholder="Enter email"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border rounded px-3 py-2"
              placeholder="Enter password"
            />
          </div>

          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-sm font-medium">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="client">Client</option> {/* Cambiado de "user" a "client" */}
              <option value="admin">Admin</option>
              <option value="provider">Provider</option>
            </select>
          </div>
        </div>

        <button
          onClick={registerUser}
          className="w-full mt-6 border rounded px-4 py-2 font-medium hover:bg-gray-100"
        >
          Register User
        </button>

        {error && <p className="mt-4 text-sm text-red-600 text-center">{error}</p>}
        {message && (
          <p className="mt-4 text-sm text-green-600 text-center">{message}</p>
        )}
      </div>
    </div>
  );
};