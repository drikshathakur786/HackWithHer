import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { protect, optionalAuth, requireEmailVerification, checkOwnership } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/async.js';
import Post from '../models/Post.js';
import User from '../models/User.js';

const router = express.Router();

// Validation rules
const createPostValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 10, max: 10000 })
    .withMessage('Content must be between 10 and 10000 characters'),
  body('category')
    .isIn([
      'menstrual_health', 'mental_health', 'reproductive_health', 'pcos',
      'nutrition', 'fitness', 'self_defense', 'cancer_awareness',
      'general_wellness', 'relationships', 'career', 'motherhood',
      'personal_story', 'question', 'support'
    ])
    .withMessage('Invalid category'),
  body('postType')
    .optional()
    .isIn(['text', 'question', 'story', 'tip', 'article', 'resource'])
    .withMessage('Invalid post type')
];

// @route   GET /api/posts
// @desc    Get all posts with filtering and pagination
// @access  Public
router.get('/', optionalAuth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('category').optional().isIn([
    'menstrual_health', 'mental_health', 'reproductive_health', 'pcos',
    'nutrition', 'fitness', 'self_defense', 'cancer_awareness',
    'general_wellness', 'relationships', 'career', 'motherhood',
    'personal_story', 'question', 'support'
  ]).withMessage('Invalid category'),
  query('sort').optional().isIn(['newest', 'oldest', 'popular', 'trending']).withMessage('Invalid sort option')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  // Build query
  let query = { status: 'published' };
  
  // Category filter
  if (req.query.category) {
    query.category = req.query.category;
  }
  
  // Search filter
  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }
  
  // Visibility filter based on authentication
  if (!req.user) {
    query.visibility = 'public';
  }
  
  // Sort options
  let sort = {};
  switch (req.query.sort) {
    case 'oldest':
      sort = { createdAt: 1 };
      break;
    case 'popular':
      sort = { likeCount: -1, commentCount: -1 };
      break;
    case 'trending':
      // Posts from last 7 days sorted by engagement
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      query.createdAt = { $gte: sevenDaysAgo };
      sort = { engagementScore: -1 };
      break;
    default:
      sort = { createdAt: -1 };
  }
  
  // Execute query
  const posts = await Post.find(query)
    .populate('author', 'firstName lastName avatar')
    .populate('community', 'name')
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();
  
  // Get total count for pagination
  const total = await Post.countDocuments(query);
  
  // Transform posts for response
  const transformedPosts = posts.map(post => {
    // Hide author info for anonymous posts
    if (post.isAnonymous) {
      post.author = {
        firstName: post.anonymousName,
        lastName: '',
        avatar: null
      };
    }
    
    // Add user interaction status if authenticated
    if (req.user) {
      post.isLikedByUser = post.likes?.some(like => 
        like.user.toString() === req.user._id.toString()
      ) || false;
    }
    
    return post;
  });
  
  res.status(200).json({
    success: true,
    data: {
      posts: transformedPosts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    }
  });
}));

// @route   GET /api/posts/trending
// @desc    Get trending posts
// @access  Public
router.get('/trending', optionalAuth, asyncHandler(async (req, res) => {
  const timeframe = parseInt(req.query.days) || 7;
  const limit = parseInt(req.query.limit) || 10;
  
  const trendingPosts = await Post.findTrending(timeframe);
  
  // Populate additional fields
  await Post.populate(trendingPosts, [
    { path: 'author', select: 'firstName lastName avatar' },
    { path: 'community', select: 'name' }
  ]);
  
  // Transform for anonymous posts
  const transformedPosts = trendingPosts.slice(0, limit).map(post => {
    if (post.isAnonymous) {
      post.author = {
        firstName: post.anonymousName,
        lastName: '',
        avatar: null
      };
    }
    
    if (req.user) {
      post.isLikedByUser = post.likes?.some(like => 
        like.user.toString() === req.user._id.toString()
      ) || false;
    }
    
    return post;
  });
  
  res.status(200).json({
    success: true,
    data: transformedPosts
  });
}));

