import request from 'supertest';
import mongoose from 'mongoose';
import express from 'express';
import User from '../models/User.js';
import HealthData from '../models/HealthData.js';
import healthRoutes from '../routes/health.js';
import authRoutes from '../routes/auth.js';

// --- Test Setup ---
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);

const TEST_DB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/sakhi-junction-test';

let token;
let userId;

beforeAll(async () => {
  await mongoose.connect(TEST_DB_URI);
});

beforeEach(async () => {
  await User.deleteMany({});
  await HealthData.deleteMany({});

  // Create a test user and get token
  const res = await request(app).post('/api/auth/register').send({
    email: 'health@example.com',
    password: 'password123',
  });

  token = res.body.token;
  userId = res.body.newUser._id;
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

// ============================================================
// GET Health Data
// ============================================================
describe('GET /api/health', () => {
  it('should return health data for authenticated user', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('cycleData');
    expect(res.body).toHaveProperty('symptoms');
    expect(res.body).toHaveProperty('moods');
    expect(res.body).toHaveProperty('waterIntake');
    expect(res.body).toHaveProperty('sleepData');
  });

  it('should create default health data on first fetch', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.cycleData).toHaveProperty('currentPhase');
    expect(res.body.cycleData).toHaveProperty('cycleLength', 28);
  });

  it('should reject unauthenticated requests', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(401);
  });
});

// ============================================================
// POST Health Data
// ============================================================
describe('POST /api/health', () => {
  it('should save health data for authenticated user', async () => {
    const healthPayload = {
      data: {
        cycleData: {
          cycleLength: 30,
          periodLength: 6,
        },
        moods: [
          {
            id: 1,
            mood: 'happy',
            energy: 8,
            stress: 2,
            anxiety: 1,
            notes: 'Feeling great!',
            date: new Date().toISOString(),
          },
        ],
      },
    };

    const res = await request(app)
      .post('/api/health')
      .set('Authorization', `Bearer ${token}`)
      .send(healthPayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Health data saved successfully');
  });

  it('should persist saved data across requests', async () => {
    // Save data
    await request(app)
      .post('/api/health')
      .set('Authorization', `Bearer ${token}`)
      .send({
        data: {
          dailyWaterGoal: 3000,
          waterGlassSize: 300,
        },
      });

    // Fetch data and verify
    const res = await request(app)
      .get('/api/health')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.dailyWaterGoal).toBe(3000);
    expect(res.body.waterGlassSize).toBe(300);
  });

  it('should update existing data without overwriting unrelated fields', async () => {
    // First save
    await request(app)
      .post('/api/health')
      .set('Authorization', `Bearer ${token}`)
      .send({
        data: {
          dailyWaterGoal: 2500,
          symptoms: [
            { id: 1, category: 'physical', type: 'headache', intensity: 'mild' },
          ],
        },
      });

    // Second save (only moods)
    await request(app)
      .post('/api/health')
      .set('Authorization', `Bearer ${token}`)
      .send({
        data: {
          moods: [{ id: 1, mood: 'calm', energy: 7, stress: 2, anxiety: 1 }],
        },
      });

    // Verify both are present
    const res = await request(app)
      .get('/api/health')
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.moods).toHaveLength(1);
    expect(res.body.moods[0].mood).toBe('calm');
  });

  it('should reject unauthenticated save requests', async () => {
    const res = await request(app).post('/api/health').send({
      data: { dailyWaterGoal: 2000 },
    });

    expect(res.status).toBe(401);
  });
});

// ============================================================
// DELETE Health Data
// ============================================================
describe('DELETE /api/health', () => {
  it('should delete health data for authenticated user', async () => {
    // First create some data
    await request(app)
      .get('/api/health')
      .set('Authorization', `Bearer ${token}`);

    // Delete it
    const res = await request(app)
      .delete('/api/health')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should reject unauthenticated delete requests', async () => {
    const res = await request(app).delete('/api/health');

    expect(res.status).toBe(401);
  });
});
