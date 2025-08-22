import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserLogin } from './pages/UserLogin';

import { UserRegister } from './pages/UserRegister';
import { RequestForm } from './pages/RequestForm';
import { RequestsTable } from './pages/RequestsTable';

import Unauthorized from './pages/Unauthorized';
import AuthProvider from './context/AuthContext';
import NavBar from './components/NavBar';
import { ResetPassword } from './components/ResetPassword';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      <NavBar/>
        <Routes>
          <Route path="/" element={<UserLogin />} />
          <Route path="/login" element={<UserLogin />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Rutas protegidas para cualquier usuario autenticado */}
          <Route element={<ProtectedRoute />}>
            <Route path="/requestform" element={<RequestForm />} />
            <Route path="/requestlist" element={<RequestsTable />} />
          </Route>

          {/* Rutas solo para admin */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/newuser" element={<UserRegister />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App
