import { Route, Routes } from 'react-router-dom';
import GuardedRoute from './components/GuardedRoute.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import ProjectsAdmin from './pages/admin/ProjectsAdmin.jsx';
import BlogsAdmin from './pages/admin/BlogsAdmin.jsx';
import RequestsAdmin from './pages/admin/RequestsAdmin.jsx';
import SubscribersAdmin from './pages/admin/SubscribersAdmin.jsx';
import UsersAdmin from './pages/admin/UsersAdmin.jsx';
import AboutAdmin from './pages/admin/AboutAdmin.jsx';
import PlansAdmin from './pages/admin/PlansAdmin.jsx';
import FilesAdmin from './pages/admin/FilesAdmin.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import ProjectDetailPage from './pages/ProjectDetailPage.jsx';
import BlogsPage from './pages/BlogsPage.jsx';
import BlogDetailPage from './pages/BlogDetailPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/projects/:slug" element={<ProjectDetailPage />} />
      <Route path="/blogs" element={<BlogsPage />} />
      <Route path="/blog/:slug" element={<BlogDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <GuardedRoute>
            <AdminLayout />
          </GuardedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<GuardedRoute permission={{ resource: 'projects', action: 'READ' }}><ProjectsAdmin /></GuardedRoute>} />
        <Route path="blogs" element={<GuardedRoute permission={{ resource: 'blogs', action: 'READ' }}><BlogsAdmin /></GuardedRoute>} />
        <Route path="requests" element={<GuardedRoute permission={{ resource: 'requests', action: 'READ' }}><RequestsAdmin /></GuardedRoute>} />
        <Route path="subscribers" element={<GuardedRoute permission={{ resource: 'subscribers', action: 'READ' }}><SubscribersAdmin /></GuardedRoute>} />
        <Route path="users" element={<GuardedRoute permission={{ resource: 'users', action: 'READ' }}><UsersAdmin /></GuardedRoute>} />
        <Route path="about" element={<GuardedRoute permission={{ resource: 'about', action: 'READ' }}><AboutAdmin /></GuardedRoute>} />
        <Route path="plans" element={<GuardedRoute permission={{ resource: 'plans', action: 'READ' }}><PlansAdmin /></GuardedRoute>} />
        <Route path="files" element={<FilesAdmin />} />
      </Route>
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}