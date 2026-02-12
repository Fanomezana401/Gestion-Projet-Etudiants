import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const registerSchema = z.object({
  firstname: z.string().min(1, { message: 'Le prénom est requis' }),
  lastname: z.string().min(1, { message: 'Le nom est requis' }),
  email: z.string().email({ message: 'Adresse email invalide' }),
  password: z.string().min(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' }),
  role: z.enum(['STUDENT', 'TEACHER'], { message: 'Veuillez sélectionner un rôle valide' }),
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  });

  if (!authContext) return null;

  const { login } = authContext;

  const onSubmit = async (data: RegisterFormInputs) => {
    try {
      const response = await api.post('/auth/register', data);
      const token = response.data.token;
      login(token);
      navigate('/dashboard');
    } catch (error: any) {
      setError('root', {
        type: 'manual',
        message: error.response?.data?.message || "Une erreur s'est produite lors de l'inscription.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 dark:from-slate-900 dark:via-gray-900 dark:to-stone-900">
      <div className="w-full max-w-md p-8 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700">
        <div className="mb-8 pb-6 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight text-center">
            Inscription
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 text-center">
            Créez votre compte
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {errors.root && (
            <div className="p-4 text-sm text-red-800 bg-red-50 dark:bg-red-900/20 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800">
              {errors.root.message}
            </div>
          )}

          {/* Prénom & Nom */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstname" className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Prénom <span className="text-red-500">*</span>
              </label>
              <input
                id="firstname"
                {...register('firstname')}
                type="text"
                placeholder="Votre prénom"
                className={`w-full py-3 px-4 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.firstname
                    ? 'border-red-400 focus:ring-red-500 focus:border-red-500'
                    : 'border-slate-300 dark:border-slate-600 focus:ring-slate-400 focus:border-slate-400'
                }`}
              />
              {errors.firstname && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.firstname.message}</p>}
            </div>
            <div>
              <label htmlFor="lastname" className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                id="lastname"
                {...register('lastname')}
                type="text"
                placeholder="Votre nom"
                className={`w-full py-3 px-4 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.lastname
                    ? 'border-red-400 focus:ring-red-500 focus:border-red-500'
                    : 'border-slate-300 dark:border-slate-600 focus:ring-slate-400 focus:border-slate-400'
                }`}
              />
              {errors.lastname && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.lastname.message}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              {...register('email')}
              type="email"
              placeholder="votre.email@exemple.com"
              className={`w-full py-3 px-4 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                errors.email
                  ? 'border-red-400 focus:ring-red-500 focus:border-red-500'
                  : 'border-slate-300 dark:border-slate-600 focus:ring-slate-400 focus:border-slate-400'
              }`}
            />
            {errors.email && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.email.message}</p>}
          </div>

          {/* Mot de passe */}
          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Mot de passe <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              {...register('password')}
              type="password"
              placeholder="••••••••"
              className={`w-full py-3 px-4 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                errors.password
                  ? 'border-red-400 focus:ring-red-500 focus:border-red-500'
                  : 'border-slate-300 dark:border-slate-600 focus:ring-slate-400 focus:border-slate-400'
              }`}
            />
            {errors.password && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.password.message}</p>}
          </div>

          {/* Rôle */}
          <div>
            <label htmlFor="role" className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Je suis un... <span className="text-red-500">*</span>
            </label>
            <select
              id="role"
              {...register('role')}
              className={`w-full py-3 px-4 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                errors.role
                  ? 'border-red-400 focus:ring-red-500 focus:border-red-500'
                  : 'border-slate-300 dark:border-slate-600 focus:ring-slate-400 focus:border-slate-400'
              }`}
            >
              <option value="">Sélectionner un rôle</option>
              <option value="STUDENT">Étudiant</option>
              <option value="TEACHER">Professeur</option>
            </select>
            {errors.role && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.role.message}</p>}
          </div>

          {/* Bouton inscription */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex items-center justify-center bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold py-3.5 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              <span className="relative z-10">
                {isSubmitting ? "Inscription..." : "S'inscrire"}
              </span>
              <div className="absolute inset-0 bg-slate-800 dark:bg-slate-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </form>

        {/* Lien connexion */}
        <p className="text-center text-slate-600 dark:text-slate-400 text-sm mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-slate-900 dark:text-slate-100 hover:underline font-semibold">
            Connectez-vous
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
