import React, { useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../auth/AuthProvider';
import { Link } from 'react-router-dom';

const Header = ({ getRole }) => {
  const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

  // Get token & logout from AuthProvider
  const { token, logoutAction, role } = useAuth();

  // ❌ If not logged in → show nothing
  if (!token) return null;

  // Load role once when logged in
  useEffect(() => {
    if (typeof getRole === 'function') {
      getRole();
    }

  }, [getRole]);

  // Logout handler
  const handleLogout = async () => {
    try {
      let response;

      // 🔐 role === "1" → admin | else → student
      if (role === "1") {
        response = await axios.get(
          `${BACKEND_BASE_URL}/api/user/logout`,
          { withCredentials: true }
        );
      } else {
        response = await axios.get(
          `${BACKEND_BASE_URL}/api/student/logout`,
          // { withCredentials: true }
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } 
      const { data } = response; 
      // console.log(data);
      // return false
      if (data?.success) {
        toast.success(data.message);
        logoutAction(); // clear auth from context
      } else {
        toast.error(data.message || "Logout failed");
      }
    } catch (error) {
      toast.error("Logout failed. Please try again.");
    }
  };

 


  return (
    <header>
      <div className="logosec">
        <Link to="/dashboard">
          <div className="logo">INTENSIVE CARE MEDICINE</div>
        </Link>

         <Link to="/dashboard" onClick={goTo(1)}>
          <p className='mb-0'>Copyright</p>
        </Link>
         <Link to="/dashboard" onClick={goTo(2)}>
          <p className='mb-0'>Table of Contents</p>
        </Link>
         <Link to="/dashboard" onClick={goTo(3)}>
          <p className='mb-0'>Acknowledgement</p>
        </Link>
         <Link to="/dashboard" onClick={goTo(4)}>
          <p className='mb-0'>Foreword</p>
        </Link>
         <Link to="/dashboard" onClick={goTo(1)}>
          <p className='mb-0'>About Author</p>
        </Link>

      </div>

      {/* Logout Button */}

      <button onClick={handleLogout} className="logout-btn">
        <i className="bi bi-box-arrow-right"></i>   Logout
      </button>
    </header>
  );
};




export default Header;
