import { useEffect, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import { fetchDashboard, fetchTaskStats } from '../services/taskApi.js';
import styles from '../styles/DashboardPage.module.css';

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [summaryData, stats] = await Promise.all([fetchDashboard(), fetchTaskStats(7)]);
        setSummary(summaryData);
        setChartData(
          stats.map((item) => ({
            day: item.day,
            count: item.count
          }))
        );
      } catch (error) {
        console.error('Failed to load dashboard', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div className="card">Loading dashboard...</div>;
  }

  if (!summary) {
    return <div className="card">Unable to load dashboard data.</div>;
  }

  return (
    <div className={styles.container}>
      <PageHeader
        title="Dashboard"
        subtitle="Monitor your productivity at a glance and stay ahead of deadlines."
      />
      <div className={styles.statsGrid}>
        <StatCard title="Total Tasks" value={summary.totalTasks} icon="🗂️" accent="blue" />
        <StatCard title="Completed" value={summary.completedTasks} icon="✅" accent="green" />
        <StatCard title="Overdue" value={summary.overdueTasks} icon="⚠️" accent="yellow" />
        <StatCard
          title="Completion Rate"
          value={`${summary.completionRate}%`}
          icon="🎯"
          accent="purple"
        />
      </div>
      <div className={styles.grid}>
        <div className="card">
          <h2>Tasks Created (Last 7 days)</h2>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <h2>Upcoming Deadlines</h2>
          <div className={styles.deadlineList}>
            {summary.upcomingDeadlines.length === 0 && (
              <p>No upcoming deadlines. You are all caught up!</p>
            )}
            {summary.upcomingDeadlines.map((task) => (
              <div key={task.id} className={styles.deadlineItem}>
                <div>
                  <h3>{task.title}</h3>
                  <p>{task.description || 'No description provided.'}</p>
                </div>
                <div>
                  <span className={`${styles.priority} ${styles[task.priority]}`}>
                    {task.priority}
                  </span>
                  <span className={styles.dueDate}>
                    {task.dueDate ? new Date(task.dueDate).toLocaleString() : 'No due date'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

