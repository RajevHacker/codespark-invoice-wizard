import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  partnerName: string | null;
  username: string | null;
  setAuthData: (token: string, partnerName: string, username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [partnerName, setPartnerName] = useState<string | null>(() => localStorage.getItem('businessName'));
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem('username'));

  const setAuthData = (token: string, partnerName: string, username: string) => {
    setToken(token);
    setPartnerName(partnerName);
    setUsername(username);

    localStorage.setItem('token', token);
    localStorage.setItem('businessName', partnerName);
    localStorage.setItem('username', username);
  };

  const logout = () => {
    setToken(null);
    setPartnerName(null);
    setUsername(null);
    localStorage.clear();
  };

  const value: AuthContextType = {
    token,
    partnerName,
    username,
    setAuthData,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};