import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

interface MessagePayload {
  id: number;
  senderId: number;
  projectId: number;
  isRead: boolean;
  // ... autres champs de message
}

interface SseContextType {
  projectUnreadCounts: Map<number, number>;
  messagesByProject: Map<number, MessagePayload[]>;
  loadMessagesForProject: (projectId: number) => void;
  newInvitation: boolean;
  clearNewInvitation: () => void;
}

const SseContext = createContext<SseContextType | undefined>(undefined);

export const SseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [projectUnreadCounts, setProjectUnreadCounts] = useState<Map<number, number>>(new Map());
  const [messagesByProject, setMessagesByProject] = useState<Map<number, MessagePayload[]>>(new Map());
  const [newInvitation, setNewInvitation] = useState(false);

  // Charger les compteurs initiaux par projet au login
  useEffect(() => {
    if (isAuthenticated) {
      api.get<Record<string, number>>('/messages/count/unread-per-project')
        .then(response => {
          const newMap = new Map<number, number>();
          for (const key in response.data) {
            newMap.set(Number(key), response.data[key]);
          }
          setProjectUnreadCounts(newMap);
        })
        .catch(error => console.error("Failed to fetch initial unread counts per project:", error));
    }
  }, [isAuthenticated]);

  // Établir la connexion SSE une seule fois
  useEffect(() => {
    if (!isAuthenticated) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    // CORRECTION: Encoder le token pour l'URL
    const encodedToken = encodeURIComponent(token);

    console.log(`[${new Date().toLocaleTimeString()}] SSE: Attempting to create native EventSource connection...`);
    const eventSource = new EventSource(`http://localhost:8080/api/sse/subscribe?token=${encodedToken}`);

    eventSource.onopen = () => {
      console.log(`[${new Date().toLocaleTimeString()}] SSE: Native EventSource Connection Opened!`);
    };

    eventSource.onerror = (err) => {
      console.error(`[${new Date().toLocaleTimeString()}] SSE: Native EventSource Error:`, err);
      // Le navigateur tentera de se reconnecter automatiquement.
    };

    const createListener = (eventName: string) => {
      eventSource.addEventListener(eventName, (ev) => {
        console.log(`[${new Date().toLocaleTimeString()}] SSE: Received event '${eventName}' with data:`, ev.data);
        
        // CORRECTION: Gérer les différents types de données
        if (eventName === 'newInvitation') {
          setNewInvitation(true);
          // Pas de JSON.parse pour cet événement
        } else {
          try {
            const data = JSON.parse(ev.data);
            if (eventName === 'newMessage') {
              const receivedMessage: MessagePayload = data;
              setMessagesByProject(prevMap => {
                const newMap = new Map(prevMap);
                const projectMessages = newMap.get(receivedMessage.projectId) || [];
                if (!projectMessages.some(msg => msg.id === receivedMessage.id)) {
                  newMap.set(receivedMessage.projectId, [...projectMessages, receivedMessage]);
                }
                return newMap;
              });
            } else if (eventName === 'projectUnreadCountUpdate') {
              setProjectUnreadCounts(prev => new Map(prev).set(data.projectId, data.count));
            } else if (eventName === 'messagesReadUpdate') {
              setMessagesByProject(prev => {
                const newMap = new Map(prev);
                const projectMessages = newMap.get(data.projectId) || [];
                newMap.set(data.projectId, projectMessages.map(msg => ({ ...msg, isRead: true })));
                return newMap;
              });
            }
          } catch (e) {
            console.error(`[SSE] Error parsing JSON for event ${eventName}:`, e, ev.data);
          }
        }
      });
    };

    createListener('newMessage');
    createListener('projectUnreadCountUpdate');
    createListener('newInvitation');
    createListener('messagesReadUpdate');

    return () => {
      console.log(`[${new Date().toLocaleTimeString()}] SSE: Closing native EventSource connection.`);
      eventSource.close();
    };
  }, [isAuthenticated]);

  const loadMessagesForProject = useCallback(async (projectId: number) => {
    if (!messagesByProject.has(projectId)) {
      try {
        const response = await api.get<MessagePayload[]>(`/messages/project/${projectId}`);
        const initialMessages = Array.isArray(response.data) ? response.data : [];
        setMessagesByProject(prev => new Map(prev).set(projectId, initialMessages));
      } catch (error) {
        console.error(`Failed to load messages for project ${projectId}:`, error);
      }
    }
  }, [messagesByProject]);

  const clearNewInvitation = () => {
    setNewInvitation(false);
  };

  return (
    <SseContext.Provider value={{ projectUnreadCounts, messagesByProject, loadMessagesForProject, newInvitation, clearNewInvitation }}>
      {children}
    </SseContext.Provider>
  );
};

export const useSse = () => {
  const context = useContext(SseContext);
  if (context === undefined) {
    throw new Error('useSse must be used within an SseProvider');
  }
  return context;
};
