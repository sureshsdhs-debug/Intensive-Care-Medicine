// QuestionWidget.jsx
import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
// import defaultImage from "../../assets/banner.jpg";
import { useUser } from "../../context/UserContext";
import "../../assets/questionstyle.css"
import api from "../../utils/api";

/**
 * QuestionWidget
 * - Shows list of questions (left image + right question)
 * - "See how others chose" opens results panel
 * - Results panel includes a "Back to question" link (left aligned) which returns to interactive view
 * - On correct submit, results panel opens automatically
 */

const QuestionWidget = ({ isManualNavigation, setIsManualNavigation }) => {
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


  const fetchThisUserResult = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${BACKEND_BASE_URL}/api/result/get-thisuser-result`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // console.log(data.resultData);

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




  useEffect(() => {
    if (!serverResults.length || !questionMap.size) return;

    const newSelected = {};
    const newSubmitted = new Set();
    const newResults = {};

    serverResults.forEach(r => {
      const qId = String(r.questionid);
      const qObj = questionMap.get(qId);
      if (!qObj) return;

      const isMultiple = qObj.questiontype === "Multiple Question";
      const correctValue = resolveCorrectValue(qObj);

      let selectedValue = null;

      // ✅ MULTIPLE QUESTION FIX
      if (isMultiple) {
        if (Array.isArray(r.selectedoption)) {
          selectedValue = r.selectedoption
            .map(key => qObj[key])
            .filter(Boolean);
        } else if (typeof r.selectedoption === "string") {
          selectedValue = [qObj[r.selectedoption]].filter(Boolean);
        } else {
          selectedValue = [];
        }
      } else {
        selectedValue = qObj[r.selectedoption] ?? null;
      }

      // correctness check
      let isCorrect = null;

      if (!isMultiple) {
        isCorrect =
          selectedValue && correctValue
            ? String(selectedValue).trim() === String(correctValue).trim()
            : null;
      } else {
        const correctKeys = Array.isArray(qObj.correctoption)
          ? qObj.correctoption
          : [qObj.correctoption];

        const selectedKeys = Array.isArray(r.selectedoption)
          ? r.selectedoption
          : [r.selectedoption];

        isCorrect =
          correctKeys.length === selectedKeys.length &&
          correctKeys.every(k => selectedKeys.includes(k));
      }

      newSelected[qId] = selectedValue;
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
    // ❌ If user clicked header menu → don't auto scroll

    if (isManualNavigation) {
      hasAutoScrolled.current = false;
    }
    if (!questions.length || hasAutoScrolled.current || !serverResults.length) return;

    const answeredIds = new Set(
      serverResults.map(r => String(r.questionid))
    );

    const nextQuestion =
      questions.find(q => !answeredIds.has(String(q._id))) ||
      questions[questions.length - 1];

    if (isManualNavigation) {
      // console.log(isManualNavigation);
      const el = document.getElementById('first-sec');
      if (el) {
        el.scrollIntoView({
          block: "center",
          // behavior: "smooth"
        });
      }
    } else {

      if (!nextQuestion) return;
      const el = document.getElementById(`q-${nextQuestion._id}`);
      if (el) {
        el.scrollIntoView({
          block: "center",
          // behavior: "smooth"
        });
        hasAutoScrolled.current = true;
      }
    }

  }, [questions, serverResults, isManualNavigation]);


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
    const isMultiple = q.questiontype === "Multiple Question";
    if (submitted.has(id)) return;

    const answer = selected[id];
    if (
      (!isMultiple && !answer) ||
      (isMultiple && (!Array.isArray(answer) || answer.length === 0))
    ) {
      toast.error("Please choose at least one option");
      return;
    }

    let selectedoption;

    if (!isMultiple) {
      selectedoption = Object.keys(q).find(k => q[k] === answer);
    } else {
      selectedoption = answer.map(val =>
        Object.keys(q).find(k => q[k] === val)
      );
    }

    submitInToDB({ questionid: id, selectedoption });

    const correctValue = resolveCorrectValue(q);


    let isCorrect = null;

    if (!isMultiple) {
      isCorrect =
        answer && correctValue
          ? String(answer).trim() === String(correctValue).trim()
          : null;
    } else {
      const correctKeys = Array.isArray(q.correctoption)
        ? q.correctoption
        : [q.correctoption];

      const selectedKeys = selectedoption || [];

      isCorrect =
        correctKeys.length === selectedKeys.length &&
        correctKeys.every(k => selectedKeys.includes(k));
    }


    setSubmitted(prev => new Set(prev).add(id));
    setResults(prev => ({ ...prev, [id]: { isCorrect, correctValue } }));

    if (isCorrect) {
      setShowStats(prev => ({ ...prev, [id]: true }));
      toast.success("Correct!");
    } else toast.error("Incorrect");
  };




  const handleSelect = (qId, value, isMultiple) => {
    if (submitted.has(qId)) return;

    setSelected(prev => {
      const current = prev[qId];

      if (!isMultiple) {
        // SINGLE QUESTION
        return { ...prev, [qId]: value };
      }

      // MULTIPLE QUESTION
      const arr = Array.isArray(current) ? current : [];
      const exists = arr.includes(value);

      return {
        ...prev,
        [qId]: exists
          ? arr.filter(v => v !== value) // uncheck
          : [...arr, value]              // check
      };
    });
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

  const prevChallenge = (index) => {
    const nextIndex = index - 1;
    if (nextIndex >= questions.length) {
      toast("No more questions.");
      return;
    }
    const nextQ = questions[nextIndex];
    const nextId = nextQ._id ?? nextQ.id ?? `q-${nextIndex}`;
    const el = document.getElementById(`q-${nextId}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    else toast("Cannot find previous question.");
  };

  // Build stats array [{key, text, percent}]
  const buildStats = (q) => {
    if (q.stats && typeof q.stats === "object") {
      const stats = [];
      ["option1", "option2", "option3", "option4", "option5", "option6", "option7", "option8", "option9"].forEach(k => {
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

    const keys = ["option1", "option2", "option3", "option4", "option5", "option6", "option7", "option8", "option9"].filter(k => q[k]);
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
    containerRight: { padding: "0px 24px" },
    questionText: { fontSize: 20, marginBottom: 0, lineHeight: 1.5, fontWeight: 500 },
    optionRow: { display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 6, cursor: "pointer" },
    radio: { width: 18, height: 18 },
    submitRow: { display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #e8e8e8", borderBottom: "1px solid #e8e8e8", padding: 5 },
    item: { marginBottom: 18 },
    circle: { width: 20, height: 20, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", marginRight: 12, border: "2px solid #2b5db5", color: "#2b5db5" },
    circleActive: { width: 20, height: 20, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", marginRight: 12, background: "#22c55e", color: "#fff" },
    progressWrap: { height: 6, borderRadius: 6, marginTop: 8, overflow: "hidden", background: "#fff" },
    percentText: { fontWeight: 600, color: "#000" },
    backToQuestionLink: { color: "#1f6fb2", cursor: "pointer", display: "inline-block", fontWeight: 500 },
    nextButtonFloating: { display: "inline-block", background: "#0f7fee", color: "#fff", padding: "7px 15px", borderRadius: 6, border: "none", cursor: "pointer", float: "right", marginTop: 8 }
  };

  return (
    <div>
      {questions.map((q, index) => {
        const correctOptionKey = q.correctoption; // e.g. "option2" 

        const isMultiple = q.questiontype === "Multiple Question";
        const id = q._id ?? q.id ?? `q-${index}`;
        const options = ["option1", "option2", "option3", "option4", "option5", "option6", "option7", "option8", "option9"].filter(k => q[k]).map(k => ({ key: k, text: q[k] }));

        const imageSrc = q?.image && typeof q.image === "string"
          ? (q.image.startsWith("http") ? q.image : `${q.image}`)
          : null;

        const isSubmitted = submitted.has(id);
        const sel = selected[id];
        const res = results[id] ?? {};
        const correctValue = res.correctValue ?? null;
        const isCorrect = res.isCorrect; // true/false/null
        const stats = buildStats(q);
        const top = stats.length ? stats.reduce((best, it) => (it.percent > (best.percent || -1) ? it : best), stats[0]) : {};

        // optional total responses
        const totalResponses = q.totalResponses ?? q.totalResponsesCount ?? q.statsTotal ?? null;

        const canSubmit = isMultiple ? Array.isArray(sel) && sel.length > 0 : !!sel;

        return (
          // <section id={`q-${id}`} className="page front-page-div question-answer" key={id} style={{ marginBottom: 31 }}>
          <section id={`q-${id}`} className="question-answer mt-3" key={id}>
            <div className="container-fluid p-0">


              {index === 0 || questions[index - 1].questiontype !== q.questiontype ? (
                <h1
                  className="question-type-text"
                  id={
                    q.questiontype === "Multiple Question"
                      ? "multiple-question-id"
                      : "single-question-id"
                  }
                >
                  {q.questiontype === "Multiple Question"
                    ? "Questions with Multiple Correct Answers"
                    : "Questions with Single Correct Option"}
                </h1>
              ) : null}

              <div className="row">
                {q.questionremark != "" && (
                  <p>{q.questionremark}</p>
                )}
              </div>
              <div className="row">
                {/* left image */}
                {imageSrc != null && (
                  <div className="col-lg-4 col-md-4 col-12 p-0">
                    <div className="left-image-div" style={{ padding: 24 }}>
                      <img src={imageSrc} alt="Question Image" style={{ width: "100%", height: "auto", borderRadius: 8, objectFit: "contain", }} />
                    </div>
                  </div>
                )}
                {/* right column */}
                <div className={`${(imageSrc != null) ? "col-lg-8 col-md-8 col-12" : "col-lg-12 col-md-12 col-12"} p-0`}>
                  <div style={styles.containerRight}>
                    {/* question text always on top */}
                    <h4 style={styles.questionText}>Q:{q.ordering} - {q.questiontext}</h4>

                    {/* stats view */}
                    {showStats[id] ? (
                      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }} >
                        <div style={{ flex: 1 }}>
                          <div className="answer-final-div">
                            <div className="answer-final-inn">
                              {stats.map((s) => {
                                // const isCorrectOption = s.key === correctOptionKey;

                                const isCorrectOption = isMultiple ? q.correctoption.includes(s.key) : s.key === correctOptionKey[0];

                                return (
                                  <div key={s.key} className="item">
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                      <div style={isCorrectOption ? styles.circle : styles.circle}>{isCorrectOption ? "" : ""}</div>
                                      <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                          <div style={{ fontSize: 16, color: "#000" }}> {s.text} </div>
                                          {totalResponses >= 5 && (
                                            <div style={styles.percentText}> &nbsp; {s.percent}% </div>
                                          )}
                                        </div>
                                        {totalResponses >= 5 && (
                                          <div style={styles.progressWrap}>
                                            <div style={{ width: `${s.percent}%`, height: "100%", background: (isSubmitted && isCorrect === true && isCorrectOption) ? "#22c55e" : "#2b5db5", borderRadius: 6 }} />
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {isCorrectOption && q.explanation && <div className="desc-box" style={{ marginTop: 12, color: "#444", lineHeight: 1.6 }}>{q.explanation}</div>}

                                    {/* ✅ SINGLE QUESTION → show below correct option */}
                                    {!isMultiple &&
                                      isCorrectOption &&
                                      showStats[id] &&
                                      isSubmitted &&
                                      // isCorrect === true &&
                                      (q.answeraudio || q.answerreason) && (
                                        <div className="audio-box" style={{ marginTop: 12 }}>
                                          {/* {q.answerreason && q.answerreason != "null" && (
                                            <p className="reason-text">
                                              <i className="bi bi-dot"></i> {q.answerreason}
                                            </p>
                                          )} */}
                                          {q.answeraudio && (
                                            <audio controls style={{ width: "100%" }}>
                                              <source
                                                src={q.answeraudio.startsWith("http")
                                                  ? q.answeraudio
                                                  : q.answeraudio}
                                                type="audio/mpeg"
                                              />
                                              Your browser does not support the audio element.
                                            </audio>
                                          )}
                                        </div>
                                      )}


                                  </div>
                                );
                              })}



                              {/* ✅ MULTIPLE QUESTION → show once at end */}
                              {isMultiple &&
                                showStats[id] &&
                                isSubmitted &&
                                // isCorrect === true &&
                                (q.answeraudio || q.answerreason) && (
                                  <div className="audio-box" style={{ marginTop: 16 }}>
                                    {/* {q.answerreason && (
                                      <p className="reason-text">
                                        <i className="bi bi-dot"></i> {q.answerreason}
                                      </p>
                                    )} */}
                                    {q.answeraudio && (
                                      <audio controls style={{ width: "100%" }}>
                                        <source
                                          src={q.answeraudio.startsWith("http")
                                            ? q.answeraudio
                                            : q.answeraudio}
                                          type="audio/mpeg"
                                        />
                                        Your browser does not support the audio element.
                                      </audio>
                                    )}
                                  </div>
                                )}


                            </div>
                          </div>

                          {/* total responses (if provided) */}
                          {totalResponses != null && totalResponses >= 5 && <div style={{ marginTop: 12, color: "#444", fontWeight: 600 }}>{totalResponses} Total Responses</div>}

                          {/* BACK TO QUESTION link (left side) */}
                          {/* {isCorrect !== true && ( */}
                          <div style={styles.submitRow}>
                            <span
                              onClick={() => setShowStats(prev => ({ ...prev, [id]: false }))}
                              style={styles.backToQuestionLink}
                            >
                              <i className="bi bi-arrow-left"></i> Back to question
                            </span>
                          </div>
                          {/* )} */}
                        </div>

                        {/* floating Next Challenge button */}
                        {/* {isSubmitted && (isCorrect === false || isCorrect === true) && (
                          <div style={{ minWidth: 160, display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }}>
                            <button style={styles.nextButtonFloating} onClick={() => nextChallenge(index)}>NEXT CHALLENGE <i className="bi bi-arrow-right"></i></button>
                          </div>
                        )} */}
                      </div>
                    ) : (
                      /* interactive question view */
                      <>
                        {options.length === 0 && <p>No options available.</p>}

                        {/* console.log(isMultiple); */}
                        {options.map((optObj, i) => {
                          const opt = optObj.text;
                          const optionId = `${id}-opt-${i}`;

                          const checked = isMultiple ? Array.isArray(sel) && sel.includes(opt) : sel === opt;

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

                          const optionLabel = String.fromCharCode(65 + i); // A, B, C, D...
                          return (
                            <div onClick={() => handleSelect(id, opt, isMultiple)} style={{ ...styles.optionRow, background, border }} key={optionId}>
                              <small style={{ width: '10px' }}>{optionLabel}</small>
                              <input id={optionId} type={isMultiple ? "checkbox" : "radio"} name={`radio-${id}`} checked={checked || false} readOnly />

                              <label htmlFor={optionId} style={{ cursor: "pointer", color }}>{opt}</label>
                            </div>
                          );
                        })}


                        <div style={styles.submitRow}>
                          {/* {!isSubmitted && ( */}

                          <div className="question-back-button">
                            {/* {serverResults.length > 0 && index > 0 && (
                              <button onClick={() => prevChallenge(index)}> <i className="bi bi-arrow-left"></i> Back</button>
                            )} */}
                            <a href="#"
                              onClick={(e) => { e.preventDefault(); setShowStats(prev => ({ ...prev, [id]: true })); }}
                              style={{ color: "#1f6fb2" }}>
                              See how others chose <i className="bi bi-arrow-right"></i>
                            </a>
                          </div>


                          {/* )}*/}
                          {!isSubmitted ? (
                            <button className="submitbuttoncls"
                              onClick={() => submitAnswer(q)}
                              disabled={!canSubmit}
                              style={{
                                minWidth: 110,
                                padding: "7px 15px",
                                borderRadius: 8,
                                border: "none",
                                fontWeight: 700,
                                background: sel ? "#0f7fee" : "#c4d0d8",
                                color: "#fff",
                                cursor: sel ? "pointer" : "not-allowed"
                              }}
                            >
                              SUBMIT <i className="bi bi-arrow-right"></i>
                            </button>
                          ) : null}
                        </div>

                        {/* wrong/correct messaging */}
                        {isSubmitted || (isCorrect === false || isCorrect === true) ? (
                          <div style={{ marginTop: 12 }}>
                            <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
                              {/* <button style={{ padding: "7px 15px", borderRadius: 6, border: "1px solid #ccc", background: "#0f7fee", fontWeight: 500 }} onClick={() => nextChallenge(index)} className="prebutton">NEXT <i className="bi bi-arrow-right"></i></button> */}
                              <button style={{ padding: "7px 15px", borderRadius: 6, border: "none", background: "#0f7fee", color: "#fff", fontWeight: 500 }} onClick={() => tryAgain(id)} className="prebutton"><i className="bi bi-arrow-clockwise"></i> TRY AGAIN</button>
                            </div>
                          </div>
                        ) : (
                          <span></span>
                        )}
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
