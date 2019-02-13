var mongoose = require('mongoose')

// Schema
var blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  body: String,
  created: { type: Date, default: Date.now }
});

// Construct Model
module.exports = mongoose.model('Blog', blogSchema);
