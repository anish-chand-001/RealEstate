import { useCallback, useEffect, useState } from "react";
import { AuthContext } from "./auth.context";
import { useNavigate } from "react-router-dom";
import { authService, getErrorMessage } from "../services/auth.service";
import { userService } from "../services/user.service";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const refreshUser = useCallback(async () => {
    try {
      const data = await userService.getProfile();
      setUser(data.user);
      return data.user;
    } catch (error) {
      setUser(null);
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        console.error("Error refreshing user details:", error);
      }
      return null;
    }
  }, []);

  useEffect(() => {
    const clearInvalidSession = () => setUser(null);
    window.addEventListener("auth:session-invalid", clearInvalidSession);
    let active = true;
    userService.getProfile()
      .then((data) => { if (active) setUser(data.user); })
      .catch(() => { if (active) setUser(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => {
      active = false;
      window.removeEventListener("auth:session-invalid", clearInvalidSession);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authService.login({ email, password });
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  };

  const register = async (formData) => {
    try {
      const data = await authService.register(formData);
      return { success: true, data };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  };

  const logout = async () => {
    try { await authService.logout(); } catch { /* Clear client state even if offline. */ }
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      login,
      register,
      logout,
      refreshUser,
      loading,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
