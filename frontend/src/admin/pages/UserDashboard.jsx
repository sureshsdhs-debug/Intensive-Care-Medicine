// Main.js

import React, { useState, useEffect, useRef, useCallback } from "react";
import DataTable from "react-data-table-component";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../../auth/AuthProvider";
import Manage from "./exams/Manage";
import bannerImg from "../../assets/banner.jpg";
import shapeImage from "../../assets/shapes.png";
import QuestionWidget from "./QuestionWidget";
import "../../assets/userstyle.css";
import useAntiScreenshot from "../../hooks/useAntiScreenshot";

export const UserDashboard = ({ getRole, roleAuth, pageIndex, setPageIndex, isManualNavigation, setIsManualNavigation }) => {
  const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableOfContentsData, setTableOfContents] = useState([]);
  const [isNextDisabled, setIsNextDisabled] = useState(false);
  const { token } = useAuth();
  const [serverUserResults, setServerUserResults] = useState([]);

  // call getRole once on mount
  useEffect(() => {
    getRole();
  }, [getRole]);



  const fetchThisUserResultData = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${BACKEND_BASE_URL}/api/result/get-thisuser-result`,
        { headers: { Authorization: `Bearer ${token}` } }
      ); 

      if (Array.isArray(data)) setServerUserResults(data);
      else if (data?.success) setServerUserResults(data.resultData || []);
      else setServerUserResults([]);
    } catch (err) {
      toast.error("Error fetching user results");
    }
  }, [BACKEND_BASE_URL, token]);


  useEffect(() => {
    if (token) fetchThisUserResultData();
  }, [fetchThisUserResultData, token]);
 

  useEffect(() => {
    const pages = document.querySelectorAll(".pager > .page");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    if (!pages.length || !prevBtn || !nextBtn) return;

    const lastIndex = pages.length;// - 1;


    const showPage = (i) => {
      pages.forEach((p) => p.classList.remove("active"));
      if (pages[i]) pages[i].classList.add("active");

      prevBtn.disabled = i === 0;
      nextBtn.disabled = i === lastIndex;
    };

    const goTo = (i) => {
      const newIndex = Math.max(0, Math.min(i, lastIndex));
      setPageIndex(newIndex);
      showPage(newIndex);
    };

    showPage(pageIndex);

    const handleNextClick = () => goTo(pageIndex + 1);
    const handlePrevClick = () => goTo(pageIndex - 1);

    nextBtn.addEventListener("click", handleNextClick);
    prevBtn.addEventListener("click", handlePrevClick);

    return () => {
      nextBtn.removeEventListener("click", handleNextClick);
      prevBtn.removeEventListener("click", handlePrevClick);
    };
  }, [pageIndex]);




  // get the table of content data 
  const fetchAllTableOfContent = async () => {
    try {
      const { data } = await axios.get(`${BACKEND_BASE_URL}/api/table-of-contents/get-all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data?.success) {
        const formattedData = data.tableofcontents.map((tableofcontents, index) => ({
          id: tableofcontents._id,
          title: tableofcontents.title,
          pagenumber: tableofcontents.pagenumber,
          ordering: tableofcontents.ordering,
          status: tableofcontents.status
        }));
        // setstudentsData(formattedData);
        formattedData.sort((a, b) => (Number(a.ordering) || 0) - (Number(b.ordering) || 0));

        setTableOfContents(formattedData);  // Initialize records with fetched data
      }

    } catch (error) {
      toast.error(error)
    }
  }

  useEffect(() => {
    fetchAllTableOfContent();
  }, []);

  // ------------------------------------
  // CODE TO AVOID TO TAKE SCREENSHORT 
  // ------------------------------------




  const isBlurred = useAntiScreenshot({
    maxViolations: 3,
    onViolationLimitReached: () => {
      toast.error("Exam terminated due to screen capture 🚫");
      // auto submit exam
      // logout user
      // navigate("/exam-terminated");
    }
  });


  return (
    <div className="main" style={{
      filter: isBlurred ? "blur(10px)" : "none",
      pointerEvents: isBlurred ? "none" : "auto",
      transition: "filter 0.2s ease"
    }}>
      {token && !roleAuth && (
        <div>
          <div className="pager">
            <section className="page active front-page-div" id="first-sec">
              <div className="container-fluid p-0">
                <div className="front-page-shape">
                  <img src={shapeImage} alt="Shapes" />
                </div>
                <div className="row">
                  <div className="col-lg-6 col-md-6 col-12 p-0">
                    <div className="left-image-div">
                      <img src={bannerImg} alt="Banner" />
                    </div>
                  </div>
                  <div className="col-lg-6 col-md-6 col-12 p-0">
                    <div className="right-content-div">
                      <div className="right-cont-inner">
                        <h6>• Self learning • All Examinations</h6>
                        <h2>
                          INTENSIVE CARE <span>MEDICINE</span>
                        </h2>
                        <h5>Author:- Dr Prakash Jha</h5>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>


            <section className="page">
              <div className="second-page-div">
                <div className="second-page-inn">
                  <h3>Copyright</h3>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco
                    laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                    irure dolor in reprehenderit in voluptate velit esse cillum
                    dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                    cupidatat non proident, sunt in culpa qui officia deserunt
                    mollit anim id est laborum. Lorem ipsum dolor sit amet,
                    consectetur adipisicing elit, sed do eiusmod tempor incididunt
                    ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                    quis nostrud exercitation ullamco laboris nisi ut aliquip ex
                    ea commodo consequat. Duis aute irure dolor in reprehenderit
                    in voluptate velit esse cillum dolore eu fugiat nulla
                    pariatur. Excepteur sint occaecat cupidatat non proident, sunt
                    in culpa qui officia deserunt mollit anim id est laborum.
                  </p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco
                    laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                    irure dolor in reprehenderit in voluptate velit esse cillum
                    dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                    cupidatat non proident, sunt in culpa qui officia deserunt
                    mollit anim id est laborum. Lorem ipsum dolor sit amet,
                    consectetur adipisicing elit, sed do eiusmod tempor incididunt
                    ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                    quis nostrud exercitation ullamco laboris nisi ut aliquip ex
                    ea commodo consequat. Duis aute irure dolor in reprehenderit
                    in voluptate velit esse cillum dolore eu fugiat nulla
                    pariatur. Excepteur sint occaecat cupidatat non proident, sunt
                    in culpa qui officia deserunt mollit anim id est laborum.
                  </p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco
                    laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                    irure dolor in reprehenderit in voluptate velit esse cillum
                    dolore eu fugiat nulla pariatur.
                  </p>
                </div>
              </div>
            </section>

            <section className="page">
              <div className="table-content">
                <div className="table-content-inn">
                  <h2>
                    Table of <span>Contents</span>
                  </h2>

                  {tableOfContentsData.map((tablevalue, index) => (
                    <div className="toc-row" key={index}>
                      <div className="toc-text">{tablevalue.title}</div>
                      <div className="dots"></div>
                      <div className="pageno">{tablevalue.pagenumber}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="page">
              <div className="second-page-div">
                <div className="second-page-inn">
                  <h3>Acknowledgement</h3>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco
                    laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                    irure dolor in reprehenderit in voluptate velit esse cillum
                    dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                    cupidatat non proident, sunt in culpa qui officia deserunt
                    mollit anim id est laborum. Lorem ipsum dolor sit amet,
                    consectetur adipisicing elit, sed do eiusmod tempor incididunt
                    ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                    quis nostrud exercitation ullamco laboris nisi ut aliquip ex
                    ea commodo consequat. Duis aute irure dolor in reprehenderit
                    in voluptate velit esse cillum dolore eu fugiat nulla
                    pariatur. Excepteur sint occaecat cupidatat non proident, sunt
                    in culpa qui officia deserunt mollit anim id est laborum.
                  </p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco
                    laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                    irure dolor in reprehenderit in voluptate velit esse cillum
                    dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                    cupidatat non proident, sunt in culpa qui officia deserunt
                    mollit anim id est laborum. Lorem ipsum dolor sit amet,
                    consectetur adipisicing elit, sed do eiusmod tempor incididunt
                    ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                    quis nostrud exercitation ullamco laboris nisi ut aliquip ex
                    ea commodo consequat. Duis aute irure dolor in reprehenderit
                    in voluptate velit esse cillum dolore eu fugiat nulla
                    pariatur. Excepteur sint occaecat cupidatat non proident, sunt
                    in culpa qui officia deserunt mollit anim id est laborum.
                  </p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco
                    laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                    irure dolor in reprehenderit in voluptate velit esse cillum
                    dolore eu fugiat nulla pariatur.
                  </p>
                </div>
              </div>
            </section>

            <section className="page">
              <div className="second-page-div">
                <div className="second-page-inn">
                  <h3>Foreword</h3>
                  <h3>Dr. Sanjay Sharma</h3>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco
                    laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                    irure dolor in reprehenderit in voluptate velit esse cillum
                    dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                    cupidatat non proident, sunt in culpa qui officia deserunt
                    mollit anim id est laborum. Lorem ipsum dolor sit amet,
                    consectetur adipisicing elit, sed do eiusmod tempor incididunt
                    ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                    quis nostrud exercitation ullamco laboris nisi ut aliquip ex
                    ea commodo consequat. Duis aute irure dolor in reprehenderit
                    in voluptate velit esse cillum dolore eu fugiat nulla
                    pariatur. Excepteur sint occaecat cupidatat non proident, sunt
                    in culpa qui officia deserunt mollit anim id est laborum.
                  </p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco
                    laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                    irure dolor in reprehenderit in voluptate velit esse cillum
                    dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                    cupidatat non proident, sunt in culpa qui officia deserunt
                    mollit anim id est laborum. Lorem ipsum dolor sit amet,
                    consectetur adipisicing elit, sed do eiusmod tempor incididunt
                    ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                    quis nostrud exercitation ullamco laboris nisi ut aliquip ex
                    ea commodo consequat. Duis aute irure dolor in reprehenderit
                    in voluptate velit esse cillum dolore eu fugiat nulla
                    pariatur. Excepteur sint occaecat cupidatat non proident, sunt
                    in culpa qui officia deserunt mollit anim id est laborum.
                  </p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco
                    laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                    irure dolor in reprehenderit in voluptate velit esse cillum
                    dolore eu fugiat nulla pariatur.
                  </p>
                </div>
              </div>
            </section>

            <section className="page">
              <div className="second-page-div">
                <div className="second-page-inn">
                  <h3>Foreword</h3>
                  <h3>Dr. Aashish Kumar</h3>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco
                    laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                    irure dolor in reprehenderit in voluptate velit esse cillum
                    dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                    cupidatat non proident, sunt in culpa qui officia deserunt
                    mollit anim id est laborum. Lorem ipsum dolor sit amet,
                    consectetur adipisicing elit, sed do eiusmod tempor incididunt
                    ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                    quis nostrud exercitation ullamco laboris nisi ut aliquip ex
                    ea commodo consequat. Duis aute irure dolor in reprehenderit
                    in voluptate velit esse cillum dolore eu fugiat nulla
                    pariatur. Excepteur sint occaecat cupidatat non proident, sunt
                    in culpa qui officia deserunt mollit anim id est laborum.
                  </p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco
                    laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                    irure dolor in reprehenderit in voluptate velit esse cillum
                    dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                    cupidatat non proident, sunt in culpa qui officia deserunt
                    mollit anim id est laborum. Lorem ipsum dolor sit amet,
                    consectetur adipisicing elit, sed do eiusmod tempor incididunt
                    ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                    quis nostrud exercitation ullamco laboris nisi ut aliquip ex
                    ea commodo consequat. Duis aute irure dolor in reprehenderit
                    in voluptate velit esse cillum dolore eu fugiat nulla
                    pariatur. Excepteur sint occaecat cupidatat non proident, sunt
                    in culpa qui officia deserunt mollit anim id est laborum.
                  </p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco
                    laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                    irure dolor in reprehenderit in voluptate velit esse cillum
                    dolore eu fugiat nulla pariatur.
                  </p>
                </div>
              </div>
            </section>

            <section className="page">
              <div className="second-page-div">
                <div className="second-page-inn">
                  <h3>Foreword</h3>
                  <h3>Dr Prakash Jha</h3>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco
                    laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                    irure dolor in reprehenderit in voluptate velit esse cillum
                    dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                    cupidatat non proident, sunt in culpa qui officia deserunt
                    mollit anim id est laborum. Lorem ipsum dolor sit amet,
                    consectetur adipisicing elit, sed do eiusmod tempor incididunt
                    ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                    quis nostrud exercitation ullamco laboris nisi ut aliquip ex
                    ea commodo consequat. Duis aute irure dolor in reprehenderit
                    in voluptate velit esse cillum dolore eu fugiat nulla
                    pariatur. Excepteur sint occaecat cupidatat non proident, sunt
                    in culpa qui officia deserunt mollit anim id est laborum.
                  </p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco
                    laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                    irure dolor in reprehenderit in voluptate velit esse cillum
                    dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                    cupidatat non proident, sunt in culpa qui officia deserunt
                    mollit anim id est laborum. Lorem ipsum dolor sit amet,
                    consectetur adipisicing elit, sed do eiusmod tempor incididunt
                    ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                    quis nostrud exercitation ullamco laboris nisi ut aliquip ex
                    ea commodo consequat. Duis aute irure dolor in reprehenderit
                    in voluptate velit esse cillum dolore eu fugiat nulla
                    pariatur. Excepteur sint occaecat cupidatat non proident, sunt
                    in culpa qui officia deserunt mollit anim id est laborum.
                  </p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco
                    laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                    irure dolor in reprehenderit in voluptate velit esse cillum
                    dolore eu fugiat nulla pariatur.
                  </p>
                </div>
              </div>
            </section>



            <section className="page front-page-div">
              <div className="container-fluid p-0">
                <div className="front-page-shape">
                  <img src={shapeImage} alt="Shapes" />
                </div>
                <div className="row">
                  <div className="col-lg-6 col-md-6 col-12 p-0">
                    <div className="left-image-div">
                      <img src={bannerImg} alt="Banner" />
                    </div>
                  </div>
                  <div className="col-lg-6 col-md-6 col-12 p-0">
                    <div className="right-content-div">
                      <div className="right-cont-inner about-cont">
                        <h2>
                          About <span>Author</span>
                        </h2>
                        <p>
                          Lorem ipsum dolor sit amet, consectetur adipisicing elit,
                          sed do eiusmod tempor incididunt ut labore et dolore magna
                          aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                          ullamco laboris nisi ut aliquip ex ea commodo consequat.
                          Duis aute irure dolor in reprehenderit in voluptate velit
                          esse cillum dolore eu fugiat nulla pariatur. Excepteur
                          sint occaecat cupidatat non proident, sunt in culpa qui
                          officia deserunt mollit anim id est laborum.
                        </p>
                        <p>
                          Lorem ipsum dolor sit amet, consectetur adipisicing elit,
                          sed do eiusmod tempor incididunt ut labore et dolore magna
                          aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                          ullamco laboris nisi ut aliquip ex ea commodo consequat.
                          Duis aute irure dolor in reprehenderit in voluptate velit
                          esse cillum dolore eu fugiat nulla pariatur. Excepteur
                          sint occaecat cupidatat non proident, sunt in culpa qui
                          officia deserunt mollit anim id est laborum.
                        </p>
                        <p>
                          Lorem ipsum dolor sit amet, consectetur adipisicing elit,
                          sed do eiusmod tempor incididunt ut labore et dolore magna
                          aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                          ullamco laboris nisi ut aliquip ex ea commodo consequat.
                          Duis aute irure dolor in reprehenderit in voluptate velit
                          esse cillum dolore eu fugiat nulla pariatur.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>


            <section className="page">
              <div className="second-page-div">
                <div className="second-page-inn">
                  <h3>Preface</h3>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco
                    laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                    irure dolor in reprehenderit in voluptate velit esse cillum
                    dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                    cupidatat non proident, sunt in culpa qui officia deserunt
                    mollit anim id est laborum. Lorem ipsum dolor sit amet,
                    consectetur adipisicing elit, sed do eiusmod tempor incididunt
                    ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                    quis nostrud exercitation ullamco laboris nisi ut aliquip ex
                    ea commodo consequat. Duis aute irure dolor in reprehenderit
                    in voluptate velit esse cillum dolore eu fugiat nulla
                    pariatur. Excepteur sint occaecat cupidatat non proident, sunt
                    in culpa qui officia deserunt mollit anim id est laborum.
                  </p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco
                    laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                    irure dolor in reprehenderit in voluptate velit esse cillum
                    dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                    cupidatat non proident, sunt in culpa qui officia deserunt
                    mollit anim id est laborum. Lorem ipsum dolor sit amet,
                    consectetur adipisicing elit, sed do eiusmod tempor incididunt
                    ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                    quis nostrud exercitation ullamco laboris nisi ut aliquip ex
                    ea commodo consequat. Duis aute irure dolor in reprehenderit
                    in voluptate velit esse cillum dolore eu fugiat nulla
                    pariatur. Excepteur sint occaecat cupidatat non proident, sunt
                    in culpa qui officia deserunt mollit anim id est laborum.
                  </p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco
                    laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                    irure dolor in reprehenderit in voluptate velit esse cillum
                    dolore eu fugiat nulla pariatur.
                  </p>
                </div>
              </div>
            </section>


            <QuestionWidget pageIndex={pageIndex} isManualNavigation={isManualNavigation}
              setIsManualNavigation={setIsManualNavigation} />
            {/* Controls */}
            {(isManualNavigation || serverUserResults.length <= 0) && (
              <div className="controls">
                <button className="btn" id="prevBtn">
                  ← Prev
                </button>
                <button className="btn" id="nextBtn" disabled={isNextDisabled}>
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
