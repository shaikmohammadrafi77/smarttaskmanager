import { api } from './api.js';

export function fetchDashboard() {
  return api.get('/tasks/dashboard/summary').then((res) => res.data);
}

export function fetchTaskStats(days = 7) {
  return api
    .get('/tasks/dashboard/stats', { params: { days } })
    .then((res) => res.data.stats);
}

export function fetchTasks() {
  return api.get('/tasks').then((res) => res.data.tasks);
}

export function createTask(payload) {
  return api.post('/tasks', payload).then((res) => res.data.task);
}

export function updateTask(taskId, payload) {
  return api.put(`/tasks/${taskId}`, payload).then((res) => res.data.task);
}

export function deleteTask(taskId) {
  return api.delete(`/tasks/${taskId}`);
}

export function fetchNotifications(unreadOnly = false) {
  return api
    .get('/tasks/notifications', { params: { unreadOnly } })
    .then((res) => res.data.notifications);
}

export function markNotificationRead(notificationId) {
  return api.patch(`/tasks/notifications/${notificationId}/read`);
}

