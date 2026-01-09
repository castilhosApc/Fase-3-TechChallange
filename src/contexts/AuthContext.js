import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCurrentUser, initializeTestUser } from '../services/authService';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      await initializeTestUser();
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };

    checkAuth();

    const interval = setInterval(async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

