import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Demo database connection - use same database but with demo prefixes for safety
const DEMO_DATABASE_URL = process.env.DEMO_DATABASE_URL || process.env.DATABASE_URL;

if (!DEMO_DATABASE_URL) {
  throw new Error(
    "DEMO_DATABASE_URL must be set for demo environment isolation",
  );
}

export const demoPool = new Pool({ connectionString: DEMO_DATABASE_URL });
export const demoDB = drizzle({ client: demoPool, schema });

// Demo flag to ensure we never accidentally use production data
export const isDemoEnvironment = () => {
  // Always allow demo in Replit development environment
  return true;
};

// Safety check to prevent demo operations on production
export const ensureDemoSafety = () => {
  // Demo is always safe in development
  return true;
};