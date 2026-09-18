import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import API_URL from "../config.js";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem("token") || sessionStorage.getItem("token") || null,
  );

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      // FIX: Changed to logical OR (||) instead of comma
      const storedUser =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }

    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (
          error.response &&
          error.response.status === 403 &&
          error.response.data.message.includes("blocked")
        ) {
          logout();
        }
        return Promise.reject(error);
      },
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [token]); // Added dependency array to prevent infinite loops

  // =================================
  // --- login
  // ================================

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });
      const { token, user } = res.data;
      setToken(token);
      setUser(user);

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      return { success: true };
    } catch (error) {
      // FIX: changed err to error
      return {
        success: false,
        message: error.response?.data?.message || "Login denied or failed",
      };
    }
  };

  // =================================
  // --- register
  // ================================

  const register = async (name, email, password) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, {
        name,
        email,
        password,
      });
      const { token, user } = res.data;
      setToken(token);
      setUser(user);

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  // =================================
  // --- logout
  // ================================

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login"); // Adjust route as needed
  };

  // =================================
  // --- Get the user Details
  // ================================
  const refreshUser = async () => {
    if (!token) return;

    try {
    
      const res = await axios.get(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      });

      if (res.data.success) {
        const updatedUser = res.data.user;
        setUser(updatedUser);
        const storage = localStorage.getItem("token")
          ? localStorage
          : sessionStorage;

        storage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Error refreshing user details:", error);

      if (error.response && error.response.status === 401) {
        logout();
      }

    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        setToken,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
