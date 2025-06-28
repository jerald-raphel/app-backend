// // models/Barcode.js
// const mongoose = require('mongoose');

// const BarcodeSchema = new mongoose.Schema({
//   value: { type: String, required: true },
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('Barcode', BarcodeSchema);

// models/Barcode.js
const mongoose = require('mongoose');

const BarcodeSchema = new mongoose.Schema({
  value: { type: String, required: true },
  image: { type: String }, // Base64 without prefix
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Barcode', BarcodeSchema);

