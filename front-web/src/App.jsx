import { Route, Routes } from 'react-router-dom';
import GuardedRoute from './components/GuardedRoute.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AdminPage from './pages/admin/AdminPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <GuardedRoute>
            <AdminPage />
          </GuardedRoute>
        }
      />
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}