// src/pages/Dashboard.tsx
import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import ProjectCard from "../components/ProjectCard";
import ProjectModal from "../components/ProjectModal";
import { Project } from "../components/types";
import KanbanBoard from "../components/KanbanBoard";
import { useAuth } from "../context/AuthContext";
import { Plus, LayoutDashboard } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);

  const openModal = (project?: Project) => {
    setEditingProject(project);
    setModalOpen(true);
  };

  const saveProject = (project: Project) => {
    setProjects((prev) => {
      const exists = prev.find((p) => p.id === project.id);
      return exists ? prev.map((p) => (p.id === project.id ? project : p)) : [...prev, project];
    });
    setModalOpen(false);
  };

  const deleteProject = (id: string) =>
    setProjects((prev) => prev.filter((p) => p.id !== id));

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 dark:from-slate-900 dark:via-gray-900 dark:to-stone-900">
      <Sidebar role={user!.role} />

      <div className="flex-1 overflow-y-auto p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <LayoutDashboard className="h-6 w-6 text-slate-700 dark:text-slate-300" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">
                {user?.role === "teacher" ? "Projets à gérer" : "Mes projets"}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                {user?.role === "teacher" ? "Supervisez et suivez vos projets" : "Gérez vos projets et tâches"}
              </p>
            </div>
          </div>

          <button
            onClick={() => openModal()}
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold rounded-lg shadow-lg hover:shadow-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-all duration-300 transform hover:scale-105"
          >
            <Plus className="h-5 w-5" />
            Nouveau projet
          </button>
        </div>

        {/* Projets */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-6 mb-8">
          <div className="flex items-center mb-5">
            <div className="w-1 h-5 bg-slate-700 dark:bg-slate-300 mr-3 rounded-full"></div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Vos projets</h2>
          </div>
          
          {projects.length === 0 ? (
            <div className="text-center py-16 text-slate-500 dark:text-slate-400">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full mb-4">
                <LayoutDashboard className="h-8 w-8 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="font-medium">Aucun projet pour le moment.</p>
              <p className="text-sm mt-2">
                Cliquez sur <span className="font-semibold text-slate-700 dark:text-slate-300">"Nouveau projet"</span> pour commencer 🚀
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onEdit={openModal}
                  onDelete={deleteProject}
                />
              ))}
            </div>
          )}
        </div>

        {/* Kanban */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center mb-6">
            <div className="w-1 h-5 bg-slate-700 dark:bg-slate-300 mr-3 rounded-full"></div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Tableau Kanban</h2>
          </div>
          <KanbanBoard />
        </div>
      </div>

      {modalOpen && (
        <ProjectModal
          isOpen={modalOpen}
          project={editingProject}
          onSave={saveProject}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}