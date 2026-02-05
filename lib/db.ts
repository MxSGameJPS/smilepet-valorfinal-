import { Pool } from "pg";

// Using connection string from the request (in .env normally, but hardcoding for quick setup as requested, or using .env if added)
// The connection string: postgresql://postgres.ezjfugnliqmbdjoqdnks:smilepetvalorfinal@aws-1-us-east-2.pooler.supabase.com:6543/postgres
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.ezjfugnliqmbdjoqdnks:smilepetvalorfinal@aws-1-us-east-2.pooler.supabase.com:6543/postgres";

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
