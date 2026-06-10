/**
 * Episode Model - MongoDB Schema
 * Stores podcast episodes
 */

const mongoose = require('mongoose');

const episodeSchema = new mongoose.Schema({
  // Parent podcast
  podcastId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Podcast',
    required: true,
    index: true
  },
  podcastName: {
    type: String,
    required: true
  },
  
  // Basic info
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  description: {
    type: String,
    trim: true
  },
  
  // Audio
  audioUrl: {
    type: String,
    maxlength: 2048
  },
  duration: {
    type: Number, // seconds
    default: 0
  },
  fileSize: {
    type: Number // bytes
  },
  
  // Episode details
  episodeNumber: {
    type: Number
  },
  season: {
    type: Number
  },
  
  // Source tracking
  editorEpisodeId: {
    type: String // UUID from Editor system
  },
  guid: {
    type: String, // RSS GUID
    index: true
  },
  
  // Statistics
  playCount: {
    type: Number,
    default: 0
  },
  completionRate: {
    type: Number,
    default: 0
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'hidden'],
    default: 'active'
  },
  
  // Published date
  publishedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  collection: 'episodes'
});

// Indexes
episodeSchema.index({ podcastId: 1, publishedAt: -1 });
episodeSchema.index({ title: 'text', description: 'text' });

// Virtual for formatted duration
episodeSchema.virtual('formattedDuration').get(function() {
  if (!this.duration) return '0:00';
  
  const hours = Math.floor(this.duration / 3600);
  const mins = Math.floor((this.duration % 3600) / 60);
  const secs = this.duration % 60;
  
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
});

module.exports = mongoose.model('Episode', episodeSchema);
