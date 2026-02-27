import axios from 'axios';
import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import { Link, useLocation } from "react-router-dom";
import { useAuth } from '../../auth/AuthProvider';
const Nav = ({ getRole, roleAuth }) => {

    const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
    // const { logoutAction } = useAuth();
    const location = useLocation();
    const { token, logoutAction } = useAuth();


    useEffect(() => {
        getRole();
    }, [roleAuth])



    // Logout handler
    const handleLogout = async () => {
        try {
            let response = await axios.get(
                `${BACKEND_BASE_URL}/api/user/logout`,
                { withCredentials: true }
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


    return (
        <div>
            {(token) && (roleAuth) && roleAuth != null &&
                <div className="navcontainer">
                    <nav className="nav">
                        <div className="nav-upper-options">
                            <Link to="/dashboard" className={location.pathname === "/dashboard" ? "active" : ""}>
                                <div className="nav-option">
                                    <i className="bi bi-laptop"></i>
                                    <h3>Dashboard</h3>
                                </div>
                            </Link>
                            {/* } */}
                            {(token && roleAuth) &&
                                <Link to="/students" className={location.pathname === "/students" ? "active" : ""}>
                                    <div className="nav-option">
                                        <i className="bi bi-people"></i>
                                        <h3>Students</h3>
                                    </div>
                                </Link>
                            }

                            {(token && roleAuth) &&
                                <Link to="/questions" className={location.pathname === "/questions" ? "active" : ""}>
                                    <div className="nav-option">
                                        <i className="bi bi-journal-text"></i>
                                        <h3>Questions</h3>
                                    </div>
                                </Link>
                            }

                            {(token && roleAuth) &&
                                <Link to="/table-of-contents" className={location.pathname === "/table-of-contents" ? "active" : ""}>
                                    <div className="nav-option">
                                        <i className="bi bi-table"></i>
                                        <h3>Table of Contents</h3>
                                    </div>
                                </Link>
                            }
                            {(token) &&
                                <Link to="/profile" className={location.pathname === "/profile" ? "active" : ""}>
                                    <div className="nav-option">
                                        <i className="bi bi-person-bounding-box"></i>
                                        <h3>Profile</h3>
                                    </div>
                                </Link>
                            }

                            {token &&
                                <div className="nav-option logout" onClick={handleLogout}>
                                    <i className="bi bi-box-arrow-right"></i>
                                    <h3>Logout</h3>
                                </div>}
                        </div>
                    </nav>
                </div>
            }
        </div>
    );
};

export default Nav;
