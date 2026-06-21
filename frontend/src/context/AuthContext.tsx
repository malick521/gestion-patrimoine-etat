import React, { createContext, useContext, useState, useEffect } from 'react';
import { LoginResponseDTO } from '../types';
import { isTokenValid } from '../types/utils/tokenUtils';

// 1. 🟢 DÉFINITION STRICTE DES RÔLES (Copiée sur ton Enum Java UserRole)
export type UserRole = 'ADMIN' | 'GESTIONNAIRE' | 'AUDITEUR' | 'CONSULTANT';

// 2. 🟢 ON FORCE TYPESCRIPT à savoir que "user.role" est l'un de ces 4 rôles
export type AuthUser = Omit<LoginResponseDTO, 'token'> & {
  role: UserRole;
};

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (data: LoginResponseDTO) => void;
  logout: () => void;
  loading: boolean;
  checkAuth: () => void; // Ajout utile pour rafraîchir les droits à la volée
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = () => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser && isTokenValid(savedToken)) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser as AuthUser);
      } catch (error) {
        console.error("Erreur de lecture du Storage Utilisateur :", error);
        cleanSession();
      }
    } else {
      cleanSession();
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const cleanSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const login = (data: LoginResponseDTO) => {
    const { token: newToken, ...userData } = data;

    // Sauvegarde Storage
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));

    // Mise à jour State
    setToken(newToken);
    setUser(userData as AuthUser);

    // Redirection propre
    window.location.href = "/";
  };

  const logout = () => {
    cleanSession();
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, checkAuth }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
};