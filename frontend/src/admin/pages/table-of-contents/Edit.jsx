//Main.js

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../auth/AuthProvider';
const Edit = () => {
  const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [inputs, setInputs] = useState({
    title: "",
    pagenumber: "",
    ordering: "",
    status: "",
  });

  const fetchtableOfContents = async () => {
    try {

        const {data} = await axios.put(`${BACKEND_BASE_URL}/api/table-of-contents/edit/${id}`,{}, 
        { headers: { Authorization: `Bearer ${token}` } }
      ); 

      if (data?.success) {
        setInputs({
          title: data.tableofcontents.title,
          pagenumber: data.tableofcontents.pagenumber,
          ordering: data.tableofcontents.ordering,
          status: data.tableofcontents.status,
        });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error fetching students");
    }
  }


  useEffect(() => {
    fetchtableOfContents();
  }, [id]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      title: inputs.title,
      pagenumber: inputs.pagenumber,
      ordering: inputs.ordering,
      status: inputs.status,
    }

    try {
      const { data } = await axios.put(`${BACKEND_BASE_URL}/api/table-of-contents/edit/${id}`, formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data?.success) {
        toast.success(data.message);

        navigate('/table-of-contents')
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error fetching students");
    }
  }
  const handleChange = (e) => {
    setInputs({
      ...inputs,
      [e.target.name]: e.target.value
    })
  }




  return (
    <div className="main">
      <div className="report-container-1">
        <div className="report-header">
          <h1 className="recent-Articles"><i className="bi bi-plus-lg"></i> Edit Table Of Contents</h1>
          <a href="/table-of-contents">
            <button className="btn-voilate"><i className="bi bi-arrow-left"></i> Back</button>
          </a>
        </div>

        <div className="report-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">
                    Title <span className="text-success"><b>*</b></span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="title"
                    onChange={handleChange}
                    value={inputs.title}
                    placeholder="Ex. Single Question"
                    required
                  />
                </div>
              </div>


              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="mobile" className="form-label">
                    Page Number <span className="text-success"><b>*</b></span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    name="pagenumber"
                    onChange={handleChange}
                    value={inputs.pagenumber}
                    placeholder="Ex. 1"
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Ordering <span className="text-success"><b>*</b></span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    name="ordering"
                    onChange={handleChange}
                    value={inputs.ordering}
                    placeholder="Ex. 1"
                    required
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="exampleInputPassword1" className="form-label">
                    Status <span className="text-success"><b>*</b></span>
                  </label>
                  <select className="form-select form-controle" name="status" value={inputs.status} onChange={handleChange} required>
                    <option value="1">Active</option>
                    <option value="2">InActive</option>
                  </select>
                </div>
              </div>

            </div>
            <button
              type="submit"
              className="btn btn-primary"
              onClick={handleSubmit}
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Edit