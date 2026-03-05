//Main.js

import React, { useState, useEffect } from 'react';
import DataTable from "react-data-table-component";
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../../auth/AuthProvider';
import Manage from './exams/Manage';
import { Link } from 'react-router-dom';



export const Dashboard = ({ getRole, roleAuth }) => {
  const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const [questionCount, setQuestionCount] = useState(0)
  const [studentCount, setStudentCount] = useState(0)
  const [tableOfContentsCount, settableOfContentsCount] = useState(0)
  const [publishedCount, setPublishedCount] = useState(0)

  useEffect(() => {
    getRole();
  }, [roleAuth])


  // dashboard count code start 
  const fetchCount = async () => {
    try {

      // get students
      const studentRes = await axios.get(
        `${BACKEND_BASE_URL}/api/student/get-all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (studentRes.data?.success) {
        setStudentCount(studentRes.data.students.length);
      }

      // get questions
      const questionRes = await axios.get(
        `${BACKEND_BASE_URL}/api/question/get-all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (questionRes.data?.success) {
        setQuestionCount(questionRes.data.question.length);
      }

      // get table of contents
      const tableOfContentsRes = await axios.get(
        `${BACKEND_BASE_URL}/api/table-of-contents/get-all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (tableOfContentsRes.data?.success) {
        settableOfContentsCount(tableOfContentsRes.data.tableofcontents.length);
      }


    } catch (error) {
      toast.error(error?.response?.data?.message || "Error fetching count");
    }
  }
  // dashboard count code end


  useEffect(() => {
    fetchCount();
  }, [token]);


  return (

    <div className="main">
      {token && roleAuth ? (
        <div>
          <div className="box-container">
            <Link to="/questions">
              <div className="box box1">
                <div className="text">
                  <h2 className="topic-heading">{questionCount}</h2>
                  <h2 className="topic">Questions</h2>
                </div>
                <img
                  src="https://media.geeksforgeeks.org/wp-content/uploads/20221210184645/Untitled-design-(31).png"
                  alt="Views"
                />
              </div>
            </Link>

            <Link to='/students'>
              <div className="box box2">
                <div className="text">
                  <h2 className="topic-heading">{studentCount}</h2>
                  <h2 className="topic">Students</h2>
                </div>
                <img
                  src="https://media.geeksforgeeks.org/wp-content/uploads/20221210185030/14.png"
                  alt="likes"
                />
              </div>
            </Link>

            <Link to="/table-of-contents">
              <div className="box box3">
                <div className="text">
                  <h2 className="topic-heading">{tableOfContentsCount}</h2>
                  <h2 className="topic">Table Of Contents</h2>
                </div>
                <img
                  src="https://media.geeksforgeeks.org/wp-content/uploads/20221210184645/Untitled-design-(32).png"
                  alt="comments"
                />
              </div>
            </Link>

            <div className="box box4">
              <div className="text">
                <h2 className="topic-heading">{publishedCount}</h2>
                <h2 className="topic">Published</h2>
              </div>
              <img
                src="https://media.geeksforgeeks.org/wp-content/uploads/20221210185029/13.png"
                alt="published"
              />
            </div>
          </div>

        </div>
      ) : (
        <Manage getRole={getRole} roleAuth={roleAuth} />
      )}
    </div>

  );
};

