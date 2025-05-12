import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import path from 'path';

// Create a database connection
const sqlite = new Database(path.join(__dirname, '../../database/bookverse.db'));

// Create a Drizzle ORM instance
export const db = drizzle(sqlite);

// Export the SQLite instance for direct access if needed
export { sqlite };
