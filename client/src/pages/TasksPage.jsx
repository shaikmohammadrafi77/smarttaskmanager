import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import TaskFilters from '../components/TaskFilters.jsx';
import TaskModal from '../components/TaskModal.jsx';
import TaskTable from '../components/TaskTable.jsx';
import {
  createTask,
  deleteTask,
  fetchTasks,
  updateTask
} from '../services/taskApi.js';

const defaultFilters = { status: 'all', priority: 'all' };

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchTasks();
        setTasks(data);
      } catch (error) {
        console.error('Failed to load tasks', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filters.status !== 'all' && task.status !== filters.status) {
        return false;
      }
      if (filters.priority !== 'all' && task.priority !== filters.priority) {
        return false;
      }
      return true;
    });
  }, [tasks, filters]);

  const handleCreateClick = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleDelete = async (task) => {
    const confirmed = window.confirm(`Delete task "${task.title}"?`);
    if (!confirmed) return;
    try {
      await deleteTask(task.id);
      setTasks((prev) => prev.filter((item) => item.id !== task.id));
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  const handleToggleComplete = async (task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const updated = await updateTask(task.id, { status: nextStatus });
      setTasks((prev) =>
        prev.map((item) => (item.id === task.id ? { ...item, ...updated } : item))
      );
    } catch (error) {
      console.error('Failed to update task', error);
    }
  };

  const handleSave = async (payload) => {
    if (editingTask) {
      const updated = await updateTask(editingTask.id, payload);
      setTasks((prev) =>
        prev.map((item) => (item.id === editingTask.id ? { ...item, ...updated } : item))
      );
    } else {
      const created = await createTask(payload);
      setTasks((prev) => [created, ...prev]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader
        title="Tasks"
        subtitle="Create, prioritize, and track all your tasks in one place."
        action={
          <button type="button" className="btn-primary" onClick={handleCreateClick}>
            + New Task
          </button>
        }
      />
      <TaskFilters filters={filters} onChange={setFilters} />
      {loading ? (
        <div className="card">Loading tasks...</div>
      ) : (
        <TaskTable
          tasks={filteredTasks}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleComplete={handleToggleComplete}
        />
      )}
      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialTask={editingTask}
      />
    </div>
  );
}

