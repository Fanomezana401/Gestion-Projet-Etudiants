import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Project } from './types';

interface ProjectModalProps {
  isOpen: boolean;
  project?: Project;
  onSave: (project: Project) => void;
  onClose: () => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, project, onSave, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
    } else {
      setName('');
      setDescription('');
    }
  }, [project, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const projectData: Project = {
      id: project?.id || Date.now().toString(),
      name,
      description,
      status: project?.status || 'Nouveau',
      progress: project?.progress || 0,
    };
    onSave(projectData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="
          relative
          w-full max-w-lg
          bg-white dark:bg-slate-800
          rounded-2xl
          shadow-xl
          border border-slate-200/60 dark:border-slate-700/50
          p-8
          animate-scaleIn
        "
      >
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="
            absolute top-4 right-4
            p-2 rounded-lg
            hover:bg-slate-100 dark:hover:bg-slate-700
            transition-all duration-200
          "
        >
          <X size={20} className="text-slate-600 dark:text-slate-300" />
        </button>

        {/* Titre avec barre indicateur */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <div className="w-1 h-8 bg-slate-700 dark:bg-slate-300 mr-3 rounded-full"></div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">
              {project ? 'Modifier le projet' : 'Créer un nouveau projet'}
            </h2>
          </div>
        </div>

        {/* Formulaire */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Nom du projet
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Plateforme e-learning"
              className="
                w-full px-4 py-3
                rounded-xl
                border border-slate-200 dark:border-slate-600
                bg-slate-50 dark:bg-slate-700/50
                text-slate-900 dark:text-slate-50
                placeholder:text-slate-400 dark:placeholder:text-slate-500
                focus:outline-none
                focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500
                focus:border-transparent
                transition-all duration-200
              "
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez brièvement le projet..."
              rows={5}
              className="
                w-full px-4 py-3
                rounded-xl
                border border-slate-200 dark:border-slate-600
                bg-slate-50 dark:bg-slate-700/50
                text-slate-900 dark:text-slate-50
                placeholder:text-slate-400 dark:placeholder:text-slate-500
                focus:outline-none
                focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500
                focus:border-transparent
                resize-none
                transition-all duration-200
              "
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="
              px-6 py-3
              rounded-xl
              bg-slate-100 dark:bg-slate-700
              text-slate-700 dark:text-slate-200
              font-semibold
              hover:bg-slate-200 dark:hover:bg-slate-600
              transition-all duration-200
              border border-slate-200 dark:border-slate-600
            "
          >
            Annuler
          </button>

          <button
            onClick={handleSave}
            className="
              px-6 py-3
              rounded-xl
              bg-slate-900 dark:bg-slate-100
              text-white dark:text-slate-900
              font-semibold
              shadow-sm
              hover:bg-slate-800 dark:hover:bg-slate-200
              hover:shadow-md
              transition-all duration-200
              border border-slate-800 dark:border-slate-200
            "
          >
            {project ? 'Enregistrer' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;