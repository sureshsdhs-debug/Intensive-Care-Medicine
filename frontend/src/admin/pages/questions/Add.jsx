// Main.js (Add Question with Image Upload)
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../auth/AuthProvider';

const Add = () => {
  const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(0);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const { token } =  useAuth();
  const [inputs, setInputs] = useState({
    questiontext: "",
    questiontype: "Single Question",
    status: 1,
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    correctoption: "",
  });


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Use FormData for file upload
      const formData = new FormData();
      formData.append("questiontext", inputs.questiontext);
      formData.append("questiontype", inputs.questiontype);
      formData.append("status", inputs.status);
      formData.append("option1", inputs.option1);
      formData.append("option2", inputs.option2);
      formData.append("option3", inputs.option3);
      formData.append("option4", inputs.option4);
      formData.append("correctoption", inputs.correctoption);

      // If image selected, append it. Backend should expect field name 'image' (adjust if different).
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        },
      }; 

      const { data } = await axios.post(`${BACKEND_BASE_URL}/api/question/add`, formData, config);

      if (data?.success) {
        toast.success(data.message);
        navigate("/questions");
      } else {
        toast.error(data.message || "Failed to add question");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Something went wrong");
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    // file handled separately in handleFileChange
    setInputs((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    // optional: validate file type/size here
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    // cleanup preview URL on unmount
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  return (
    <div className="main">
      <div className="report-container-1">
        <div className="report-header">
          <h1 className="recent-Articles"><i className="bi bi-plus-lg"></i> Add Question</h1>
          <a href="/questions">
            <button className="btn-voilate"><i className="bi bi-arrow-left"></i> Back</button>
          </a>
        </div>

        <div className="report-body">
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="row">
              <div className="col-md-12">
                <div className="mb-3">
                  <label htmlFor="questiontext" className="form-label">
                    Question Text <span className="text-success"><b>*</b></span>
                  </label>
                  <input
                    id="questiontext"
                    type="text"
                    className="form-control"
                    name="questiontext"
                    onChange={handleChange}
                    value={inputs.questiontext}
                    placeholder="Ex. What is the value of 5+9 ?"
                    required
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Question Type</label>
                  <select className="form-select form-controle" name="questiontype" onChange={handleChange} value={inputs.questiontype}>
                    <option value="Single Question">Single Question</option>
                    <option value="Multiple Question">Multiple Question</option>
                  </select>
                </div>
              </div>

              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select className="form-select form-controle" name="status" onChange={handleChange} value={inputs.status}>
                    <option value={1}>Active</option>
                    <option value={2}>InActive</option>
                  </select>
                </div>
              </div>

              <div className="col-md-3">
                <div className="mb-3">
                  <label className="form-label">Option 1<span className="text-success"><b>*</b></span></label>
                  <input
                    type="text"
                    className="form-control"
                    name="option1"
                    onChange={handleChange}
                    value={inputs.option1}
                    placeholder="Ex. 234"
                    required
                  />
                </div>
              </div>

              <div className="col-md-3">
                <div className="mb-3">
                  <label className="form-label">Option 2<span className="text-success"><b>*</b></span></label>
                  <input
                    type="text"
                    className="form-control"
                    name="option2"
                    onChange={handleChange}
                    value={inputs.option2}
                    placeholder="Ex. 234"
                    required
                  />
                </div>
              </div>

              <div className="col-md-3">
                <div className="mb-3">
                  <label className="form-label">Option 3<span className="text-success"><b>*</b></span></label>
                  <input
                    type="text"
                    className="form-control"
                    name="option3"
                    onChange={handleChange}
                    value={inputs.option3}
                    placeholder="Ex. 234"
                    required
                  />
                </div>
              </div>

              <div className="col-md-3">
                <div className="mb-3">
                  <label className="form-label">Option 4<span className="text-success"><b>*</b></span></label>
                  <input
                    type="text"
                    className="form-control"
                    name="option4"
                    onChange={handleChange}
                    value={inputs.option4}
                    placeholder="Ex. 234"
                    required
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Correct Option <span className="text-success"><b>*</b></span>
                  </label>
                  <select className="form-select form-controle" name="correctoption" onChange={handleChange} required value={inputs.correctoption}>
                    <option value="">-- Choose Option --</option>
                    <option value="option1">Option1</option>
                    <option value="option2">Option2</option>
                    <option value="option3">Option3</option>
                    <option value="option4">Option4</option>
                  </select>
                </div>
              </div>

              {/* Image upload field */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Question Image (optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control"
                    name="image"
                    onChange={handleFileChange}
                  />
                  {imagePreview && (
                    <div style={{ marginTop: 8 }}>
                      <small className="text-muted">Preview:</small>
                      <div>
                        <img src={imagePreview} alt="preview" style={{ maxWidth: '200px', maxHeight: '200px', marginTop: 6 }} />
                      </div>
                    </div>
                  )}
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

export default Add;
