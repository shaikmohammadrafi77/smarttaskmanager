import { verifyToken } from '../utils/token.js';
import { getDb } from '../db/index.js';

export function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = verifyToken(token);
    const db = getDb();

    db.get('SELECT id, name, email, created_at FROM users WHERE id = ?', decoded.id, (err, user) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: 'Invalid token' });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
}

