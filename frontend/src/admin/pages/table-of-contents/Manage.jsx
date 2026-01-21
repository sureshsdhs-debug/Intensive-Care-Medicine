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
    { name: "Title", selector: (row) => row.title, sortable: true },
    { name: "Page Number", selector: (row) => row.pagenumber, sortable: true },
    { name: "Ordering", selector: (row) => row.ordering, sortable: true },
    { name: "Status", selector: (row) => (row.status == 1 ? "Active" : "Inactive"), sortable: true },
    {
      name: "Action",
      cell: (row) => (
        <div className="d-flex">
          <a href={`/table-of-contents/edit/${row.id}`}>
            <button className="btn btn-primary m-1" title="Edit">
              <i className="bi bi-pencil-square"></i>
            </button>
          </a>
          <button
            onClick={() => handleDeleteSubject(row.id)}
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

  const handleDeleteSubject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this table of contents?")) return;
    setLoading(true);
    try {
      const { data } = await axios.delete(`${BACKEND_BASE_URL}/api/table-of-contents/delete/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data?.success) {
        toast.success(data.message);
        const tableofcontents = records.filter(cid => cid.id !== id);
        setRecords(tableofcontents);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to delete table of contents");
    } finally {
      setLoading(false);
    }
  };

  //  get all the student list 

  const fetchAllStudent = async () => {
    try {
      const { data } = await axios.get(`${BACKEND_BASE_URL}/api/table-of-contents/get-all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data?.success) {
        setRecords(data?.tableofcontents);

        const formattedData = data.tableofcontents.map((tableofcontents, index) => ({
          id: tableofcontents._id,
          title: tableofcontents.title,
          pagenumber: tableofcontents.pagenumber,
          ordering: tableofcontents.ordering,
          status: tableofcontents.status
        }));
        // setstudentsData(formattedData);
        formattedData.sort((a, b) => (Number(a.ordering) || 0) - (Number(b.ordering) || 0));

        setRecords(formattedData);  // Initialize records with fetched data

      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error fetching questions");
    }
  }

  useEffect(() => {
    fetchAllStudent();

  }, []);
  return (
    <div className="main">
      <div className="report-container">
        <div className="report-header">
          <h1 className="recent-Articles"><i className="bi bi-bookshelf"></i> Table Of Contents</h1>
          <a href="/table-of-contents/add">
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