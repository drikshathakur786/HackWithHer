import mongoose from 'mongoose';
import User from '../models/User.js';

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

describe('User Model', () => {
  it('should create a user successfully', async () => {
    const user = new User({
      email: 'test@example.com',
      password: 'password123',
    });

    const saved = await user.save();
    expect(saved.email).toBe('test@example.com');
    expect(saved.role).toBe('user');
    expect(saved.isActive).toBe(true);
  });

  it('should hash the password before saving', async () => {
    const user = new User({
      email: 'hash@example.com',
      password: 'plaintext123',
    });

    const saved = await user.save();
    expect(saved.password).not.toBe('plaintext123');
    expect(saved.password).toMatch(/^\$2[ayb]\$.{56}$/);
  });

  it('should not re-hash password on non-password update', async () => {
    const user = new User({
      email: 'nohash@example.com',
      password: 'password123',
    });
    const saved = await user.save();
    const firstHash = saved.password;

    saved.name = 'Updated Name';
    const updated = await saved.save();
    expect(updated.password).toBe(firstHash);
  });

  it('should validate password correctly with matchPassword', async () => {
    const user = new User({
      email: 'match@example.com',
      password: 'correctpassword',
    });
    await user.save();

    const isMatch = await user.matchPassword('correctpassword');
    const isWrong = await user.matchPassword('wrongpassword');

    expect(isMatch).toBe(true);
    expect(isWrong).toBe(false);
  });

  it('should generate a valid JWT token', async () => {
    const user = new User({
      email: 'jwt@example.com',
      password: 'password123',
    });
    await user.save();

    const token = user.getSignedJwtToken();
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
  });

  it('should enforce unique email constraint', async () => {
    await User.create({ email: 'unique@example.com', password: 'pass123' });

    await expect(
      User.create({ email: 'unique@example.com', password: 'pass456' })
    ).rejects.toThrow();
  });

  it('should require email', async () => {
    const user = new User({ password: 'password123' });
    await expect(user.save()).rejects.toThrow(/email/i);
  });

  it('should require password', async () => {
    const user = new User({ email: 'nopass@example.com' });
    await expect(user.save()).rejects.toThrow(/password/i);
  });

  it('should lowercase email on save', async () => {
    const user = new User({
      email: 'UpperCase@EXAMPLE.COM',
      password: 'password123',
    });
    const saved = await user.save();
    expect(saved.email).toBe('uppercase@example.com');
  });

  it('should set default role to user', async () => {
    const user = await User.create({
      email: 'role@example.com',
      password: 'password123',
    });
    expect(user.role).toBe('user');
  });
});
