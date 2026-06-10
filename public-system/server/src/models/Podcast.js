/**
 * Podcast Model - MongoDB Schema
 * Stores published podcasts received from Editor system
 */

const mongoose = require('mongoose');

const podcastSchema = new mongoose.Schema({
  // Basic info
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  author: {
    type: String,
    trim: true,
    maxlength: 255
  },
  description: {
    type: String,
    trim: true
  },
  
  // Media
  imageUrl: {
    type: String,
    maxlength: 2048
  },
  
  // Classification
  category: {
    type: String,
    trim: true,
    maxlength: 100,
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  
  // Source tracking
  editorPodcastId: {
    type: String, // UUID from Editor system
    index: true
  },
  adminFeedId: {
    type: Number // Reference back to Admin system
  },
  
  // Statistics
  episodeCount: {
    type: Number,
    default: 0
  },
  totalListenCount: {
    type: Number,
    default: 0
  },
  saveCount: {
    type: Number,
    default: 0
  },
  
  // Ratings
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'hidden', 'featured'],
    default: 'active',
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Color/icon for UI
  colorClass: {
    type: String,
    default: 't1'
  },
  iconClass: {
    type: String,
    default: 'ti-radio'
  },
  
  // Timestamps
  publishedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastEpisodeAt: {
    type: Date
  }
}, {
  timestamps: true,
  collection: 'podcasts'
});

// Indexes for search
podcastSchema.index({ title: 'text', author: 'text', description: 'text' });
podcastSchema.index({ category: 1, publishedAt: -1 });
podcastSchema.index({ isFeatured: 1, publishedAt: -1 });

// Virtual for meta display
podcastSchema.virtual('meta').get(function() {
  return `${this.category || 'Uncategorized'} · ${this.episodeCount || 0} eps`;
});

// Method to update rating
podcastSchema.methods.updateRating = function(newRating, oldRating = null) {
  if (oldRating !== null) {
    // Update existing rating
    const totalPoints = this.averageRating * this.ratingCount;
    this.averageRating = (totalPoints - oldRating + newRating) / this.ratingCount;
  } else {
    // Add new rating
    const totalPoints = this.averageRating * this.ratingCount;
    this.ratingCount += 1;
    this.averageRating = (totalPoints + newRating) / this.ratingCount;
  }
  this.averageRating = Math.round(this.averageRating * 10) / 10; // Round to 1 decimal
  return this.save();
};

module.exports = mongoose.model('Podcast', podcastSchema);
