/**
 * Authentication System Tests
 * Critical regression prevention for authentication flows
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import supertest from 'supertest';
import { createTestUser, cleanupTestData, testDb } from './setup.js';
import { users } from '../shared/schema.js';
import bcrypt from 'bcrypt';

const API_BASE = process.env.VITE_API_URL || 'http://localhost:5000';
const request = supertest(API_BASE);

describe('Authentication System', () => {
  let testUser;
  let agent;

  beforeEach(async () => {
    agent = supertest.agent(API_BASE);
    
    // Create test user with known password
    const hashedPassword = await bcrypt.hash('TestPassword123!', 12);
    testUser = await createTestUser({
      email: 'auth-test@test.example',
      password: hashedPassword,
      emailVerified: true
    });
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('Login Flow', () => {
    it('should login with valid credentials', async () => {
      const response = await agent
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'TestPassword123!'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('should reject invalid password', async () => {
      const response = await agent
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Invalid');
    });

    it('should reject unverified email', async () => {
      // Create unverified user
      const hashedPassword = await bcrypt.hash('TestPassword123!', 12);
      const unverifiedUser = await createTestUser({
        email: 'unverified@test.example',
        password: hashedPassword,
        emailVerified: false
      });

      const response = await agent
        .post('/api/auth/login')
        .send({
          email: unverifiedUser.email,
          password: 'TestPassword123!'
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('verify');
    });
  });

  describe('Session Management', () => {
    it('should maintain session after login', async () => {
      // Login first
      await agent
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'TestPassword123!'
        });

      // Check authenticated endpoint
      const response = await agent.get('/api/auth/user');
      
      expect(response.status).toBe(200);
      expect(response.body.email).toBe(testUser.email);
    });

    it('should reject unauthenticated requests', async () => {
      const response = await request.get('/api/auth/user');
      
      expect(response.status).toBe(401);
    });

    it('should logout and clear session', async () => {
      // Login first
      await agent
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'TestPassword123!'
        });

      // Logout
      const logoutResponse = await agent.post('/api/auth/logout');
      expect(logoutResponse.status).toBe(200);

      // Verify session cleared
      const userResponse = await agent.get('/api/auth/user');
      expect(userResponse.status).toBe(401);
    });
  });

  describe('Registration Flow', () => {
    it('should register new user with valid data', async () => {
      const newUserData = {
        email: 'newuser@test.example',
        password: 'NewPassword123!',
        firstName: 'New',
        lastName: 'User'
      };

      const response = await agent
        .post('/api/auth/register')
        .send(newUserData);

      expect(response.status).toBe(201);
      expect(response.body.message).toContain('created');
    });

    it('should reject duplicate email registration', async () => {
      const response = await agent
        .post('/api/auth/register')
        .send({
          email: testUser.email, // Existing email
          password: 'NewPassword123!',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('exists');
    });

    it('should reject weak passwords', async () => {
      const response = await agent
        .post('/api/auth/register')
        .send({
          email: 'weakpass@test.example',
          password: '123', // Weak password
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('password');
    });
  });

  describe('Protected Routes', () => {
    it('should protect SOAP entry creation', async () => {
      const response = await request
        .post('/api/soap')
        .send({
          scripture: 'TEST_John 3:16',
          observation: 'Test observation',
          application: 'Test application',
          prayer: 'Test prayer'
        });

      expect(response.status).toBe(401);
    });

    it('should allow authenticated SOAP entry creation', async () => {
      // Login first
      await agent
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'TestPassword123!'
        });

      const response = await agent
        .post('/api/soap')
        .send({
          scripture: 'TEST_John 3:16',
          observation: 'Test observation',
          application: 'Test application',
          prayer: 'Test prayer'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });
  });
});