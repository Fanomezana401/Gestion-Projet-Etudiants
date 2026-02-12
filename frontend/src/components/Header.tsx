import React, { useState } from "react";
import { PlusCircle, Bell, User, ChevronDown } from "lucide-react";

interface HeaderProps {
  onCreateProject: () => void;
}

export default function Header({ onCreateProject }: HeaderProps) {
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <header className="flex justify-between items-center bg-white dark:bg-slate-800 p-5 shadow-lg rounded-lg mb-6 border border-slate-200 dark:border-slate-700">
      {/* Titre */}
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">
        Gestion des projets
      </h1>

      <div className="flex items-center gap-4">
        {/* Bouton créer projet */}
        <button
          onClick={onCreateProject}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          <PlusCircle size={20} />
          <span className="font-semibold">Nouveau projet</span>
        </button>

        {/* Notification */}
        <button className="relative p-2.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 border border-transparent hover:border-slate-300 dark:hover:border-slate-600">
          <Bell size={20} className="text-slate-700 dark:text-slate-300" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-800 animate-pulse"></span>
        </button>

        {/* Menu utilisateur */}
        <div className="relative">
          <button
            onClick={() => setOpenMenu(!openMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 border border-transparent hover:border-slate-300 dark:hover:border-slate-600"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 dark:from-slate-400 dark:to-slate-600 flex items-center justify-center text-white dark:text-slate-900 shadow-md">
              <User size={16} />
            </div>
            <ChevronDown
              size={16}
              className={`text-slate-600 dark:text-slate-300 transition-transform ${
                openMenu ? "rotate-180" : ""
              }`}
            />
          </button>

          {openMenu && (
            <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-slate-800 shadow-2xl rounded-lg overflow-hidden z-50 border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2">
              <button className="block w-full text-left px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                Profil
              </button>
              <button className="block w-full text-left px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                Paramètres
              </button>
              <button className="block w-full text-left px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 font-medium transition-colors border-t border-slate-200 dark:border-slate-700">
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}