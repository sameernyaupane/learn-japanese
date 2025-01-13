import postgres from 'postgres';
import 'dotenv/config';

// Debug: Log the connection details
console.log('Database connection details:', {
  host: process.env.PG_HOST,
  user: process.env.PG_USERNAME,
  database: process.env.PG_DATABASE,
  port: Number(process.env.PG_PORT),
  // Don't log the actual password for security
  hasPassword: !!process.env.PG_PASSWORD
});

// PostgreSQL connection
export const sql = postgres({
  host: process.env.PG_HOST,
  user: process.env.PG_USERNAME,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  port: Number(process.env.PG_PORT)
}); 