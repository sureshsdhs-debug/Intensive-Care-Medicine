import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

const useAntiScreenshot = ({
  maxViolations = 3,
  onViolationLimitReached = null
} = {}) => {
  const violationCount = useRef(0);

  const handleViolation = () => {
    violationCount.current += 1;

    toast.error("Screenshots are not allowed 🚫");

    if (
      maxViolations &&
      violationCount.current >= maxViolations &&
      typeof onViolationLimitReached === "function"
    ) {
      onViolationLimitReached();
    }
  };

  useEffect(() => {
    /* -----------------------------
       Disable Right Click & Copy
    ----------------------------- */
    const disableDefault = (e) => e.preventDefault();

    document.addEventListener("contextmenu", disableDefault);
    document.addEventListener("copy", disableDefault);
    document.addEventListener("cut", disableDefault);
    document.addEventListener("paste", disableDefault);

    /* -----------------------------
       Detect Screenshot Keys
    ----------------------------- */
  const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();

      const isScreenshotKey =
        e.key === "PrintScreen" ||
        (e.ctrlKey && key === "p") ||
        (e.metaKey && e.shiftKey && ["3", "4"].includes(key));

      const isDevToolsKey = null;
    //     (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(key)) || // Ctrl+Shift+I/J/C
    //     e.key === "F12" ||                                          // F12
    //     (e.metaKey && e.altKey && ["i", "j"].includes(key));        // Mac Cmd+Opt+I/J

 

      if (isScreenshotKey || isDevToolsKey) {
        e.preventDefault();
        e.stopPropagation();

        handleViolation(
          isDevToolsKey
            ? "Developer tools are not allowed"
            : "Screenshot attempt detected"
        );

        return false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", disableDefault);
      document.removeEventListener("copy", disableDefault);
      document.removeEventListener("cut", disableDefault);
      document.removeEventListener("paste", disableDefault);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
};

export default useAntiScreenshot;
