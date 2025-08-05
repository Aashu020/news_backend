const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  source: {
    id: String,
    name: String
  },
  author: String,
  title: String,
  description: String,
  url: {
    type: String,
    unique: true // ✅ prevent duplicate URLs
  },
  urlToImage: String,
  publishedAt: Date,
  content: String
});

module.exports = mongoose.model('News', newsSchema);
