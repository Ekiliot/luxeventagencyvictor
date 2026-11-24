'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, X, Loader2, CheckCircle2 } from 'lucide-react';
import { CatalogData, CatalogItem } from '@/lib/types';
import { formatPrice } from '@/lib/formatPrice';
import styles from './PricingCarousel.module.css';
import modalStyles from './PricesClient.module.css';

interface PricingCarouselProps {
  catalog: CatalogData;
  lang: 'en' | 'ro' | 'ru';
  dict: any;
}

export function PricingCarousel({ catalog, lang, dict }: PricingCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
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

  const getLoc = (obj: any): string => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[lang] || obj['ru'] || obj['ro'] || obj['en'] || '';
  };

  const categories = catalog.categories || [];
  const items = (catalog.items || []).filter(item => item.active !== false);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -380 : 380;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

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
      const displayPrice = formatPrice(selectedItem, lang);
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: bookingForm.name,
          phone: bookingForm.phone,
          message: `Заявка с карусели: ${itemTitle} (${displayPrice}). Дата: ${bookingForm.date || 'Не указана'}. Пожелания: ${bookingForm.notes || 'Нет'}`,
          service: `${itemTitle} (${displayPrice})`
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

  const viewAllText = {
    ru: 'Смотреть весь прайс-лист',
    ro: 'Vezi toate pachetele și prețurile',
    en: 'Explore Complete Pricing'
  }[lang] || 'Смотреть весь прайс-лист';

  const eyebrowText = {
    ru: 'КОЛЛЕКЦИИ & ПРАЙС',
    ro: 'COLECȚII & PREȚURI',
    en: 'COLLECTIONS & PRICING'
  }[lang] || 'КОЛЛЕКЦИИ';

  const headingText = {
    ru: 'Пакеты и Цены',
    ro: 'Pachete și Prețuri',
    en: 'Signature Packages & Rates'
  }[lang] || 'Пакеты и Цены';

  const subtitleText = {
    ru: 'Прозрачные тарифы на декор, фотозоны и организацию событий под ключ',
    ro: 'Tarife transparente pentru decor, fotozone și organizarea evenimentelor',
    en: 'Transparent rates for luxury decor, photozones, and full event planning'
  }[lang] || 'Прозрачные тарифы';

  return (
    <section className={styles.carouselSection}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <span className={styles.eyebrow}>{eyebrowText}</span>
          <h2 className={styles.title}>{headingText}</h2>
          <p className={styles.subtitle}>{subtitleText}</p>
        </div>

        <div className={styles.navControls}>
          <button onClick={() => scroll('left')} className={styles.arrowBtn} aria-label="Предыдущий слайд">
            <ChevronLeft size={22} />
          </button>
          <button onClick={() => scroll('right')} className={styles.arrowBtn} aria-label="Следующий слайд">
            <ChevronRight size={22} />
          </button>
        </div>
      </div>

      <div className={styles.trackContainer}>
        <div ref={scrollRef} className={styles.track}>
          {items.map((item) => {
            const cat = categories.find(c => c.id === item.categoryId);
            const titleStr = getLoc(item.title);
            const descStr = getLoc(item.description);

            return (
              <div key={item.id} className={styles.card}>
                <div className={styles.imageWrapper}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image || '/photozones/1f4ebfa4-34af-4cbd-8059-3186ce818cb0.jpg'}
                    alt={titleStr}
                    className={styles.cardImage}
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/photozones/1f4ebfa4-34af-4cbd-8059-3186ce818cb0.jpg';
                    }}
                  />
                  {item.badge && <span className={styles.badge}>{item.badge}</span>}
                </div>

                <div className={styles.cardContent}>
                  {cat && <span className={styles.category}>{getLoc(cat.name)}</span>}
                  <h3 className={styles.cardTitle}>{titleStr}</h3>
                  <div className={styles.price}>{formatPrice(item, lang)}</div>
                  <p className={styles.desc}>{descStr}</p>

                  <button onClick={() => openBooking(item)} className={styles.bookBtn}>
                    <span>{dict?.orderBtn || 'Забронировать'}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.footerAction}>
        <Link href={`/${lang}/prices`} className={styles.viewAllLink}>
          <span>{viewAllText}</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {modalOpen && selectedItem && (
          <div className={modalStyles.modalOverlay} onClick={() => setModalOpen(false)}>
            <motion.div
              className={modalStyles.modalContent}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <button 
                className={modalStyles.modalClose} 
                onClick={() => setModalOpen(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>

              {isBooked ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem' }}>
                  <CheckCircle2 size={52} color="#0d0d0f" style={{ margin: '0 auto 1.2rem' }} />
                  <h3 className={modalStyles.modalTitle}>Заявка успешно принята!</h3>
                  <p className={modalStyles.subtitle} style={{ marginTop: '0.5rem' }}>
                    Спасибо! Виктор свяжется с вами в течение 15 минут для подтверждения.
                  </p>
                  <button
                    onClick={() => setModalOpen(false)}
                    className={modalStyles.submitModalBtn}
                    style={{ marginTop: '1.8rem' }}
                  >
                    Закрыть
                  </button>
                </div>
              ) : (
                <>
                  <h3 className={modalStyles.modalTitle}>Бронирование услуги</h3>
                  <div className={modalStyles.modalItemName}>
                    {getLoc(selectedItem.title)} — {formatPrice(selectedItem, lang)}
                  </div>

                  {errorMsg && (
                    <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.88rem' }}>
                      {errorMsg}
                    </div>
                  )}

                  <form onSubmit={handleBookingSubmit}>
                    <div className={modalStyles.formGroup}>
                      <label className={modalStyles.formLabel}>Ваше имя *</label>
                      <input
                        type="text"
                        required
                        className={modalStyles.formInput}
                        placeholder="Например, Елена"
                        value={bookingForm.name}
                        onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                      />
                    </div>

                    <div className={modalStyles.formGroup}>
                      <label className={modalStyles.formLabel}>Номер телефона *</label>
                      <input
                        type="tel"
                        required
                        className={modalStyles.formInput}
                        placeholder="+373 69 ..."
                        value={bookingForm.phone}
                        onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                      />
                    </div>

                    <div className={modalStyles.formGroup}>
                      <label className={modalStyles.formLabel}>Дата мероприятия</label>
                      <input
                        type="date"
                        className={modalStyles.formInput}
                        value={bookingForm.date}
                        onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                      />
                    </div>

                    <div className={modalStyles.formGroup}>
                      <label className={modalStyles.formLabel}>Пожелания или локация</label>
                      <textarea
                        rows={2}
                        className={modalStyles.formInput}
                        placeholder="Дополнительные детали..."
                        value={bookingForm.notes}
                        onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={modalStyles.submitModalBtn}
                    >
                      {isSubmitting && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
                      {isSubmitting ? 'Отправка...' : 'Подтвердить бронь'}
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
