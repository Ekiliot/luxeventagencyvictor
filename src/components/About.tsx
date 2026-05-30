'use client';

import { motion, Variants } from 'framer-motion';
import styles from './About.module.css';
import teamImage from '../team-nobg.png';

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
  },
};

export function About({ dict }: { dict: any }) {
  return (
    <section id="about" className={`section-padding ${styles.about}`}>
      <div className={styles.glow}></div>
      <div className={`container ${styles.grid}`}>
        
        {/* Left Column: Text Content */}
        <motion.div 
          className={styles.content}
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={fadeUp} className="heading-eyebrow">
            {dict.title}
          </motion.div>
          
          <motion.h2 variants={fadeUp} className={styles.title}>
            {dict.subtitle}
          </motion.h2>

          <motion.div variants={fadeUp} className="silver-divider" style={{ margin: '0 0 2rem 0' }}></motion.div>

          <motion.p variants={fadeUp} className={styles.description}>
            {dict.description1}
          </motion.p>
          
          <motion.p variants={fadeUp} className={styles.description}>
            {dict.description2}
          </motion.p>
        </motion.div>

        {/* Right Column: Floating Luxury Glass Frame */}
        <motion.div 
          className={styles.imageContainer}
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          <div className={styles.glassFrame}>
            <img src={teamImage.src} alt="Lux Event Agency Team" className={styles.image} />
            {/* The sweeping shine effect */}
            <div className={styles.shine}></div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
