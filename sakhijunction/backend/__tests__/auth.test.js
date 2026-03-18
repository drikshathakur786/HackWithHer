import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import express from 'express';
import User from '../models/User.js';
import authRoutes from '../routes/auth.js';

// --- Test Setup ---
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

const TEST_DB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/sakhi-junction-test';

beforeAll(async () => {
  await mongoose.connect(TEST_DB_URI);
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

// ============================================================
// Registration Tests
// ============================================================
describe('POST /api/auth/register', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('newUser');
    expect(res.body.newUser.email).toBe('test@example.com');
    expect(res.body.message).toBe('User registered successfully');
  });

  it('should reject duplicate email', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'duplicate@example.com',
      password: 'password123',
    });

    const res = await request(app).post('/api/auth/register').send({
      email: 'duplicate@example.com',
      password: 'password456',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it('should reject missing email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      password: 'password123',
    });

    expect(res.status).toBe(400);
  });

  it('should reject missing password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'test@example.com',
    });

    expect(res.status).toBe(400);
  });

  it('should reject invalid email format', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'not-an-email',
      password: 'password123',
    });

    expect(res.status).toBe(400);
  });

  it('should reject passwords shorter than 6 characters', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'short@example.com',
      password: '12345',
    });

    expect(res.status).toBe(400);
  });

  it('should not return the password in response', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'safe@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.newUser).not.toHaveProperty('password');
  });

  it('should store password as a bcrypt hash (not plain text)', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'hash@example.com',
      password: 'password123',
    });

    const user = await User.findOne({ email: 'hash@example.com' });
    expect(user.password).not.toBe('password123');
    expect(user.password).toMatch(/^\$2[ayb]\$.{56}$/); // bcrypt pattern
  });
});

// ============================================================
// Login Tests
// ============================================================
describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send({
      email: 'login@example.com',
      password: 'password123',
    });
  });

  it('should login with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'login@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe('login@example.com');
    expect(res.body.message).toBe('Login successful');
  });

  it('should reject incorrect password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'login@example.com',
      password: 'wrongpassword',
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it('should reject non-existent email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nonexistent@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(401);
  });

  it('should return a valid JWT token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'login@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(decoded).toHaveProperty('userId');
    expect(decoded).toHaveProperty('email', 'login@example.com');
  });

  it('should not return the password in user object', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'login@example.com',
      password: 'password123',
    });

    expect(res.body.user).not.toHaveProperty('password');
  });
});

// ============================================================
// GET /me Tests
// ============================================================
describe('GET /api/auth/me', () => {
  let token;

  beforeEach(async () => {
    const registerRes = await request(app).post('/api/auth/register').send({
      email: 'me@example.com',
      password: 'password123',
    });
    token = registerRes.body.token;
  });

  it('should return current user when authenticated', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('email', 'me@example.com');
    expect(res.body).toHaveProperty('id');
    expect(res.body).not.toHaveProperty('password');
  });

  it('should reject request without token', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
  });

  it('should reject invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token-here');

    expect(res.status).toBe(403);
  });
});
