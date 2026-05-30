import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { authService } from "../services/authService";
import { AuthUser, LoginRequest } from "../types/auth";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAuth = async () => {
    try {
      const savedToken = await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN);
      const savedUser = await SecureStore.getItemAsync(STORAGE_KEYS.USER);

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuth();
  }, []);

  const login = async (data: LoginRequest) => {
    const res = await authService.login(data);

    const authUser: AuthUser = {
        id: res.userId,
        driverId: res.driverId,
        username: res.username,
        fullName: res.fullName,
        email: res.email,
        roleName: res.roleName,
        isActive: res.isActive,
        };

    await SecureStore.setItemAsync(STORAGE_KEYS.TOKEN, res.token);
    await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(authUser));

    setToken(res.token);
    setUser(authUser);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}