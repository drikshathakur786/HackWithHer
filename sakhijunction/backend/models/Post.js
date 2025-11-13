import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  // Basic Post Information
  title: {
    type: String,
    required: [true, 'Post title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    maxlength: [10000, 'Content cannot exceed 10000 characters']
  },
  excerpt: {
    type: String,
    maxlength: [300, 'Excerpt cannot exceed 300 characters']
  },
  
  // Author Information
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  anonymousName: {
    type: String,
    default: 'Anonymous Sister'
  },
  
  // Categories and Tags
  category: {
    type: String,
    required: true,
    enum: [
      'menstrual_health',
      'mental_health',
      'reproductive_health',
      'pcos',
      'nutrition',
      'fitness',
      'self_defense',
      'cancer_awareness',
      'general_wellness',
      'relationships',
      'career',
      'motherhood',
      'personal_story',
      'question',
      'support'
    ]
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Content Type
  postType: {
    type: String,
    enum: ['text', 'question', 'story', 'tip', 'article', 'resource'],
    default: 'text'
  },
  
  // Media Attachments
  images: [{
    public_id: String,
    url: String,
    caption: String
  }],
  documents: [{
    public_id: String,
    url: String,
    filename: String,
    fileType: String,
    size: Number
  }],
  
  // Engagement Metrics
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    isAnonymous: {
      type: Boolean,
      default: false
    },
    anonymousName: {
      type: String,
      default: 'Anonymous Sister'
    },
    likes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    replies: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      content: {
        type: String,
        required: true,
        maxlength: [500, 'Reply cannot exceed 500 characters']
      },
      isAnonymous: {
        type: Boolean,
        default: false
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  
  // Community and Privacy
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community'
  },
  visibility: {
    type: String,
    enum: ['public', 'community_only', 'followers_only'],
    default: 'public'
  },
  
  // Content Moderation
  isModerated: {
    type: Boolean,
    default: false
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderationReason: String,
  flaggedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'harassment', 'misinformation', 'other']
    },
    description: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // SEO and Analytics
  slug: {
    type: String,
    sparse: true
  },
  metaDescription: String,
  readingTime: Number, // in minutes
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'hidden'],
    default: 'published'
  },
  publishedAt: Date,
  
  // Featured Content
  isFeatured: {
    type: Boolean,
    default: false
  },
  featuredUntil: Date,
  
  // AI Content Analysis
  sentimentScore: {
    type: Number,
    min: -1,
    max: 1
  },
  emotionTags: [String], // joy, sadness, fear, anger, etc.
  topicsDetected: [String], // AI-detected topics
  
  // Wellness Impact
  wellnessCategory: {
    type: String,
    enum: ['mental', 'physical', 'emotional', 'social', 'spiritual']
  },
  supportLevel: {
    type: String,
    enum: ['seeking', 'offering', 'sharing', 'educating']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ community: 1, createdAt: -1 });
postSchema.index({ isFeatured: 1, featuredUntil: 1 });
postSchema.index({ slug: 1 }, { unique: true, sparse: true });

// Text search index
postSchema.index({
  title: 'text',
  content: 'text',
  tags: 'text'
}, {
  weights: {
    title: 10,
    content: 5,
    tags: 8
  }
});

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments ? this.comments.length : 0;
});

// Virtual for engagement score
postSchema.virtual('engagementScore').get(function() {
  const likes = this.likeCount;
  const comments = this.commentCount;
  const views = this.views || 0;
  const shares = this.shares || 0;
  
  // Weighted engagement score
  return (likes * 1) + (comments * 3) + (shares * 5) + (views * 0.1);
});

// Pre-save middleware to generate slug
postSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .trim();
    
    // Add timestamp to ensure uniqueness
    this.slug += '-' + Date.now();
  }
  
  // Set published date if status is published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Calculate reading time (average 200 words per minute)
  if (this.isModified('content')) {
    const wordCount = this.content.split(/\s+/).length;
    this.readingTime = Math.ceil(wordCount / 200);
  }
  
  // Generate excerpt if not provided
  if (this.isModified('content') && !this.excerpt) {
    this.excerpt = this.content.substring(0, 297) + '...';
  }
  
  next();
});

// Method to check if user has liked the post
postSchema.methods.isLikedBy = function(userId) {
  return this.likes.some(like => like.user.toString() === userId.toString());
};

// Method to add like
postSchema.methods.addLike = function(userId) {
  if (!this.isLikedBy(userId)) {
    this.likes.push({ user: userId });
  }
};

// Method to remove like
postSchema.methods.removeLike = function(userId) {
  this.likes = this.likes.filter(like => like.user.toString() !== userId.toString());
};

// Method to add view
postSchema.methods.addView = function() {
  this.views = (this.views || 0) + 1;
};

// Static method to find trending posts
postSchema.statics.findTrending = function(timeframe = 7) {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - timeframe);
  
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: fromDate },
        status: 'published'
      }
    },
    {
      $addFields: {
        engagementScore: {
          $add: [
            { $size: '$likes' },
            { $multiply: [{ $size: '$comments' }, 3] },
            { $multiply: ['$shares', 5] },
            { $multiply: ['$views', 0.1] }
          ]
        }
      }
    },
    {
      $sort: { engagementScore: -1 }
    },
    {
      $limit: 20
    }
  ]);
};

const Post = mongoose.model('Post', postSchema);

export default Post;
