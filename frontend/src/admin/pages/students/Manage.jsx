//Main.js

import axios from 'axios';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DataTable from "react-data-table-component";
import { useAuth } from '../../../auth/AuthProvider';
const Manage = () => {
  const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  // Table columns
  const columns = [
    // { name: "ID", selector: (row) => row.id, sortable: true },
    { name: "Name", selector: (row) => row.name, sortable: true },
    {
      name: "Email", selector: (row) => row.email, sortable: true,
      cell: (row) => (
        <div title={row.email} className="emailCell">
          {row.email}
        </div>
      ),
    },
    { name: "Mobile", selector: (row) => row.mobile, sortable: true },
    // { name: "Role", selector: (row) => row.role==1? "Employee": row.role==2 ? "Project Manager"  : row.role==3 ? "SEO Manager" : row.role==4 ? "Development Manager" : "Admin", sortable: true },
    { name: "Status", selector: (row) => (row.status == 1 ? "Active" : "Inactive"), sortable: true },
    // { name: "Created", selector: (row) => row.createdAt, sortable: true },
    {
      name: "Action",
      cell: (row) => (
        <div className="d-flex">
          <a href={`/students/view/${row.id}`}>
            <button className="btn btn-voilate m-1" title="View">
              <i className="bi bi-eye"></i>
            </button>
          </a>
          <a href={`/students/edit/${row.id}`}>
            <button className="btn btn-primary m-1" title="Edit">
              <i className="bi bi-pencil-square"></i>
            </button>
          </a>
          <button
            onClick={() => handleDeleteStudent(row.id)}
            className="btn btn-danger m-1"
            title="Delete"
            disabled={loading}
          >
            {loading ? "..." : <i className="bi bi-trash2"></i>}
          </button>
        </div>
      ),
    },
  ];


  // Delete employee function

  const handleDeleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    setLoading(true);
    try {
      const { data } = await axios.delete(`${BACKEND_BASE_URL}/api/student/delete/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data?.success) {
        toast.success(data.message);
        const studentData = records.filter(std => std.id !== id); 
        setRecords(studentData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to fetch student");
    } finally {
      setLoading(false);
    }
  };

  //  get all the student list 

  const fetchAllStudent = async () => {
    try {
      const { data } = await axios.get(`${BACKEND_BASE_URL}/api/student/get-all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data?.success) {
        setRecords(data?.students);

        const formattedData = data.students.map((students, index) => ({
          id: students._id,
          name: students.name,
          email: students.email,
          mobile: students.mobile,
          status: students.status
        })); 
        setRecords(formattedData);  // Initialize records with fetched data 
      }

    } catch (error) {
      toast.error(error?.response?.data?.message || "Error occurs");
    }
  }

  useEffect(() => {
    fetchAllStudent();

  }, [token]);
  return (
    <div className="main">
      <div className="report-container">
        <div className="report-header">
          <h1 className="recent-Articles"><i className="bi bi-people"></i> Stutents</h1>
          <a href="/students/add">
            <button className="btn-voilate"><i className="bi bi-plus-lg"></i> Add</button>
          </a>
        </div>

        <div className="report-body"> 
          <DataTable
            columns={columns}
            data={records}
            selectableRows
            fixedHeader
            pagination
          />

          {/* </div> */}
        </div>
      </div>
    </div>
  );
};

export default Manage;