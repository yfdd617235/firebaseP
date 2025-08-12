// src/components/NavBar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NavBar = () => {
  const { user, profile, loading, signOutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOutUser();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // obtener role desde profile (si existe)
  const role = profile?.role;

  const menuItems = () => {
    if (!role) return null;

    switch (role) {
      case "admin":
        return (
          <>
            <Link to="/admin" className="hover:underline">
              Admin Dashboard
            </Link>
            <Link to="/dashboard" className="hover:underline">
              User Dashboard
            </Link>
          </>
        );
      case "user":
        return (
          <Link to="/dashboard" className="hover:underline">
            Dashboard
          </Link>
        );
      case "provider":
        return (
          <Link to="/dashboard" className="hover:underline">
            Provider Dashboard
          </Link>
        );
      default:
        return null;
    }
  };

  return (
    <nav className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <Link to="/" className="font-bold text-lg">
          MiApp
        </Link>

        {/* Mientras carga el profile, evitamos flicker mostrando un texto pequeño */}
        {loading ? <span className="text-sm">Loading...</span> : menuItems()}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm mr-2">
              {profile?.name || user.email}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-200"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
