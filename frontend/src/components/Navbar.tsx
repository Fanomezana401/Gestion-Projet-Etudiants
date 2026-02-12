import React from "react";
import { PlusCircle } from "lucide-react";

interface NavbarProps {
  onAddProject: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onAddProject }) => {
  return (
    <header className="flex justify-between items-center px-8 py-5 mb-8
      bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl
      rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/50
      hover:shadow-md transition-all duration-300"
    >
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">
          Tableau de projets
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
          Suivi et organisation de vos projets
        </p>
      </div>

      <button
        onClick={onAddProject}
        className="
          flex items-center gap-2.5
          bg-slate-900 dark:bg-slate-100
          hover:bg-slate-800 dark:hover:bg-slate-200
          text-white dark:text-slate-900
          font-semibold
          px-6 py-3 rounded-xl
          shadow-sm hover:shadow-md
          transition-all duration-300
          hover:scale-105
          border border-slate-800 dark:border-slate-200
        "
      >
        <PlusCircle size={20} />
        Nouveau projet
      </button>
    </header>
  );
};

export default Navbar;