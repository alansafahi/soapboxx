/**
 * SOAP Journal System Tests
 * Critical regression prevention for SOAP entry functionality
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import supertest from 'supertest';
import { createTestUser, createTestSoapEntry, cleanupTestData } from './setup.js';
import bcrypt from 'bcrypt';

const API_BASE = process.env.VITE_API_URL || 'http://localhost:5000';

describe('SOAP Journal System', () => {
  let testUser;
  let agent;

  beforeEach(async () => {
    agent = supertest.agent(API_BASE);
    
    // Create authenticated test user
    const hashedPassword = await bcrypt.hash('TestPassword123!', 12);
    testUser = await createTestUser({
      email: 'soap-test@test.example',
      password: hashedPassword,
      emailVerified: true
    });

    // Login user
    await agent
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'TestPassword123!'
      });
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('SOAP Entry Creation', () => {
    it('should create SOAP entry with all fields', async () => {
      const soapData = {
        scripture: 'TEST_John 3:16',
        observation: 'God demonstrates His love through Jesus Christ',
        application: 'I need to trust in God\'s love for me',
        prayer: 'Thank you God for your endless love and grace',
        mood: 'grateful',
        tags: ['love', 'grace', 'salvation']
      };

      const response = await agent
        .post('/api/soap')
        .send(soapData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.scripture).toBe(soapData.scripture);
      expect(response.body.observation).toBe(soapData.observation);
      expect(response.body.application).toBe(soapData.application);
      expect(response.body.prayer).toBe(soapData.prayer);
      expect(response.body.mood).toBe(soapData.mood);
      expect(response.body.tags).toEqual(soapData.tags);
    });

    it('should require scripture field', async () => {
      const soapData = {
        observation: 'Test observation',
        application: 'Test application',
        prayer: 'Test prayer'
      };

      const response = await agent
        .post('/api/soap')
        .send(soapData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('scripture');
    });

    it('should handle empty optional fields', async () => {
      const soapData = {
        scripture: 'TEST_Psalm 23:1',
        observation: '',
        application: '',
        prayer: ''
      };

      const response = await agent
        .post('/api/soap')
        .send(soapData);

      expect(response.status).toBe(201);
      expect(response.body.scripture).toBe(soapData.scripture);
    });
  });

  describe('SOAP Entry Retrieval', () => {
    let testEntry;

    beforeEach(async () => {
      testEntry = await createTestSoapEntry(testUser.id, {
        scripture: 'TEST_Matthew 5:14',
        observation: 'We are called to be light in darkness',
        application: 'I will shine God\'s light through my actions',
        prayer: 'Help me be a light to others'
      });
    });

    it('should retrieve user SOAP entries', async () => {
      const response = await agent.get('/api/soap');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      const entry = response.body.find(e => e.id === testEntry.id);
      expect(entry).toBeDefined();
      expect(entry.scripture).toBe(testEntry.scripture);
    });

    it('should retrieve specific SOAP entry', async () => {
      const response = await agent.get(`/api/soap/${testEntry.id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testEntry.id);
      expect(response.body.scripture).toBe(testEntry.scripture);
    });

    it('should return 404 for non-existent entry', async () => {
      const response = await agent.get('/api/soap/999999');

      expect(response.status).toBe(404);
    });
  });

  describe('SOAP Entry Sharing', () => {
    let testEntry;

    beforeEach(async () => {
      testEntry = await createTestSoapEntry(testUser.id, {
        scripture: 'TEST_Romans 8:28',
        observation: 'God works all things for good',
        application: 'Trust God in difficult times',
        prayer: 'Help me trust your plan'
      });
    });

    it('should share SOAP entry to social feed', async () => {
      const response = await agent
        .post(`/api/soap/${testEntry.id}/share`)
        .send({
          message: 'Sharing my reflection on God\'s goodness'
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toContain('shared');
    });

    it('should generate shareable link', async () => {
      const response = await agent
        .post(`/api/soap/${testEntry.id}/share-link`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('shareUrl');
      expect(response.body.shareUrl).toContain('soap-journal');
    });
  });

  describe('SOAP Entry Updates', () => {
    let testEntry;

    beforeEach(async () => {
      testEntry = await createTestSoapEntry(testUser.id);
    });

    it('should update SOAP entry', async () => {
      const updates = {
        observation: 'Updated observation',
        application: 'Updated application'
      };

      const response = await agent
        .put(`/api/soap/${testEntry.id}`)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.observation).toBe(updates.observation);
      expect(response.body.application).toBe(updates.application);
    });

    it('should prevent unauthorized updates', async () => {
      // Create another user's entry
      const otherUser = await createTestUser({
        email: 'other@test.example'
      });
      const otherEntry = await createTestSoapEntry(otherUser.id);

      const response = await agent
        .put(`/api/soap/${otherEntry.id}`)
        .send({
          observation: 'Unauthorized update'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('SOAP Entry Filtering', () => {
    beforeEach(async () => {
      // Create test entries with different moods and dates
      await createTestSoapEntry(testUser.id, {
        scripture: 'TEST_Psalm 1:1',
        mood: 'peaceful',
        tags: ['wisdom']
      });
      await createTestSoapEntry(testUser.id, {
        scripture: 'TEST_Psalm 1:2',
        mood: 'grateful',
        tags: ['thanksgiving']
      });
    });

    it('should filter by mood', async () => {
      const response = await agent
        .get('/api/soap')
        .query({ mood: 'peaceful' });

      expect(response.status).toBe(200);
      expect(response.body.every(entry => entry.mood === 'peaceful')).toBe(true);
    });

    it('should filter by date range', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const response = await agent
        .get('/api/soap')
        .query({ startDate: today, endDate: today });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should search by content', async () => {
      const response = await agent
        .get('/api/soap/search')
        .query({ q: 'wisdom' });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});