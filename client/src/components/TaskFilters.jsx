import styles from '../styles/TaskFilters.module.css';

export default function TaskFilters({ filters, onChange }) {
  const handleChange = (event) => {
    const { name, value } = event.target;
    onChange({ ...filters, [name]: value });
  };

  return (
    <div className={`${styles.filters} card`}>
      <div>
        <label>
          Status
          <select name="status" value={filters.status} onChange={handleChange}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
        </label>
      </div>
      <div>
        <label>
          Priority
          <select name="priority" value={filters.priority} onChange={handleChange}>
            <option value="all">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
      </div>
    </div>
  );
}

