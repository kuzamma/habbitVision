import { useState, useEffect } from "react";

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Initial check
    checkIfMobile();
    
    // Add event listener for resize
    window.addEventListener("resize", checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  function checkIfMobile() {
    setIsMobile(window.innerWidth < 768);
  }

  return isMobile;
}