import { api } from './api.js';

export function fetchProfile() {
  return api.get('/profile').then((res) => res.data.profile);
}

