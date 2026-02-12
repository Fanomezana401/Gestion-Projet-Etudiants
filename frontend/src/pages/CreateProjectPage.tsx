import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Loader2, ArrowLeft, PlusCircle, Trash2, Users, Rocket } from 'lucide-react'; // Importez les icônes nécessaires

// Mise à jour du schéma pour la collaboration
const projectSchema = z.object({
  name: z.string().min(3, { message: 'Le nom du projet doit contenir au moins 3 caractères.' }),
  description: z.string().optional(),
  numberOfSprints: z.coerce.number().min(1, { message: 'Il doit y avoir au moins 1 sprint.' }).max(20, { message: 'Maximum 20 sprints.' }),
  sprintDurationInDays: z.coerce.number().min(7, { message: 'Un sprint doit durer au moins 7 jours.' }).max(30, { message: 'Un sprint ne peut pas dépasser 30 jours.' }),
  memberEmails: z.array(z.object({ email: z.string().email({ message: 'Email invalide.' }) })).optional(),
  supervisorEmail: z.string().email({ message: 'Email invalide.' }).optional().or(z.literal('')),
});

type ProjectFormInputs = z.infer<typeof projectSchema>;

const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormInputs>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      sprintDurationInDays: 14,
      memberEmails: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "memberEmails",
  });

  const onSubmit = async (data: ProjectFormInputs) => {
    try {
      setServerError(null);
      // Transformer les données pour correspondre au DTO du backend
      const requestData = {
        ...data,
        memberEmails: data.memberEmails?.map(m => m.email),
      };
      await api.post('/projects', requestData);
      navigate('/dashboard');
    } catch (error: any) {
      setServerError(error.response?.data?.message || "Une erreur s'est produite lors de la création du projet.");
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-full">
      <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="flex items-center mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center justify-center p-2 rounded-full hover:bg-gray-200 transition duration-200 mr-4">
            <ArrowLeft className="h-6 w-6 text-gray-700" />
          </button>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Créer un nouveau projet</h1>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {serverError && <div className="p-3 text-sm text-red-800 bg-red-100 rounded-lg border border-red-300">{serverError}</div>}

          {/* Section Détails */}
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-2xl border border-gray-100 dark:border-gray-600">
            <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-800 dark:text-gray-100">
              Détails du Projet
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block mb-2 font-medium text-gray-700 dark:text-gray-200">Nom du projet <span className="text-red-500">*</span></label>
                <input id="name" {...register('name')} className={`w-full p-3 rounded-xl border bg-gray-100 dark:bg-gray-600 focus:outline-none focus:ring-2 transition ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} dark:text-white`} />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>
              <div>
                <label htmlFor="description" className="block mb-2 font-medium text-gray-700 dark:text-gray-200">Description</label>
                <textarea id="description" {...register('description')} rows={4} className="w-full p-3 rounded-xl border bg-gray-100 dark:bg-gray-600 resize-none focus:outline-none focus:ring-2 border-gray-300 focus:ring-indigo-500 dark:text-white" />
              </div>
            </div>
          </div>

          {/* Section Planification */}
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-2xl border border-gray-100 dark:border-gray-600">
            <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-800 dark:text-gray-100">
              Planification des Sprints
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="numberOfSprints" className="block mb-2 font-medium text-gray-700 dark:text-gray-200">Nombre de Sprints <span className="text-red-500">*</span></label>
                <input id="numberOfSprints" type="number" {...register('numberOfSprints')} className={`w-full p-3 rounded-xl border bg-gray-100 dark:bg-gray-600 focus:outline-none focus:ring-2 ${errors.numberOfSprints ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} dark:text-white`} />
                {errors.numberOfSprints && <p className="mt-1 text-sm text-red-600">{errors.numberOfSprints.message}</p>}
              </div>
              <div>
                <label htmlFor="sprintDurationInDays" className="block mb-2 font-medium text-gray-700 dark:text-gray-200">Durée d'un sprint (en jours) <span className="text-red-500">*</span></label>
                <input id="sprintDurationInDays" type="number" {...register('sprintDurationInDays')} className={`w-full p-3 rounded-xl border bg-gray-100 dark:bg-gray-600 focus:outline-none focus:ring-2 ${errors.sprintDurationInDays ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} dark:text-white`} />
                {errors.sprintDurationInDays && <p className="mt-1 text-sm text-red-600">{errors.sprintDurationInDays.message}</p>}
              </div>
            </div>
          </div>

          {/* Section Membres */}
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-2xl border border-gray-100 dark:border-gray-600">
            <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-800 dark:text-gray-100">
              <Users className="mr-2 text-indigo-600" /> Membres et Supervision
            </h3>
            <div>
              <label htmlFor="supervisorEmail" className="block mb-2 font-medium text-gray-700 dark:text-gray-200">Email du Superviseur</label>
              <input id="supervisorEmail" {...register('supervisorEmail')} placeholder="professeur@exemple.com" className={`w-full p-3 rounded-xl border bg-gray-100 dark:bg-gray-600 focus:outline-none focus:ring-2 ${errors.supervisorEmail ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} dark:text-white`} />
              {errors.supervisorEmail && <p className="mt-1 text-sm text-red-600">{errors.supervisorEmail.message}</p>}
            </div>
            <div className="mt-4">
              <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">Emails des Membres</label>
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-4 items-center mb-3">
                  <input
                    type="email"
                    placeholder="Email du membre"
                    {...register(`memberEmails.${index}.email`)}
                    className={`flex-1 p-3 rounded-xl border bg-gray-100 dark:bg-gray-600 focus:outline-none focus:ring-2 ${errors.memberEmails?.[index]?.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} dark:text-white`}
                  />
                  <button type="button" onClick={() => remove(index)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => append({ email: "" })}
                className="flex items-center text-indigo-600 hover:text-indigo-800 mt-4 font-medium p-1 rounded-lg hover:bg-indigo-50 transition"
              >
                <PlusCircle size={18} className="mr-2" /> Ajouter un membre
              </button>
            </div>
          </div>

          {/* Bouton de soumission (Très stylisé) */}
          <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="group flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-8 rounded-2xl shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 disabled:opacity-50 relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Rocket className="mr-2 h-5 w-5" />}
                {isSubmitting ? 'Création...' : 'Créer le projet'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectPage;
