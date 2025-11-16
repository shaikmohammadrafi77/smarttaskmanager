import jwt from 'jsonwebtoken';

const DEFAULT_EXPIRY = '12h';
const DEFAULT_SECRET = 'dev-smart-ai-task-organizer-secret';
let warned = false;

function getSecret() {
  const secret = process.env.JWT_SECRET || DEFAULT_SECRET;
  if (secret === DEFAULT_SECRET && !warned) {
    console.warn(
      'JWT_SECRET environment variable not set. Falling back to insecure default secret. Configure JWT_SECRET in your .env file for production use.'
    );
    warned = true;
  }
  return secret;
}

export function generateToken(payload, options = {}) {
  const secret = getSecret();
  return jwt.sign(payload, secret, { expiresIn: DEFAULT_EXPIRY, ...options });
}

export function verifyToken(token) {
  const secret = getSecret();
  return jwt.verify(token, secret);
}

