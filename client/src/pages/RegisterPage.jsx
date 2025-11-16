import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import styles from '../styles/AuthPage.module.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create your Smart Task account</h1>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            placeholder="Full name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            className={styles.input}
            placeholder="Email address"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            className={styles.input}
            placeholder="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
          {error && <div style={{ color: '#ef4444', fontSize: 14 }}>{error}</div>}
          <button className={`${styles.submit} btn-primary`} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <div className={styles.footer}>
          Already have an account?
          <Link className={styles.link} to="/login">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

