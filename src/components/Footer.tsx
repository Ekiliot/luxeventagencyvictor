import styles from './Footer.module.css';

export function Footer({ dict }: { dict: any }) {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.content}>
          <p className={styles.phone}>
            <a href="tel:+37360123456" className={styles.phoneLink}>
              +373 60 123 456
            </a>
          </p>
          <p className={styles.text}>&copy; {new Date().getFullYear()} {dict.rights}</p>
        </div>
      </div>
    </footer>
  );
}
