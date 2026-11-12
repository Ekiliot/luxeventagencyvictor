'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { CatalogData, CatalogItem } from '@/lib/types';
import styles from './PricesClient.module.css';

interface PricesClientProps {
  catalog: CatalogData;
  lang: 'en' | 'ro' | 'ru';
  dict: any;
}

export function PricesClient({ catalog, lang, dict }: PricesClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    name: '',
    phone: '',
    date: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Helper to extract localized text
  const getLoc = (obj: any): string => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[lang] || obj['ru'] || obj['ro'] || obj['en'] || '';
  };

  const categories = catalog.categories || [];
  const items = (catalog.items || []).filter(item => item.active !== false);

  const filteredItems = activeCategory === 'all'
    ? items
    : items.filter(item => item.categoryId === activeCategory);

  const openBooking = (item: CatalogItem) => {
    setSelectedItem(item);
    setIsBooked(false);
    setErrorMsg('');
    setBookingForm({ name: '', phone: '', date: '', notes: '' });
    setModalOpen(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const itemTitle = getLoc(selectedItem.title);
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: bookingForm.name,
          phone: bookingForm.phone,
          message: `Бронирование: ${itemTitle} (${selectedItem.price}). Дата: ${bookingForm.date || 'Не указана'}. Пожелания: ${bookingForm.notes || 'Нет'}`,
          service: `${itemTitle} (${selectedItem.price})`
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Ошибка при отправке');
      }

      setIsBooked(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Произошла ошибка, попробуйте еще раз');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.pricesSection}>
      {/* Header */}
      <motion.div 
        className={styles.header}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={styles.eyebrow}>
          LUXE COLLECTIONS
        </div>
        <h1 className={styles.title}>{dict.title || 'Прайс-лист & Коллекции'}</h1>
        <p className={styles.subtitle}>{dict.subtitle || 'Прозрачные цены на декор, фотозоны и организацию ваших главных событий'}</p>
      </motion.div>

      {/* Category Tabs */}
      <motion.div 
        className={styles.tabsContainer}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.15 }}
      >
        <button
          onClick={() => setActiveCategory('all')}
          className={`${styles.tabBtn} ${activeCategory === 'all' ? styles.activeTab : ''}`}
        >
          {dict.allCategories || 'Все категории'}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`${styles.tabBtn} ${activeCategory === cat.id ? styles.activeTab : ''}`}
          >
            {getLoc(cat.name)}
          </button>
        ))}
      </motion.div>

      {/* Grid of Minimal Luxury Price Cards */}
      <motion.div 
        className={styles.grid}
        layout
        transition={{ duration: 0.4 }}
      >
        <AnimatePresence>
          {filteredItems.map((item, idx) => {
            const category = categories.find(c => c.id === item.categoryId);
            const categoryName = category ? getLoc(category.name) : '';
            const title = getLoc(item.title);
            const desc = getLoc(item.description);

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5, delay: idx * 0.04 }}
                className={styles.card}
              >
                <div className={styles.imageWrapper}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image || '/photozones/1f4ebfa4-34af-4cbd-8059-3186ce818cb0.jpg'}
                    alt={title}
                    className={styles.cardImage}
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/photozones/1f4ebfa4-34af-4cbd-8059-3186ce818cb0.jpg';
                    }}
                  />
                  {item.badge && <span className={styles.itemBadge}>{item.badge}</span>}
                </div>

                <div className={styles.cardContent}>
                  {categoryName && <span className={styles.cardCategory}>{categoryName}</span>}
                  <h3 className={styles.cardTitle}>{title}</h3>
                  <div className={styles.priceTag}>{item.price}</div>
                  <p className={styles.cardDesc}>{desc}</p>

                  {item.features && item.features.length > 0 && (
                    <ul className={styles.featuresList}>
                      {item.features.map((feat, fIdx) => (
                        <li key={fIdx} className={styles.featureItem}>
                          <Check size={15} className={styles.featureIcon} />
                          <span>{getLoc(feat)}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    onClick={() => openBooking(item)}
                    className={styles.orderBtn}
                  >
                    <span>{dict.orderBtn || 'Оставить заявку'}</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Booking Modal */}
      <AnimatePresence>
        {modalOpen && selectedItem && (
          <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
            <motion.div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <button 
                className={styles.modalClose} 
                onClick={() => setModalOpen(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>

              {isBooked ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem' }}>
                  <CheckCircle2 size={52} color="#0d0d0f" style={{ margin: '0 auto 1.2rem' }} />
                  <h3 className={styles.modalTitle}>{dict.successTitle || 'Заявка успешно принята!'}</h3>
                  <p className={styles.subtitle} style={{ marginTop: '0.5rem' }}>
                    {dict.successDesc || 'Спасибо! Виктор свяжется с вами в течение 15 минут.'}
                  </p>
                  <button
                    onClick={() => setModalOpen(false)}
                    className={styles.submitModalBtn}
                    style={{ marginTop: '1.8rem' }}
                  >
                    Закрыть
                  </button>
                </div>
              ) : (
                <>
                  <h3 className={styles.modalTitle}>{dict.modalTitle || 'Бронирование услуги'}</h3>
                  <div className={styles.modalItemName}>
                    {getLoc(selectedItem.title)} — {selectedItem.price}
                  </div>

                  {errorMsg && (
                    <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.88rem' }}>
                      {errorMsg}
                    </div>
                  )}

                  <form onSubmit={handleBookingSubmit}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>{dict.namePlaceholder || 'Ваше имя *'}</label>
                      <input
                        type="text"
                        required
                        className={styles.formInput}
                        placeholder="Например, Анна"
                        value={bookingForm.name}
                        onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>{dict.phonePlaceholder || 'Номер телефона *'}</label>
                      <input
                        type="tel"
                        required
                        className={styles.formInput}
                        placeholder="+373 69 ..."
                        value={bookingForm.phone}
                        onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>{dict.datePlaceholder || 'Дата мероприятия'}</label>
                      <input
                        type="date"
                        className={styles.formInput}
                        value={bookingForm.date}
                        onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Пожелания или локация</label>
                      <textarea
                        rows={2}
                        className={styles.formInput}
                        placeholder="Дополнительные детали..."
                        value={bookingForm.notes}
                        onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={styles.submitModalBtn}
                    >
                      {isSubmitting && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
                      {isSubmitting ? 'Отправка...' : (dict.sendBtn || 'Подтвердить бронь')}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
