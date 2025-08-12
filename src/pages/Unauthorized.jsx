// src/pages/Unauthorized.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center p-4">
      <h1 className="text-4xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
      <p className="text-lg mb-6">
        No tienes permiso para acceder a esta página.
      </p>
      <Link
        to="/login"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Ir al inicio de sesión
      </Link>
    </div>
  );
};

export default Unauthorized;
