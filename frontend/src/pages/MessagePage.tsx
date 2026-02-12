import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { Loader2, Send, CheckCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSse } from '../context/SseContext';

interface Message {
  id: number;
  senderId: number;
  senderFirstname: string;
  senderLastname: string;
  senderEmail: string;
  content: string;
  sentAt: string;
  projectId: number;
  isRead: boolean;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (date.toDateString() === yesterday.toDateString()) return "Hier";
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
};

const MessagePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const { messagesByProject, loadMessagesForProject } = useSse();
  const [newMessageContent, setNewMessageContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const pId = Number(projectId);
  const messages = messagesByProject.get(pId) || [];

  useEffect(() => {
    loadMessagesForProject(pId);
    api.put(`/messages/project/${pId}/mark-as-read`).catch(console.error);
  }, [pId, loadMessagesForProject]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessageContent.trim() || !pId) return;
    
    const chatMessage = { projectId: pId, content: newMessageContent };

    try {
      setNewMessageContent('');
      await api.post('/messages', chatMessage);
    } catch (err) {
      console.error("Erreur lors de l'envoi du message:", err);
      setNewMessageContent(chatMessage.content);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [newMessageContent]);

  let lastDate = '';

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 dark:from-slate-900 dark:via-gray-900 dark:to-stone-900">
      {/* Entête de la Conversation */}
      <header className="p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">
          Conversation du Projet #{projectId}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Échangez avec votre équipe
        </p>
      </header>

      {/* Zone des Messages */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isMyMessage = msg.senderEmail === user?.email;
          const senderName = isMyMessage ? 'Vous' : `${msg.senderFirstname} ${msg.senderLastname}`;
          const messageDate = formatDate(msg.sentAt);
          const showDateHeader = messageDate !== lastDate;
          lastDate = messageDate;

          return (
            <React.Fragment key={msg.id}>
              {showDateHeader && (
                <div className="flex justify-center my-4">
                  <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600">
                    {messageDate}
                  </span>
                </div>
              )}
              <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] p-4 shadow-lg border transition-all ${
                  isMyMessage 
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-800 dark:border-slate-200 rounded-t-xl rounded-bl-xl rounded-br-none' 
                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 rounded-t-xl rounded-br-xl rounded-bl-none'
                }`}>
                  {!isMyMessage && (
                    <p className="font-semibold text-sm mb-2 text-slate-700 dark:text-slate-300">
                      {senderName}
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  <div className={`flex items-center justify-end text-xs mt-2 ${
                    isMyMessage 
                      ? 'text-slate-300 dark:text-slate-600' 
                      : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    <span>{new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isMyMessage && msg.isRead && (
                      <CheckCheck size={14} className="ml-1.5" />
                    )}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Champ de Saisie */}
      <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg">
        <div className="flex items-end gap-3">
          <textarea
            ref={textareaRef}
            value={newMessageContent}
            onChange={(e) => setNewMessageContent(e.target.value)}
            onKeyPress={(e) => { 
              if (e.key === 'Enter' && !e.shiftKey) { 
                e.preventDefault(); 
                handleSendMessage(); 
              } 
            }}
            placeholder="Écrivez votre message..."
            className="flex-1 border border-slate-300 dark:border-slate-600 p-3 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 focus:outline-none resize-none bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all"
            rows={1}
          />
          <button 
            onClick={handleSendMessage} 
            disabled={!newMessageContent.trim()}
            className="group relative flex items-center justify-center bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold p-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            <span className="relative z-10">
              <Send size={20} />
            </span>
            <div className="absolute inset-0 bg-slate-800 dark:bg-slate-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagePage;