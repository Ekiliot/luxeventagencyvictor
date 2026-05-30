'use client';

import { motion } from 'framer-motion';
import { Phone, Mail, MapPin } from 'lucide-react';
import styles from './Contact.module.css';

export function Contact({ dict }: { dict: any }) {
  return (
    <section id="contact" className={`section-padding ${styles.contact}`}>
      <div className="container">
        <motion.div 
          className={styles.grid}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Left Column: Info Panel */}
          <motion.div 
            className={styles.infoPanel}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <h2 className={styles.title}>{dict.title}</h2>
            <div className={styles.divider}></div>
            <p className={styles.subtitle}>{dict.subtitle}</p>
            
            <div className={styles.contactDetails}>
              <div className={styles.detailItem}>
                <Phone size={22} strokeWidth={1.25} className={styles.icon} />
                <a href="tel:+37360123456" className={styles.detailValue}>
                  +373 60 123 456
                </a>
              </div>
              <div className={styles.detailItem}>
                <Mail size={22} strokeWidth={1.25} className={styles.icon} />
                <a href="mailto:hello@luxevents.md" className={styles.detailValue}>
                  hello@luxevents.md
                </a>
              </div>
              <div className={styles.detailItem}>
                <MapPin size={22} strokeWidth={1.25} className={styles.icon} />
                <span className={styles.detailValue}>
                  Chişinău, Moldova
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Form Panel */}
          <motion.div 
            className={styles.formPanel}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
              <div className={styles.inputGroup}>
                <input type="text" required className={styles.input} placeholder={dict.name} />
                <span className={styles.inputBar}></span>
              </div>
              <div className={styles.inputGroup}>
                <input type="tel" required className={styles.input} placeholder={dict.phone} />
                <span className={styles.inputBar}></span>
              </div>
              <div className={styles.inputGroup}>
                <input type="email" required className={styles.input} placeholder={dict.email} />
                <span className={styles.inputBar}></span>
              </div>
              <div className={styles.inputGroup}>
                <textarea required className={styles.input} placeholder={dict.message}></textarea>
                <span className={styles.inputBar}></span>
              </div>
              <button type="submit" className={styles.submitBtn}>
                {dict.cta}
              </button>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
