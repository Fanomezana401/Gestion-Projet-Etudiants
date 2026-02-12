import React from 'react';
import { useParams } from 'react-router-dom';
import KanbanBoard from '../components/KanbanBoard';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const KanbanPage: React.FC = () => {
  const { projectId, sprintId } = useParams<{ projectId: string; sprintId: string }>();
  const navigate = useNavigate();

  if (!projectId || !sprintId) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 dark:from-slate-900 dark:via-gray-900 dark:to-stone-900">
        <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-300 font-medium">ID de projet ou de sprint manquant.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 dark:from-slate-900 dark:via-gray-900 dark:to-stone-900 p-6">
      <div className="max-w-full">
        <div className="flex items-center mb-8 pb-4 border-b border-slate-200 dark:border-slate-700">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center justify-center p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 mr-4 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </button>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">Kanban du Sprint</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Gérez vos tâches et suivez leur progression</p>
          </div>
        </div>
        <KanbanBoard projectId={projectId} sprintId={sprintId} />
      </div>
    </div>
  );
};

export default KanbanPage;