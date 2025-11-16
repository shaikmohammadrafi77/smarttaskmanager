import dotenv from 'dotenv';
import { initDatabase, closeDatabase } from './index.js';

dotenv.config();

async function runMigrations() {
  try {
    initDatabase();
    console.log('Database schema ensured successfully.');
  } catch (error) {
    console.error('Failed to run migrations:', error);
    process.exitCode = 1;
  } finally {
    closeDatabase();
  }
}

runMigrations();


