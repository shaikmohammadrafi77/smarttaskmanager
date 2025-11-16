import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import {
  fetchNotifications,
  markNotificationRead
} from '../services/taskApi.js';
import styles from '../styles/NotificationBell.module.css';

dayjs.extend(relativeTime);

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchNotifications();
        setNotifications(data);
      } catch (error) {
        console.error('Failed to load notifications', error);
      }
    };
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleMarkRead = async (notification) => {
    if (notification.read) {
      return;
    }
    try {
      await markNotificationRead(notification.id);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id ? { ...item, read: true } : item
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  return (
    <div className={styles.wrapper}>
      <button type="button" className={styles.button} onClick={handleToggle}>
        🔔
        {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
      </button>
      {open && (
        <div className={styles.dropdown}>
          <div className={styles.heading}>Notifications</div>
          <div className={styles.list}>
            {notifications.length === 0 && <p className={styles.empty}>No notifications yet.</p>}
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`${styles.item} ${notification.read ? styles.read : ''}`}
                onClick={() => handleMarkRead(notification)}
                onKeyDown={(event) => event.key === 'Enter' && handleMarkRead(notification)}
                role="button"
                tabIndex={0}
              >
                <div className={styles.message}>{notification.message}</div>
                <div className={styles.meta}>
                  <span className={`${styles.tag} ${styles[notification.priority]}`}>
                    {notification.priority}
                  </span>
                  <span>{dayjs(notification.triggerTime).fromNow()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

