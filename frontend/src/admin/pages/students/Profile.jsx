//Main.js

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../auth/AuthProvider';
const Profile = () => {
  const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
  const { token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [inputs, setInputs] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    gender: "",
    status: "",
    role: ""
  });

  useEffect(() => {
    fetchStudent();
  }, [id,token]);


  const fetchStudent = async () => {
    try { 
      const { data } = await axios.get(`${BACKEND_BASE_URL}/api/student/profile`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }); 

      if (data?.success && data.student) {

        // If admin / subadmin
        if (data.student.role !== undefined && data.student.role !== null) {
          setInputs({
            name: data.student.fullname,
            email: data.student.email,
            status: data.student.status,
            role: data.student.role
          });

        } else {
          // Normal student
          setInputs({
            name: data.student.name,
            email: data.student.email,
            mobile: data.student.mobile,
            gender: data.student.gender,
            status: data.student.status
          });
        }
      }

    } catch (error) {
      toast.error(error?.message || "Something went wrong");
    }
  };

 

  return (
    <div className="main">
      <div className="report-container-1">
        <div className="report-header">
          <h1 className="recent-Articles"><i className="bi bi-person-badge"></i> Profile</h1>
          {/*<a href="/students">*/}
          <button onClick={() => navigate(-1)} className="btn-voilate"><i className="bi bi-arrow-left"></i> Back</button>
          {/*</a>*/}
        </div>

     <div className="report-body">
  <div className="container-fluid">
    <div className="row">

      {/* Profile Card */}
      <div className="col-md-4">
        <div className="card shadow-sm border-0 text-center">
          <div className="card-body">

            {/* Avatar */}
            <div
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                background: "#6c63ff",
                color: "#fff",
                fontSize: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "auto"
              }}
            >
              {inputs.name?.charAt(0)}
            </div>

            <h4 className="mt-3">{inputs.name}</h4>
            <p className="text-muted">{inputs.email}</p>

            <span className={inputs.status === 1 ? "badge bg-success" : "badge bg-danger"}>
              {inputs.status === 1 ? "Active" : "Inactive"}
            </span>

          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="col-md-8">
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white">
            <h5 className="mb-0">
              <i className="bi bi-person-lines-fill me-2"></i>
              Profile Information
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

            {inputs.role ? (
              <div className="row mb-3">
                <div className="col-md-4 fw-bold">Role</div>
                <div className="col-md-8">
                  <span className={inputs.role === 1 ? "badge bg-primary" : "badge bg-secondary"}>
                    {inputs.role === 1 ? "Admin" : "Sub Admin"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="row mb-3">
                <div className="col-md-4 fw-bold">Gender</div>
                <div className="col-md-8">{inputs.gender}</div>
              </div>
            )}

            {inputs.mobile && (
              <div className="row mb-3">
                <div className="col-md-4 fw-bold">Mobile</div>
                <div className="col-md-8">{inputs.mobile}</div>
              </div>
            )}

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

export default Profile