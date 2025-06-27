// routes/barcode.js
const express = require('express');
const router = express.Router();
const Barcode = require('../models/Barcode');

// POST /barcode/save
router.post('/barcode/save', async (req, res) => {
  const { value } = req.body;
  if (!value) return res.status(400).json({ message: 'Barcode value is required' });

  try {
    const newBarcode = new Barcode({ value });
    await newBarcode.save();
    res.status(201).json({ message: 'Barcode saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving barcode', error });
  }
});

router.get('/all', async (req, res) => {
  try {
    const barcodes = await Barcode.find().sort({ createdAt: -1 });
    res.json({ success: true, data: barcodes });
  } catch (err) {
    console.error('Error fetching barcodes:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


module.exports = router;
