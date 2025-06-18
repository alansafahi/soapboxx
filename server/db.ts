import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure Neon for serverless
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineConnect = false;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure connection pool with optimized settings for Neon serverless
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 3, // Allow multiple connections for concurrent requests
  connectionTimeoutMillis: 15000, // Increased timeout
  idleTimeoutMillis: 60000, // Increased idle timeout
  allowExitOnIdle: true, // Allow process to exit when idle
});

export const db = drizzle({ client: pool, schema });