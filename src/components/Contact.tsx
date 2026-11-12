'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, CheckCircle, Loader2 } from 'lucide-react';
import styles from './Contact.module.css';

export function Contact({ dict }: { dict: any }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          service: 'Заявка с сайта (Контакты)'
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка при отправке заявки');
      }

      setIsSuccess(true);
      setFormData({ name: '', phone: '', email: '', message: '' });
    } catch (err: any) {
      setErrorMsg(err.message || 'Произошла ошибка, попробуйте еще раз');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            {isSuccess ? (
              <motion.div 
                className={styles.successBox}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className={styles.successIcon}>
                  <CheckCircle size={28} />
                </div>
                <h3 className={styles.successTitle}>Заявка принята</h3>
                <p className={styles.successText}>
                  Спасибо! Ваша заявка успешно сохранена. Виктор свяжется с вами в течение 15 минут для обсуждения деталей события.
                </p>
                <button 
                  onClick={() => setIsSuccess(false)}
                  className={styles.resetBtn}
                >
                  Отправить еще одну заявку
                </button>
              </motion.div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit}>
                {errorMsg && (
                  <div className={styles.errorBanner}>
                    {errorMsg}
                  </div>
                )}
                <div className={styles.inputGroup}>
                  <input 
                    type="text" 
                    required 
                    className={styles.input} 
                    placeholder={dict.name}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <span className={styles.inputBar}></span>
                </div>
                <div className={styles.inputGroup}>
                  <input 
                    type="tel" 
                    required 
                    className={styles.input} 
                    placeholder={dict.phone}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                  <span className={styles.inputBar}></span>
                </div>
                <div className={styles.inputGroup}>
                  <input 
                    type="email" 
                    className={styles.input} 
                    placeholder={dict.email}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  <span className={styles.inputBar}></span>
                </div>
                <div className={styles.inputGroup}>
                  <textarea 
                    required 
                    className={styles.input} 
                    placeholder={dict.message}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  ></textarea>
                  <span className={styles.inputBar}></span>
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className={styles.submitBtn}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {isSubmitting && <Loader2 size={18} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />}
                  {isSubmitting ? 'Отправка...' : dict.cta}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
