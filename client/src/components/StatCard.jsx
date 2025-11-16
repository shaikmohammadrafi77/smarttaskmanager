import styles from '../styles/StatCard.module.css';

export default function StatCard({ title, value, subtitle, accent = 'blue', icon }) {
  return (
    <div className={`${styles.card} ${styles[accent]}`}>
      <div className={styles.icon}>{icon}</div>
      <div className={styles.content}>
        <span className={styles.title}>{title}</span>
        <span className={styles.value}>{value}</span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </div>
    </div>
  );
}

