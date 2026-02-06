// src/pages/Edit.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../auth/AuthProvider";

const Edit = () => {
  const BACKEND_BASE_URL =
    import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:5000";
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);

  // separate file states for image and audio
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // for newly selected image
  const [existingImageUrl, setExistingImageUrl] = useState(""); // existing saved image url

  const [audioFile, setAudioFile] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null); // for newly selected audio
  const [existingAudioUrl, setExistingAudioUrl] = useState(""); // existing saved audio url

  const [inputs, setInputs] = useState({
    questiontext: "",
    questiontype: "Single Question",
    status: 1,
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    option5: "",
    correctoption: [],
    answerreason: "",
    // we do not store binary audio here; backend returns path/url
  });



  const getQuestionById = async () => {
    try {
      const { data } = await axios.put(`${BACKEND_BASE_URL}/api/question/edit/${id}`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data?.success) {
        const correct = data.question.correctoption;
        // console.log(data.question);
        setInputs({
          questiontext: data.question.questiontext,
          questiontype: data.question.questiontype,
          option1: data.question.option1,
          option2: data.question.option2,
          option3: data.question.option3,
          option4: data.question.option4,
          option5: data.question.option5,
          // correctoption: data.question.correctoption,
          correctoption: Array.isArray(correct) ? correct : correct ? [correct] : [],

          status: data.question.status,
          answeraudio: data.question.answeraudio,
          answerreason: data.question.answerreason,

        });

        // set existing urls if present (make sure backend returns relative path like "uploads/..." or full URL)
        setExistingImageUrl(data.question.image ? `${data.question.image}` : "");
        setExistingAudioUrl(data.question.answeraudio ? `${data.question.answeraudio}` : "");

        // clear previews
        setImageFile(null);
        setImagePreview(null);
        setAudioFile(null);
        setAudioPreviewUrl(null);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error fetching students");
    }
  }


  useEffect(() => {
    getQuestionById();
  }, [id, token]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiCorrectChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, opt => opt.value);

    setInputs(prev => ({
      ...prev,
      correctoption: selected, // ✅ ARRAY
    }));
  };


  // image input change
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    // optional validations
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    // create preview URL
    const url = URL.createObjectURL(file);
    setImageFile(file);
    setImagePreview(url);
    // if new file selected, we might still keep existingImageUrl for reference or remove - here we keep but preview shows new file
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (inputs.correctoption == '') {
      toast.error("Select at least one correct option");
      return;
    }


    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("questiontext", inputs.questiontext);
      formData.append("questiontype", inputs.questiontype);
      formData.append("status", inputs.status);
      formData.append("option1", inputs.option1);
      formData.append("option2", inputs.option2);
      formData.append("option3", inputs.option3);
      formData.append("option4", inputs.option4);
      formData.append("option5", inputs.option5);
      // formData.append("correctoption", inputs.correctoption);

      if (inputs.questiontype === "Multiple Question") {
        inputs.correctoption.forEach((opt) =>
          formData.append("correctoption[]", opt)
        );
      } else {
        formData.append("correctoption", inputs.correctoption[0] || "");
      }


      formData.append("answerreason", inputs.answerreason);

      // append files if selected
      if (imageFile) {
        formData.append("image", imageFile); // backend should expect 'image'
      }
      if (audioFile) {
        formData.append("answeraudio", audioFile); // backend should expect 'answeraudio'
      }

      // send PUT to update (do not set Content-Type — browser sets the multipart boundary)
      const { data } = await axios.put(
        `${BACKEND_BASE_URL}/api/question/edit/${id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
        {
          withCredentials: true, // if needed
        }
      );

      if (data?.success) {
        toast.success(data.message || "Question updated");
        navigate("/questions");
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || err.message || "Error updating");
    } finally {
      setLoading(false);
    }
  };

  // cleanup object URLs when component unmounts or when previews change
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    };
  }, [imagePreview, audioPreviewUrl]);

  return (
    <div className="main">
      <div className="report-container-1">
        <div className="report-header">
          <h1 className="recent-Articles">
            <i className="bi bi-plus-lg" /> Edit Question
          </h1>
          <a href="/questions">
            <button className="btn-voilate">
              <i className="bi bi-arrow-left" /> Back
            </button>
          </a>
        </div>

        <div className="report-body">
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="row">
              <div className="col-md-12 mb-3">
                <label>Question Text <span className="text-danger"><b>*</b></span></label>
                <input
                  type="text"
                  className="form-control"
                  name="questiontext"
                  onChange={handleChange}
                  value={inputs.questiontext}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
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

              <div className="col-md-6 mb-3">
                <label>Status</label>
                <select
                  name="status"
                  className="form-select"
                  onChange={handleChange}
                  value={inputs.status}
                >
                  <option value={1}>Active</option>
                  <option value={2}>InActive</option>
                </select>
              </div>

              <div className="col-md-2 mb-3">
                <label>Option 1 <span className="text-danger"><b>*</b></span></label>
                <input
                  name="option1"
                  type="text"
                  className="form-control"
                  onChange={handleChange}
                  value={inputs.option1}
                  required
                />
              </div>
              <div className="col-md-2 mb-3">
                <label>Option 2 <span className="text-danger"><b>*</b></span></label>
                <input
                  name="option2"
                  type="text"
                  className="form-control"
                  onChange={handleChange}
                  value={inputs.option2}
                  required
                />
              </div>
              <div className="col-md-2 mb-3">
                <label>Option 3 <span className="text-danger"><b>*</b></span></label>
                <input
                  name="option3"
                  type="text"
                  className="form-control"
                  onChange={handleChange}
                  value={inputs.option3}
                  required
                />
              </div>
              <div className="col-md-2 mb-3">
                <label>Option 4 <span className="text-danger"><b>*</b></span></label>
                <input
                  name="option4"
                  type="text"
                  className="form-control"
                  onChange={handleChange}
                  value={inputs.option4}
                  required
                />
              </div>
              <div className="col-md-2 mb-3">
                <label>Option 5 </label>
                <input
                  name="option5"
                  type="text"
                  className="form-control"
                  onChange={handleChange}
                  value={inputs.option5}
                />
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




              {/* Image upload */}
              <div className="col-md-3 mb-3">
                <label>Question Image (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={handleImageChange}
                />

                {imagePreview ? (
                  <div style={{ marginTop: 8 }}>
                    <small className="text-muted">New Image Preview:</small>
                    <div>
                      <img
                        src={imagePreview}
                        alt="preview"
                        style={{ maxWidth: 200, maxHeight: 200, marginTop: 6 }}
                      />
                    </div>
                  </div>
                ) : existingImageUrl ? (
                  <div style={{ marginTop: 8 }}>
                    <small className="text-muted">Current Image:</small>
                    <div>
                      <img
                        src={existingImageUrl}
                        alt="current"
                        style={{ maxWidth: 200, maxHeight: 200, marginTop: 6 }}
                      />
                    </div>
                  </div>
                ) : null}
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
                    <small className="text-muted">New Audio Preview:</small>
                    <div style={{ marginTop: 6 }}>
                      <audio controls src={audioPreviewUrl}>
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  </div>
                ) : existingAudioUrl ? (
                  <div style={{ marginTop: 8 }}>
                    <small className="text-muted">Current Audio:</small>
                    <div style={{ marginTop: 6 }}>
                      <audio controls src={existingAudioUrl}>
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  </div>
                ) : null}
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

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Updating..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Edit;
