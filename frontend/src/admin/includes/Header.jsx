import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../auth/AuthProvider';
import { Link } from 'react-router-dom';
import logo from "../../assets/icm-logo.png";
import GlobalPageSearch from '../../context/GlobalPageSearch';
const Header = ({ getRole, pageIndex, setPageIndex, setIsManualNavigation }) => {
  const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
  const { token, logoutAction, role } = useAuth();

  // ❌ If not logged in → show nothing
  if (!token) return null;

  // Load role once
  useEffect(() => {
    if (typeof getRole === "function") {
      getRole();
    }
  }, [getRole]);


  // Logout handler
  const handleLogout = async () => {
    try {
      let response = await axios.get(
        `${BACKEND_BASE_URL}/api/student/logout`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

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
          <div className="logo">
            <img className='logo-class' src={logo} alt="Logo" /> </div>
        </Link>
      </div>

      {role != 1 && (

        <div className="logosec">
           <GlobalPageSearch />
          <button className="btn btn-primary" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight" aria-controls="offcanvasRight">
            <i className="bi bi-list"></i>
          </button>

          <div className="offcanvas offcanvas-end custom-offcanvas"
            tabIndex="-1"
            id="offcanvasRight"
          >
            <div className="offcanvas-header border-bottom">
              <h5 className="fw-bold mb-0 text-color">📖 Page Menus</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="offcanvas"
              ></button>
            </div>

            <div className="offcanvas-body p-0">
              {[
                "Copyright",
                "Table of Contents",
                "Acknowledgement",
                "Dr. Sanjay",
                "Dr. Aashish",
                "Dr Prakash",
                "About Author",
                "Preface",
              ].map((item, index) => (
                <div
                  key={index}
                  onClick={() => goTo(index + 1)}
                  className={`menu-item ${pageIndex === index + 1 ? "active-menu" : ""
                    }`}
                  data-bs-dismiss="offcanvas"
                >
                  {item}
                </div>
              ))}

              <p onClick={handleLogout} className="menu-item logout-btn">
                <i className="bi bi-box-arrow-right"></i> Logout
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
