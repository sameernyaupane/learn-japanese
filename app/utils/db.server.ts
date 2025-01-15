import postgres from 'postgres';
import 'dotenv/config';

// PostgreSQL connection
export const sql = postgres({
  host: process.env.PG_HOST,
  user: process.env.PG_USERNAME,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  port: Number(process.env.PG_PORT)
}); 