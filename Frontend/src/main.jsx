import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

import App from "./App.jsx";

function SmoothScrollApp() {
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      return undefined;
    }

    const lenis = new Lenis({
      duration: 1.9,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
      wheelMultiplier: 0.8,
      touchMultiplier: 1.4,
      autoRaf: true,
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  return <App />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SmoothScrollApp />
  </StrictMode>,
);
