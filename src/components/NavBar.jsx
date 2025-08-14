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
            <Link to="/newuser" className="hover:underline">
              New User
            </Link>
            <Link to="/requestform" className="hover:underline">
              Service Request
            </Link>
            <Link to="/requestlist" className="hover:underline">
              Request List
            </Link>
          </>
        );
      case "client":
        return (
          <>
            <Link to="/requestform" className="hover:underline">
              Service Request
            </Link>
            <Link to="/requestlist" className="hover:underline">
              Request List
            </Link>
          </>
        );
      case "provider":
        return (
          <Link to="/requestlist" className="hover:underline">
            Request List
          </Link>
        );
      default:
        return null;
    }
  };

  return (
    <nav className="bg-white fixed top-0 left-0 w-full z-50 border px-4 py-3 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <Link to="/" className="font-bold text-lg">
          Home
        </Link>

        {/* Mientras carga el profile, evitamos flicker mostrando un texto pequeño */}
        {loading ? <span className="text-sm">Loading...</span> : menuItems()}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm mr-2 text-red-500 font-bold">
              {profile?.name || user.email}
            </span>
            <button
              onClick={handleLogout}
              className="border px-3 py-1 rounded hover:bg-red-600"
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
