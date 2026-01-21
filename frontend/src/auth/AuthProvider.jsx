import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "../context/UserContext";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const { setUserId } = useUser();

  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isAuth, setIsAuth] = useState(null); // 👈 IMPORTANT
  const [role, setRole] = useState(localStorage.getItem("role"));

  const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

  // ✅ VERIFY TOKEN ON APP LOAD
  useEffect(() => {
    const verifyToken = async () => { 
      if (!token) {
        setIsAuth(false);
        return;
      }

      try {
        const {data} = await axios.get(
          `${BACKEND_BASE_URL}/api/auth/verify-token`,
          { headers: { Authorization: `Bearer ${token}`}}
        );
 
        if (data.valid) {
          setIsAuth(true);
        } else {
          logoutAction();
        }
      } catch (error) {
        logoutAction();
      }
    };

    // verifyToken();
  }, [token]);

  // ✅ LOGIN
  const loginAction = (tokenData) => {
    setToken(tokenData.token);
    setRole(tokenData.role);

    localStorage.setItem("token", tokenData.token);
    localStorage.setItem("role", tokenData.role);

    setIsAuth(true);
    navigate("/dashboard");
  };

  // ✅ LOGOUT
  const logoutAction = () => {
    setToken(null);
    setRole(null);
    setIsAuth(false);

    localStorage.removeItem("token");
    localStorage.removeItem("role");

    setUserId(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        isAuth,
        loginAction,
        logoutAction,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
