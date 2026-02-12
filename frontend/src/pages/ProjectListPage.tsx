import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Eye, Loader2, Trash2 } from 'lucide-react';
import api from '../services/api';

interface Project {
  id: number;
  name: string;
  description: string;
  progress: number;
  status: string;
}

const getStatusClasses = (status?: string) => {
  switch (status) {
    case 'En cours':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'Terminé':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'Nouveau':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    default:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  }
};

const ProjectListPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/projects/my-projects');
      setProjects(response.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors de la récupération des projets.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: number, projectName: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le projet "${projectName}" ? Cette action est irréversible.`)) return;

    try {
      await api.delete(`/projects/${projectId}`);
      fetchProjects();
    } catch (err) {
      setError('Erreur lors de la suppression du projet.');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="text-gray-600 dark:text-gray-300">Chargement des projets...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center mt-8">{error}</p>;
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">

      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Mes Projets</h1>
          <p className="text-gray-600 dark:text-gray-400">Gérez tous vos projets ici.</p>
        </div>
        <Link to="/projects/new">
          <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white shadow-md hover:bg-indigo-700 transition transform hover:scale-105">
            <PlusCircle className="h-5 w-5" />
            Créer un projet
          </button>
        </Link>
      </div>

      {/* LISTE DES PROJETS */}
      {projects.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-12">
          Vous n'avez encore aucun projet. Créez-en un pour commencer !
        </p>
      ) : (
        <div className="space-y-4">
          {projects.map(project => (
            <div
              key={project.id}
              className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              {/* INFO PROJET */}
              <div className="flex flex-col gap-2">
                <p className="text-lg font-bold text-gray-800 dark:text-white">{project.name}</p>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusClasses(project.status)}`}>
                  {project.status}
                </span>
              </div>

              {/* PROGRESSION & ACTIONS */}
              <div className="flex flex-col md:flex-row md:items-center md:gap-4 w-full md:w-auto">
                {/* Barre de progression */}
                <div className="flex flex-col w-full md:w-64 mr-0 md:mr-4 mb-2 md:mb-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Progression</span>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{project.progress}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-2.5 rounded-full bg-indigo-600"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* BOUTONS */}
                <div className="flex gap-2">
                  <Link to={`/projects/${project.id}`}>
                    <button className="flex items-center gap-2 rounded-xl bg-blue-500 px-3 py-2 text-white font-semibold shadow-md hover:bg-blue-600 transition transform hover:scale-105">
                      <Eye className="h-5 w-5" />
                      Voir
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDeleteProject(project.id, project.name)}
                    className="flex items-center gap-2 rounded-xl bg-red-500 px-3 py-2 text-white font-semibold shadow-md hover:bg-red-600 transition transform hover:scale-105"
                  >
                    <Trash2 className="h-5 w-5" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectListPage;
