import React, { useState } from "react";
import { Home, Folder, User, Moon, Sun } from "lucide-react";

export default function Sidebar() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <aside
      className="
        w-64 h-screen
        bg-white dark:bg-slate-900
        border-r border-slate-200/60 dark:border-slate-800/50
        shadow-sm
        flex flex-col
        px-6 py-6
      "
    >
      {/* Logo avec barre indicateur */}
      <div className="mb-10">
        <div className="flex items-center mb-1">
          <div className="w-1 h-8 bg-slate-700 dark:bg-slate-300 mr-3 rounded-full"></div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">
            ProjManager
          </h1>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 ml-4 font-medium">
          Gestion intelligente
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2">
        <button
          className="
            flex items-center gap-3
            px-4 py-3
            rounded-xl
            text-slate-700 dark:text-slate-200
            hover:bg-slate-100 dark:hover:bg-slate-800
            hover:text-slate-900 dark:hover:text-slate-50
            transition-all duration-200
            border border-transparent
            hover:border-slate-200 dark:hover:border-slate-700
          "
        >
          <Home size={20} />
          <span className="font-semibold">Tableau de bord</span>
        </button>

        <button
          className="
            flex items-center gap-3
            px-4 py-3
            rounded-xl
            text-slate-700 dark:text-slate-200
            hover:bg-slate-100 dark:hover:bg-slate-800
            hover:text-slate-900 dark:hover:text-slate-50
            transition-all duration-200
            border border-transparent
            hover:border-slate-200 dark:hover:border-slate-700
          "
        >
          <Folder size={20} />
          <span className="font-semibold">Projets</span>
        </button>

        <button
          className="
            flex items-center gap-3
            px-4 py-3
            rounded-xl
            text-slate-700 dark:text-slate-200
            hover:bg-slate-100 dark:hover:bg-slate-800
            hover:text-slate-900 dark:hover:text-slate-50
            transition-all duration-200
            border border-transparent
            hover:border-slate-200 dark:hover:border-slate-700
          "
        >
          <User size={20} />
          <span className="font-semibold">Profil</span>
        </button>
      </nav>

      {/* Dark mode toggle */}
      <div className="pt-6 border-t border-slate-200/60 dark:border-slate-800/50 flex justify-center">
        <button
          onClick={toggleDarkMode}
          className="
            flex items-center gap-2.5
            px-5 py-2.5
            rounded-xl
            bg-slate-100 dark:bg-slate-800
            text-slate-700 dark:text-slate-200
            hover:bg-slate-200 dark:hover:bg-slate-700
            transition-all duration-200
            border border-slate-200/60 dark:border-slate-700/50
            shadow-sm
          "
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          <span className="text-sm font-semibold">
            {darkMode ? "Light" : "Dark"}
          </span>
        </button>
      </div>
    </aside>
  );
}