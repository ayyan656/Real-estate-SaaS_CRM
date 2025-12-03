import React, { createContext, useContext, useState, useEffect } from "react";
import {
  loginUser,
  registerUser,
  logoutUser as logoutUserService,
} from "../services/userService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("estateflow_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Check for Google OAuth callback
    const params = new URLSearchParams(window.location.hash.split("?")[1]);
    const token = params.get("token");
    const userData = params.get("user");

    if (token && userData) {
      try {
        const user = JSON.parse(decodeURIComponent(userData));
        console.log("Google OAuth User Data:", user);
        console.log("Avatar URL:", user.avatar);
        setUser(user);
        localStorage.setItem("estateflow_user", JSON.stringify(user));
        localStorage.setItem("authToken", token);
        // Clean up URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      } catch (err) {
        console.error("Error parsing OAuth callback:", err);
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await loginUser({ email, password });
      setUser(response.user);
      localStorage.setItem("estateflow_user", JSON.stringify(response.user));
      localStorage.setItem("authToken", response.token);
      return response;
    } catch (err) {
      const errorMsg = err.message || "Login failed";
      setError(errorMsg);
      throw err;
    }
  };

  const register = async (name, email, password, phone = "") => {
    try {
      setError(null);
      const response = await registerUser({ name, email, password, phone });
      setUser(response.user);
      localStorage.setItem("estateflow_user", JSON.stringify(response.user));
      localStorage.setItem("authToken", response.token);
      return response;
    } catch (err) {
      const errorMsg = err.message || "Registration failed";
      setError(errorMsg);
      throw err;
    }
  };

  const googleLogin = async () => {
    //redirect to Google OAuth endpoint
    window.location.href = `${
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
    }/auth/google`;
  };

  const logout = () => {
    logoutUserService();
    setUser(null);
    localStorage.removeItem("estateflow_user");
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, error, login, register, googleLogin, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
