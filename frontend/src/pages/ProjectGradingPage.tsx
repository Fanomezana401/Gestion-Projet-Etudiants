import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Loader2, ArrowLeft, Star, MessageSquare } from 'lucide-react';

/* ===================== INTERFACES ===================== */
interface Deliverable {
  id: number;
  name: string;
  submittedAt: string;
  fileUrl: string;
  grade?: number;
  remarks?: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  deliverables: Deliverable[];
}

/* ===================== COMPONENT ===================== */
const ProjectGradingPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [grades, setGrades] = useState<Record<number, number | undefined>>({});
  const [remarks, setRemarks] = useState<Record<number, string>>({});

  /* ===================== FETCH ===================== */
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await api.get<Project>(
          `/teacher/projects/${projectId}/details`
        );
        setProject(response.data);

        const initialGrades: Record<number, number | undefined> = {};
        const initialRemarks: Record<number, string> = {};
        response.data.deliverables.forEach(d => {
          initialGrades[d.id] = d.grade;
          initialRemarks[d.id] = d.remarks || '';
        });

        setGrades(initialGrades);
        setRemarks(initialRemarks);
        setError(null);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
          'Erreur lors de la récupération des détails du projet.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  /* ===================== HANDLERS ===================== */
  const handleGradeChange = (deliverableId: number, grade: string) => {
    setGrades(prev => ({ ...prev, [deliverableId]: Number(grade) }));
  };

  const handleRemarkChange = (deliverableId: number, remark: string) => {
    setRemarks(prev => ({ ...prev, [deliverableId]: remark }));
  };

  const handleSaveGrade = async (deliverableId: number) => {
    try {
      await api.post(`/teacher/deliverables/${deliverableId}/grade`, {
        grade: grades[deliverableId],
        remarks: remarks[deliverableId],
      });
      alert('Note et remarque enregistrées avec succès !');
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de l'enregistrement.");
    }
  };

  /* ===================== STATES ===================== */
  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  /* ===================== UI ===================== */
  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 p-6">

      {/* HEADER */}
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="rounded-full p-2 transition hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white">
            Évaluation du projet
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {project?.name}
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="rounded-3xl bg-white p-6 shadow-xl dark:bg-gray-800">
        <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-white">
          Livrables soumis
        </h2>

        {project?.deliverables.length === 0 ? (
          <p className="py-12 text-center text-gray-500 dark:text-gray-400">
            Aucun livrable soumis pour ce projet.
          </p>
        ) : (
          <div className="space-y-6">
            {project?.deliverables.map(deliverable => (
              <div
                key={deliverable.id}
                className="rounded-2xl border border-gray-200 p-5 transition hover:shadow-md dark:border-gray-700"
              >
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                  {/* INFOS */}
                  <div>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">
                      {deliverable.name}
                    </p>
                    <a
                      href={deliverable.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      Télécharger le livrable
                    </a>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Soumis le {new Date(deliverable.submittedAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* EVALUATION */}
                  <div className="flex flex-col gap-4 md:flex-row md:items-center">

                    {/* NOTE */}
                    <div className="flex items-center gap-2 rounded-xl bg-yellow-50 px-4 py-2 dark:bg-yellow-900/30">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <input
                        type="number"
                        value={grades[deliverable.id] || ''}
                        onChange={(e) =>
                          handleGradeChange(deliverable.id, e.target.value)
                        }
                        placeholder="Note /20"
                        className="w-24 rounded-lg border border-gray-300 bg-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:border-gray-600 dark:bg-gray-800"
                      />
                    </div>

                    {/* REMARQUES */}
                    <div className="flex items-start gap-2 rounded-xl bg-gray-50 px-4 py-2 dark:bg-gray-700">
                      <MessageSquare className="mt-1 h-5 w-5 text-gray-500" />
                      <textarea
                        value={remarks[deliverable.id] || ''}
                        onChange={(e) =>
                          handleRemarkChange(deliverable.id, e.target.value)
                        }
                        placeholder="Remarques du professeur..."
                        rows={2}
                        className="w-64 resize-none rounded-lg border border-gray-300 bg-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:border-gray-600 dark:bg-gray-800"
                      />
                    </div>

                    {/* SAVE */}
                    <button
                      onClick={() => handleSaveGrade(deliverable.id)}
                      className="rounded-xl bg-green-600 px-5 py-2 font-semibold text-white shadow hover:bg-green-700 transition"
                    >
                      Enregistrer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectGradingPage;
