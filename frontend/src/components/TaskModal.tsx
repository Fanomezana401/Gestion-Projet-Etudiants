import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, Trash2, CheckSquare, Square } from 'lucide-react';
import api from '../services/api';

interface Subtask {
  id: number;
  title: string;
  isCompleted: boolean;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  sprintId: number;
  assignedUserId?: number;
  prerequisiteTaskIds?: Set<number>;
  subtasks?: Subtask[];
}

interface User {
  id: number;
  firstname: string;
  lastname: string;
}

interface TaskModalProps {
  task?: Task | null;
  allTasks: Task[];
  projectMembers: User[];
  onClose: () => void;
  onUpdate: (updatedTask: Task) => void;
  onCreate: (newTask: Task) => void;
  sprintId: number;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, allTasks, projectMembers, onClose, onUpdate, onCreate, sprintId }) => {
  const isCreating = !task;
  const [editingTask, setEditingTask] = useState<Partial<Task>>({});
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showPrerequisiteSelector, setShowPrerequisiteSelector] = useState(false);

  useEffect(() => {
    if (isCreating) {
      setEditingTask({ title: '', description: '', status: 'À faire', sprintId, subtasks: [] });
    } else if (task) {
      setEditingTask({
        ...task,
        prerequisiteTaskIds: new Set(task.prerequisiteTaskIds as unknown as number[] || []),
        subtasks: task.subtasks || []
      });
    }
  }, [task, isCreating, sprintId]);

  const subtaskProgress = useMemo(() => {
    const total = editingTask.subtasks?.length || 0;
    if (total === 0) return 0;
    const completed = editingTask.subtasks?.filter(st => st.isCompleted).length || 0;
    return Math.round((completed / total) * 100);
  }, [editingTask.subtasks]);

  const handleSave = async () => {
    if (isCreating) {
      try {
        const response = await api.post<Task>('/tasks', editingTask);
        onCreate(response.data);
        onClose();
      } catch (error) {
        console.error("Failed to create task:", error);
      }
    } else {
      try {
        const response = await api.put<Task>(`/tasks/${editingTask.id}`, {
          ...editingTask,
          prerequisiteTaskIds: Array.from(editingTask.prerequisiteTaskIds || [])
        });
        onUpdate(response.data);
        onClose();
      } catch (error) {
        console.error("Failed to update task:", error);
      }
    }
  };

  const handleAddSubtask = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newSubtaskTitle.trim() && !isCreating) {
      e.preventDefault();
      try {
        const response = await api.post<Subtask>(`/tasks/${task?.id}/subtasks`, { title: newSubtaskTitle });
        const newSubtasks = [...(editingTask.subtasks || []), response.data];
        const updatedTask = { ...editingTask, subtasks: newSubtasks };
        setEditingTask(updatedTask);
        onUpdate(updatedTask as Task);
        setNewSubtaskTitle('');
      } catch (error) {
        console.error("Failed to add subtask:", error);
      }
    }
  };

  const handleToggleSubtask = async (subtaskId: number, isCompleted: boolean) => {
    try {
      await api.put(`/subtasks/${subtaskId}/status`, { isCompleted });
      const newSubtasks = editingTask.subtasks?.map(st => 
        st.id === subtaskId ? { ...st, isCompleted } : st
      );
      const updatedTask = { ...editingTask, subtasks: newSubtasks };
      setEditingTask(updatedTask);
      onUpdate(updatedTask as Task);
    } catch (error) {
      console.error("Failed to toggle subtask:", error);
    }
  };

  const handleDeleteSubtask = async (subtaskId: number) => {
    try {
      await api.delete(`/subtasks/${subtaskId}`);
      const newSubtasks = editingTask.subtasks?.filter(st => st.id !== subtaskId);
      const updatedTask = { ...editingTask, subtasks: newSubtasks };
      setEditingTask(updatedTask);
      onUpdate(updatedTask as Task);
    } catch (error) {
      console.error("Failed to delete subtask:", error);
    }
  };

  const handleAddPrerequisite = async (prerequisiteId: number) => {
    if (isCreating || !task) return;
    try {
      await api.post(`/tasks/${task.id}/dependencies/${prerequisiteId}`);
      const updatedPrerequisites = new Set(editingTask.prerequisiteTaskIds || []).add(prerequisiteId);
      const updatedTask = { ...editingTask, prerequisiteTaskIds: updatedPrerequisites };
      setEditingTask(updatedTask);
      onUpdate(updatedTask as Task);
      setShowPrerequisiteSelector(false);
    } catch (error) {
      console.error("Failed to add prerequisite:", error);
    }
  };

  const handleRemovePrerequisite = async (prerequisiteId: number) => {
    if (isCreating || !task) return;
    try {
      const updatedPrerequisites = new Set(editingTask.prerequisiteTaskIds || []);
      updatedPrerequisites.delete(prerequisiteId);
      const updatedTask = { ...editingTask, prerequisiteTaskIds: updatedPrerequisites };
      setEditingTask(updatedTask);
      onUpdate(updatedTask as Task);
      await api.delete(`/tasks/${task.id}/dependencies/${prerequisiteId}`);
    } catch (error) {
      console.error("Failed to remove prerequisite:", error);
    }
  };

  const getTaskTitleById = (taskId: number) => {
    return allTasks.find(t => t.id === taskId)?.title || 'Tâche inconnue';
  };

  const availablePrerequisites = allTasks.filter(
    t => t.id !== task?.id && !(editingTask.prerequisiteTaskIds?.has(t.id))
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/50 p-8 w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="w-1 h-8 bg-slate-700 dark:bg-slate-300 mr-3 rounded-full"></div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">
              {isCreating ? 'Nouvelle Tâche' : 'Détails de la Tâche'}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto pr-4 -mr-4 space-y-5">
          <input 
            type="text" 
            placeholder="Titre de la tâche" 
            value={editingTask.title || ''} 
            onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })} 
            className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-transparent transition-all duration-200"
          />
          <textarea 
            placeholder="Description" 
            value={editingTask.description || ''} 
            onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })} 
            className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-transparent resize-none transition-all duration-200"
            rows={4} 
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select 
              value={editingTask.status || 'À faire'} 
              onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value })} 
              className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-transparent transition-all duration-200"
            >
              <option value="À faire">À faire</option>
              <option value="En cours">En cours</option>
              <option value="Terminé">Terminé</option>
            </select>
            <select 
              value={editingTask.assignedUserId || ''} 
              onChange={(e) => setEditingTask({ ...editingTask, assignedUserId: Number(e.target.value) || undefined })} 
              className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Non assignée</option>
              {projectMembers.map(member => (<option key={member.id} value={member.id}>{member.firstname} {member.lastname}</option>))}
            </select>
          </div>

          {!isCreating && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-slate-50 tracking-tight">Checklist</h3>
                {editingTask.subtasks && editingTask.subtasks.length > 0 && (
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mb-4">
                    <div className="bg-slate-700 dark:bg-slate-300 h-2.5 rounded-full transition-all duration-300" style={{ width: `${subtaskProgress}%` }}></div>
                  </div>
                )}
                <div className="space-y-2">
                  {editingTask.subtasks?.map(st => (
                    <div key={st.id} className="flex items-center group p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all duration-200">
                      <button onClick={() => handleToggleSubtask(st.id, !st.isCompleted)} className="mr-3">
                        {st.isCompleted ? <CheckSquare size={20} className="text-slate-700 dark:text-slate-300" /> : <Square size={20} className="text-slate-400 dark:text-slate-500" />}
                      </button>
                      <span className={`flex-1 text-slate-900 dark:text-slate-50 ${st.isCompleted ? 'line-through text-slate-500 dark:text-slate-400' : ''}`}>{st.title}</span>
                      <button onClick={() => handleDeleteSubtask(st.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center mt-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                  <Plus size={20} className="text-slate-400 dark:text-slate-500 mr-2" />
                  <input
                    type="text"
                    placeholder="Ajouter un élément..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyDown={handleAddSubtask}
                    className="w-full bg-transparent focus:outline-none text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-slate-50 tracking-tight">Prérequis</h3>
                <div className="space-y-2">
                  {Array.from(editingTask.prerequisiteTaskIds || []).map(id => (
                    <div key={id} className="flex justify-between items-center bg-slate-100 dark:bg-slate-700/50 p-3 rounded-xl border border-slate-200 dark:border-slate-600">
                      <span className="text-slate-900 dark:text-slate-50 font-medium">{getTaskTitleById(id)}</span>
                      <button onClick={() => handleRemovePrerequisite(id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                {showPrerequisiteSelector ? (
                  <select
                    onChange={(e) => handleAddPrerequisite(Number(e.target.value))}
                    className="w-full p-3 mt-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-transparent transition-all duration-200"
                    defaultValue=""
                  >
                    <option value="" disabled>Sélectionner une tâche...</option>
                    {availablePrerequisites.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                ) : (
                  <button
                    onClick={() => setShowPrerequisiteSelector(true)}
                    className="mt-3 flex items-center text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 font-semibold transition-colors duration-200"
                  >
                    <Plus size={16} className="mr-1" /> Ajouter un prérequis
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-700/50">
          <button 
            onClick={handleSave} 
            className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold shadow-sm hover:bg-slate-800 dark:hover:bg-slate-200 hover:shadow-md transition-all duration-200 border border-slate-800 dark:border-slate-200"
          >
            {isCreating ? 'Créer' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;