import { api } from './api.js';

export function fetchSuggestion(payload) {
  return api.post('/suggestions', payload).then((res) => res.data.suggestion);
}

