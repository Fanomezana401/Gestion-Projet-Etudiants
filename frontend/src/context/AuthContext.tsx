import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

// CORRECTION: Ajout de 'id' et 'role' à l'interface User
interface User {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean; // Ajout de l'état de chargement
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Initialiser à true

  const decodeAndSetUser = useCallback((token: string) => {
    try {
      // CORRECTION: Décodage des champs 'id' et 'role'
      const decodedToken: { sub: string; id: number; firstname: string; lastname: string; role: string } = jwtDecode(token);
      const user: User = {
        id: decodedToken.id,
        email: decodedToken.sub,
        firstname: decodedToken.firstname,
        lastname: decodedToken.lastname,
        role: decodedToken.role,
      };
      setIsAuthenticated(true);
      setUser(user);
      return true;
    } catch (error) {
      console.error("Failed to decode token:", error);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
      return false;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      decodeAndSetUser(token);
    }
    setLoading(false); // Mettre à jour le chargement après la vérification du token
  }, [decodeAndSetUser]);

  const login = useCallback((token: string) => {
    localStorage.setItem('token', token);
    decodeAndSetUser(token);
  }, [decodeAndSetUser]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
