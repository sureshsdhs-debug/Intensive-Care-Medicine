import React, { useEffect, useRef, useState } from "react";
import Mark from "mark.js";

const GlobalPageSearch = () => {
  const [keyword, setKeyword] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);

  const markInstance = useRef(null);

  useEffect(() => {
    markInstance.current = new Mark(document.querySelector("#page-content"));
  }, []);

  const handleSearch = (value) => {
    setKeyword(value);

    if (!markInstance.current) return;

    markInstance.current.unmark({
      done: () => {
        if (value) {
          markInstance.current.mark(value, {
            separateWordSearch: false,
            done: (count) => {
              setTotalMatches(count);
              setCurrentIndex(0);
              highlightCurrent(0);
            },
          });
        } else {
          setTotalMatches(0);
        }
      },
    });
  };

  const highlightCurrent = (index) => {
    const marks = document.querySelectorAll("mark");
    if (!marks.length) return;

    marks.forEach((m) => (m.style.background = "yellow"));
    marks[index].style.background = "orange";

    marks[index].scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const nextMatch = () => {
    if (!totalMatches) return;
    const newIndex = (currentIndex + 1) % totalMatches;
    setCurrentIndex(newIndex);
    highlightCurrent(newIndex);
  };

  const prevMatch = () => {
    if (!totalMatches) return;
    const newIndex =
      currentIndex === 0 ? totalMatches - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    highlightCurrent(newIndex);
  };



  useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === "f") {
      e.preventDefault();
      document.querySelector("input")?.focus();
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, []);



  return (
    <div className="content-search-bar">
      <input
        type="text"
        placeholder="Search..."
        value={keyword}
        onChange={(e) => handleSearch(e.target.value)}
      />

      <span>
        {totalMatches ? `${currentIndex + 1}/${totalMatches}` : "0/0"}
      </span>

      <button onClick={prevMatch}>↑</button>
      <button onClick={nextMatch}>↓</button>
    </div>
  );
};
 

export default GlobalPageSearch;