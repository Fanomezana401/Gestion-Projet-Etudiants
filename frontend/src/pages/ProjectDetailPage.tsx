import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Loader2, KanbanSquare, Calendar, Flag, MessageSquare, Edit, Trash2, PlusCircle, ArrowLeft, UploadCloud, Download, Eye, FileText, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import SubmitDeliverableModal from '../components/SubmitDeliverableModal';
import FilePreviewModal from '../components/FilePreviewModal';
import { useAuth } from '../context/AuthContext';

// --- Interfaces ---
interface Sprint {
  id: number;
  name: string;
  sprintNumber: number;
  startDate: string;
  endDate: string;
  status: string;
}

interface Deliverable {
  id: number;
  name: string;
  fileUrl: string;
  submittedAt: string;
  submittedByUserId: number;
  grade?: number;
  remarks?: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  progress: number;
  status: string;
  sprints: Sprint[];
  deliverables: Deliverable[];
}

// --- Schemas de validation ---
const editProjectSchema = z.object({
  name: z.string().min(3, { message: 'Le nom du projet doit contenir au moins 3 caractères.' }),
  description: z.string().optional(),
  status: z.string(),
});
type EditProjectFormInputs = z.infer<typeof editProjectSchema>;

const sprintSchema = z.object({
  name: z.string().min(3, { message: 'Le nom du sprint doit contenir au moins 3 caractères.' }),
  startDate: z.string().refine((date) => !isNaN(new Date(date).getTime()), { message: 'Date de début invalide.' }),
  endDate: z.string().refine((date) => !isNaN(new Date(date).getTime()), { message: 'Date de fin invalide.' }),
  status: z.string().optional(),
});
type SprintFormInputs = z.infer<typeof sprintSchema>;

// --- Fonctions utilitaires ---
const getStatusClasses = (status: string) => {
  switch (status) {
    case 'Actif': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'Terminé': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'À venir': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  }
};

const getFileNameFromUrl = (url: string) => {
    try {
      return url.substring(url.lastIndexOf('/') + 1);
    } catch {
      return "fichier";
    }
};

const isPreviewable = (fileUrl: string) => {
  const ext = fileUrl.split('.').pop()?.toLowerCase();
  return ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext || '');
};

