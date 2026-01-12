import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider"; 

const ProtectedRoute = ({ children }) => {
  
  const { token } = useAuth(); // assumes useAuth returns { token, role }
  const location = useLocation();
  const role = localStorage.getItem('role');// propRole ?? authRole; // allow overriding role via prop if desired
 

  const path = location.pathname;

  const publicPages = ["/login", "/register"];
  const isHome = path === "/" || path === "";

  // If user IS logged in: prevent access to login/register/home → redirect to dashboard
  if (token && (publicPages.includes(path) || isHome)) {
  
    return <Navigate to="/dashboard" replace />;
  }
 
  // If user is NOT logged in: allow only login/register; otherwise redirect to login
  if (!token) {
    if (publicPages.includes(path)) {
      return children; // allow /login and /register when not authenticated
    }
    // for other pages, redirect to login and preserve attempted location if you want
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ROLE-BASED ACCESS CONTROL
  // Restrict all /students-like pages only to role = 1
  const isStudentPage =
    path.startsWith("/students") ||
    path.startsWith("/subjects") ||
    path.startsWith("/questions") ||
    path.startsWith("/exams") ||
    path.startsWith("/courses");

  if (isStudentPage && role !== "1") { 
    // logged-in but not allowed → send to generic dashboard or a 403 page
    return <Navigate to="/dashboard" replace />;
  }

  // All checks passed → render children
  return children;
};

export default ProtectedRoute;



 