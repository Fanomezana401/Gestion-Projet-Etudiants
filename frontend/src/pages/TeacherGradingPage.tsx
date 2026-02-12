import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Loader2, CheckCircle, FileText, Download, Eye, Clock, Check } from 'lucide-react';
import FilePreviewModal from '../components/FilePreviewModal';

interface Deliverable {
  id: number;
  name: string;
  fileUrl: string;
  submittedAt: string;
  projectName: string;
  submittedByUserName: string;
  grade?: number;
  remarks?: string;
}

const TeacherGradingPage: React.FC = () => {
  const [toGrade, setToGrade] = useState<Deliverable[]>([]);
  const [graded, setGraded] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);
  const [grade, setGrade] = useState<number | ''>('');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showFilePreview, setShowFilePreview] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string } | null>(null);

  useEffect(() => {
    fetchDeliverables();
  }, []);

  const fetchDeliverables = async () => {
    try {
      setLoading(true);
      const response = await api.get<Deliverable[]>('/teacher/deliverables/to-grade');
      setToGrade(response.data.filter(d => d.grade == null));
      setGraded(response.data.filter(d => d.grade != null));
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les livrables.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenGradeModal = (deliverable: Deliverable) => {
    setSelectedDeliverable(deliverable);
    setGrade(deliverable.grade || '');
    setRemarks(deliverable.remarks || '');
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeliverable) return;

    setIsSubmitting(true);
    try {
      await api.post(`/teacher/deliverables/${selectedDeliverable.id}/grade`, {
        grade: Number(grade),
        remarks
      });
      fetchDeliverables();
      setSelectedDeliverable(null);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement de la note.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openFilePreview = (fileUrl: string, fileName: string) => {
    setPreviewFile({ url: fileUrl, name: fileName });
    setShowFilePreview(true);
  };

  const getFileNameFromUrl = (url: string) => url.substring(url.lastIndexOf('/') + 1);
  const isPreviewable = (fileUrl: string) => ['pdf','png','jpg','jpeg','gif','webp'].includes(fileUrl.split('.').pop()?.toLowerCase() || '');

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-10 w-10 animate-spin text-indigo-600" /></div>;

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Évaluation des Livrables</h1>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Liste des livrables */}
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center">
              <Clock className="mr-2 text-yellow-500" /> En attente de notation ({toGrade.length})
            </h2>
            <div className="space-y-4">
              {toGrade.length === 0 ? <p className="text-gray-500">Aucun livrable en attente.</p> :
                toGrade.map(d => (
                  <div key={d.id} 
                       className={`bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-l-4 cursor-pointer transition ${selectedDeliverable?.id === d.id ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-yellow-500'}`}
                       onClick={() => handleOpenGradeModal(d)}
                  >
                    <h3 className="font-semibold text-gray-800 dark:text-white">{d.name}</h3>
                    <p className="text-sm text-gray-500">{d.projectName} - {new Date(d.submittedAt).toLocaleDateString()}</p>
                  </div>
                ))
              }
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center">
              <Check className="mr-2 text-green-500" /> Historique des notations ({graded.length})
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {graded.length === 0 ? <p className="text-gray-500">Aucun livrable noté.</p> :
                graded.map(d => (
                  <div key={d.id} 
                       className={`bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-l-4 cursor-pointer transition ${selectedDeliverable?.id === d.id ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-green-500'}`}
                       onClick={() => handleOpenGradeModal(d)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white">{d.name}</h3>
                        <p className="text-sm text-gray-500">{d.projectName}</p>
                      </div>
                      <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">{d.grade}/20</span>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {/* Panneau de notation */}
        <div className="lg:sticky lg:top-6 h-fit">
          {selectedDeliverable ? (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Noter : {selectedDeliverable.name}</h2>
              <div className="mb-4 flex gap-2">
                {isPreviewable(selectedDeliverable.fileUrl) ? (
                  <button onClick={(e) => { e.stopPropagation(); openFilePreview(selectedDeliverable.fileUrl, selectedDeliverable.name); }}
                          className="text-xs flex items-center text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded">
                    <Eye size={14} className="mr-1" /> Aperçu
                  </button>
                ) : (
                  <a href={`http://localhost:8080/api/files/download/${getFileNameFromUrl(selectedDeliverable.fileUrl)}`} 
                     onClick={(e) => e.stopPropagation()}
                     className="text-xs flex items-center text-green-600 hover:underline bg-green-50 px-2 py-1 rounded">
                    <Download size={14} className="mr-1" /> Télécharger
                  </a>
                )}
              </div>

              <form onSubmit={handleGradeSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Note (/20)</label>
                  <input type="number" min="0" max="20" step="0.5" value={grade} 
                         onChange={(e) => setGrade(Number(e.target.value))}
                         className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remarques / Feedback</label>
                  <textarea rows={4} value={remarks} onChange={(e) => setRemarks(e.target.value)}
                            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500"
                            placeholder="Ex: Excellent travail, mais attention à..." />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setSelectedDeliverable(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center">
                    {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-center text-gray-500">
              <FileText className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p>Sélectionnez un livrable à gauche pour commencer la notation.</p>
            </div>
          )}
        </div>
      </div>

      {previewFile && (
        <FilePreviewModal 
          isOpen={showFilePreview} 
          onClose={() => setShowFilePreview(false)} 
          fileUrl={previewFile.url} 
          fileName={previewFile.name} 
        />
      )}
    </div>
  );
};

export default TeacherGradingPage;
