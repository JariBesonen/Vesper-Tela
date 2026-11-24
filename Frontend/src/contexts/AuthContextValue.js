import { createContext } from "react";

export const AuthContext = createContext({
  isLoggedIn: false,
  cartCount: 0,
  loading: true,
  setIsLoggedIn: () => {},
  refreshSession: () => {},
  refreshCartCount: () => {},
});
