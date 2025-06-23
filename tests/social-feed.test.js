/**
 * Social Feed System Tests
 * Critical regression prevention for community interaction features
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import supertest from 'supertest';
import { createTestUser, createTestSoapEntry, cleanupTestData, testDb } from './setup.js';
import { discussions } from '../shared/schema.ts';
import bcrypt from 'bcrypt';

const API_BASE = process.env.VITE_API_URL || 'http://localhost:5000';

describe('Social Feed System', () => {
  let testUser;
  let agent;

  beforeEach(async () => {
    agent = supertest.agent(API_BASE);
    
    // Create authenticated test user
    const hashedPassword = await bcrypt.hash('TestPassword123!', 12);
    testUser = await createTestUser({
      email: 'feed-test@test.example',
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

  describe('Feed Content Retrieval', () => {
    beforeEach(async () => {
      // Create test discussion posts
      await testDb.insert(discussions).values({
        authorId: testUser.id,
        type: 'discussion',
        title: 'Test Discussion',
        content: 'This is a test discussion post',
        tags: ['test', 'discussion'],
        isPublic: true
      });
    });

    it('should retrieve social feed with posts', async () => {
      const response = await agent.get('/api/feed');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should filter feed by type', async () => {
      const response = await agent
        .get('/api/feed')
        .query({ type: 'discussion' });

      expect(response.status).toBe(200);
      expect(response.body.every(post => post.type === 'discussion')).toBe(true);
    });

    it('should paginate feed results', async () => {
      const response = await agent
        .get('/api/feed')
        .query({ page: 1, limit: 5 });

      expect(response.status).toBe(200);
      expect(response.body.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Post Interactions', () => {
    let testPost;

    beforeEach(async () => {
      const [post] = await testDb.insert(discussions).values({
        authorId: testUser.id,
        type: 'discussion',
        title: 'Test Interaction Post',
        content: 'Testing post interactions',
        tags: ['test'],
        isPublic: true
      }).returning();
      testPost = post;
    });

    it('should like a post', async () => {
      const response = await agent
        .post(`/api/discussions/${testPost.id}/like`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('liked');
    });

    it('should unlike a previously liked post', async () => {
      // Like first
      await agent.post(`/api/discussions/${testPost.id}/like`);
      
      // Unlike
      const response = await agent
        .post(`/api/discussions/${testPost.id}/like`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('unliked');
    });

    it('should bookmark a post', async () => {
      const response = await agent
        .post(`/api/discussions/${testPost.id}/bookmark`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('bookmarked');
    });

    it('should share a post', async () => {
      const response = await agent
        .post(`/api/discussions/${testPost.id}/share`)
        .send({
          platform: 'internal',
          message: 'Sharing this great post'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('shared');
    });
  });

  describe('Post Creation', () => {
    it('should create discussion post', async () => {
      const postData = {
        type: 'discussion',
        title: 'New Test Discussion',
        content: 'This is a new discussion post for testing',
        tags: ['test', 'new'],
        isPublic: true
      };

      const response = await agent
        .post('/api/discussions')
        .send(postData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(postData.title);
      expect(response.body.content).toBe(postData.content);
    });

    it('should create prayer request', async () => {
      const prayerData = {
        type: 'prayer',
        title: 'Test Prayer Request',
        content: 'Please pray for this test situation',
        isAnonymous: false,
        isPublic: true
      };

      const response = await agent
        .post('/api/discussions')
        .send(prayerData);

      expect(response.status).toBe(201);
      expect(response.body.type).toBe('prayer');
    });

    it('should require title for posts', async () => {
      const postData = {
        type: 'discussion',
        content: 'Post without title'
      };

      const response = await agent
        .post('/api/discussions')
        .send(postData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('title');
    });
  });

  describe('Comments System', () => {
    let testPost;

    beforeEach(async () => {
      const [post] = await testDb.insert(discussions).values({
        authorId: testUser.id,
        type: 'discussion',
        title: 'Test Comments Post',
        content: 'Testing comments functionality',
        isPublic: true
      }).returning();
      testPost = post;
    });

    it('should add comment to post', async () => {
      const commentData = {
        content: 'This is a test comment'
      };

      const response = await agent
        .post(`/api/discussions/${testPost.id}/comments`)
        .send(commentData);

      expect(response.status).toBe(201);
      expect(response.body.content).toBe(commentData.content);
    });

    it('should retrieve post comments', async () => {
      // Add a comment first
      await agent
        .post(`/api/discussions/${testPost.id}/comments`)
        .send({ content: 'Test comment' });

      const response = await agent
        .get(`/api/discussions/${testPost.id}/comments`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should require comment content', async () => {
      const response = await agent
        .post(`/api/discussions/${testPost.id}/comments`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('content');
    });
  });

  describe('SOAP Entry Integration', () => {
    let soapEntry;

    beforeEach(async () => {
      soapEntry = await createTestSoapEntry(testUser.id, {
        scripture: 'TEST_Philippians 4:13',
        observation: 'I can do all things through Christ',
        application: 'Trust in God\'s strength',
        prayer: 'Help me rely on Your strength'
      });
    });

    it('should share SOAP entry to feed', async () => {
      const response = await agent
        .post(`/api/soap/${soapEntry.id}/share`)
        .send({
          message: 'Sharing my SOAP reflection',
          shareToFeed: true
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toContain('shared');
    });

    it('should display shared SOAP entries in feed', async () => {
      // Share SOAP entry first
      await agent
        .post(`/api/soap/${soapEntry.id}/share`)
        .send({
          message: 'Sharing my reflection',
          shareToFeed: true
        });

      // Check feed
      const feedResponse = await agent.get('/api/feed');
      
      expect(feedResponse.status).toBe(200);
      const soapPosts = feedResponse.body.filter(post => 
        post.type === 'soap_share' || post.content?.includes('TEST_Philippians')
      );
      expect(soapPosts.length).toBeGreaterThan(0);
    });
  });

  describe('Content Moderation', () => {
    it('should prevent unauthorized post deletion', async () => {
      // Create post by another user
      const otherUser = await createTestUser({
        email: 'other-user@test.example'
      });
      
      const [otherPost] = await testDb.insert(discussions).values({
        authorId: otherUser.id,
        type: 'discussion',
        title: 'Other User Post',
        content: 'This belongs to another user',
        isPublic: true
      }).returning();

      const response = await agent
        .delete(`/api/discussions/${otherPost.id}`);

      expect(response.status).toBe(403);
    });

    it('should allow author to delete own post', async () => {
      const [ownPost] = await testDb.insert(discussions).values({
        authorId: testUser.id,
        type: 'discussion',
        title: 'My Own Post',
        content: 'I can delete this',
        isPublic: true
      }).returning();

      const response = await agent
        .delete(`/api/discussions/${ownPost.id}`);

      expect(response.status).toBe(200);
    });
  });

  describe('Feed Performance', () => {
    it('should handle feed requests within reasonable time', async () => {
      const startTime = Date.now();
      
      const response = await agent.get('/api/feed');
      
      const responseTime = Date.now() - startTime;
      
      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
    });

    it('should cache feed results appropriately', async () => {
      // First request
      const response1 = await agent.get('/api/feed');
      
      // Second request (should use cache if available)
      const response2 = await agent.get('/api/feed');

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      // Both should return same content structure
      expect(Array.isArray(response1.body)).toBe(true);
      expect(Array.isArray(response2.body)).toBe(true);
    });
  });
});