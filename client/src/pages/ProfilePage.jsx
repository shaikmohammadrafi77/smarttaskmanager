import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import { fetchProfile } from '../services/profileApi.js';
import styles from '../styles/ProfilePage.module.css';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProfile();
        setProfile(data);
      } catch (error) {
        console.error('Failed to load profile', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className={styles.container}>
      <PageHeader title="Profile" subtitle="Review your account information." />
      {loading ? (
        <div className="card">Loading profile...</div>
      ) : profile ? (
        <div className="card">
          <div className={styles.row}>
            <span className={styles.label}>Name</span>
            <span>{profile.name}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Email</span>
            <span>{profile.email}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Member Since</span>
            <span>{new Date(profile.memberSince).toLocaleDateString()}</span>
          </div>
        </div>
      ) : (
        <div className="card">Profile unavailable.</div>
      )}
    </div>
  );
}

