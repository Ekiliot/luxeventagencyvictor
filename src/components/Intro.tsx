"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Intro.module.css";

export function Intro() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    // Sequence lasts 3.5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      document.body.style.overflow = ""; // CLEAR IT HERE!
    }, 3500);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={styles.introContainer}
          initial={{ y: 0 }}
          exit={{ y: "-100%", transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] } }}
        >
          {/* Cinematic noise overlay */}
          <div className={styles.noiseOverlay}></div>

          <div className={styles.textContainer}>
            <motion.h1 
              className={styles.title}
              initial={{ opacity: 0, y: 10, filter: "blur(10px)", letterSpacing: "5px" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)", letterSpacing: "20px" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              LUX
            </motion.h1>
            
            <motion.p
              className={styles.subtitle}
              initial={{ opacity: 0, y: 15, letterSpacing: "2px" }}
              animate={{ opacity: 1, y: 0, letterSpacing: "8px" }}
              transition={{ duration: 1.2, delay: 1.2, ease: "easeOut" }}
            >
              event agency
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
