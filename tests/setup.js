/**
 * Test Setup Configuration for SoapBox Super App
 * Automated regression testing system
 */

import { beforeAll, afterAll, beforeEach } from 'vitest';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '../shared/schema.js';

// Test database configuration
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
const testPool = new Pool({ connectionString: TEST_DATABASE_URL });
export const testDb = drizzle({ client: testPool, schema });

// Global test setup
beforeAll(async () => {
  console.log('🧪 Setting up test environment...');
  
  // Ensure test database is available
  try {
    await testPool.query('SELECT 1');
    console.log('✅ Test database connection established');
  } catch (error) {
    console.error('❌ Test database connection failed:', error);
    throw error;
  }
});

afterAll(async () => {
  console.log('🧹 Cleaning up test environment...');
  await testPool.end();
});

// Clean test data before each test
beforeEach(async () => {
  // Reset test data to known state
  // Note: Only clean test-specific data, not production data
  if (process.env.NODE_ENV === 'test') {
    // Clean test entries with email patterns
    await testDb.delete(schema.users).where(schema.users.email.like('%@test.example'));
    await testDb.delete(schema.soapEntries).where(schema.soapEntries.scripture.like('TEST_%'));
  }
});

// Test utilities
export const createTestUser = async (overrides = {}) => {
  const testUser = {
    id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email: `test-${Date.now()}@test.example`,
    username: `testuser${Date.now()}`,
    firstName: 'Test',
    lastName: 'User',
    emailVerified: true,
    ...overrides
  };

  const [user] = await testDb.insert(schema.users).values(testUser).returning();
  return user;
};

export const createTestChurch = async (overrides = {}) => {
  const testChurch = {
    name: `Test Church ${Date.now()}`,
    denomination: 'Test Denomination',
    isDemo: true,
    ...overrides
  };

  const [church] = await testDb.insert(schema.churches).values(testChurch).returning();
  return church;
};

export const createTestSoapEntry = async (userId, overrides = {}) => {
  const testEntry = {
    userId,
    scripture: 'TEST_John 3:16',
    observation: 'Test observation',
    application: 'Test application',
    prayer: 'Test prayer',
    mood: 'peaceful',
    tags: ['test'],
    ...overrides
  };

  const [entry] = await testDb.insert(schema.soapEntries).values(testEntry).returning();
  return entry;
};

// Test data cleanup helper
export const cleanupTestData = async () => {
  if (process.env.NODE_ENV === 'test') {
    await testDb.delete(schema.users).where(schema.users.email.like('%@test.example'));
    await testDb.delete(schema.soapEntries).where(schema.soapEntries.scripture.like('TEST_%'));
  }
};