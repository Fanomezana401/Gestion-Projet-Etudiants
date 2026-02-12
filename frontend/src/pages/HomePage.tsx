import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Users, Clock, CheckCircle } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 dark:from-slate-900 dark:via-gray-900 dark:to-stone-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute w-96 h-96 bg-slate-300 dark:bg-slate-700 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-10 animate-blob" style={{ top: '-12rem', left: '-12rem', animationDelay: '0s' }}></div>
        <div className="absolute w-96 h-96 bg-gray-300 dark:bg-gray-700 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-10 animate-blob" style={{ bottom: '-12rem', right: '-12rem', animationDelay: '2s' }}></div>
        <div className="absolute w-96 h-96 bg-stone-300 dark:bg-stone-700 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-10 animate-blob" style={{ top: '20%', right: '-10rem', animationDelay: '4s' }}></div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mb-12 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-12 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700">
          <h1 className="text-6xl font-semibold text-slate-900 dark:text-slate-50 mb-6 tracking-tight">
            Gérez vos projets <span className="text-slate-700 dark:text-slate-300 font-bold">simplement</span> et <span className="text-slate-700 dark:text-slate-300 font-bold">efficacement</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
            Organisez, collaborez et réussissez vos projets académiques avec intelligence.
          </p>
          <Link 
            to="/login" 
            className="inline-block px-10 py-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold rounded-lg shadow-lg hover:shadow-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-all duration-300 transform hover:scale-105"
          >
            Commencer
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-2xl hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 group transform hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-slate-600 to-slate-800 dark:from-slate-400 dark:to-slate-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Zap className="w-7 h-7 text-white dark:text-slate-900" />
            </div>
            <h3 className="text-slate-900 dark:text-slate-50 font-semibold text-lg mb-3">Rapidité d'exécution</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Créez et gérez vos tâches en un clin d'œil.</p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-2xl hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 group transform hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-gray-600 to-gray-800 dark:from-gray-400 dark:to-gray-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Users className="w-7 h-7 text-white dark:text-slate-900" />
            </div>
            <h3 className="text-slate-900 dark:text-slate-50 font-semibold text-lg mb-3">Collaboration Facile</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Invitez des membres et travaillez ensemble.</p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-2xl hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 group transform hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-stone-600 to-stone-800 dark:from-stone-400 dark:to-stone-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Clock className="w-7 h-7 text-white dark:text-slate-900" />
            </div>
            <h3 className="text-slate-900 dark:text-slate-50 font-semibold text-lg mb-3">Suivi en Temps Réel</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Restez informé de l'avancement de vos projets.</p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-2xl hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 group transform hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-300 dark:to-slate-500 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <CheckCircle className="w-7 h-7 text-white dark:text-slate-900" />
            </div>
            <h3 className="text-slate-900 dark:text-slate-50 font-semibold text-lg mb-3">Objectifs Atteints</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Visualisez vos progrès et célébrez vos succès.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;