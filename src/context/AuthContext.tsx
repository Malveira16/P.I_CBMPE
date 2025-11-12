import { createContext, useState} from "react";
import type{ ReactNode } from "react";

type AuthContextType = {
  user: { username: string; password: string } | null;
  login: (username: string, password: string) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ username: string; password: string } | null>(null);

  const login = (username: string, password: string) => setUser({ username, password });
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};