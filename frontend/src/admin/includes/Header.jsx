import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../auth/AuthProvider';
import { Link } from 'react-router-dom';

const Header = ({ getRole, pageIndex, setPageIndex,setIsManualNavigation }) => {
  const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
  const { token, logoutAction, role } = useAuth();

  // const [pageIndex, setPageIndex] = useState(0);

  // ❌ If not logged in → show nothing
  if (!token) return null;

  // Load role once
  useEffect(() => {
    if (typeof getRole === "function") {
      getRole();
    }
  }, [getRole]);

  // 👉 Page handling logic inside useEffect
  // useEffect(() => {
  //   const pages = document.querySelectorAll(".page");
  //   const prevBtn = document.getElementById("prevBtn");
  //   const nextBtn = document.getElementById("nextBtn");

  //   if (!pages.length || !prevBtn || !nextBtn) return;

  //   const lastIndex = pages.length - 1;

  //   const showPage = (i) => {
  //     console.log(i);
      
  //     pages.forEach((p) => p.classList.remove("active"));
  //     if (pages[i]) pages[i].classList.add("active");

  //     prevBtn.disabled = i === 0;
  //     nextBtn.disabled = i === lastIndex;
  //   };

  //         const goTo = (i) => {
  //           setPageIndex(i);
  //         };

  //   const handleNextClick = () => goTo(pageIndex + 1);
  //   const handlePrevClick = () => goTo(pageIndex - 1);

  //   showPage(pageIndex);

  //   nextBtn.addEventListener("click", handleNextClick);
  //   prevBtn.addEventListener("click", handlePrevClick);

  //   return () => {
  //     nextBtn.removeEventListener("click", handleNextClick);
  //     prevBtn.removeEventListener("click", handlePrevClick);
  //   };
  // }, [pageIndex]);

  // Logout handler
  const handleLogout = async () => {
    try {
      let response;

      if (role === "1") {
        response = await axios.get(
          `${BACKEND_BASE_URL}/api/user/logout`,
          { withCredentials: true }
        );
      } else {
        response = await axios.get(
          `${BACKEND_BASE_URL}/api/student/logout`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      const { data } = response;

      if (data?.success) {
        toast.success(data.message);
        logoutAction();
      } else {
        toast.error(data.message || "Logout failed");
      }
    } catch (error) {
      toast.error("Logout failed. Please try again.");
    }
  };

  // 👉 Header click page change
  // const goTo = (index) => { 
  //   setPageIndex(index);
  // };

  const goTo = (index) => {
  setIsManualNavigation(true);   // ⭐ IMPORTANT
  setPageIndex(index);
};

  return (
    <header>
      <div className="logosec">
        <Link to="/dashboard" onClick={() => goTo(0)}>
          <div className="logo">INTENSIVE CARE MEDICINE</div>
        </Link>

        <div onClick={() => goTo(1)}>
          <p className={`mb-0 ${pageIndex === 1 ? "active-menu" : ""}`}>Copyright</p>
        </div>

        <div onClick={() => goTo(2)}>
          <p className={`mb-0 ${pageIndex === 2 ? "active-menu" : ""}`}>Table of Contents</p>
        </div>

        <div onClick={() => goTo(3)}>
          <p className={`mb-0 ${pageIndex === 3 ? "active-menu" : ""}`}>Acknowledgement</p>
        </div>

        <div onClick={() => goTo(4)}>
          <p className={`mb-0 ${pageIndex === 4 ? "active-menu" : ""}`}>Dr. Sanjay</p>
           </div>
        <div onClick={() => goTo(5)}>
          <p className={`mb-0 ${pageIndex === 5 ? "active-menu" : ""}`}>Dr. Aashish</p>
           </div>
        <div onClick={() => goTo(6)}>
          <p className={`mb-0 ${pageIndex === 6 ? "active-menu" : ""}`}>Dr Prakash</p>
        </div>

        <div onClick={() => goTo(7)}>
          <p className={`mb-0 ${pageIndex === 7 ? "active-menu" : ""}`}>About Author</p>
        </div>
        <div onClick={() => goTo(8)}>
          <p className={`mb-0 ${pageIndex === 8 ? "active-menu" : ""}`}>Preface</p>
        </div>
      </div>

      <button onClick={handleLogout} className="logout-btn">
        <i className="bi bi-box-arrow-right"></i> Logout
      </button>
    </header>
  );
};

export default Header;
