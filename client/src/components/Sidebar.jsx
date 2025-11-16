import { NavLink } from 'react-router-dom';
import styles from '../styles/Sidebar.module.css';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/tasks', label: 'Tasks', icon: '🗂️' },
  { to: '/calendar', label: 'Calendar', icon: '🗓️' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
  { to: '/profile', label: 'Profile', icon: '👤' }
];

export default function Sidebar({ isOpen, onToggle }) {
  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      <div className={styles.brand}>
        <button type="button" className={styles.menuButton} onClick={onToggle}>
          ☰
        </button>
        <span>Smart Task Organizer</span>
      </div>
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

