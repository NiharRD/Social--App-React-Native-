// utils/authContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  // Load token once on app start
  useEffect(() => {
    loadToken();
  }, []);

  const loadToken = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync("jwt_token");
      setToken(storedToken);
    } catch (error) {
      console.error("Error loading token:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (newToken, newUserData) => {
    await SecureStore.setItemAsync("jwt_token", newToken);
    setToken(newToken);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("jwt_token");

    setToken(null);
  };

  // Derive isLoggedIn from token - no separate state needed!
  const isLoggedIn = token !== null;

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        token,
        login,
        logout,
        isLoading,
        userData,
        setUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
