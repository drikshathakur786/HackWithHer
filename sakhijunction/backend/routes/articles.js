import express from 'express';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/async.js';

const router = express.Router();

// Placeholder routes
router.get('/', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Articles routes coming soon' });
}));

export default router;
