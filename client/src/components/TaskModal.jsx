import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { fetchSuggestion } from '../services/suggestionApi.js';
import styles from '../styles/TaskModal.module.css';

const defaultTask = {
  title: '',
  description: '',
  priority: 'medium',
  dueDate: '',
  remindAt: ''
};

export default function TaskModal({ open, onClose, onSave, initialTask }) {
  const [form, setForm] = useState(defaultTask);
  const [loading, setLoading] = useState(false);
  const [suggestionMessage, setSuggestionMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialTask) {
      setForm({
        title: initialTask.title || '',
        description: initialTask.description || '',
        priority: initialTask.priority || 'medium',
        dueDate: initialTask.dueDate ? formatForInput(initialTask.dueDate) : '',
        remindAt: initialTask.remindAt ? formatForInput(initialTask.remindAt) : ''
      });
    } else {
      setForm(defaultTask);
    }
    setSuggestionMessage('');
    setError('');
  }, [initialTask, open]);

  if (!open) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await onSave({
        ...form,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
        remindAt: form.remindAt ? new Date(form.remindAt).toISOString() : null
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    }
  };

  const handleSuggestion = async () => {
    setLoading(true);
    setSuggestionMessage('');
    try {
      const suggestion = await fetchSuggestion({
        title: form.title,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null
      });
      setForm((prev) => ({
        ...prev,
        priority: suggestion.priority ?? prev.priority,
        remindAt: suggestion.remindAt ? formatForInput(suggestion.remindAt) : prev.remindAt
      }));
      setSuggestionMessage(
        suggestion.message || 'AI suggestion applied. Review before saving.'
      );
    } catch (err) {
      setSuggestionMessage('Could not fetch suggestion. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>{initialTask ? 'Edit Task' : 'New Task'}</h2>
          <button type="button" className={styles.close} onClick={handleClose}>
            ✕
          </button>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label>
            Title
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="Task title"
            />
          </label>
          <label>
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the task"
            />
          </label>
          <div className={styles.row}>
            <label>
              Priority
              <select name="priority" value={form.priority} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            <label>
              Due Date
              <input
                type="datetime-local"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
              />
            </label>
          </div>
          <label>
            Remind At
            <input
              type="datetime-local"
              name="remindAt"
              value={form.remindAt}
              onChange={handleChange}
            />
          </label>
          <div className={styles.actions}>
            <button type="button" className={styles.secondary} onClick={handleSuggestion} disabled={loading}>
              {loading ? 'Getting suggestion...' : 'AI Suggestion'}
            </button>
            <div className={styles.actionGroup}>
              <button type="button" className={styles.secondary} onClick={handleClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save Task
              </button>
            </div>
          </div>
          {suggestionMessage && <div className={styles.suggestion}>{suggestionMessage}</div>}
          {error && <div className={styles.error}>{error}</div>}
        </form>
      </div>
    </div>
  );
}

function formatForInput(value) {
  return dayjs(value).format('YYYY-MM-DDTHH:mm');
}

