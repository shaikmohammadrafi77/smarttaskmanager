import {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  getDashboardSummary,
  getTaskStatsByDay
} from '../services/taskService.js';
import { listNotifications, markNotificationRead } from '../services/notificationService.js';

export async function getTasks(req, res, next) {
  try {
    const tasks = await listTasks(req.user.id);
    res.json({ tasks });
  } catch (error) {
    next(error);
  }
}

export async function createTaskController(req, res, next) {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const task = await createTask(req.user.id, req.body);
    res.status(201).json({ task });
  } catch (error) {
    next(error);
  }
}

export async function updateTaskController(req, res, next) {
  try {
    const task = await updateTask(req.user.id, Number(req.params.id), req.body);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ task });
  } catch (error) {
    next(error);
  }
}

export async function deleteTaskController(req, res, next) {
  try {
    const deleted = await deleteTask(req.user.id, Number(req.params.id));
    if (!deleted) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function getDashboard(req, res, next) {
  try {
    const summary = await getDashboardSummary(req.user.id);
    res.json(summary);
  } catch (error) {
    next(error);
  }
}

export async function getTaskStats(req, res, next) {
  try {
    const days = Number(req.query.days) || 7;
    const stats = await getTaskStatsByDay(req.user.id, days);
    res.json({ stats });
  } catch (error) {
    next(error);
  }
}

export async function getNotificationsController(req, res, next) {
  try {
    const { unreadOnly } = req.query;
    const notifications = await listNotifications(req.user.id, {
      unreadOnly: unreadOnly === 'true'
    });
    res.json({ notifications });
  } catch (error) {
    next(error);
  }
}

export async function markNotificationReadController(req, res, next) {
  try {
    const success = await markNotificationRead(req.user.id, Number(req.params.id));
    if (!success) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

