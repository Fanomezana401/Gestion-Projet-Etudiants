import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MainLayout from './layouts/MainLayout';
import ProjectListPage from './pages/ProjectListPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import KanbanPage from './pages/KanbanPage';
import KanbanHubPage from './pages/KanbanHubPage';
import StatsPage from './pages/StatsPage';
import CreateProjectPage from './pages/CreateProjectPage';
import MessagePage from './pages/MessagePage';
import MessagingHubPage from './pages/MessagingHubPage';
import InvitationsPage from './pages/InvitationsPage';
import TeacherProjectsPage from './pages/TeacherProjectsPage';
import ProjectGradingPage from './pages/ProjectGradingPage';
import TeacherGradingPage from './pages/TeacherGradingPage'; // Importer la nouvelle page
import TeacherStudentsPage from './pages/TeacherStudentsPage'; // Importer la nouvelle page
import { AuthContext } from './context/AuthContext';
import './index.css';

const App: React.FC = () => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    return <div style={{ padding: '2rem', fontFamily: 'sans-serif', textAlign: 'center' }}>Chargement du contexte d'authentification...</div>;
  }

  const { isAuthenticated } = authContext;

  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/" element={!isAuthenticated ? <HomePage /> : <Navigate to="/dashboard" />} />
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" />} />

      {/* Routes protégées */}
      <Route 
        path="/" 
        element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="projects" element={<ProjectListPage />} />
        <Route path="projects/new" element={<CreateProjectPage />} />
        <Route path="projects/:projectId" element={<ProjectDetailPage />} />
        <Route path="projects/:projectId/sprints/:sprintId/kanban" element={<KanbanPage />} />
        
        <Route path="messages" element={<MessagingHubPage />}>
          <Route path=":projectId" element={<MessagePage />} />
        </Route>
        
        <Route path="tasks" element={<KanbanHubPage />} />
        <Route path="invitations" element={<InvitationsPage />} />
        <Route path="stats" element={<StatsPage />} />

        {/* Routes pour le professeur */}
        <Route path="teacher/projects" element={<TeacherProjectsPage />} />
        <Route path="teacher/projects/:projectId/grade" element={<ProjectGradingPage />} />
        <Route path="teacher/grading" element={<TeacherGradingPage />} />
        <Route path="teacher/students" element={<TeacherStudentsPage />} />
      </Route>

      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} />} />
    </Routes>
  );
};

export default App;
