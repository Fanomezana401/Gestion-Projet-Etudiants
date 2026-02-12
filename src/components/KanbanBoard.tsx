import React, { useState, useEffect } from 'react';
import { DndContext, closestCorners, DragOverlay, useDroppable } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { Plus, Edit, Trash, Loader2, GripVertical, CheckSquare, Square } from 'lucide-react';
import api from '../services/api';

// --- Interfaces ---
interface Subtask {
  id?: string;
  title: string;
  isCompleted: boolean;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  sprintId: number;
  assignedUserId?: number;
  assignedUserFirstname?: string;
  assignedUserLastname?: string;
  subtasks?: Subtask[];
  prerequisiteTaskIds?: string[];
}

interface Column {
  id: 'todo' | 'in-progress' | 'done';
  title: string;
}

interface KanbanBoardProps {
  projectId: string;
  sprintId: string;
}

// --- COMPOSANTS INDÉPENDANTS ---

const TaskCard: React.FC<{ task: Task; onEdit: (task: Task) => void; onDelete: (taskId: string) => void; onToggleSubtask: (taskId: string, subtaskId: string, isCompleted: boolean) => void; }> = ({ task, onEdit, onDelete, onToggleSubtask }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { task },
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const assignedUserName = task.assignedUserFirstname ? `${task.assignedUserFirstname} ${task.assignedUserLastname || ''}`.trim() : 'Non assignée';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="bg-gray-100 dark:bg-gray-700 p-3 rounded-xl shadow-sm mb-3 hover:shadow-md transition"
    >
      <div className="flex items-start">
        <div {...listeners} className="p-1 cursor-grab">
          <GripVertical size={16} className="text-gray-500" />
        </div>
        <div className="flex-1 ml-1">
          <p className="text-gray-800 dark:text-gray-200 font-semibold">{task.title}</p>
          {task.description && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{task.description}</p>}
          
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Assigné à: {assignedUserName}</span>
            <div>
              <button onClick={() => onEdit(task)} className="text-blue-600 hover:text-blue-800 p-1"><Edit size={16} /></button>
              <button onClick={() => onDelete(task.id)} className="text-red-600 hover:text-red-800 p-1"><Trash size={16} /></button>
            </div>
          </div>

          {task.subtasks && task.subtasks.length > 0 && (
            <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">Sous-tâches:</p>
              {task.subtasks.map((sub, index) => (
                <div 
                  key={sub.id || index} 
                  className="flex items-center text-xs text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 rounded p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (sub.id) onToggleSubtask(task.id, sub.id, !sub.isCompleted);
                  }}
                >
                  {sub.isCompleted ? <CheckSquare size={14} className="mr-1 text-green-500" /> : <Square size={14} className="mr-1 text-gray-400" />}
                  <span className={sub.isCompleted ? 'line-through' : ''}>{sub.title}</span>
                </div>
              ))}
            </div>
          )}

          {task.prerequisiteTaskIds && task.prerequisiteTaskIds.length > 0 && (
            <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">Prérequis:</p>
              <p className="text-xs text-gray-600 dark:text-gray-300">IDs: {task.prerequisiteTaskIds.join(', ')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const KanbanColumn: React.FC<{ column: Column; tasks: Task[]; onEdit: (task: Task) => void; onDelete: (taskId: string) => void; onToggleSubtask: (taskId: string, subtaskId: string, isCompleted: boolean) => void; }> = ({ column, tasks, onEdit, onDelete, onToggleSubtask }) => {
  const { setNodeRef } = useDroppable({ id: column.id });
  return (
    <div ref={setNodeRef} className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-4 min-h-[400px] flex flex-col">
      <h2 className="font-semibold text-lg mb-3 border-b dark:border-gray-700 pb-2 text-gray-800 dark:text-white">{column.title}</h2>
      <div className="overflow-y-auto flex-1">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} onToggleSubtask={onToggleSubtask} />)}
        </SortableContext>
      </div>
    </div>
  );
};

const TaskModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (task: Partial<Task>) => void; taskToEdit?: Task; allTasks: Task[] }> = ({ isOpen, onClose, onSave, taskToEdit, allTasks }) => {
  const [editingTask, setEditingTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    subtasks: [],
    prerequisiteTaskIds: [],
  });
  const isCreating = !taskToEdit;

  useEffect(() => {
    if (isOpen) {
      setEditingTask({
        id: taskToEdit?.id,
        title: taskToEdit?.title || '',
        description: taskToEdit?.description || '',
        subtasks: taskToEdit?.subtasks?.map(sub => ({ 
          id: sub.id ? String(sub.id) : undefined,
          title: sub.title || '', 
          isCompleted: sub.isCompleted || false 
        })) || [],
        prerequisiteTaskIds: taskToEdit?.prerequisiteTaskIds || [],
      });
    }
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!editingTask.title?.trim()) {
      alert("Le titre ne peut pas être vide.");
      return;
    }
    onSave(editingTask);
    onClose();
  };

  const handleAddSubtask = () => {
    setEditingTask(prev => ({
      ...prev,
      subtasks: [...(prev.subtasks || []), { title: '', isCompleted: false }]
    }));
  };

  const handleUpdateSubtask = (index: number, field: keyof Subtask, value: any) => {
    setEditingTask(prev => ({
      ...prev,
      subtasks: prev.subtasks?.map((sub, i) => i === index ? { ...sub, [field]: value } : sub)
    }));
  };

  const handleDeleteSubtask = (index: number) => {
    setEditingTask(prev => ({
      ...prev,
      subtasks: prev.subtasks?.filter((_, i) => i !== index)
    }));
  };

  const handleTogglePrerequisite = (taskId: string) => {
    setEditingTask(prev => {
      const currentPrereqs = prev.prerequisiteTaskIds || [];
      const newPrereqs = currentPrereqs.includes(taskId) 
        ? currentPrereqs.filter(id => id !== taskId) 
        : [...currentPrereqs, taskId];
      return { ...prev, prerequisiteTaskIds: newPrereqs };
    });
  };

  const availablePrerequisites = allTasks.filter(t => t.id !== taskToEdit?.id);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{isCreating ? 'Nouvelle tâche' : 'Modifier la tâche'}</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="taskTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Titre</label>
            <input
              id="taskTitle"
              type="text"
              value={editingTask.title || ''}
              onChange={(e) => setEditingTask(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Titre de la tâche"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="taskDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Description</label>
            <textarea
              id="taskDescription"
              value={editingTask.description || ''}
              onChange={(e) => setEditingTask(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description de la tâche..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 dark:text-white"
              rows={3}
            />
          </div>

          {!isCreating && (
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Sous-tâches</h3>
                <button onClick={handleAddSubtask} className="px-3 py-1 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600">Ajouter</button>
              </div>
              {editingTask.subtasks?.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">Aucune sous-tâche.</p>}
              <div className="space-y-2">
                {editingTask.subtasks?.map((sub, index) => (
                  <div key={sub.id || index} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={sub.isCompleted}
                      onChange={(e) => handleUpdateSubtask(index, 'isCompleted', e.target.checked)}
                      className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                    />
                    <input
                      type="text"
                      value={sub.title}
                      onChange={(e) => handleUpdateSubtask(index, 'title', e.target.value)}
                      placeholder="Titre de la sous-tâche"
                      className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm dark:text-white"
                    />
                    <button onClick={() => handleDeleteSubtask(index)} className="text-red-500 hover:text-red-700">
                      <Trash size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isCreating && (
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Prérequis</h3>
              <div className="max-h-40 overflow-y-auto">
                {availablePrerequisites.map(task => (
                  <div key={task.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`prereq-${task.id}`}
                      checked={editingTask.prerequisiteTaskIds?.includes(task.id)}
                      onChange={() => handleTogglePrerequisite(task.id)}
                      className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                    />
                    <label htmlFor={`prereq-${task.id}`} className="ml-2 text-sm text-gray-700 dark:text-gray-200">{task.title}</label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6 space-x-3">
          <button onClick={onClose} className="px-5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500">Annuler</button>
          <button onClick={handleSave} className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-md hover:from-indigo-700 hover:to-purple-700">{taskToEdit ? 'Enregistrer' : 'Créer'}</button>
        </div>
      </div>
    </div>
  );
};

// --- COMPOSANT PRINCIPAL ---

const KanbanBoard: React.FC<KanbanBoardProps> = ({ projectId, sprintId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const columns: Column[] = [
    { id: 'todo', title: 'À Faire' },
    { id: 'in-progress', title: 'En Cours' },
    { id: 'done', title: 'Terminé' },
  ];

  const fetchTasks = async () => {
    if (!projectId || !sprintId) return;
    try {
      setLoading(true);
      const response = await api.get(`/projects/${projectId}/sprints/${sprintId}/tasks`);
      setTasks(response.data);
      setError(null);
    } catch (err) {
      console.error("Erreur lors du chargement des tâches:", err);
      setError("Impossible de charger les tâches pour ce sprint.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId, sprintId]);

  const handleToggleSubtask = async (taskId: string, subtaskId: string, isCompleted: boolean) => {
    const originalTasks = tasks;
    setTasks(prevTasks => 
      prevTasks.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            subtasks: t.subtasks?.map(st => 
              st.id === subtaskId ? { ...st, isCompleted } : st
            )
          };
        }
        return t;
      })
    );

    try {
      await api.put(`/subtasks/${subtaskId}/status`, { isCompleted });
    } catch (err: any) { // Capture the error object
      console.error("Failed to update subtask status:", err);
      alert(err.response?.data?.message || "Erreur lors de la mise à jour du statut de la sous-tâche.");
      setTasks(originalTasks); // Revert optimistic update
    }
  };

  const handleDragStart = (event: any) => {
    setActiveDragId(event.active.id);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over) return;

    const activeTaskId = active.id as string;
    const overTargetId = over.id as string;

    const activeTask = tasks.find(t => t.id === activeTaskId);
    if (!activeTask) return;

    const originalTasks = [...tasks];
    const activeColumnId = activeTask.status;
    let overColumnId = activeColumnId;

    if (columns.some(col => col.id === overTargetId)) {
      overColumnId = overTargetId as 'todo' | 'in-progress' | 'done';
    } else {
      const overTask = tasks.find(t => t.id === overTargetId);
      if (overTask) {
        overColumnId = overTask.status;
      } else {
        return;
      }
    }

    const isMovingBetweenColumns = activeColumnId !== overColumnId;

    if (isMovingBetweenColumns) {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === activeTaskId ? { ...task, status: overColumnId } : task
        )
      );
      try {
        await api.put(`/tasks/${activeTaskId}`, { status: overColumnId });
      } catch (err: any) {
        console.error("Erreur lors de la mise à jour du statut:", err);
        alert(err.response?.data?.message || "Erreur lors de la mise à jour du statut."); // Afficher le message du backend
        setTasks(originalTasks); // Restaurer l'état précédent
      }
    } else {
      const tasksInActiveColumn = tasks.filter(t => t.status === activeColumnId);
      const oldIndex = tasksInActiveColumn.findIndex(t => t.id === activeTaskId);
      const newIndex = tasksInActiveColumn.findIndex(t => t.id === overTargetId);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newOrderTasksInColumn = arrayMove(tasksInActiveColumn, oldIndex, newIndex);
        setTasks(prevTasks => {
          const otherTasks = prevTasks.filter(t => t.status !== activeColumnId);
          return [...otherTasks, ...newOrderTasksInColumn];
        });
      }
    }
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      if (taskData.id) {
        const payload = { 
          title: taskData.title, 
          description: taskData.description || "",
          subtasks: taskData.subtasks?.map(sub => ({ id: sub.id ? Number(sub.id) : undefined, title: sub.title, isCompleted: sub.isCompleted })),
          prerequisiteTaskIds: taskData.prerequisiteTaskIds?.map(Number),
        };
        await api.put(`/tasks/${taskData.id}`, payload);
      } else {
        const payload = {
          title: taskData.title,
          description: taskData.description || "",
          sprintId: Number(sprintId),
          status: 'todo',
          subtasks: taskData.subtasks?.map(sub => ({ title: sub.title, isCompleted: sub.isCompleted })),
          prerequisiteTaskIds: taskData.prerequisiteTaskIds?.map(Number),
        };
        await api.post('/tasks', payload);
      }
      fetchTasks();
    } catch (err: any) {
      console.error("Erreur lors de l'enregistrement de la tâche:", err);
      alert(err.response?.data?.message || "Impossible d'enregistrer la tâche.");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err: any) {
      console.error("Erreur lors de la suppression de la tâche:", err);
      alert(err.response?.data?.message || "Impossible de supprimer la tâche.");
    }
  };

  const activeTask = activeDragId ? tasks.find(task => task.id === activeDragId) : null;

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="h-10 w-10 animate-spin text-indigo-600" /></div>;
  if (error) return <div className="bg-red-100 border border-red-300 text-red-600 rounded-xl p-6 text-center">{error}</div>;

  return (
    <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart} collisionDetection={closestCorners}>
      <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Tableau Kanban</h1>
          <button onClick={() => { setTaskToEdit(undefined); setModalOpen(true); }} className="flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 transition duration-300 hover:scale-105">
            <Plus className="mr-2 h-5 w-5" />
            Ajouter une tâche
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map(col => (
            <KanbanColumn
              key={col.id}
              column={col}
              tasks={tasks.filter(t => t.status === col.id)}
              onEdit={(task) => { setTaskToEdit(task); setModalOpen(true); }}
              onDelete={handleDeleteTask}
              onToggleSubtask={handleToggleSubtask}
            />
          ))}
        </div>
        <TaskModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSave={handleSaveTask} taskToEdit={taskToEdit} allTasks={tasks} />
      </div>
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;
