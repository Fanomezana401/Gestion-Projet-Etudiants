import React from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

type State = { hasError: boolean; error?: Error };

export default class ErrorBoundary extends React.Component<{}, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: any) {
    // tu peux logger l'erreur ailleurs
    console.error("Captured by ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 dark:from-slate-900 dark:via-gray-900 dark:to-stone-900 px-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 p-8 text-center">
            
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
              </div>
            </div>

            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 mb-3 tracking-tight">
              Oups… une erreur est survenue
            </h1>

            <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
              Une erreur inattendue s'est produite.  
              Veuillez consulter la console pour plus de détails techniques.
            </p>

            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold shadow-lg hover:shadow-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-all duration-300 transform hover:scale-105"
            >
              <RefreshCcw className="h-4 w-4" />
              Recharger la page
            </button>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}