import React, { useContext, useMemo } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useSse } from '../context/SseContext';
import {
  LayoutDashboard,
  Folder,
  ListTodo,
  MessageSquare,
  BarChart2,
  LogOut,
  Mail,
  UserCheck,
  FileCheck,
  Users
} from 'lucide-react';

/* ---------------- NavItem ---------------- */
const NavItem: React.FC<{
  to: string;
  icon: React.ReactNode;
  label: string;
  notificationCount?: number;
}> = ({ to, icon, label, notificationCount }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center py-3 px-4 rounded-lg mb-2 transition-all duration-300 font-medium ${
        isActive
          ? 'bg-slate-700 text-white shadow border border-slate-600'
          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
      }`
    }
  >
    {icon}
    <span className="flex-1 ml-3">{label}</span>

    {notificationCount && notificationCount > 0 && (
      <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
        {notificationCount}
      </span>
    )}
  </NavLink>
);

/* ---------------- Layout ---------------- */
const MainLayout: React.FC = () => {
  const authContext = useContext(AuthContext);
  const { projectUnreadCounts, newInvitation } = useSse();
  const navigate = useNavigate();

  const totalUnreadMessages = useMemo(
    () =>
      Array.from(projectUnreadCounts.values()).reduce(
        (acc, count) => acc + count,
        0
      ),
    [projectUnreadCounts]
  );

  if (!authContext) return null;

  const { user, logout } = authContext;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-100">
      {/* ---------------- Sidebar sombre ---------------- */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col p-6 border-r border-slate-800">
        {/* Logo / titre */}
        <div className="mb-8 pb-6 border-b border-slate-800">
          <h1 className="text-2xl font-semibold tracking-tight">
            <NavLink
              to="/dashboard"
              className="text-white hover:text-slate-300 transition-colors"
            >
              Gestion Projets
            </NavLink>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {user?.role === 'TEACHER'
              ? 'Espace Enseignant'
              : 'Espace Étudiant'}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1">
          <NavItem
            to="/dashboard"
            icon={<LayoutDashboard className="h-5 w-5" />}
            label="Tableau de Bord"
          />

          {user?.role === 'TEACHER' ? (
            <>
              <NavItem
                to="/teacher/projects"
                icon={<UserCheck className="h-5 w-5" />}
                label="Mes Projets"
              />
              <NavItem
                to="/teacher/grading"
                icon={<FileCheck className="h-5 w-5" />}
                label="Correction Livrables"
              />
              <NavItem
                to="/teacher/students"
                icon={<Users className="h-5 w-5" />}
                label="Suivi Étudiants"
              />
              <NavItem
                to="/messages"
                icon={<MessageSquare className="h-5 w-5" />}
                label="Messagerie"
                notificationCount={totalUnreadMessages}
              />
              <NavItem
                to="/invitations"
                icon={<Mail className="h-5 w-5" />}
                label="Invitations"
                notificationCount={newInvitation ? 1 : 0}
              />
            </>
          ) : (
            <>
              <NavItem
                to="/projects"
                icon={<Folder className="h-5 w-5" />}
                label="Mes Projets"
              />
              <NavItem
                to="/tasks"
                icon={<ListTodo className="h-5 w-5" />}
                label="Tâches (Kanban)"
              />
              <NavItem
                to="/messages"
                icon={<MessageSquare className="h-5 w-5" />}
                label="Messagerie"
                notificationCount={totalUnreadMessages}
              />
              <NavItem
                to="/invitations"
                icon={<Mail className="h-5 w-5" />}
                label="Invitations"
                notificationCount={newInvitation ? 1 : 0}
              />
            </>
          )}

          <NavItem
            to="/stats"
            icon={<BarChart2 className="h-5 w-5" />}
            label="Statistiques"
          />
        </nav>

        {/* Déconnexion */}
        <div className="mt-auto pt-6 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center py-3 px-4 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition font-medium"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ---------------- Contenu clair ---------------- */}
      <main className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 dark:from-slate-900 dark:via-gray-900 dark:to-stone-900">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
