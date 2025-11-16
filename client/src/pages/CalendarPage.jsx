import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import PageHeader from '../components/PageHeader.jsx';
import { fetchTasks } from '../services/taskApi.js';
import styles from '../styles/CalendarPage.module.css';

export default function CalendarPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchTasks();
        setTasks(data);
      } catch (error) {
        console.error('Failed to load tasks for calendar', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const grouped = useMemo(() => {
    const map = {};
    tasks.forEach((task) => {
      if (!task.dueDate) {
        return;
      }
      const dateKey = dayjs(task.dueDate).format('YYYY-MM-DD');
      if (!map[dateKey]) {
        map[dateKey] = [];
      }
      map[dateKey].push(task);
    });
    return Object.entries(map)
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([date, items]) => ({ date, items }));
  }, [tasks]);

  return (
    <div className={styles.container}>
      <PageHeader
        title="Calendar"
        subtitle="Visualise your upcoming deadlines and reminders."
      />
      {loading ? (
        <div className="card">Loading calendar...</div>
      ) : grouped.length === 0 ? (
        <div className="card">No scheduled tasks yet. Add due dates to see them here.</div>
      ) : (
        <div className={styles.list}>
          {grouped.map((group) => (
            <div key={group.date} className="card">
              <h2>{dayjs(group.date).format('dddd, MMM D, YYYY')}</h2>
              <div className={styles.items}>
                {group.items.map((task) => (
                  <div key={task.id} className={styles.item}>
                    <div>
                      <h3>{task.title}</h3>
                      <p>{task.description || 'No description provided.'}</p>
                    </div>
                    <div className={styles.meta}>
                      <span className={`${styles.badge} ${styles[task.priority]}`}>
                        {task.priority}
                      </span>
                      <span>
                        Due at {dayjs(task.dueDate).format('h:mm A')}
                        {task.remindAt && (
                          <small> • Reminder {dayjs(task.remindAt).format('MMM D, h:mm A')}</small>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

