// QuestionPageSheetWidget.jsx
import React, { useEffect, useState, useCallback } from "react"; 
import toast from "react-hot-toast"; 
import { useUser } from "../../context/UserContext";
import "../../assets/questionstyle.css"
import api from "../../utils/api";

/**
 * QuestionPageSheetWidget
 * - Shows list of questions (left image + right question)
 * - "See how others chose" opens results panel
 * - Results panel includes a "Back to question" link (left aligned) which returns to interactive view
 * - On correct submit, results panel opens automatically
 */

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
      }
      else {
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



  return (
    <section className="question-page-sheet">
  <div className="container question-page-sheet-container">

    <div className="question-page-title">Question Page Sheet</div>

    {questions.length === 0 ? (
      <p className="text-center">No questions available</p>
    ) : (
      questions.map((q, index) => (
        <div className="question-page-sheet-card shadow-sm" key={q._id || index}>
          
          <div className="d-flex align-items-start">
            
            {/* Question Number Badge */}
            <div className="question-page-sheet-number">
              {String(index + 1).padStart(2, "0")}
            </div>

            <div className="flex-grow-1">
              <div className="question-page-sheet-text">
                {q.questiontext}
              </div>

              <div className="answer-page-sheet-text">
                <span>Answer:</span> {q.answerreason || "Not Answered"}
              </div>
            </div>

          </div>

        </div>
      ))
    )}

  </div>
</section>
  );
};

export default QuestionPageSheetWidget;