// @route   GET /api/posts/:id
// @desc    Get single post
// @access  Public
router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate('author', 'firstName lastName avatar bio')
    .populate('community', 'name description')
    .populate('comments.user', 'firstName lastName avatar')
    .populate('comments.replies.user', 'firstName lastName avatar');
  
  if (!post || post.status !== 'published') {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }
  
  // Check visibility
  if (!req.user && post.visibility !== 'public') {
    return res.status(403).json({
      success: false,
      message: 'This post is not publicly accessible'
    });
  }
  
  // Increment view count
  post.addView();
  await post.save();
  
  // Transform for anonymous posts
  if (post.isAnonymous) {
    post.author = {
      firstName: post.anonymousName,
      lastName: '',
      avatar: null,
      bio: null
    };
  }
  
  // Transform comments for anonymous ones
  post.comments = post.comments.map(comment => {
    if (comment.isAnonymous) {
      comment.user = {
        firstName: comment.anonymousName,
        lastName: '',
        avatar: null
      };
    }
    
    // Transform replies
    comment.replies = comment.replies.map(reply => {
      if (reply.isAnonymous) {
        reply.user = {
          firstName: 'Anonymous Sister',
          lastName: '',
          avatar: null
        };
      }
      return reply;
    });
    
    return comment;
  });
  
  // Add user interaction status
  if (req.user) {
    post.isLikedByUser = post.isLikedBy(req.user._id);
  }
  
  res.status(200).json({
    success: true,
    data: post
  });
}));

// @route   POST /api/posts
// @desc    Create new post
// @access  Private
router.post('/', protect, requireEmailVerification, createPostValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const postData = {
    ...req.body,
    author: req.user._id
  };
  
  // Set anonymous name if post is anonymous
  if (req.body.isAnonymous) {
    postData.anonymousName = req.body.anonymousName || 'Anonymous Sister';
  }
  
  const post = await Post.create(postData);
  
  // Populate author info
  await post.populate('author', 'firstName lastName avatar');
  
  res.status(201).json({
    success: true,
    message: 'Post created successfully',
    data: post
  });
}));

// @route   PUT /api/posts/:id
// @desc    Update post
// @access  Private (Author only)
router.put('/:id', protect, checkOwnership(Post), createPostValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const post = req.resource; // Set by checkOwnership middleware
  
  // Update allowed fields
  const allowedFields = ['title', 'content', 'category', 'tags', 'postType', 'excerpt', 'isAnonymous', 'anonymousName'];
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      post[field] = req.body[field];
    }
  });
  
  await post.save();
  
  res.status(200).json({
    success: true,
    message: 'Post updated successfully',
    data: post
  });
}));

// @route   DELETE /api/posts/:id
// @desc    Delete post
// @access  Private (Author only)
router.delete('/:id', protect, checkOwnership(Post), asyncHandler(async (req, res) => {
  const post = req.resource;
  
  // Soft delete by changing status
  post.status = 'archived';
  await post.save();
  
  res.status(200).json({
    success: true,
    message: 'Post deleted successfully'
  });
}));

// @route   POST /api/posts/:id/like
// @desc    Like/unlike a post
// @access  Private
router.post('/:id/like', protect, asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  
  if (!post || post.status !== 'published') {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }
  
  const isLiked = post.isLikedBy(req.user._id);
  
  if (isLiked) {
    post.removeLike(req.user._id);
  } else {
    post.addLike(req.user._id);
  }
  
  await post.save();
  
  res.status(200).json({
    success: true,
    data: {
      isLiked: !isLiked,
      likeCount: post.likeCount
    }
  });
}));

// @route   POST /api/posts/:id/comments
// @desc    Add comment to post
// @access  Private
router.post('/:id/comments', protect, [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const post = await Post.findById(req.params.id);
  
  if (!post || post.status !== 'published') {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }
  
  const comment = {
    user: req.user._id,
    content: req.body.content,
    isAnonymous: req.body.isAnonymous || false,
    anonymousName: req.body.anonymousName || 'Anonymous Sister'
  };
  
  post.comments.push(comment);
  await post.save();
  
  // Populate the new comment
  await post.populate('comments.user', 'firstName lastName avatar');
  
  const newComment = post.comments[post.comments.length - 1];
  
  res.status(201).json({
    success: true,
    message: 'Comment added successfully',
    data: newComment
  });
}));

// @route   POST /api/posts/:id/share
// @desc    Share a post (increment share count)
// @access  Private
router.post('/:id/share', protect, asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  
  if (!post || post.status !== 'published') {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }
  
  post.shares = (post.shares || 0) + 1;
  await post.save();
  
  res.status(200).json({
    success: true,
    message: 'Post shared successfully',
    data: {
      shareCount: post.shares
    }
  });
}));

export default router;
