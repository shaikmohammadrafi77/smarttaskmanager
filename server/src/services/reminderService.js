import cron from 'node-cron';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import { getDb } from '../db/index.js';
import { createNotification, findExistingNotification } from './notificationService.js';

dayjs.extend(relativeTime);

let schedulerInitialised = false;

export function initScheduler() {
  if (schedulerInitialised) {
    return;
  }

  cron.schedule('* * * * *', () => {
    processReminders().catch((err) => {
      console.error('Failed to process reminders', err);
    });
  });

  schedulerInitialised = true;
}

export async function processReminders() {
  const db = getDb();
  const now = dayjs();
  const windowStart = now.subtract(1, 'minute').toISOString();
  const windowEnd = now.add(1, 'minute').toISOString();

  const tasks = await new Promise((resolve, reject) => {
    db.all(
      `SELECT tasks.* FROM tasks
       WHERE remind_at IS NOT NULL
         AND status != 'completed'
         AND remind_at BETWEEN ? AND ?`,
      [windowStart, windowEnd],
      (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      }
    );
  });

  for (const task of tasks) {
    const triggerTime = dayjs(task.remind_at).toISOString();
    const existing = await findExistingNotification(task.id, triggerTime);
    if (existing) {
      continue;
    }
    const message = `Reminder: "${task.title}" is due ${task.due_date ? dayjs(task.due_date).fromNow() : 'soon'}.`;
    await createNotification({
      userId: task.user_id,
      taskId: task.id,
      message,
      priority: task.priority,
      triggerTime
    });
  }
}

