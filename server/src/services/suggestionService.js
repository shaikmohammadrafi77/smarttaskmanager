import dayjs from 'dayjs';
import { getDb } from '../db/index.js';

const KEYWORD_PRIORITY_MAP = [
  { keywords: ['exam', 'assignment', 'deadline', 'submission'], priority: 'high' },
  { keywords: ['meeting', 'review', 'call'], priority: 'medium' },
  { keywords: ['reminder', 'read', 'watch'], priority: 'low' }
];

export async function generateTaskSuggestion(userId, payload = {}) {
  const { title = '', dueDate = null } = payload;
  const db = getDb();

  const stats = await fetchUserStats(userId);

  let priority = 'medium';
  let reasoning = [];

  const lowered = title.toLowerCase();
  for (const { keywords, priority: mappedPriority } of KEYWORD_PRIORITY_MAP) {
    if (keywords.some((keyword) => lowered.includes(keyword))) {
      priority = mappedPriority;
      reasoning.push(`Detected keyword match for ${mappedPriority} priority.`);
      break;
    }
  }

  if (dueDate) {
    const due = dayjs(dueDate);
    if (due.diff(dayjs(), 'hour') <= 24) {
      priority = 'high';
      reasoning.push('Due date within 24 hours, setting priority to high.');
    } else if (due.diff(dayjs(), 'day') <= 3 && priority !== 'high') {
      priority = 'medium';
      reasoning.push('Due date in the next 3 days, keeping priority medium.');
    }
  }

  if (!reasoning.length) {
    if (stats.highPriorityRate < 0.2) {
      priority = 'medium';
      reasoning.push('Defaulting to medium priority for new users.');
    } else {
      reasoning.push('Using historical distribution of priorities.');
    }
  }

  const defaultReminder = computeDefaultReminder(dueDate, stats);

  return {
    priority,
    remindAt: defaultReminder,
    message: reasoning.join(' ')
  };
}

function fetchUserStats(userId) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) AS high_priority_count
       FROM tasks WHERE user_id = ?`,
      [userId],
      (err, row) => {
        if (err) {
          return reject(err);
        }
        const total = row?.total || 0;
        const highPriorityRate = total ? (row.high_priority_count || 0) / total : 0;
        resolve({ total, highPriorityRate });
      }
    );
  });
}

function computeDefaultReminder(dueDate, stats) {
  if (!dueDate) {
    return null;
  }
  const due = dayjs(dueDate);
  if (!due.isValid()) {
    return null;
  }

  let offsetHours = 24;
  if (stats.total < 5) {
    offsetHours = 48;
  } else if (stats.highPriorityRate > 0.4) {
    offsetHours = 12;
  }

  const reminder = due.subtract(offsetHours, 'hour');
  if (reminder.isBefore(dayjs())) {
    return dayjs().add(30, 'minute').toISOString();
  }
  return reminder.toISOString();
}

