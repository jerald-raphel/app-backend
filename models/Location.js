const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  place: { type: String, required: true },
  timestamp: { type: Date, required: true },
});

module.exports = mongoose.model('Location', locationSchema);
