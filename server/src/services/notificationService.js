import dayjs from 'dayjs';
import { getDb } from '../db/index.js';

export function createNotification({ userId, taskId, message, priority, triggerTime }) {
  const db = getDb();

  return new Promise((resolve, reject) => {
    const stmt = db.prepare(
      `INSERT INTO notifications (user_id, task_id, message, priority, trigger_time)
       VALUES (?, ?, ?, ?, ?)`
    );
    stmt.run(userId, taskId, message, priority, triggerTime, function callback(err) {
      if (err) {
        return reject(err);
      }
      db.get('SELECT * FROM notifications WHERE id = ?', [this.lastID], (selectErr, row) => {
        if (selectErr) {
          return reject(selectErr);
        }
        resolve(mapNotification(row));
      });
    });
  });
}

export function listNotifications(userId, { unreadOnly = false } = {}) {
  const db = getDb();

  return cleanupOrphanNotifications(userId).then(
    () =>
      new Promise((resolve, reject) => {
        const params = [userId];
        if (unreadOnly) {
          params.push(0);
        }
        db.all(
          `SELECT n.*
           FROM notifications n
           LEFT JOIN tasks t ON n.task_id = t.id
           WHERE n.user_id = ?
             AND (n.task_id IS NULL OR t.id IS NOT NULL)
             ${unreadOnly ? 'AND n.read = ?' : ''}
           ORDER BY n.trigger_time DESC`,
          params,
          (err, rows) => {
            if (err) {
              return reject(err);
            }
            resolve(rows.map(mapNotification));
          }
        );
      })
  );
}

export function markNotificationRead(userId, notificationId) {
  const db = getDb();
  const now = dayjs().toISOString();
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE notifications SET read = 1, updated_at = ?
       WHERE id = ? AND user_id = ?`,
      [now, notificationId, userId],
      function callback(err) {
        if (err) {
          return reject(err);
        }
        resolve(this.changes > 0);
      }
    );
  });
}

export function findExistingNotification(taskId, triggerTime) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM notifications WHERE task_id = ? AND trigger_time = ?`,
      [taskId, triggerTime],
      (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row ? mapNotification(row) : null);
      }
    );
  });
}

function mapNotification(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    taskId: row.task_id,
    message: row.message,
    priority: row.priority,
    triggerTime: row.trigger_time,
    read: Boolean(row.read),
    createdAt: row.created_at
  };
}

function cleanupOrphanNotifications(userId) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM notifications
       WHERE user_id = ?
         AND task_id IS NOT NULL
         AND task_id NOT IN (SELECT id FROM tasks WHERE user_id = ?)`,
      [userId, userId],
      (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      }
    );
  });
}

