import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import { CheckCircle2, Clock, ListTodo, TrendingUp } from "lucide-react";

export default function StatsBoard() {
  const stats = { todo: 3, in_progress: 5, done: 2 };
  const total = stats.todo + stats.in_progress + stats.done;

  // Données pour le graphique en barres (basées sur les stats réelles)
  const barChartData = [
    { name: "À faire", value: stats.todo, fill: "#64748b" },
    { name: "En cours", value: stats.in_progress, fill: "#3b82f6" },
    { name: "Terminé", value: stats.done, fill: "#10b981" },
  ];

  // Données pour le graphique groupé
  const groupedData = [
    {
      category: "Tâches",
      "À faire": stats.todo,
      "En cours": stats.in_progress,
      "Terminé": stats.done,
    },
  ];

  const statCards = [
    {
      label: "À faire",
      value: stats.todo,
      icon: ListTodo,
      bgColor: "bg-slate-50 dark:bg-slate-800/50",
      textColor: "text-slate-700 dark:text-slate-300",
      iconColor: "text-slate-600 dark:text-slate-400",
      borderColor: "border-slate-200/60 dark:border-slate-700/50",
      percentage: total > 0 ? Math.round((stats.todo / total) * 100) : 0,
    },
    {
      label: "En cours",
      value: stats.in_progress,
      icon: Clock,
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-700 dark:text-blue-300",
      iconColor: "text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-200/60 dark:border-blue-800/50",
      percentage: total > 0 ? Math.round((stats.in_progress / total) * 100) : 0,
    },
    {
      label: "Terminé",
      value: stats.done,
      icon: CheckCircle2,
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      textColor: "text-emerald-700 dark:text-emerald-300",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      borderColor: "border-emerald-200/60 dark:border-emerald-800/50",
      percentage: total > 0 ? Math.round((stats.done / total) * 100) : 0,
    },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-2">
            {payload[0].name || payload[0].payload.name}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs text-slate-600 dark:text-slate-400">
              <span style={{ color: entry.color || entry.fill }} className="font-semibold">●</span>{" "}
              {entry.name}: {entry.value} ({Math.round((entry.value / total) * 100)}%)
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec titre */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-1 h-8 bg-slate-700 dark:bg-slate-300 mr-3 rounded-full"></div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">
            Statistiques des tâches
          </h2>
        </div>
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <TrendingUp size={20} />
          <span className="text-sm font-semibold">
            {stats.done > 0 ? `${Math.round((stats.done / total) * 100)}%` : '0%'} complété
          </span>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid md:grid-cols-3 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`${stat.bgColor} ${stat.borderColor} p-6 rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${stat.bgColor} border ${stat.borderColor}`}>
                  <Icon size={22} className={stat.iconColor} />
                </div>
                <span className={`text-xs font-semibold ${stat.textColor} bg-white dark:bg-slate-800 px-2.5 py-1 rounded-full border ${stat.borderColor}`}>
                  {stat.percentage}%
                </span>
              </div>
              <h3 className={`text-sm font-semibold ${stat.textColor} mb-1`}>
                {stat.label}
              </h3>
              <p className={`text-3xl font-bold ${stat.textColor}`}>
                {stat.value}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                {stat.value} tâche{stat.value > 1 ? "s" : ""}
              </p>
            </div>
          );
        })}
      </div>

      {/* Graphiques d'évolution */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Graphique en barres verticales */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4 tracking-tight">
            Répartition des tâches
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                style={{ fontSize: '12px', fontWeight: '600' }}
              />
              <YAxis 
                stroke="#64748b" 
                style={{ fontSize: '12px', fontWeight: '600' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {barChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Graphique en barres groupées */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4 tracking-tight">
            Vue comparative
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={groupedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
              <XAxis 
                dataKey="category" 
                stroke="#64748b" 
                style={{ fontSize: '12px', fontWeight: '600' }}
              />
              <YAxis 
                stroke="#64748b" 
                style={{ fontSize: '12px', fontWeight: '600' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px', fontWeight: '600' }}
                iconType="square"
              />
              <Bar dataKey="À faire" fill="#64748b" radius={[8, 8, 0, 0]} />
              <Bar dataKey="En cours" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Terminé" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Barre de progression globale */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Progression globale
          </h3>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-50">
            {total > 0 ? Math.round((stats.done / total) * 100) : 0}% complété
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
          <div className="h-full flex">
            <div
              className="bg-slate-500 dark:bg-slate-400 transition-all duration-500"
              style={{ width: `${(stats.todo / total) * 100}%` }}
            ></div>
            <div
              className="bg-blue-500 dark:bg-blue-400 transition-all duration-500"
              style={{ width: `${(stats.in_progress / total) * 100}%` }}
            ></div>
            <div
              className="bg-emerald-500 dark:bg-emerald-400 transition-all duration-500"
              style={{ width: `${(stats.done / total) * 100}%` }}
            ></div>
          </div>
        </div>
        <div className="flex justify-between mt-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>{stats.todo} à faire</span>
          <span>{stats.in_progress} en cours</span>
          <span>{stats.done} terminé{stats.done > 1 ? "s" : ""}</span>
        </div>
      </div>
    </div>
  );
}