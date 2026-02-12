import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useSse } from '../context/SseContext';
import { Loader2, Mail, Check, X } from 'lucide-react';

interface Invitation {
  id: number;
  projectName: string;
  senderName: string;
  role: string;
  sentAt: string;
}

const InvitationsPage: React.FC = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { clearNewInvitation } = useSse();

  useEffect(() => {
    clearNewInvitation();
    fetchInvitations();
  }, [clearNewInvitation]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const response = await api.get<Invitation[]>('/invitations/my-invitations');
      setInvitations(response.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors de la récupération des invitations.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (invitationId: number) => {
    try {
      await api.post(`/invitations/${invitationId}/accept`);
      fetchInvitations();
    } catch (err) {
      console.error("Erreur lors de l'acceptation de l'invitation:", err);
    }
  };

  const handleDecline = async (invitationId: number) => {
    try {
      await api.post(`/invitations/${invitationId}/decline`);
      fetchInvitations();
    } catch (err) {
      console.error("Erreur lors du refus de l'invitation:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 dark:from-slate-900 dark:via-gray-900 dark:to-stone-900">
        <div className="relative">
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 rounded-full blur-xl opacity-50 animate-pulse"></div>
          <Loader2 className="relative h-12 w-12 animate-spin text-slate-700 dark:text-slate-300" />
        </div>
        <p className="mt-6 text-sm font-medium text-slate-600 dark:text-slate-400 animate-pulse">
          Chargement des invitations...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 dark:from-slate-900 dark:via-gray-900 dark:to-stone-900">
        <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 dark:from-slate-900 dark:via-gray-900 dark:to-stone-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-50 mb-2 flex items-center tracking-tight">
            <Mail className="mr-3 text-slate-600 dark:text-slate-400 h-8 w-8" /> 
            Mes Invitations
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 ml-11">Gérez vos invitations aux projets</p>
        </div>
        
        {invitations.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full mb-4">
              <Mail className="h-8 w-8 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium">Vous n'avez aucune invitation en attente.</p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">Les nouvelles invitations apparaîtront ici</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map(invitation => (
              <div 
                key={invitation.id} 
                className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-600 hover:-translate-y-0.5"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-slate-800 dark:text-slate-200 text-base leading-relaxed">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{invitation.senderName}</span>
                      <span className="text-slate-600 dark:text-slate-400"> vous a invité à rejoindre le projet </span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{invitation.projectName}</span>
                      <span className="text-slate-600 dark:text-slate-400"> en tant que </span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{invitation.role}</span>
                      <span className="text-slate-600 dark:text-slate-400">.</span>
                    </p>
                    <p className="text-slate-500 dark:text-slate-500 text-xs mt-2 flex items-center">
                      <span className="inline-block w-1.5 h-1.5 bg-slate-400 dark:bg-slate-600 rounded-full mr-2"></span>
                      Reçu le {new Date(invitation.sentAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAccept(invitation.id)}
                      className="flex items-center justify-center px-5 py-3 bg-emerald-600 dark:bg-emerald-500 text-white rounded-lg hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 font-medium"
                    >
                      <Check size={18} className="mr-1.5" />
                      Accepter
                    </button>
                    <button
                      onClick={() => handleDecline(invitation.id)}
                      className="flex items-center justify-center px-5 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 font-medium"
                    >
                      <X size={18} className="mr-1.5" />
                      Refuser
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitationsPage;