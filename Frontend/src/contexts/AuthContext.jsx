import { createContext, useCallback, useEffect, useState } from "react";

export const AuthContext = createContext({
  isLoggedIn: false,
  cartCount: 0,
  loading: true,
  setIsLoggedIn: () => {},
  refreshSession: () => {},
  refreshCartCount: () => {},
});

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refreshCartCount = useCallback(async () => {
    try {
      if (!isLoggedIn) {
        const raw = localStorage.getItem("vesper_guest_cart_v1");
        const guestItems = raw ? JSON.parse(raw) : [];
        const total = Array.isArray(guestItems)
          ? guestItems.reduce(
              (sum, item) => sum + Number(item?.quantity || 0),
              0,
            )
          : 0;
        setCartCount(total);
        return;
      }

      const res = await fetch("http://localhost:3000/api/cart", {
        credentials: "include",
      });

      if (!res.ok) {
        setCartCount(0);
        return;
      }

      const data = await res.json();
      const total = Array.isArray(data)
        ? data.reduce((sum, item) => sum + Number(item?.quantity || 0), 0)
        : 0;
      setCartCount(total);
    } catch {
      setCartCount(0);
    }
  }, [isLoggedIn]);

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

  useEffect(() => {
    refreshCartCount();
  }, [refreshCartCount]);

  useEffect(() => {
    const handleCartUpdated = () => {
      refreshCartCount();
    };

    window.addEventListener("vesper-cart-updated", handleCartUpdated);
    return () => {
      window.removeEventListener("vesper-cart-updated", handleCartUpdated);
    };
  }, [refreshCartCount]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        cartCount,
        loading,
        setIsLoggedIn,
        refreshSession,
        refreshCartCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
