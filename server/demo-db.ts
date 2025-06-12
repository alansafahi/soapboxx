import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Demo database connection - separate from production
const DEMO_DATABASE_URL = process.env.DEMO_DATABASE_URL || process.env.DATABASE_URL + '_demo';

if (!DEMO_DATABASE_URL) {
  throw new Error(
    "DEMO_DATABASE_URL must be set for demo environment isolation",
  );
}

export const demoPool = new Pool({ connectionString: DEMO_DATABASE_URL });
export const demoDB = drizzle({ client: demoPool, schema });

// Demo flag to ensure we never accidentally use production data
export const isDemoEnvironment = () => {
  return process.env.NODE_ENV === 'demo' || process.env.DEMO_MODE === 'true';
};

// Safety check to prevent demo operations on production
export const ensureDemoSafety = () => {
  if (!isDemoEnvironment() && !process.env.ALLOW_DEMO_IN_PRODUCTION) {
    throw new Error('Demo operations are restricted to demo environment only');
  }
};