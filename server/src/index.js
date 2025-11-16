import dotenv from 'dotenv';
import app from './app.js';
import { initScheduler } from './services/reminderService.js';

dotenv.config();

const PORT = process.env.PORT || 5173;

app.listen(PORT, () => {
  console.log(`Smart AI Task Organizer API listening on port ${PORT}`);
});

// Start background jobs such as reminder checks
initScheduler();

