/**
 * User Model - MongoDB Schema
 * Stores user data for saved podcasts, listen history, ratings
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Basic info
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    trim: true,
    maxlength: 100
  },
  
  // Display
  initials: {
    type: String,
    maxlength: 3
  },
  avatarUrl: {
    type: String,
    maxlength: 2048
  },
  
  // Authentication
  passwordHash: {
    type: String
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'apple'],
    default: 'local'
  },
  
  // Saved podcasts
  savedPodcasts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Podcast'
  }],
  
  // Followed podcasts
  followedPodcasts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Podcast'
  }],
  
  // Listen history
  listenHistory: [{
    episodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Episode'
    },
    podcastId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Podcast'
    },
    progress: {
      type: Number, // seconds
      default: 0
    },
    completed: {
      type: Boolean,
      default: false
    },
    listenedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Ratings given
  ratings: [{
    podcastId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Podcast'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Reviews written
  reviews: [{
    podcastId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Podcast'
    },
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Player state
  currentEpisode: {
    episodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Episode'
    },
    podcastId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Podcast'
    },
    progress: {
      type: Number,
      default: 0
    },
    playbackRate: {
      type: Number,
      default: 1.0
    }
  },
  
  // Stats
  stats: {
    totalListened: {
      type: Number,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    totalSaved: {
      type: Number,
      default: 0
    }
  },
  
  // Account
  plan: {
    type: String,
    enum: ['free', 'premium'],
    default: 'free'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'users'
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ savedPodcasts: 1 });
userSchema.index({ 'listenHistory.episodeId': 1 });

// Method to save a podcast
userSchema.methods.savePodcast = function(podcastId) {
  if (!this.savedPodcasts.includes(podcastId)) {
    this.savedPodcasts.push(podcastId);
    this.stats.totalSaved = this.savedPodcasts.length;
  }
  return this.save();
};

// Method to unsave a podcast
userSchema.methods.unsavePodcast = function(podcastId) {
  this.savedPodcasts = this.savedPodcasts.filter(id => !id.equals(podcastId));
  this.stats.totalSaved = this.savedPodcasts.length;
  return this.save();
};

// Method to add to listen history
userSchema.methods.addToHistory = function(episodeId, podcastId, progress) {
  // Remove existing entry for this episode
  this.listenHistory = this.listenHistory.filter(h => !h.episodeId.equals(episodeId));
  
  // Add new entry at the beginning
  this.listenHistory.unshift({
    episodeId,
    podcastId,
    progress,
    listenedAt: new Date()
  });
  
  // Keep only last 100 items
  if (this.listenHistory.length > 100) {
    this.listenHistory = this.listenHistory.slice(0, 100);
  }
  
  this.stats.totalListened = this.listenHistory.length;
  return this.save();
};

// Method to rate a podcast
userSchema.methods.ratePodcast = function(podcastId, rating) {
  const existingIndex = this.ratings.findIndex(r => r.podcastId.equals(podcastId));
  
  if (existingIndex >= 0) {
    this.ratings[existingIndex].rating = rating;
  } else {
    this.ratings.push({ podcastId, rating });
  }
  
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
