//Main.js

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../auth/AuthProvider';
const View = () => {
  const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [inputs, setInputs] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    gender: "",
    status: ""
  });

  useEffect(() => {
    fetchStudent();
  }, [id]);


  const fetchStudent = async () => {
    try {
      const { data } = await axios.put(`${BACKEND_BASE_URL}/api/student/edit/${id}`, {},
        { headers: { authorization: `Bearer ${token}` } }
      );
      //  console.log(data);

      if (data?.success) {
        setInputs({
          name: data.student.name,
          email: data.student.email,
          mobile: data.student.mobile,
          gender: data.student.gender,
          status: data.student.status
        });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error occurs");
    }
  }



  return (
    <div className="main">
      <div className="report-container-1">
        <div className="report-header">
          <h1 className="recent-Articles"><i className="bi bi-plus-lg"></i> View Stutents</h1>
          <a href="/students">
            <button className="btn-voilate"><i className="bi bi-arrow-left"></i> Back</button>
          </a>
        </div>

     <div className="report-body">
  <div className="container-fluid">
    <div className="row">

      {/* Student Profile Card */}
      <div className="col-md-4">
        <div className="card shadow-sm border-0">
          <div className="card-body text-center">

            <div className="mb-3">
              <div
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "50%",
                  background: "#6c63ff",
                  color: "#fff",
                  fontSize: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "auto"
                }}
              >
                {inputs.name?.charAt(0)}
              </div>
            </div>

            <h4>{inputs.name}</h4>

            <p className={inputs.status === 1 ? "text-success" : "text-danger"}>
              {inputs.status === 1 ? "Active Student" : "Inactive Student"}
            </p>

          </div>
        </div>
      </div>


      {/* Student Information */}
      <div className="col-md-8">
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white">
            <h5 className="mb-0">
              <i className="bi bi-person-lines-fill me-2"></i>
              Student Information
            </h5>
          </div>

          <div className="card-body">

            <div className="row mb-3">
              <div className="col-md-4 fw-bold">Name</div>
              <div className="col-md-8">{inputs.name}</div>
            </div>

            <div className="row mb-3">
              <div className="col-md-4 fw-bold">Email</div>
              <div className="col-md-8">{inputs.email}</div>
            </div>

            <div className="row mb-3">
              <div className="col-md-4 fw-bold">Mobile</div>
              <div className="col-md-8">{inputs.mobile}</div>
            </div>

            <div className="row mb-3">
              <div className="col-md-4 fw-bold">Gender</div>
              <div className="col-md-8">{inputs.gender}</div>
            </div>

            <div className="row">
              <div className="col-md-4 fw-bold">Status</div>
              <div className="col-md-8">
                <span className={inputs.status === 1 ? "badge bg-success" : "badge bg-danger"}>
                  {inputs.status === 1 ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  </div>
</div>
      </div>
    </div>
  );
};

export default View