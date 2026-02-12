import React, { useState } from 'react';
import { Loader2, Upload } from 'lucide-react';

interface SubmitDeliverableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, file: File) => Promise<void>;
  projectId: number;
}

const SubmitDeliverableModal: React.FC<SubmitDeliverableModalProps> = ({ isOpen, onClose, onSave, projectId }) => {
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !file) {
      alert("Veuillez fournir un nom et un fichier pour le livrable.");
      return;
    }
    setIsSubmitting(true);
    try {
      await onSave(name, file);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la soumission du livrable", error);
      alert("Une erreur est survenue lors de la soumission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 w-full max-w-md shadow-xl border border-slate-200/60 dark:border-slate-700/50 animate-scaleIn">
        {/* Titre avec barre indicateur */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <div className="w-1 h-8 bg-slate-700 dark:bg-slate-300 mr-3 rounded-full"></div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">
              Soumettre un Livrable
            </h2>
          </div>
        </div>
        
        <div className="space-y-5">
          <div>
            <label htmlFor="deliverableName" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Nom du livrable
            </label>
            <input
              id="deliverableName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Rapport final, Code source v1.0"
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div>
            <label htmlFor="fileUpload" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Fichier
            </label>
            <div className="mt-1 flex justify-center px-6 pt-6 pb-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200">
              <div className="space-y-2 text-center">
                <Upload className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
                <div className="flex text-sm text-slate-600 dark:text-slate-300 justify-center">
                  <label htmlFor="file-upload" className="relative cursor-pointer rounded-lg font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-slate-50 bg-white dark:bg-slate-800 px-4 py-2 shadow-sm border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 transition-all duration-200">
                    <span>Sélectionnez un fichier</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                  </label>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {file ? file.name : 'Aucun fichier sélectionné'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-8 space-x-3">
          <button 
            onClick={onClose} 
            className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 border border-slate-200 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            Annuler
          </button>
          <button 
            onClick={handleSubmit} 
            className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold shadow-sm hover:bg-slate-800 dark:hover:bg-slate-200 hover:shadow-md flex items-center justify-center transition-all duration-200 border border-slate-800 dark:border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Soumettre
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmitDeliverableModal;