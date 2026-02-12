import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, KanbanSquare } from 'lucide-react';
import api from '../services/api';

// Interfaces pour correspondre aux DTOs du backend
interface Sprint {
  id: number;
  name: string;
  sprintNumber: number;
  startDate: string;
  endDate: string;
  status: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  progress: number;
  status: string;
  sprints: Sprint[];
}

// Helper pour les configurations de statut de sprint
const getSprintStatusConfig = (status: string) => {
  switch (status) {
    case 'Actif':
      return { borderColor: 'border-slate-400', bgLight: 'bg-slate-100 dark:bg-slate-700/30', textColor: 'text-slate-800 dark:text-slate-200', gradient: 'from-slate-500 to-slate-600' };
    case 'Terminé':
      return { borderColor: 'border-emerald-400', bgLight: 'bg-emerald-50 dark:bg-emerald-900/20', textColor: 'text-emerald-800 dark:text-emerald-300', gradient: 'from-emerald-500 to-emerald-600' };
    case 'À venir':
      return { borderColor: 'border-gray-400', bgLight: 'bg-gray-100 dark:bg-gray-700/30', textColor: 'text-gray-700 dark:text-gray-300', gradient: 'from-gray-400 to-gray-500' };
    default: // Par défaut ou autre statut
      return { borderColor: 'border-amber-400', bgLight: 'bg-amber-50 dark:bg-amber-900/20', textColor: 'text-amber-800 dark:text-amber-300', gradient: 'from-amber-500 to-amber-600' };
  }
};

const KanbanHubPage: React.FC = () => {
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

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 dark:from-slate-900 dark:via-gray-900 dark:to-stone-900">
        <div className="relative">
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 rounded-full blur-xl opacity-50 animate-pulse"></div>
          <Loader2 className="relative h-12 w-12 animate-spin text-slate-700 dark:text-slate-300" />
        </div>
        <p className="mt-6 text-sm font-medium text-slate-600 dark:text-slate-400 animate-pulse">
          Chargement des projets pour Kanban...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 dark:from-slate-900 dark:via-gray-900 dark:to-stone-900">
        <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 dark:from-slate-900 dark:via-gray-900 dark:to-stone-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-50 mb-2 tracking-tight">
            Centrale Kanban
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Accédez aux tableaux Kanban de tous vos sprints</p>
        </div>
        
        {projects.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full mb-4">
              <KanbanSquare className="h-8 w-8 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium">Vous n'avez encore aucun projet.</p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">Créez-en un pour commencer à utiliser le Kanban !</p>
          </div>
        ) : (
          <div className="space-y-8">
            {projects.map(project => (
              <div key={project.id} className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="w-1 h-6 bg-slate-700 dark:bg-slate-300 mr-3 rounded-full"></div>
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">{project.name}</h2>
                </div>
                
                {project.sprints.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 py-4">Aucun sprint défini pour ce projet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[...project.sprints]
                      .sort((a, b) => a.sprintNumber - b.sprintNumber)
                      .map(sprint => {
                        const statusConfig = getSprintStatusConfig(sprint.status);
                        return (
                          <Link key={sprint.id} to={`/projects/${project.id}/sprints/${sprint.id}/kanban`} className="group block">
                            <div className={`relative p-6 rounded-lg shadow-md border-2 ${statusConfig.borderColor} ${statusConfig.bgLight} overflow-hidden transform hover:-translate-y-1 transition-all duration-300 hover:shadow-xl`}>
                              <div className="flex justify-between items-start mb-4">
                                <h4 className="font-semibold text-lg text-slate-900 dark:text-slate-50">{sprint.name}</h4>
                                <div className={`px-3 py-1 text-xs font-semibold rounded-full ${statusConfig.textColor} border ${statusConfig.borderColor}`}>
                                  {sprint.status}
                                </div>
                              </div>

                              <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Ouvrir le tableau</span>
                                  <KanbanSquare className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors" />
                                </div>
                              </div>

                              <div className={`absolute inset-0 bg-gradient-to-br ${statusConfig.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none rounded-lg`}></div>
                            </div>
                          </Link>
                        );
                      })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanHubPage;