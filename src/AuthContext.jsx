import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

// ✅ Yahan apna ID aur Password set karo
const VALID_USERNAME = "admin";
const VALID_PASSWORD = "madhurekha123";

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => sessionStorage.getItem("auth") === "true"
  );

  const login = (username, password) => {
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      sessionStorage.setItem("auth", "true");
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem("auth");
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}