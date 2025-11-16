import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  getTasks,
  createTaskController,
  updateTaskController,
  deleteTaskController,
  getDashboard,
  getTaskStats,
  getNotificationsController,
  markNotificationReadController
} from '../controllers/taskController.js';

const router = Router();

router.use(requireAuth);

router.get('/', getTasks);
router.post('/', createTaskController);
router.put('/:id', updateTaskController);
router.delete('/:id', deleteTaskController);

router.get('/dashboard/summary', getDashboard);
router.get('/dashboard/stats', getTaskStats);

router.get('/notifications', getNotificationsController);
router.patch('/notifications/:id/read', markNotificationReadController);

export default router;

