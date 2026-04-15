import { createContext, useCallback, useEffect, useState } from "react";

export const AuthContext = createContext({
  isLoggedIn: false,
  loading: true,
  setIsLoggedIn: () => {},
  refreshSession: () => {},
});

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:3000/api/auth/session", {
        credentials: "include",
      });
      const data = await res.json();
      setIsLoggedIn(Boolean(data && data.loggedIn));
    } catch (err) {
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, loading, setIsLoggedIn, refreshSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}
