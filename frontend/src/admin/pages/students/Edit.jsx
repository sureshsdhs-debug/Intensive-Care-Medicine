// Main.js

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../auth/AuthProvider';

const Edit = () => {
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

  const fetchStudent = async () => {
    try {
      const { data } = await axios.put(`${BACKEND_BASE_URL}/api/student/edit/${id}`,{}, {
        headers: { Authorization: `Bearer ${token}` }
      }); 
      
      if (data?.success) {
        setInputs({
          name: data.student.name || "",
          email: data.student.email || "",
          mobile: data.student.mobile || "",
          gender: data.student.gender || "",
          status: data.student.status || "",
          password: "",  // Always empty initially
        });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error fetching student data");
    }
  };

  useEffect(() => {
    fetchStudent();
  }, [id, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare form data; only include password if not empty
    const formData = {
      name: inputs.name,
      email: inputs.email,
      mobile: inputs.mobile,
      gender: inputs.gender,
      status: inputs.status,
    };
    if (inputs.password.trim() !== "") {
      formData.password = inputs.password;
    }

    try {
      const { data } = await axios.put(`${BACKEND_BASE_URL}/api/student/edit/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data?.success) {
        toast.success(data.message);
        navigate('/students');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error updating student");
    }
  };

  const handleChange = (e) => {
    setInputs(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="main">
      <div className="report-container-1">
        <div className="report-header">
          <h1 className="recent-Articles"><i className="bi bi-plus-lg"></i> Edit Students</h1>
          <Link to="/students">
            <button className="btn-voilate"><i className="bi bi-arrow-left"></i> Back</button>
          </Link>
        </div>

        <div className="report-body">
          <form onSubmit={handleSubmit}>
            <div className="row">

              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="fullname" className="form-label">
                    Name <span className="text-success"><b>*</b></span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    onChange={handleChange}
                    value={inputs.name}
                    placeholder="Ex. Suresh Sarkar"
                    required
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="mobile" className="form-label">
                    Mobile <span className="text-success"><b>*</b></span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    name="mobile"
                    onChange={handleChange}
                    value={inputs.mobile}
                    placeholder="Ex. 8789567788"
                    required
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email <span className="text-success"><b>*</b></span>
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    onChange={handleChange}
                    value={inputs.email}
                    placeholder="Ex. abc@gmail.com"
                    required
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password <small>(leave blank to keep unchanged)</small>
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    onChange={handleChange}
                    value={inputs.password}
                    placeholder="Password"
                    // removed required to make optional on edit
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="gender" className="form-label">
                    Gender <span className="text-success"><b>*</b></span>
                  </label>
                  <select
                    className="form-select form-control"
                    name="gender"
                    onChange={handleChange}
                    value={inputs.gender}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="status" className="form-label">
                    Status <span className="text-success"><b>*</b></span>
                  </label>
                  <select
                    className="form-select form-control"
                    name="status"
                    onChange={handleChange}
                    value={inputs.status}
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="1">Active</option>
                    <option value="2">InActive</option>
                  </select>
                </div>
              </div>

            </div>
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Edit;
