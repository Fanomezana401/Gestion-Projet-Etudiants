import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Book, BarChart2, Bell, Loader2, ArrowRight, Flag, CheckCircle } from 'lucide-react';
import api from '../services/api';

interface Project {
  id: number;
  name: string;
  description: string;
  progress: number;
  status: string;
}

const getStatusConfig = (status?: string) => {
  switch (status) {
    case 'En cours':
      return { bg: 'from-blue-500 to-cyan-500', text: 'En cours', icon: <Flag className="h-4 w-4" /> };
    case 'Terminé':
      return { bg: 'from-green-500 to-emerald-500', text: 'Terminé', icon: <CheckCircle className="h-4 w-4" /> };
    case 'Nouveau':
      return { bg: 'from-gray-400 to-gray-500', text: 'Nouveau', icon: <PlusCircle className="h-4 w-4" /> };
    default:
      return { bg: 'from-yellow-500 to-amber-500', text: 'À faire', icon: <Bell className="h-4 w-4" /> };
  }
};

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [completedTasksCount, setCompletedTasksCount] = useState<number>(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projectsResponse, tasksCountResponse, messagesCountResponse] = await Promise.all([
          api.get('/projects/my-projects'),
          api.get('/tasks/count/completed'),
          api.get('/messages/count/unread')
        ]);

        setProjects(projectsResponse.data);
        setCompletedTasksCount(tasksCountResponse.data.count);
        setUnreadMessagesCount(messagesCountResponse.data.count);
        setError(null);
      } catch (err) {
        setError('Erreur lors de la récupération des données du tableau de bord.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Bonjour, {user?.firstname || 'Utilisateur'} !
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Bienvenue sur votre tableau de bord.</p>
        </div>
        <Link to="/projects/new">
          <button className="flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 transition duration-300 hover:scale-105">
            <PlusCircle className="mr-2 h-5 w-5" />
            Créer un projet
          </button>
        </Link>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl flex items-center transform hover:scale-102 transition-all duration-300">
          <Book className="h-8 w-8 text-blue-500 mr-4" />
          <div>
            <p className="text-gray-600 dark:text-gray-400">Projets Actifs</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {loading ? '...' : projects.filter(p => p.status !== 'Terminé').length}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl flex items-center transform hover:scale-102 transition-all duration-300">
          <BarChart2 className="h-8 w-8 text-green-500 mr-4" />
          <div>
            <p className="text-gray-600 dark:text-gray-400">Tâches Terminées</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{loading ? '...' : completedTasksCount}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl flex items-center transform hover:scale-102 transition-all duration-300">
          <Bell className="h-8 w-8 text-red-500 mr-4" />
          <div>
            <p className="text-gray-600 dark:text-gray-400">Notifications</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{loading ? '...' : unreadMessagesCount}</p>
          </div>
        </div>
      </div>

      {/* Projets */}
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">Mes Projets</h1>
      {loading && (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="ml-4 text-gray-600 dark:text-gray-400">Chargement des projets...</p>
        </div>
      )}
      {error && <p className="text-red-500 text-center">{error}</p>}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {projects.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8 col-span-full">
              Vous n'avez encore aucun projet. Créez-en un pour commencer !
            </p>
          ) : (
            projects.map((project) => {
              const statusConfig = getStatusConfig(project.status);
              return (
                <Link key={project.id} to={`/projects/${project.id}`} className="group block">
                  <div className="relative bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl overflow-hidden transform hover:-translate-y-1 transition-all duration-300 border border-gray-100 hover:border-indigo-400">
                    <div className={`flex items-center justify-between mb-4 p-2 rounded-xl bg-gradient-to-r ${statusConfig.bg} text-white`}>
                      <span className="font-bold text-sm flex items-center gap-1.5">
                        {statusConfig.icon} {statusConfig.text}
                      </span>
                      <ArrowRight className="h-4 w-4 text-white group-hover:translate-x-1 transition" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{project.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{project.description}</p>
                    <div className="relative pt-1 mb-4">
                      <div className="flex mb-2 items-center justify-between">
                        <span className="text-xs font-semibold inline-block text-indigo-600 dark:text-indigo-400">Progression</span>
                        <span className="text-xs font-semibold inline-block text-indigo-600 dark:text-indigo-400">{project.progress}%</span>
                      </div>
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-indigo-200 dark:bg-indigo-900">
                        <div style={{ width: `${project.progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"></div>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-pink-500/0 to-blue-500/0 group-hover:from-purple-500/5 group-hover:via-pink-500/5 group-hover:to-blue-500/5 transition-all duration-300 pointer-events-none rounded-3xl"></div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
