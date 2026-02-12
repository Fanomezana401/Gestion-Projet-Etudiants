import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Loader2, Search, Filter, Eye, Edit } from 'lucide-react';

interface Student {
  id: number;
  firstname: string;
  lastname: string;
}

interface Project {
  id: number;
  name: string;
  students: Student[];
  supervisor: string;
  progress: number;
  status: string;
}

const TeacherProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await api.get<Project[]>('/projects/supervised');
        setProjects(response.data);
        setFilteredProjects(response.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Erreur lors de la récupération des projets.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    let result = projects;
    if (statusFilter !== 'all') result = result.filter(p => p.status === statusFilter);
    if (searchTerm) {
      result = result.filter(
        p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             p.students.some(s => `${s.firstname} ${s.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    setFilteredProjects(result);
  }, [searchTerm, statusFilter, projects]);

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-10 w-10 animate-spin text-indigo-600" /></div>;
  if (error) return <div className="text-center p-8 text-red-600">{error}</div>;

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Mes Projets Supervisés</h1>

      {/* Barre de recherche et filtre */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par projet ou étudiant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 pl-10 pr-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="relative w-full md:w-48">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 pl-10 pr-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="Nouveau">Nouveau</option>
            <option value="En cours">En cours</option>
            <option value="Soumis">Soumis</option>
            <option value="Validé">Validé</option>
            <option value="En retard">En retard</option>
          </select>
        </div>
      </div>

      {/* Liste des projets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map(project => (
          <div key={project.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 hover:scale-102 transform transition">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{project.name}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              <span className="font-semibold">Étudiants:</span> {project.students.map(s => `${s.firstname} ${s.lastname}`).join(', ')}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              <span className="font-semibold">Encadrant:</span> {project.supervisor}
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
              <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{project.status}</span>
              <div className="flex gap-2">
                <Link to={`/projects/${project.id}`}>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition flex items-center justify-center">
                    <Eye size={16} />
                  </button>
                </Link>
                <Link to={`/teacher/projects/${project.id}/grade`}>
                  <button className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition flex items-center justify-center">
                    <Edit size={16} />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherProjectsPage;
