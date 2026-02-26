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
  const { token } = useAuth();
  const [audioFile, setAudioFile] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null); // for newly selected audio

  const [inputs, setInputs] = useState({
    questiontext: "",
    questiontype: "Single Question",
    status: 1,
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    option5: "",
    answerreason: "",
    correctoption: [],
    ordering: "",
  });


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (inputs.correctoption == '') {
      toast.error("Select at least one correct option");
      return;
    }

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
      formData.append("option5", inputs.option5);
      formData.append("ordering", inputs.ordering);
      formData.append("answerreason", inputs.answerreason);
      // formData.append("correctoption", inputs.correctoption);


      if (inputs.questiontype === "Multiple Question") {
        inputs.correctoption.forEach((opt) =>
          formData.append("correctoption[]", opt)
        );
      } else {
        formData.append("correctoption", inputs.correctoption[0] || "");
      }



      // If image selected, append it. Backend should expect field name 'image' (adjust if different).
      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (audioFile) {
        formData.append("answeraudio", audioFile); // backend should expect 'answeraudio'
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



  // audio input change
  const handleAudioChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setAudioFile(null);
      setAudioPreviewUrl(null);
      return;
    }

    // optional validations for audio
    if (!file.type.startsWith("audio/")) {
      toast.error("Please select a valid audio file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Audio must be under 10MB");
      return;
    }

    const url = URL.createObjectURL(file);
    setAudioFile(file);
    setAudioPreviewUrl(url);
  };


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
                    Question Text <span className="text-danger"><b>*</b></span>
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

              <div className="col-md-4 mb-3">
                <label>Question Type</label>
                <select
                  name="questiontype"
                  className="form-select"
                  value={inputs.questiontype}
                  onChange={(e) => {
                    const value = e.target.value;

                    setInputs((prev) => ({
                      ...prev,
                      questiontype: value,
                      correctoption: [], // ✅ reset ONLY when user changes type
                    }));
                  }}
                >
                  <option value="Single Question">Single Question</option>
                  <option value="Multiple Question">Multiple Question</option>
                </select>
              </div>

              <div className="col-md-4">
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select className="form-select form-controle" name="status" onChange={handleChange} value={inputs.status}>
                    <option value={1}>Active</option>
                    <option value={2}>InActive</option>
                  </select>
                </div>
              </div>

               <div className="col-md-4 mb-3">
                <label>Ordering <span className="text-danger"><b>*</b></span></label>
                <input
                  name="ordering"
                  type="number"
                  className="form-control"
                  onChange={handleChange}
                  value={inputs.ordering}
                  required
                />
              </div>



              <div className="col-md-2">
                <div className="mb-3">
                  <label className="form-label">Option 1<span className="text-danger"><b>*</b></span></label>
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

              <div className="col-md-2">
                <div className="mb-3">
                  <label className="form-label">Option 2<span className="text-danger"><b>*</b></span></label>
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

              <div className="col-md-2">
                <div className="mb-3">
                  <label className="form-label">Option 3<span className="text-danger"><b>*</b></span></label>
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

              <div className="col-md-2">
                <div className="mb-3">
                  <label className="form-label">Option 4<span className="text-danger"><b>*</b></span></label>
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

              <div className="col-md-2">
                <div className="mb-3">
                  <label className="form-label">Option 5</label>
                  <input
                    type="text"
                    className="form-control"
                    name="option5"
                    onChange={handleChange}
                    value={inputs.option5}
                    placeholder="Ex. 234"
                  />
                </div>
              </div>

               <div className="col-md-12 mb-3">
                <label>
                  Correct Option <span className="text-danger"><b>*</b></span>
                </label>

                {inputs.questiontype === "Multiple Question" ? (
                  // ✅ MULTIPLE (CHECKBOX)
                  ["option1", "option2", "option3", "option4", "option5"].map((opt) =>
                    inputs[opt] ? (
                      <div className="form-check" key={opt}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`correct-${opt}`}
                          checked={inputs.correctoption.includes(opt)}
                          onChange={(e) => {
                            setInputs((prev) => ({
                              ...prev,
                              correctoption: e.target.checked
                                ? [...prev.correctoption, opt]
                                : prev.correctoption.filter((o) => o !== opt),
                            }));
                          }}
                        />
                        <label className="form-check-label" htmlFor={`correct-${opt}`}>
                          {inputs[opt]}
                        </label>
                      </div>
                    ) : null
                  )
                ) : (
                  // ✅ SINGLE (RADIO)
                  ["option1", "option2", "option3", "option4", "option5"].map((opt) =>
                    inputs[opt] ? (
                      <div className="form-check" key={opt}>
                        <input
                          type="radio"
                          id={`correct-${opt}`}
                          name="correctoption"
                          value={opt}
                          className="form-check-input"
                          checked={inputs.correctoption.includes(opt)}   // ✅ FIX
                          onChange={() => {
                            setInputs((prev) => ({
                              ...prev,
                              correctoption: [opt],                       // ✅ always array
                            }));
                          }}
                        />
                        <label className="form-check-label" htmlFor={`correct-${opt}`}>
                          {inputs[opt]}
                        </label>
                      </div>
                    ) : null
                  ) 
                )}
              </div>


              {/* Image upload field */}
              <div className="col-md-3">
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


              {/* Audio upload */}
              <div className="col-md-3 mb-3">
                <label>Answer Audio (optional)</label>
                <input
                  type="file"
                  accept="audio/*"
                  className="form-control"
                  onChange={handleAudioChange}
                />

                {/* Show audio preview if user selected a new audio file */}
                {audioPreviewUrl ? (
                  <div style={{ marginTop: 8 }}>
                    {/* <small className="text-muted">New Audio Preview:</small> */}
                    <div style={{ marginTop: 6 }}>
                      <audio controls src={audioPreviewUrl}>
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  </div>
                ) : ''}
              </div>

              <div className="col-md-6 mb-3">
                <label> Answer Reason (optional)</label>
                <input
                  id="answerreason"
                  type="text"
                  className="form-control"
                  name="answerreason"
                  onChange={handleChange}
                  value={inputs.answerreason}
                  placeholder=""
                />
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
