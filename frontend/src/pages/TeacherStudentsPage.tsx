import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Loader2, Book, BarChart2 } from 'lucide-react';

interface Student {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  projectsCount: number;
  completedTasksCount: number;
}

const TeacherStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await api.get<Student[]>('/teacher/students');
        setStudents(response.data);
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || 'Erreur lors de la récupération des étudiants.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-10 w-10 animate-spin text-indigo-600" /></div>;
  if (error) return <div className="text-center p-8 text-red-600">{error}</div>;

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Suivi des Étudiants</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
            Aucun étudiant supervisé pour le moment.
          </div>
        ) : (
          students.map(student => (
            <div key={student.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 hover:scale-102 transform transition">
              <p className="font-bold text-lg text-gray-800 dark:text-white mb-1">{student.firstname} {student.lastname}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{student.email}</p>
              <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <Book className="h-4 w-4" /> Projets: {student.projectsCount}
                </div>
                <div className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4" /> Tâches Terminées: {student.completedTasksCount}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeacherStudentsPage;
