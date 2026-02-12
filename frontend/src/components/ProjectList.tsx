import React from "react";
import { Edit, Trash2 } from "lucide-react";

export default function ProjectList() {
  const projects = [
    { id: "1", title: "Projet A", description: "Description A", status: "todo" },
    { id: "2", title: "Projet B", description: "Description B", status: "in_progress" },
  ];

  const statusStyles: Record<string, string> = {
    todo: "bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300 border-slate-200/60 dark:border-slate-600/50",
    in_progress: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/50",
    done: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/50",
  };

  const statusLabels: Record<string, string> = {
    todo: "À faire",
    in_progress: "En cours",
    done: "Terminé",
  };

  return (
    <div className="grid gap-4">
      {projects.map((p) => (
        <div
          key={p.id}
          className="
            group
            bg-white/80 dark:bg-slate-800/80
            backdrop-blur-xl
            p-6 rounded-xl
            shadow-sm hover:shadow-md
            transition-all duration-300
            hover:-translate-y-1
            border border-slate-200/60 dark:border-slate-700/50
            hover:border-slate-300 dark:hover:border-slate-600
          "
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Infos projet */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 tracking-tight">
                {p.title}
              </h3>

              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                {p.description}
              </p>

              <span
                className={`
                  inline-block mt-3 px-3 py-1.5 rounded-lg
                  text-xs font-semibold
                  border
                  ${statusStyles[p.status]}
                `}
              >
                {statusLabels[p.status]}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
              <button
                className="
                  p-2 rounded-lg
                  bg-slate-100 dark:bg-slate-700/50
                  text-slate-700 dark:text-slate-300
                  hover:bg-slate-200 dark:hover:bg-slate-700
                  transition-all duration-200
                  hover:scale-105
                  border border-slate-200/60 dark:border-slate-600/50
                "
              >
                <Edit size={16} />
              </button>

              <button
                className="
                  p-2 rounded-lg
                  bg-red-50 dark:bg-red-900/20
                  text-red-600 dark:text-red-400
                  hover:bg-red-100 dark:hover:bg-red-900/30
                  transition-all duration-200
                  hover:scale-105
                  border border-red-200/60 dark:border-red-800/50
                "
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}