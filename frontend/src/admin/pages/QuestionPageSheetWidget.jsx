// QuestionPageSheetWidget.jsx
import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import "../../assets/questionstyle.css";
import api from "../../utils/api";

const QuestionPageSheetWidget = ({ isManualNavigation, setIsManualNavigation }) => {
  const token = localStorage.getItem("token");
  const [questions, setQuestions] = useState([]);
  const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

  const fetchAllQuestion = useCallback(async () => {
    try {
      const { data } = await api.get(
        `${BACKEND_BASE_URL}/api/question/get-all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data?.success) {
        setQuestions(data.question || []);
      } else {
        toast.error("Failed to fetch questions");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error fetching questions");
    }
  }, [BACKEND_BASE_URL, token]);

  useEffect(() => {
    if (token) {
      fetchAllQuestion();
    }
  }, [fetchAllQuestion, token]);

  // ✅ Separate questions
  const singleQuestions = questions.filter(
    (q) => q.questiontype === "Single Question"
  );

  const multipleQuestions = questions.filter(
    (q) => q.questiontype === "Multiple Question"
  );

  // ✅ Reusable Card Component
  const renderCard = (q, index) => (
    <div className="question-page-sheet-card shadow-sm mb-3" key={q._id || index}>
      <div className="d-flex align-items-start">

        {/* Question Number */}
        <div className="question-page-sheet-number">
          {String(q.ordering || index + 1).padStart(2, "0")}
        </div>

        <div className="flex-grow-1">
          <div
            className="question-page-sheet-text one-line"
            title={q.questiontext}
          >
           {q.questiontext.slice(0, 50)}...
          </div>

          <div className="answer-page-sheet-text">
            <span>Answer:</span> {q.answerreason || "Not Answered"}
          </div>
        </div>

      </div>
    </div>
  );

  return (
    <section className="question-page-sheet" id="answersheet">
      <div className="container question-page-sheet-container">

        <div className="question-page-title">Answer Sheet</div>

        <div className="row">

          {/* ✅ Single Questions */}
          <div className="col-md-6">
            <h3 className="mb-3 question-answer-sheet-cls">Single Option Answer Sheet</h3>

            {singleQuestions.length > 0 ? (
              singleQuestions.map((q, index) => renderCard(q, index))
            ) : (
              <p>No Single Questions</p>
            )}
          </div>

          {/* ✅ Multiple Questions */}
          <div className="col-md-6">
            <h3 className="mb-3 question-answer-sheet-cls">Multiple Option Answer Sheet</h3>

            {multipleQuestions.length > 0 ? (
              multipleQuestions.map((q, index) => renderCard(q, index))
            ) : (
              <p>No Multiple Questions</p>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};

export default QuestionPageSheetWidget;