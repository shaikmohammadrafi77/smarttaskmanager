import { getDb } from '../db/index.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/token.js';

function normalizeEmail(email = '') {
  return email.trim().toLowerCase();
}

export function register(req, res, next) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  const db = getDb();
  const normalizedEmail = normalizeEmail(email);

  db.get('SELECT id FROM users WHERE email = ?', normalizedEmail, (err, existingUser) => {
    if (err) {
      return next(err);
    }
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const passwordHash = hashPassword(password);

    const stmt = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
    stmt.run(name.trim(), normalizedEmail, passwordHash, function callback(insertErr) {
      if (insertErr) {
        return next(insertErr);
      }

      const token = generateToken({ id: this.lastID });
      res.status(201).json({
        token,
        user: {
          id: this.lastID,
          name: name.trim(),
          email: normalizedEmail
        }
      });
    });
  });
}

export function login(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const db = getDb();
  const normalizedEmail = normalizeEmail(email);

  db.get('SELECT id, name, email, password_hash FROM users WHERE email = ?', normalizedEmail, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user || !comparePassword(password, user.password_hash)) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken({ id: user.id });
    delete user.password_hash;

    res.json({ token, user });
  });
}

