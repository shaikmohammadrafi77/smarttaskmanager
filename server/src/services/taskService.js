import dayjs from 'dayjs';
import { getDb } from '../db/index.js';

const PRIORITIES = ['low', 'medium', 'high'];
const STATUSES = ['pending', 'completed', 'overdue'];

function ensurePriority(priority) {
  if (!priority) return 'medium';
  const normalized = priority.toLowerCase();
  if (PRIORITIES.includes(normalized)) {
    return normalized;
  }
  return 'medium';
}

function ensureStatus(status) {
  if (!status) return 'pending';
  const normalized = status.toLowerCase();
  if (STATUSES.includes(normalized)) {
    return normalized;
  }
  return 'pending';
}

export function hydrateTask(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    priority: row.priority,
    status: row.status,
    dueDate: row.due_date,
    remindAt: row.remind_at,
    aiSuggestion: row.ai_suggestion,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function listTasks(userId) {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM tasks WHERE user_id = ? ORDER BY
       CASE WHEN due_date IS NULL THEN 1 ELSE 0 END,
       due_date ASC`,
      [userId],
      (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(
          rows.map((row) => {
            const status = computeStatus(row);
            if (status !== row.status) {
              updateStatus(row.id, status);
              row.status = status;
            }
            return hydrateTask(row);
          })
        );
      }
    );
  });
}

export function createTask(userId, payload) {
  const db = getDb();
  const {
    title,
    description = '',
    priority,
    dueDate = null,
    remindAt = null,
    status,
    aiSuggestion = null
  } = payload;

  const normalizedPriority = ensurePriority(priority);
  const normalizedStatus = ensureStatus(status);
  const now = dayjs().toISOString();

  return new Promise((resolve, reject) => {
    const stmt = db.prepare(
      `INSERT INTO tasks
      (user_id, title, description, priority, status, due_date, remind_at, ai_suggestion, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    stmt.run(
      userId,
      title.trim(),
      description.trim(),
      normalizedPriority,
      normalizedStatus,
      dueDate,
      remindAt,
      aiSuggestion,
      now,
      now,
      function callback(err) {
        if (err) {
          return reject(err);
        }
        db.get('SELECT * FROM tasks WHERE id = ?', [this.lastID], (selectErr, row) => {
          if (selectErr) {
            return reject(selectErr);
          }
          resolve(hydrateTask(row));
        });
      }
    );
  });
}

export function updateTask(userId, taskId, updates) {
  const db = getDb();
  const now = dayjs().toISOString();

  const fields = [];
  const values = [];

  if (updates.title) {
    fields.push('title = ?');
    values.push(updates.title.trim());
  }
  if (typeof updates.description === 'string') {
    fields.push('description = ?');
    values.push(updates.description.trim());
  }
  if (updates.priority) {
    fields.push('priority = ?');
    values.push(ensurePriority(updates.priority));
  }
  if (updates.status) {
    fields.push('status = ?');
    values.push(ensureStatus(updates.status));
  }
  if (updates.dueDate !== undefined) {
    fields.push('due_date = ?');
    values.push(updates.dueDate);
  }
  if (updates.remindAt !== undefined) {
    fields.push('remind_at = ?');
    values.push(updates.remindAt);
  }
  if (updates.aiSuggestion !== undefined) {
    fields.push('ai_suggestion = ?');
    values.push(updates.aiSuggestion);
  }

  if (!fields.length) {
    return Promise.reject(new Error('No valid fields to update'));
  }

  fields.push('updated_at = ?');
  values.push(now);

  values.push(userId, taskId);

  return new Promise((resolve, reject) => {
    const query = `UPDATE tasks SET ${fields.join(', ')} WHERE user_id = ? AND id = ?`;
    db.run(query, values, function callback(err) {
      if (err) {
        return reject(err);
      }
      if (this.changes === 0) {
        return resolve(null);
      }
      db.get('SELECT * FROM tasks WHERE id = ?', [taskId], (selectErr, row) => {
        if (selectErr) {
          return reject(selectErr);
        }
        resolve(hydrateTask(row));
      });
    });
  });
}

export function deleteTask(userId, taskId) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(
        'DELETE FROM notifications WHERE user_id = ? AND task_id = ?',
        [userId, taskId],
        (notifyErr) => {
          if (notifyErr) {
            return reject(notifyErr);
          }
          db.run(
            'DELETE FROM tasks WHERE user_id = ? AND id = ?',
            [userId, taskId],
            function callback(taskErr) {
              if (taskErr) {
                return reject(taskErr);
              }
              resolve(this.changes > 0);
            }
          );
        }
      );
    });
  });
}

export function updateStatus(taskId, status) {
  const db = getDb();
  const now = dayjs().toISOString();
  db.run('UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?', [status, now, taskId]);
}

export function computeStatus(task) {
  if (!task.due_date) {
    return task.status || 'pending';
  }

  const due = dayjs(task.due_date);
  if (!due.isValid()) {
    return task.status || 'pending';
  }
  if (task.status === 'completed') {
    return 'completed';
  }
  return due.isBefore(dayjs()) ? 'overdue' : 'pending';
}

export function getDashboardSummary(userId) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) AS overdue
      FROM tasks WHERE user_id = ?`,
      [userId],
      (err, rows) => {
        if (err) {
          return reject(err);
        }
        const { total = 0, completed = 0, overdue = 0 } = rows[0] || {};
        const completionRate = total ? Number((completed / total) * 100).toFixed(1) : '0.0';

        db.all(
          `SELECT * FROM tasks
           WHERE user_id = ? AND due_date IS NOT NULL
           ORDER BY due_date ASC LIMIT 5`,
          [userId],
          (tasksErr, upcomingRows) => {
            if (tasksErr) {
              return reject(tasksErr);
            }
            resolve({
              totalTasks: total,
              completedTasks: completed,
              overdueTasks: overdue,
              completionRate: completionRate,
              upcomingDeadlines: upcomingRows.map(hydrateTask)
            });
          }
        );
      }
    );
  });
}

export function getTaskStatsByDay(userId, days = 7) {
  const db = getDb();
  const start = dayjs().subtract(days - 1, 'day').startOf('day').toISOString();

  return new Promise((resolve, reject) => {
    db.all(
      `SELECT date(created_at) AS day, COUNT(*) AS count
       FROM tasks WHERE user_id = ? AND created_at >= ?
       GROUP BY date(created_at)
       ORDER BY day ASC`,
      [userId, start],
      (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      }
    );
  });
}

