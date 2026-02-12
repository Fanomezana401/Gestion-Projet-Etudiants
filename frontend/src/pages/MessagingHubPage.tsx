import React, { useEffect, useState, useCallback } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import api from '../services/api';
import { Loader2, MessageSquare } from 'lucide-react';
import { useSse } from '../context/SseContext';

interface Project {
  id: number;
  name: string;
}

const MessagingHubPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const { projectUnreadCounts } = useSse();

  const fetchProjects = useCallback(async () => {
    try {
      const response = await api.get<Project[]>('/projects/my-projects');
      setProjects(response.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors de la récupération des projets.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  /* ===== LOADING ===== */
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-full bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 dark:from-slate-900 dark:via-gray-900 dark:to-stone-900">
        <div className="relative">
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 rounded-full blur-xl opacity-50 animate-pulse"></div>
          <Loader2 className="relative h-10 w-10 animate-spin text-slate-700 dark:text-slate-300" />
        </div>
        <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-400 animate-pulse">
          Chargement des conversations...
        </p>
      </div>
    );
  }

  /* ===== ERROR ===== */
  if (error) {
    return (
      <div className="flex justify-center items-center h-full bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 dark:from-slate-900 dark:via-gray-900 dark:to-stone-900">
        <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm font-medium text-red-700 dark:text-red-300">
            {error}
          </p>
        </div>
      </div>
    );
  }

  const isConversationActive = location.pathname.startsWith('/messages/');

  return (
    <div className="flex h-full bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 dark:from-slate-900 dark:via-gray-900 dark:to-stone-900 rounded-xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
      
      {/* ===== SIDEBAR ===== */}
      <aside
        className={`w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-all ${
          isConversationActive ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">
            Conversations
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Projets associés
          </p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-700">
          {projects.length === 0 ? (
            <div className="p-6 text-center text-slate-500 dark:text-slate-400">
              <p className="text-sm font-medium">
                Vous n'êtes membre d'aucun projet.
              </p>
            </div>
          ) : (
            projects.map(project => {
              const unreadCount = projectUnreadCounts.get(project.id) || 0;

              return (
                <NavLink
                  key={project.id}
                  to={`/messages/${project.id}`}
                  className={({ isActive }) =>
                    `group flex items-center justify-between px-5 py-4 transition-all ${
                      isActive
                        ? 'bg-slate-100 dark:bg-slate-700/50'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-semibold shadow">
                      {project.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-slate-50 transition-colors">
                      {project.name}
                    </span>
                  </div>

                  {unreadCount > 0 && (
                    <span className="ml-2 min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full bg-rose-500 text-white text-xs font-semibold animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </NavLink>
              );
            })
          )}
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <main className="flex-1 flex flex-col bg-white dark:bg-slate-800">
        {isConversationActive ? (
          <Outlet />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8" />
            </div>
            <p className="text-sm font-medium">
              Sélectionnez une conversation pour commencer
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default MessagingHubPage;
