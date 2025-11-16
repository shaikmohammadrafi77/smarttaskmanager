import { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import styles from '../styles/AppLayout.module.css';

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen((prev) => !prev)} />
      <div className={styles.mainArea}>
        <Topbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}

