// QuestionWidget.jsx
import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import axios from "axios";
import toast from "react-hot-toast";
import defaultImage from "../../assets/banner.jpg";
import { useUser } from "../../context/UserContext";

const QuestionWidget = () => {
  const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
  const token = localStorage.getItem("token");
  const { userId } = useUser();

  const hasAutoScrolled = useRef(false);

  const [questions, setQuestions] = useState([]);
  const [serverResults, setServerResults] = useState([]);

  const [selected, setSelected] = useState({});
  const [submitted, setSubmitted] = useState(new Set());
  const [results, setResults] = useState({});
  const [showStats, setShowStats] = useState({});

  /* ----------------------------------------
     FETCH QUESTIONS
  ---------------------------------------- */
  const fetchAllQuestion = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${BACKEND_BASE_URL}/api/question/get-all`
      );
      if (data?.success) setQuestions(data.question || []);
      else toast.error("Failed to fetch questions");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error fetching questions");
    }
  }, [BACKEND_BASE_URL]);

  /* ----------------------------------------
     FETCH USER RESULTS
  ---------------------------------------- */
  const fetchThisUserResult = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${BACKEND_BASE_URL}/api/result/get-thisuser-result`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (Array.isArray(data)) setServerResults(data);
      else if (data?.success) setServerResults(data.resultData || []);
      else setServerResults([]);
    } catch (err) {
      toast.error("Error fetching user results");
    }
  }, [BACKEND_BASE_URL, token]);

  useEffect(() => {
    fetchAllQuestion();
  }, [fetchAllQuestion]);

  useEffect(() => {
    if (token) fetchThisUserResult();
  }, [fetchThisUserResult, token]);

  /* ----------------------------------------
     QUESTION MAP (FAST LOOKUP)
  ---------------------------------------- */
  const questionMap = useMemo(() => {
    const map = new Map();
    questions.forEach(q => map.set(String(q._id), q));
    return map;
  }, [questions]);

  /* ----------------------------------------
     RESOLVE CORRECT VALUE
  ---------------------------------------- */
  const resolveCorrectValue = useCallback((q) => {
    if (!q?.correctoption) return null;
    return q[q.correctoption] ?? null;
  }, []);

  /* ----------------------------------------
     SYNC SERVER RESULTS → STATE
  ---------------------------------------- */
  useEffect(() => {
    if (!serverResults.length || !questionMap.size) return;

    const newSelected = {};
    const newSubmitted = new Set();
    const newResults = {};

    serverResults.forEach(r => {
      const qId = String(r.questionid);
      const qObj = questionMap.get(qId);
      if (!qObj) return;

      const selectedText = qObj[r.selectedoption];
      const correctValue = resolveCorrectValue(qObj);

      const isCorrect =
        selectedText && correctValue
          ? String(selectedText).trim() === String(correctValue).trim()
          : null;

      newSelected[qId] = selectedText;
      newSubmitted.add(qId);
      newResults[qId] = { isCorrect, correctValue };
    });

    setSelected(newSelected);
    setSubmitted(newSubmitted);
    setResults(newResults);
  }, [serverResults, questionMap, resolveCorrectValue]);

  /* ----------------------------------------
     AUTO SCROLL TO NEXT UNANSWERED QUESTION
  ---------------------------------------- */
  useEffect(() => {
    if (!questions.length || hasAutoScrolled.current) return;

    const answeredIds = new Set(
      serverResults.map(r => String(r.questionid))
    );

    const nextQuestion =
      questions.find(q => !answeredIds.has(String(q._id))) ||
      questions[questions.length - 1];

    if (!nextQuestion) return;

    const el = document.getElementById(`q-${nextQuestion._id}`);
    if (el) {
      el.scrollIntoView({ block: "center" });
      hasAutoScrolled.current = true;
    }
  }, [questions, serverResults]);

  /* ----------------------------------------
     SUBMIT ANSWER
  ---------------------------------------- */
  const submitInToDB = useCallback(
    async (payload) => {
      try {
        await axios.post(
          `${BACKEND_BASE_URL}/api/result/add`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error(err);
      }
    },
    [BACKEND_BASE_URL, token]
  );

  const submitAnswer = async (q) => {
    const id = q._id;
    if (submitted.has(id)) return;

    const answer = selected[id];
    if (!answer) {
      toast.error("Please choose an option first");
      return;
    }

    const selectedoption = Object.keys(q).find(k => q[k] === answer);

    submitInToDB({ questionid: id, selectedoption });

    const correctValue = resolveCorrectValue(q);
    const isCorrect =
      answer && correctValue
        ? String(answer).trim() === String(correctValue).trim()
        : null;

    setSubmitted(prev => new Set(prev).add(id));
    setResults(prev => ({ ...prev, [id]: { isCorrect, correctValue } }));

    if (isCorrect) {
      setShowStats(prev => ({ ...prev, [id]: true }));
      toast.success("Correct!");
    } else toast.error("Incorrect");
  };

  /* ----------------------------------------
     UI HELPERS
  ---------------------------------------- */
  const handleSelect = (qId, value) => {
    if (submitted.has(qId)) return;
    setSelected(prev => ({ ...prev, [qId]: value }));
  };

  const nextChallenge = (index) => {
    const next = questions[index + 1];
    if (!next) return toast("No more questions");
    document
      .getElementById(`q-${next._id}`)
      ?.scrollIntoView({ block: "center" });
  };

  /* ----------------------------------------
     RENDER
  ---------------------------------------- */
  return (
    <div>
      {questions.map((q, index) => {
        const id = q._id;
        const isSubmitted = submitted.has(id);
        const sel = selected[id];
        const res = results[id] || {};
        const isCorrect = res.isCorrect;

        const imageSrc = q.image
          ? `${BACKEND_BASE_URL}/${q.image}`
          : defaultImage;

        return (
          <section
            id={`q-${id}`}
            key={id}
            style={{ marginBottom: 28 }}
          >
            <div className="container-fluid">
              <div className="row">
                <div className="col-md-6">
                  <img
                    src={imageSrc}
                    alt=""
                    style={{ width: "100%", borderRadius: 8 }}
                  />
                </div>

                <div className="col-md-6">
                  <h4>{q.questiontext}</h4>

                  {["option1", "option2", "option3", "option4"].map(opt => (
                    <div
                      key={opt}
                      onClick={() => handleSelect(id, q[opt])}
                      style={{
                        padding: 10,
                        border:
                          sel === q[opt]
                            ? "1px solid #0b5fa5"
                            : "1px solid #ccc",
                        marginBottom: 10,
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        checked={sel === q[opt]}
                        readOnly
                      />{" "}
                      {q[opt]}
                    </div>
                  ))}

                  {!isSubmitted && (
                    <button onClick={() => submitAnswer(q)}>
                      SUBMIT
                    </button>
                  )}

                  {isSubmitted && (
                    <button onClick={() => nextChallenge(index)}>
                      NEXT
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default QuestionWidget;
