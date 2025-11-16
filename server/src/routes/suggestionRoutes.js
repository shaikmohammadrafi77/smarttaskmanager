import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { getSuggestion } from '../controllers/suggestionController.js';

const router = Router();

router.use(requireAuth);
router.post('/', getSuggestion);

export default router;

