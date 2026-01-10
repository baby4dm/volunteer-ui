import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { api } from "../api/axiosConfig";
import type {
  LoginRequest,
  RegisterRequest,
  User,
  AuthResponse,
} from "../types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          setUser({
            id: 1,
            email: "user@example.com",
            firstName: "User",
            lastName: "Test",
            phoneNumber: "+380000000000",
            role: "USER",
            region: "Київська",
            settlement: "Київ",
          });
        } catch (error) {
          console.error("Token failed", error);
          localStorage.removeItem("token");
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (data: LoginRequest) => {
    const response = await api.post<AuthResponse>("/auth/login", data);
    localStorage.setItem("token", response.data.token);

    setUser({
      id: 1,
      email: data.email,
      firstName: "Волонтер",
      lastName: "",
      phoneNumber: "",
      role: "USER",
    });
  };

  const register = async (data: RegisterRequest) => {
    const response = await api.post<AuthResponse>("/auth/register", data);
    localStorage.setItem("token", response.data.token);

    setUser({
      id: 1,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phone,
      role: "USER",
      region: data.region,
      settlement: data.settlement,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
