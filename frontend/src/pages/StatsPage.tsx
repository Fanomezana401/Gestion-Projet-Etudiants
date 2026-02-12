import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader2, BarChart2, CheckCircle, Clock, Users, FileText, Folder } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface StatsSummary {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalStudents: number;
  deliverablesToGrade: number;
}

const StatsPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get<StatsSummary>('/stats/summary');
      setStats(response.data);
      setError(null);
    } catch (err) {
      console.error("Erreur lors du chargement des statistiques:", err);
      setError("Impossible de charger les statistiques.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Rafraîchir les stats toutes les 30 secondes pour capturer les changements
    const interval = setInterval(() => {
      fetchStats();
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 dark:from-slate-900 dark:via-gray-900 dark:to-stone-900">
      <div className="relative">
        <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 rounded-full blur-xl opacity-50 animate-pulse"></div>
        <Loader2 className="relative h-12 w-12 animate-spin text-slate-700 dark:text-slate-300" />
      </div>
      <p className="mt-6 text-sm font-medium text-slate-600 dark:text-slate-400 animate-pulse">
        Chargement des statistiques...
      </p>
    </div>
  );

  if (error || !stats) return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 dark:from-slate-900 dark:via-gray-900 dark:to-stone-900">
      <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-700 dark:text-red-300 font-medium">{error || 'Aucune donnée disponible.'}</p>
      </div>
    </div>
  );

  const projectData = [
    { name: 'Actifs', value: stats.activeProjects, color: '#64748b' },
    { name: 'Terminés', value: stats.completedProjects, color: '#22c55e' },
    { name: 'Autres', value: stats.totalProjects - stats.activeProjects - stats.completedProjects, color: '#94a3b8' }
  ];

  const taskData = [
    { name: 'Terminées', value: stats.completedTasks, color: '#22c55e' },
    { name: 'En attente', value: stats.pendingTasks, color: '#f59e0b' }
  ];

  const StatCard = ({ title, value, icon, colorClass }: { title: string, value: number, icon: React.ReactNode, colorClass: string }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 flex items-center transform hover:-translate-y-1 transition duration-300">
      <div className={`p-4 rounded-xl ${colorClass} text-white mr-4 shadow-md`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">{title}</p>
        <p className="text-3xl font-bold text-slate-800 dark:text-white">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 dark:from-slate-900 dark:via-gray-900 dark:to-stone-900 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center">
          <BarChart2 className="mr-3 text-slate-700 dark:text-slate-300" /> Tableau de Bord Statistique
        </h1>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors font-medium text-sm shadow-md"
        >
          Actualiser
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Projets" 
          value={stats.totalProjects} 
          icon={<Folder size={24} />} 
          colorClass="bg-slate-700 dark:bg-slate-600" 
        />
        <StatCard 
          title="Tâches Terminées" 
          value={stats.completedTasks} 
          icon={<CheckCircle size={24} />} 
          colorClass="bg-green-600 dark:bg-green-500" 
        />
        <StatCard 
          title="Tâches en Attente" 
          value={stats.pendingTasks} 
          icon={<Clock size={24} />} 
          colorClass="bg-yellow-600 dark:bg-yellow-500" 
        />
        
        {user?.role === 'TEACHER' ? (
          <StatCard 
            title="Livrables à Corriger" 
            value={stats.deliverablesToGrade} 
            icon={<FileText size={24} />} 
            colorClass="bg-red-600 dark:bg-red-500" 
          />
        ) : (
          <StatCard 
            title="Taux de Complétion" 
            value={stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0} 
            icon={<BarChart2 size={24} />} 
            colorClass="bg-purple-600 dark:bg-purple-500" 
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Graphique Projets */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Répartition des Projets</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {projectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#374151' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graphique Tâches */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">État des Tâches</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#6b7280', fontSize: 14 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={40}>
                  {taskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {user?.role === 'TEACHER' && (
        <div className="mt-8 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Étudiants Supervisés</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Nombre total d'étudiants uniques dans vos projets.</p>
          </div>
          <div className="flex items-center bg-slate-50 dark:bg-slate-900/30 px-6 py-4 rounded-2xl">
            <Users size={32} className="text-slate-600 dark:text-slate-400 mr-4" />
            <span className="text-4xl font-extrabold text-slate-600 dark:text-slate-400">{stats.totalStudents}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsPage;
