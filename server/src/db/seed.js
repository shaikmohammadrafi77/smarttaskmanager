import dotenv from 'dotenv';
import dayjs from 'dayjs';
import { initDatabase, getDb, closeDatabase } from './index.js';
import { hashPassword } from '../utils/password.js';

dotenv.config();

function runQuery(query, params = []) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.run(query, params, function callback(err) {
      if (err) {
        return reject(err);
      }
      resolve(this);
    });
  });
}

function getQuery(query, params = []) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        return reject(err);
      }
      resolve(row);
    });
  });
}

async function seed() {
  try {
    initDatabase();
    const existing = await getQuery('SELECT id FROM users WHERE email = ?', ['admin@example.com']);
    if (existing) {
      console.log('Seed data already present. Skipping.');
      return;
    }

    const now = dayjs().toISOString();
    const passwordHash = hashPassword('password123');

    const userResult = await runQuery(
      `INSERT INTO users (name, email, password_hash, created_at)
       VALUES (?, ?, ?, ?)`,
      ['Admin', 'admin@example.com', passwordHash, now]
    );

    const userId = userResult.lastID;

    await runQuery(
      `INSERT INTO tasks (user_id, title, description, priority, status, due_date, remind_at, ai_suggestion, created_at, updated_at)
       VALUES
       (?, 'Welcome to Smart AI Task Organizer', 'Explore the dashboard and create your first task.', 'low', 'pending', NULL, NULL, NULL, ?, ?),
       (?, 'Add your first real task', 'Click the "+ New Task" button on the Tasks page.', 'medium', 'pending', ?, ?, 'Suggested reminder created during seed.', ?, ?)`,
      [
        userId,
        now,
        now,
        userId,
        dayjs().add(2, 'day').toISOString(),
        dayjs().add(1, 'day').toISOString(),
        now,
        now
      ]
    );

    console.log('Seed data inserted successfully.');
  } catch (error) {
    console.error('Failed to seed database:', error);
    process.exitCode = 1;
  } finally {
    closeDatabase();
  }
}

seed();


