// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute
 * - allowedRoles: array de roles permitidos (ej: ['admin', 'provider'])
 * - si allowedRoles es vacío o no se pasa, se permite cualquier usuario autenticado
 *
 * Uso: envolver rutas en App.jsx con:
 * <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
 *   <Route path="/admin" element={<AdminDashboard />} />
 * </Route>
 */
export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, profile, loading } = useAuth();

  // Mientras carga el estado de auth, evitar render prematuro
  if (loading) return <p>Loading...</p>;

  // Si no hay usuario autenticado -> redirigir a login
  if (!user) return <Navigate to="/login" replace />;

  // Si se especificaron roles y el perfil no está permitido -> redirigir a Unauthorized
  if (allowedRoles.length > 0) {
    const userRole = profile?.role || 'client';
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Usuario autenticado y con permiso -> render de la ruta hija
  return <Outlet />;
};
