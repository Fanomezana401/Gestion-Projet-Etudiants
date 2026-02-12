import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Loader2, Edit, Folder, AlertTriangle, Calendar, FileText, Bell } from 'lucide-react';

// Interfaces
interface Project {
  id: number;
  name: string;
  description: string;
  progress: number;
  status: string;
}

interface Deadline {
  id: number;
  name: string;
  date: string;
  projectName: string;
}

interface Deliverable {
  id: number;
  name: string;
  submittedAt: string;
  projectName: string;
}

interface TeacherStats {
  totalProjects: number;
  lateProjectsCount: number;
  unreadNotifications: number;
}

const TeacherDashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [lateProjects, setLateProjects] = useState<Project[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [
          projectsResponse,
          lateProjectsResponse,
          deadlinesResponse,
          deliverablesResponse,
          statsResponse
        ] = await Promise.all([
          api.get<Project[]>('/teacher/projects'),
          api.get<Project[]>('/teacher/projects/late'),
          api.get<Deadline[]>('/teacher/deadlines/next'),
          api.get<Deliverable[]>('/teacher/deliverables/latest'),
          api.get<TeacherStats>('/teacher/statistics')
        ]);

        setProjects(projectsResponse.data);
        setLateProjects(lateProjectsResponse.data);
        setDeadlines(deadlinesResponse.data);
        setDeliverables(deliverablesResponse.data);
        setStats(statsResponse.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erreur lors de la récupération des données du tableau de bord.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">{error}</div>;
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-full">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
        Tableau de Bord du Professeur
      </h1>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl flex items-center transform hover:scale-102 transition-all duration-300">
          <Folder className="h-8 w-8 text-blue-500 mr-4" />
          <div>
            <p className="text-gray-600 dark:text-gray-400">Projets Supervisés</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats?.totalProjects || 0}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl flex items-center transform hover:scale-102 transition-all duration-300">
          <AlertTriangle className="h-8 w-8 text-red-500 mr-4" />
          <div>
            <p className="text-gray-600 dark:text-gray-400">Projets en Retard</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats?.lateProjectsCount || 0}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl flex items-center transform hover:scale-102 transition-all duration-300">
          <Bell className="h-8 w-8 text-yellow-500 mr-4" />
          <div>
            <p className="text-gray-600 dark:text-gray-400">Notifications</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats?.unreadNotifications || 0}</p>
          </div>
        </div>
      </div>

      {/* Listes de détails */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
            <Calendar className="mr-2" /> Prochaines Deadlines
          </h2>
          <div className="space-y-2">
            {deadlines.map(d => (
              <div key={d.id} className="text-sm text-gray-700 dark:text-gray-300">
                {d.name} ({d.projectName}) - {new Date(d.date).toLocaleDateString()}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
            <FileText className="mr-2" /> Derniers Livrables
          </h2>
          <div className="space-y-2">
            {deliverables.map(d => (
              <div key={d.id} className="text-sm text-gray-700 dark:text-gray-300">
                {d.name} ({d.projectName}) - {new Date(d.submittedAt).toLocaleDateString()}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
            <AlertTriangle className="mr-2" /> Projets en Retard
          </h2>
          <div className="space-y-2">
            {lateProjects.map(p => (
              <div key={p.id} className="text-sm text-gray-700 dark:text-gray-300">{p.name}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Liste des projets supervisés */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Tous les Projets Supervisés</h2>
        <div className="space-y-4">
          {projects.map(project => (
            <div
              key={project.id}
              className="p-4 border dark:border-gray-700 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <div className="mb-4 sm:mb-0">
                <p className="font-bold text-lg text-gray-800 dark:text-white">{project.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{project.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-40">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Progression</span>
                    <span className="text-sm font-semibold text-gray-800 dark:text-white">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
                <Link to="/teacher/grading">
                  <button className="flex items-center bg-green-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-green-600 transition">
                    <Edit className="mr-2 h-5 w-5" />
                    Noter
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
