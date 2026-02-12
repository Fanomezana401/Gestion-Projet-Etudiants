// src/pages/Login.tsx
import React, { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Email: ${email}, Password: ${password}`);
    // ici tu pourras ajouter la logique de connexion
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 dark:from-slate-900 dark:via-gray-900 dark:to-stone-900 p-4">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-50 text-center mb-2 tracking-tight">
            Connexion
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
            Accédez à votre espace de gestion
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all"
            />
          </div>
          
          <button
            type="submit"
            className="w-full mt-2 py-3.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold rounded-lg shadow-lg hover:shadow-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-all duration-300 transform hover:scale-[1.02]"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}