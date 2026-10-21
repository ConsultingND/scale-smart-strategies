import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    // If there's a hash (anchor link), scroll to it after a brief delay
    const timer = setTimeout(() => {
      const element = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo(0, 0);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
