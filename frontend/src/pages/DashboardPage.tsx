import React from 'react';
import { useAuth } from '../context/AuthContext';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';
import { Loader2 } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 dark:from-slate-900 dark:via-gray-900 dark:to-stone-900">
        <div className="relative">
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 rounded-full blur-xl opacity-50 animate-pulse"></div>
          <Loader2 className="relative h-12 w-12 animate-spin text-slate-700 dark:text-slate-300" />
        </div>
        <p className="mt-6 text-sm font-medium text-slate-600 dark:text-slate-400 animate-pulse">
          Chargement de votre espace...
        </p>
      </div>
    );
  }

  if (!user) {
    return null; 
  }

  // CORRECTION: Utiliser la valeur exacte du rôle ('TEACHER')
  if (user.role === 'TEACHER') {
    return <TeacherDashboard />;
  } else {
    return <StudentDashboard />;
  }
};

export default DashboardPage;