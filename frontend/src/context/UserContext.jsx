// src/context/UserContext.jsx
import { createContext, useState, useContext, useEffect } from "react";
import {jwtDecode} from "jwt-decode";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
 
  // on mount: if token exists, decode and populate userId
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) return;
      
      const decoded = jwtDecode(token);
      // adjust property name as needed: userId, sub, id, etc.
      const id = decoded?.userId ?? null;  
      
      if (id) setUserId(id);
    } catch (err) {
      console.warn("Failed to decode token in UserProvider:", err);
      setUserId(null);
    }
  }, []);

  return (
    <UserContext.Provider value={{ userId, setUserId }}>
      {children}
    </UserContext.Provider>
  );
}; 

export const useUser = () => useContext(UserContext);
