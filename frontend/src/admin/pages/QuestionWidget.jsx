// QuestionWidget.jsx
import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import defaultImage from "../../assets/banner.jpg";
import { useUser } from "../../context/UserContext";


/**
 * QuestionWidget
 * - Shows list of questions (left image + right question)
 * - "See how others chose" opens results panel
 * - Results panel includes a "Back to question" link (left aligned) which returns to interactive view
 * - On correct submit, results panel opens automatically
 */

const QuestionWidget = () => {
  const hasAutoScrolled = useRef(false);
  const token = localStorage.getItem("token");
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState({});
  const [submitted, setSubmitted] = useState(new Set());
  const [results, setResults] = useState({});
  const [showStats, setShowStats] = useState({});
  const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
  const { userId } = useUser();
  const [serverResults, setServerResults] = useState([]);
 
  const fetchAllQuestion = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${BACKEND_BASE_URL}/api/question/get-all`,
        { headers: { Authorization: `Bearer ${token}` } }
      ); 
      
      if (data?.success) setQuestions(data.question || []);
      else toast.error("Failed to fetch questions");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error fetching questions");
    }
  }, [BACKEND_BASE_URL]);

  useEffect(() => {
    fetchAllQuestion();
  }, []);
 

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
    if (!questions.length || hasAutoScrolled.current || !serverResults.length) return;

    const answeredIds = new Set(
      serverResults.map(r => String(r.questionid))
    );

    const nextQuestion =
      questions.find(q => !answeredIds.has(String(q._id))) ||
      questions[questions.length - 1];

    if (!nextQuestion) return;

    const el = document.getElementById(`q-${nextQuestion._id}`);
    if (el) {
      el.scrollIntoView({ block: "center", });
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


 

  const handleSelect = (qId, value) => {
    if (submitted.has(qId)) return;
    setSelected(prev => ({ ...prev, [qId]: value }));
  };
 

  const tryAgain = (qId) => {
    setSubmitted(prev => {
      const next = new Set(prev);
      next.delete(qId);
      return next;
    });
    setSelected(prev => {
      const copy = { ...prev };
      delete copy[qId];
      return copy;
    });
    setResults(prev => {
      const copy = { ...prev };
      delete copy[qId];
      return copy;
    });
    const el = document.getElementById(`q-${qId}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const nextChallenge = (index) => {
    const nextIndex = index + 1;
    if (nextIndex >= questions.length) {
      toast("No more questions.");
      return;
    }
    const nextQ = questions[nextIndex];
    const nextId = nextQ._id ?? nextQ.id ?? `q-${nextIndex}`;
    const el = document.getElementById(`q-${nextId}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    else toast("Cannot find next question.");
  };

  // Build stats array [{key, text, percent}]
  const buildStats = (q) => {
    if (q.stats && typeof q.stats === "object") {
      const stats = [];
      ["option1", "option2", "option3", "option4"].forEach(k => {
        if (q[k]) stats.push({ key: k, text: q[k], percent: Number(q.stats[k]) || 0 });
      });
      const total = stats.reduce((s, it) => s + it.percent, 0);
      if (total !== 100 && total > 0) {
        return stats.map(it => ({ ...it, percent: Math.round((it.percent / total) * 100) }));
      }
      if (total === 0) {
        const per = Math.floor(100 / stats.length) || 0;
        return stats.map((it, i) => ({ ...it, percent: i === stats.length - 1 ? 100 - per * (stats.length - 1) : per }));
      }
      return stats;
    }

    const keys = ["option1", "option2", "option3", "option4"].filter(k => q[k]);
    if (!keys.length) return [];
    // sample distribution for 4 options (like your screenshots)
    if (keys.length === 4) {
      const sample = [13, 15, 8, 55];
      return keys.map((k, i) => ({ key: k, text: q[k], percent: sample[i] ?? Math.round(100 / keys.length) }));
    }
    const base = Math.floor(100 / keys.length) || 0;
    return keys.map((k, i) => ({ key: k, text: q[k], percent: i === keys.length - 1 ? 100 - base * (keys.length - 1) : base }));
  };

  // inline styles (you can move these to your css file)
  const styles = {
    containerRight: { padding: 24 },
    questionText: { fontSize: 15, marginBottom: 18, lineHeight: 1.5, fontWeight: 500 },
    optionRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 6, marginBottom: 10, cursor: "pointer" },
    radio: { width: 18, height: 18 },
    submitRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18, borderTop: "1px solid #e8e8e8", paddingTop: 16 },
    item: { marginBottom: 18 },
    circle: { width: 26, height: 26, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", marginRight: 12, border: "2px solid #2b5db5", color: "#2b5db5" },
    circleActive: { width: 26, height: 26, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", marginRight: 12, background: "#22c55e", color: "#fff" },
    progressWrap: { height: 6, borderRadius: 6, marginTop: 8, overflow: "hidden", background: "#fff" },
    percentText: { fontWeight: 600, color: "#000" },
    backToQuestionLink: { color: "#1f6fb2", cursor: "pointer", display: "inline-block", fontWeight: 500 },
    nextButtonFloating: { display: "inline-block", background: "#0b5fa5", color: "#fff", padding: "12px 22px", borderRadius: 6, border: "none", cursor: "pointer", float: "right", marginTop: 8 }
  };

  return (
    <div>
      {questions.map((q, index) => {
        const id = q._id ?? q.id ?? `q-${index}`;
        const options = ["option1", "option2", "option3", "option4"].filter(k => q[k]).map(k => ({ key: k, text: q[k] }));
        const imageSrc = q?.image && typeof q.image === "string"
          ? (q.image.startsWith("http") ? q.image : `${BACKEND_BASE_URL}/${q.image}`)
          : defaultImage;

        const isSubmitted = submitted.has(id);
        const sel = selected[id];
        const res = results[id] ?? {};
        const correctValue = res.correctValue ?? null;
        const isCorrect = res.isCorrect; // true/false/null
        const stats = buildStats(q);
        const top = stats.length ? stats.reduce((best, it) => (it.percent > (best.percent || -1) ? it : best), stats[0]) : {};

        // optional total responses
        const totalResponses = q.totalResponses ?? q.totalResponsesCount ?? q.statsTotal ?? null;

        return (
          <section id={`q-${id}`} className="page front-page-div question-answer" key={id} style={{ marginBottom: 28 }}>
            <div className="container-fluid p-0">
              <div className="row">
                {/* left image */}
                <div className="col-lg-6 col-md-6 col-12 p-0">
                  <div className="left-image-div" style={{ padding: 24 }}>
                    <img src={imageSrc} alt="Banner" style={{ width: "100%", height: "auto", borderRadius: 8 }} />
                  </div>
                </div>

                {/* right column */}
                <div className="col-lg-6 col-md-6 col-12 p-0">
                  <div style={styles.containerRight}>
                    {/* question text always on top */}
                    <h4 style={styles.questionText}>{q.questiontext}</h4>

                    {/* stats view */}
                    {showStats[id] ? (
                      <div style={{ display: "flex", gap: 24 }}>
                        <div style={{ flex: 1 }}>
                          <div className="answer-final-div">
                            <div className="answer-final-inn">
                              {stats.map((s) => {
                                const isActive = s.key === top.key;
                                return (
                                  <div key={s.key} className="item" style={styles.item}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                      {/* <div style={isActive ? styles.circleActive : styles.circle}>{isActive ? "✓" : ""}</div> */}
                                      <div style={isActive ? styles.circle : styles.circle}>{isActive ? "" : ""}</div>

                                      <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                          <div style={{ fontSize: 16, color: "#000" }}>{s.text}</div>
                                          {totalResponses > 5 && (
                                            <div style={styles.percentText}>{s.percent}%</div>
                                          )}
                                        </div>
                                        {totalResponses > 5 && (
                                          <div style={styles.progressWrap}>
                                            <div style={{ width: `${s.percent}%`, height: "100%", background: isActive ? "#22c55e" : "#2b5db5", borderRadius: 6 }} />
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {isActive && q.explanation && <div className="desc-box" style={{ marginTop: 12, color: "#444", lineHeight: 1.6 }}>{q.explanation}</div>}

                                    {isActive && q.answeraudio && (
                                      <div className="audio-box" style={{ marginTop: 12 }}>
                                        <audio controls style={{ width: "100%" }}>
                                          <source src={q.answeraudio.startsWith("http") ? q.answeraudio : `${BACKEND_BASE_URL}/${q.answeraudio}`} type="audio/mpeg" />
                                          Your browser does not support the audio element.
                                        </audio>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* total responses (if provided) */}
                          {totalResponses != null && totalResponses>5 && <div style={{ marginTop: 12, color: "#444", fontWeight: 600 }}>{totalResponses} Total Responses</div>}

                          {/* BACK TO QUESTION link (left side) */}
                          {isCorrect !== true && (
                            <div style={styles.submitRow}>
                              <span
                                onClick={() => setShowStats(prev => ({ ...prev, [id]: false }))}
                                style={styles.backToQuestionLink}
                              >
                                <i className="bi bi-arrow-left"></i> Back to question
                              </span>
                            </div>
                          )}
                        </div>

                        {/* floating Next Challenge button */}
                        {isSubmitted && (isCorrect === false || isCorrect === true) && (
                          <div style={{ minWidth: 160, display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }}>
                            <button style={styles.nextButtonFloating} onClick={() => nextChallenge(index)}>NEXT CHALLENGE <i className="bi bi-arrow-right"></i></button>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* interactive question view */
                      <>
                        {options.length === 0 && <p>No options available.</p>}

                        {options.map((optObj, i) => {
                          const opt = optObj.text;
                          const optionId = `${id}-opt-${i}`;
                          const checked = sel === opt;

                          let background = "#fff";
                          let border = "1px solid transparent";
                          let color = "#111";

                          if (!isSubmitted) {
                            if (checked) { background = "#f1f7ff"; border = "1px solid #cfe6ff"; }
                          } else {
                            if (isCorrect === true) {
                              if (String(opt).trim() === String(correctValue).trim()) { background = "#e6f9ee"; border = "1px solid #34c759"; color = "#0b7a3a"; }
                            } else if (isCorrect === false) {
                              if (checked) { background = "#fdecea"; border = "1px solid #ff3b30"; color = "#a12a22"; }
                            } else {
                              if (checked) { background = "#f1f7ff"; border = "1px solid #cfe6ff"; }
                            }
                          }

                          return (
                            <div key={optionId} onClick={() => handleSelect(id, opt)} style={{ ...styles.optionRow, background, border }} role="button">
                              <input id={optionId} type="radio" name={`radio-${id}`} value={opt} checked={checked || false} readOnly style={styles.radio} />
                              <label htmlFor={optionId} style={{ cursor: "pointer", color }}>{opt}</label>
                            </div>
                          );
                        })}

                        <div style={styles.submitRow}>
                          {!isSubmitted && (
                            <a href="#"
                              onClick={(e) => { e.preventDefault(); setShowStats(prev => ({ ...prev, [id]: true })); }}
                              style={{ color: "#1f6fb2" }}>
                              See how others chose <i className="bi bi-arrow-right"></i>
                            </a>
                          )}
                          {!isSubmitted ? (
                            <button
                              onClick={() => submitAnswer(q)}
                              disabled={!sel}
                              style={{
                                minWidth: 160,
                                padding: "14px 22px",
                                borderRadius: 8,
                                border: "none",
                                fontWeight: 700,
                                background: sel ? "#0b5fa5" : "#c4d0d8",
                                color: "#fff",
                                cursor: sel ? "pointer" : "not-allowed"
                              }}
                            >
                              SUBMIT <i className="bi bi-arrow-right"></i>
                            </button>
                          ) : null}
                        </div>

                        {/* wrong/correct messaging */}
                        {isSubmitted && (isCorrect === false || isCorrect === true) && (
                          <div style={{ marginTop: 12 }}>
                            {/* <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{ width: 28, height: 28, borderRadius: 20, background: "#ff3b30", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>✕</div>
                              <div>
                                <div style={{ color: "#a12a22", fontWeight: 700 }}>Try again! That is not the correct answer.</div>
                              </div>
                            </div> */}

                            <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
                              <button style={{ padding: "12px 22px", borderRadius: 6, border: "1px solid #ccc", background: "#132573", fontWeight: 500 }} onClick={() => nextChallenge(index)}>NEXT CHALLENGE <i className="bi bi-arrow-right"></i></button>
                              <button style={{ padding: "12px 22px", borderRadius: 6, border: "none", background: "#132573", color: "#fff", fontWeight: 500 }} onClick={() => tryAgain(id)}><i className="bi bi-arrow-clockwise"></i> TRY AGAIN</button>
                            </div>
                          </div>
                        )}

                        {/* {isSubmitted && isCorrect === true && (
                          <div style={{ marginTop: 12, color: "#0b7a3a", fontWeight: 700 }}>You selected the correct answer.</div>
                        )}

                        {isSubmitted && isCorrect === false && (
                          <div style={{ marginTop: 12, color: "#bb0b0bff", fontWeight: 700 }}>Submitted — correct answer not available locally.</div>
                        )} */}
                      </>
                    )}
                  </div>
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