// --- Composant principal ---
const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [showDeliverableModal, setShowDeliverableModal] = useState(false);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string } | null>(null);
  const [currentSprint, setCurrentSprint] = useState<Sprint | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const {
    register: registerProject,
    handleSubmit: handleProjectSubmit,
    formState: { errors: projectErrors, isSubmitting: projectIsSubmitting },
    reset: resetProjectForm,
  } = useForm<EditProjectFormInputs>({ resolver: zodResolver(editProjectSchema) });

  const {
    register: registerSprint,
    handleSubmit: handleSprintSubmit,
    formState: { errors: sprintErrors, isSubmitting: sprintIsSubmitting },
    reset: resetSprintForm,
  } = useForm<SprintFormInputs>({ resolver: zodResolver(sprintSchema) });

  const fetchProjectDetails = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const response = await api.get<Project>(`/projects/${projectId}`);
      setProject(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération des détails du projet.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  const handleDeliverableSubmit = async (name: string, file: File) => {
    if (!projectId) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('projectId', projectId);
    await api.post('/deliverables', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    fetchProjectDetails();
  };

  const handleGenerateAndSubmitReport = async () => {
    if (!projectId || !project) return;
    setIsGeneratingReport(true);
    try {
      const response = await api.get(`/projects/${projectId}/report`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const fileName = `Rapport_${project.name.replace(/\s+/g, '_')}.pdf`;
      const file = new File([blob], fileName, { type: 'application/pdf' });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);

      if (window.confirm("Le rapport a été généré et téléchargé. Voulez-vous le soumettre automatiquement comme livrable ?")) {
        await handleDeliverableSubmit("Rapport Automatique", file);
        alert("Le rapport a été soumis avec succès !");
      }

    } catch (error) {
      console.error("Erreur lors de la génération du rapport :", error);
      alert("Impossible de générer le rapport.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleDeleteDeliverable = async (deliverableId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce livrable ? Cette action est irréversible.")) {
      try {
        await api.delete(`/deliverables/${deliverableId}`);
        fetchProjectDetails();
      } catch (err: any) {
        alert(err.response?.data?.message || "Impossible de supprimer le livrable.");
      }
    }
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      const response = await api.get(`/files/download/${getFileNameFromUrl(fileUrl)}`, {
        responseType: 'blob',
      });

      let extension = '';
      const realFileName = getFileNameFromUrl(fileUrl);
      if (realFileName.includes('.')) {
        extension = '.' + realFileName.split('.').pop();
      }
      
      let downloadName = fileName;
      if (!downloadName.toLowerCase().endsWith(extension.toLowerCase())) {
        downloadName += extension;
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', downloadName);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur lors du téléchargement :", error);
      alert("Impossible de télécharger le fichier.");
    }
  };

  const openFilePreview = (fileUrl: string, fileName: string) => {
    setPreviewFile({ url: fileUrl, name: fileName });
    setShowFilePreview(true);
  };

  const handleEditProject = (data: EditProjectFormInputs) => {
    if (!project) return;
    setServerError(null);
    api.put(`/projects/${project.id}`, data)
      .then(() => { setShowEditProjectModal(false); fetchProjectDetails(); })
      .catch((err) => setServerError(err.response?.data?.message || "Une erreur s'est produite."));
  };

  const handleDeleteProject = () => {
    if (!project || !window.confirm(`Êtes-vous sûr de vouloir supprimer le projet "${project.name}" ?`)) return;
    api.delete(`/projects/${project.id}`)
      .then(() => navigate('/projects'))
      .catch((err) => setServerError(err.response?.data?.message || "Une erreur s'est produite."));
  };

  const openEditProjectModal = () => {
    if (project) {
      resetProjectForm({ name: project.name, description: project.description, status: project.status });
      setShowEditProjectModal(true);
    }
  };

  const handleCreateSprint = (data: SprintFormInputs) => {
    if (!projectId) return;
    setServerError(null);
    api.post('/sprints', { ...data, projectId: Number(projectId) })
      .then(() => { setShowSprintModal(false); fetchProjectDetails(); })
      .catch((err) => setServerError(err.response?.data?.message || "Une erreur s'est produite."));
  };

  const handleUpdateSprint = (data: SprintFormInputs) => {
    if (!currentSprint) return;
    setServerError(null);
    api.put(`/sprints/${currentSprint.id}`, data)
      .then(() => { setShowSprintModal(false); fetchProjectDetails(); })
      .catch((err) => setServerError(err.response?.data?.message || "Une erreur s'est produite."));
  };

  const handleDeleteSprint = (sprintId: number, sprintName: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le sprint "${sprintName}" ?`)) return;
    api.delete(`/sprints/${sprintId}`)
      .then(() => fetchProjectDetails())
      .catch((err) => setServerError(err.response?.data?.message || "Une erreur s'est produite."));
  };

  const openCreateSprintModal = () => {
    setCurrentSprint(null);
    resetSprintForm({ name: '', startDate: '', endDate: '', status: 'À venir' });
    setShowSprintModal(true);
  };

  const openEditSprintModal = (sprint: Sprint) => {
    setCurrentSprint(sprint);
    resetSprintForm({ name: sprint.name, startDate: sprint.startDate, endDate: sprint.endDate, status: sprint.status });
    setShowSprintModal(true);
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-10 w-10 animate-spin text-indigo-600" /></div>;
  if (error || !project) return <div className="text-center p-8 text-red-600">{error || 'Projet non trouvé.'}</div>;

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-full">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="flex items-center justify-center p-2 rounded-full hover:bg-gray-200 transition duration-200 mr-4"><ArrowLeft className="h-6 w-6 text-gray-700" /></button>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Détails du Projet</h1>
        </div>
        <div className="flex gap-4">
          {user?.role === 'STUDENT' && (
            <>
              <button 
                onClick={handleGenerateAndSubmitReport} 
                disabled={isGeneratingReport}
                className="flex items-center px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition duration-300 transform hover:scale-105 disabled:opacity-50"
              >
                {isGeneratingReport ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2" />}
                Générer Rapport
              </button>
              <button onClick={() => setShowDeliverableModal(true)} className="flex items-center px-4 py-2 rounded-xl bg-green-500 text-white font-semibold shadow-md hover:bg-green-600 transition duration-300 transform hover:scale-105"><UploadCloud className="mr-2" /> Soumettre Livrable</button>
            </>
          )}
          {user?.role === 'TEACHER' && (
            <>
              <button onClick={openEditProjectModal} className="flex items-center px-4 py-2 rounded-xl bg-blue-500 text-white font-semibold shadow-md hover:bg-blue-600 transition duration-300 transform hover:scale-105"><Edit className="mr-2" /> Modifier</button>
              <button onClick={handleDeleteProject} className="flex items-center px-4 py-2 rounded-xl bg-red-500 text-white font-semibold shadow-md hover:bg-red-600 transition duration-300 transform hover:scale-105"><Trash2 className="mr-2" /> Supprimer</button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl mb-8 border border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-2">{project.name}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{project.description}</p>
            <div className="flex flex-col gap-3 text-sm text-gray-700 dark:text-gray-200 mt-6">
              <p className="flex items-center gap-2"><Flag size={18} className="text-purple-500" /> Statut: <span className="font-semibold text-gray-900 dark:text-white">{project.status}</span></p>
              <p className="flex items-center gap-2"><Calendar size={18} className="text-green-500" /> Sprints: <span className="font-semibold text-gray-900 dark:text-white">{project.sprints.length}</span></p>
              <p className="flex items-center gap-2"><MessageSquare size={18} className="text-blue-500" /> Messagerie: <Link to={`/messages/${project.id}`} className="text-indigo-600 hover:underline">Ouvrir</Link></p>
            </div>
          </div>
          <div className="flex justify-center items-center">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle className="text-gray-200 dark:text-gray-700 stroke-current" strokeWidth="10" cx="50" cy="50" r="40" fill="transparent"></circle>
                <circle className="text-indigo-500 progress-ring__circle stroke-current" strokeWidth="10" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent" strokeDasharray={40 * 2 * Math.PI} strokeDashoffset={40 * 2 * Math.PI - (project.progress / 100) * (40 * 2 * Math.PI)}></circle>
                <text x="50" y="50" fontFamily="sans-serif" fontSize="20" fill="currentColor" textAnchor="middle" alignmentBaseline="middle" className="text-indigo-700 dark:text-indigo-300 font-bold">{project.progress}%</text>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Sprints</h2>
          {user?.role === 'TEACHER' && (
            <button onClick={openCreateSprintModal} className="flex items-center px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold shadow-md hover:bg-indigo-700 transition duration-300 transform hover:scale-105"><PlusCircle className="mr-2" /> Ajouter</button>
          )}
        </div>
        <div className="space-y-4">
          {project.sprints.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">Aucun sprint pour ce projet. Créez-en un !</p>
          ) : (
            [...project.sprints].sort((a, b) => a.sprintNumber - b.sprintNumber).map(sprint => (
              <div key={sprint.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm transform hover:-translate-y-0.5">
                <div>
                  <h4 className="font-bold text-lg text-gray-800 dark:text-white">{sprint.name} (Sprint {sprint.sprintNumber})</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1"><Calendar size={14} /> Date: {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}</p>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full mt-1 inline-block ${getStatusClasses(sprint.status)}`}><Flag className="inline-block mr-1 h-3 w-3" />{sprint.status}</span>
                </div>
                <div className="flex gap-2 mt-3 md:mt-0">
                  {user?.role === 'TEACHER' && (
                    <>
                      <button onClick={() => openEditSprintModal(sprint)} className="flex items-center px-3 py-2 rounded-lg bg-blue-500 text-white font-semibold shadow-md hover:bg-blue-600 transition duration-300 transform hover:scale-105"><Edit className="mr-2" /> Modifier</button>
                      <button onClick={() => handleDeleteSprint(sprint.id, sprint.name)} className="flex items-center px-3 py-2 rounded-lg bg-red-500 text-white font-semibold shadow-md hover:bg-red-600 transition duration-300 transform hover:scale-105"><Trash2 className="mr-2" /> Supprimer</button>
                    </>
                  )}
                  <Link to={`/projects/${project.id}/sprints/${sprint.id}/kanban`} className="flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow-md hover:bg-indigo-700 transition duration-300 transform hover:scale-105"><KanbanSquare className="mr-2" /> Kanban</Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-8 bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Livrables Soumis</h2>
        <div className="space-y-4">
          {project.deliverables.map(deliverable => (
            <div key={deliverable.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-lg">{deliverable.name}</p>
                  {deliverable.grade && (
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full flex items-center">
                      <CheckCircle size={12} className="mr-1" />
                      {deliverable.grade}/20
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-2">Soumis le: {new Date(deliverable.submittedAt).toLocaleDateString()}</p>
                
                {deliverable.remarks && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-3 rounded-r text-sm text-gray-700 dark:text-gray-300 mt-2">
                    <span className="font-bold block mb-1">Remarque du professeur :</span>
                    {deliverable.remarks}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isPreviewable(deliverable.fileUrl) && (
                  <button onClick={() => openFilePreview(deliverable.fileUrl, deliverable.name)} className="flex items-center text-sm text-blue-600 hover:underline p-2 bg-blue-50 rounded-lg"><Eye size={16} className="mr-1" />Aperçu</button>
                )}
                
                <button onClick={() => handleDownload(deliverable.fileUrl, deliverable.name)} className="flex items-center text-sm text-green-600 hover:underline p-2 bg-green-50 rounded-lg"><Download size={16} className="mr-1" />Télécharger</button>
                
                {user && user.id === deliverable.submittedByUserId && (
                  <button onClick={() => handleDeleteDeliverable(deliverable.id)} className="flex items-center text-sm text-red-600 hover:underline p-2 bg-red-50 rounded-lg"><Trash2 size={16} className="mr-1" />Supprimer</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <SubmitDeliverableModal isOpen={showDeliverableModal} onClose={() => setShowDeliverableModal(false)} onSave={handleDeliverableSubmit} projectId={project.id} />
      {previewFile && <FilePreviewModal isOpen={showFilePreview} onClose={() => setShowFilePreview(false)} fileUrl={previewFile.url} fileName={previewFile.name} />}
      
      {/* ... (autres modals) */}
    </div>
  );
};

export default ProjectDetailPage;
