// routes/auth.js - Express router for authentication
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// AUTHENTICATION MIDDLEWARE
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Token verification failed:', err.message);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// GET USER INFO ENDPOINT - ADD THIS NEW ROUTE
router.get('/me', authenticateToken, async (req, res) => {
  try {
    console.log("Auth me endpoint hit, user from token:", req.user);
    
    // Get user from database using ID from token
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user data
    const userResponse = {
      id: user._id,
      email: user.email,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    };

    console.log("Returning user data:", userResponse);
    res.json(userResponse);

  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// REGISTRATION ROUTE
router.post('/register', async (req, res) => {
  console.log("Registration endpoint hit:", {
    method: req.method,
    body: req.body
  });

  try {
    const { email, password } = req.body;
    console.log("Received registration data:", { email, password: password ? "***" : "missing" });

    // Validate input
    if (!email || !password) {
      console.log("Validation failed: missing email or password");
      return res.status(400).json({ 
        message: 'Email and password are required',
        received: { email: !!email, password: !!password }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("Validation failed: invalid email format");
      return res.status(400).json({ 
        message: 'Please enter a valid email address' 
      });
    }

    // Validate password length
    if (password.length < 6) {
      console.log("Validation failed: password too short");
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user already exists
    console.log("Checking for existing user...");
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log("User already exists");
      return res.status(400).json({ 
        message: 'User already exists with this email' 
      });
    }

    // Hash the password
    console.log("Hashing password...");
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    console.log("Creating new user...");
    const newUser = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date(),
    });

    // Save user to MongoDB
    console.log("Saving user to database...");
    const savedUser = await newUser.save();
    console.log("User saved successfully:", savedUser._id);

    // Generate JWT token
    console.log("Generating JWT token...");
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    
    const token = jwt.sign(
      { 
        userId: savedUser._id, 
        email: savedUser.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data (excluding password)
    const userResponse = {
      _id: savedUser._id,
      email: savedUser.email,
      createdAt: savedUser.createdAt,
    };

    console.log("Registration successful");
    res.status(201).json({
      message: 'User registered successfully',
      newUser: userResponse,
      token: token,
    });

  } catch (error) {
    console.error('Registration error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: validationErrors 
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'User already exists with this email' 
      });
    }

    res.status(500).json({ 
      message: 'Internal server error. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// LOGIN ROUTE
router.post('/login', async (req, res) => {
  console.log("Login endpoint hit:", {
    method: req.method,
    body: { email: req.body.email, password: req.body.password ? "***" : "missing" }
  });

  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log("Login validation failed: missing email or password");
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("Login validation failed: invalid email format");
      return res.status(400).json({ 
        message: 'Please enter a valid email address' 
      });
    }

    // Find user in MongoDB
    console.log("Finding user in database...");
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log("User not found");
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Verify password
    console.log("Verifying password...");
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("Password validation failed");
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    console.log("Generating JWT token for login...");
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data (excluding password)
    const userResponse = {
      id: user._id,
      email: user.email,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    };

    console.log("Login successful, sending response:", {
      message: 'Login successful',
      user: userResponse,
      token: token ? 'Generated' : 'Missing'
    });

    // Make sure we return the response properly
    return res.status(200).json({
      message: 'Login successful',
      user: userResponse,
      token: token,
    });

  } catch (error) {
    console.error('Login error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    res.status(500).json({ 
      message: 'Internal server error. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Export the router
export default router;