import { generateTaskSuggestion } from '../services/suggestionService.js';

export async function getSuggestion(req, res, next) {
  try {
    const suggestion = await generateTaskSuggestion(req.user.id, req.body);
    res.json({ suggestion });
  } catch (error) {
    next(error);
  }
}

