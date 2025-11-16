import styles from '../styles/TaskTable.module.css';

export default function TaskTable({ tasks, onEdit, onDelete, onToggleComplete }) {
  if (!tasks.length) {
    return <div className="card">No tasks found. Create your first task!</div>;
  }

  return (
    <div className="card">
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Due</th>
            <th>Remind At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>
                <div className={styles.title}>{task.title}</div>
                {task.description && <div className={styles.description}>{task.description}</div>}
              </td>
              <td>
                <span className={`${styles.badge} ${styles[task.priority]}`}>{task.priority}</span>
              </td>
              <td>
                <span className={`${styles.badge} ${styles[task.status]}`}>{task.status}</span>
              </td>
              <td>{task.dueDate ? new Date(task.dueDate).toLocaleString() : '—'}</td>
              <td>{task.remindAt ? new Date(task.remindAt).toLocaleString() : '—'}</td>
              <td className={styles.actions}>
                <button type="button" onClick={() => onToggleComplete(task)}>
                  {task.status === 'completed' ? 'Reopen' : 'Complete'}
                </button>
                <button type="button" onClick={() => onEdit(task)}>
                  Edit
                </button>
                <button type="button" className={styles.danger} onClick={() => onDelete(task)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

