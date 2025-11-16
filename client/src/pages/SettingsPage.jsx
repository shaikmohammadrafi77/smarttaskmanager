import { useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import styles from '../styles/SettingsPage.module.css';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    webPush: false,
    emailNotifications: false,
    digestTime: '08:00'
  });

  const handleChange = (event) => {
    const { name, type, checked, value } = event.target;
    setSettings((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = (event) => {
    event.preventDefault();
    window.alert('Settings saved locally. Connect to notification service to persist.');
  };

  return (
    <div className={styles.container}>
      <PageHeader
        title="Settings"
        subtitle="Configure reminder channels and daily planning preferences."
      />
      <form className="card" onSubmit={handleSave}>
        <section className={styles.section}>
          <h2>Notifications</h2>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              name="webPush"
              checked={settings.webPush}
              onChange={handleChange}
            />
            <div>
              <span className={styles.label}>Web Push Notifications</span>
              <p>Receive task reminders in your browser as push notifications.</p>
            </div>
          </label>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              name="emailNotifications"
              checked={settings.emailNotifications}
              onChange={handleChange}
            />
            <div>
              <span className={styles.label}>Email Notifications</span>
              <p>Send reminders to your email address (requires SMTP configuration).</p>
            </div>
          </label>
        </section>
        <section className={styles.section}>
          <h2>Daily Digest</h2>
          <label className={styles.field}>
            Digest Time
            <input
              type="time"
              name="digestTime"
              value={settings.digestTime}
              onChange={handleChange}
            />
          </label>
        </section>
        <div className={styles.actions}>
          <button className="btn-primary" type="submit">
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}

