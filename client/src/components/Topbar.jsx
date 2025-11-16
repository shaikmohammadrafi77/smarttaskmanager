import { useAuth } from '../hooks/useAuth.js';
import NotificationBell from './NotificationBell.jsx';
import styles from '../styles/Topbar.module.css';

export default function Topbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();

  return (
    <header className={styles.header}>
      <button type="button" className={styles.toggleButton} onClick={onToggleSidebar}>
        ☰
      </button>
      <div className={styles.spacer} />
      <NotificationBell />
      <div className={styles.profile}>
        <div className={styles.avatar}>{user?.name?.[0]?.toUpperCase() ?? '?'}</div>
        <div className={styles.details}>
          <span className={styles.name}>{user?.name}</span>
          <span className={styles.email}>{user?.email}</span>
        </div>
      </div>
      <button type="button" className={styles.logoutButton} onClick={logout}>
        Logout
      </button>
    </header>
  );
}

