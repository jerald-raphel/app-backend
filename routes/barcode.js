const express = require('express');
const router = express.Router();
const Jimp = require('jimp');
const {
  RGBLuminanceSource,
  BinaryBitmap,
  HybridBinarizer,
  MultiFormatReader,
} = require('@zxing/library');

const Barcode = require('../models/Barcode');

// 🧹 Clean base64 input
function normalizeBase64(dataUrl) {
  return dataUrl.replace(/^data:image\/\w+;base64,/, '').trim();
}

// 🔍 Decode QR from image buffer
async function readQRCodeFromBuffer(buffer) {
  const image = await Jimp.read(buffer);
  console.log(`📏 Image loaded: ${image.bitmap.width}x${image.bitmap.height}`);

  const source = new RGBLuminanceSource(image.bitmap.data, image.bitmap.width, image.bitmap.height);
  const bitmap = new BinaryBitmap(new HybridBinarizer(source));

  const reader = new MultiFormatReader();
  try {
    const result = reader.decode(bitmap);
    return result.getText();
  } catch (err) {
    console.error('❌ QR decode error:', err.message);
    throw new Error('QR not detected or unreadable.');
  }
}

// ✅ Save barcode with value and image
router.post('/save', async (req, res) => {
  const { value, image } = req.body;

  if (!value || !image) {
    return res.status(400).json({ message: 'Value and base64 image required' });
  }

  try {
    const newBarcode = new Barcode({
      value,
      image: normalizeBase64(image),
    });

    await newBarcode.save();
    res.status(201).json({ message: 'Barcode with image saved successfully' });
  } catch (error) {
    console.error('Error saving barcode:', error);
    res.status(500).json({ message: 'Error saving barcode', error });
  }
});

// ✅ Get all barcodes
router.get('/all', async (req, res) => {
  try {
    const barcodes = await Barcode.find().sort({ createdAt: -1 });
    res.json({ success: true, data: barcodes });
  } catch (err) {
    console.error('Error fetching barcodes:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ Verify QR from base64 or direct value
router.post('/verify', async (req, res) => {
  try {
    let qrValue = null;

    if (req.body.value) {
      qrValue = req.body.value;
    } else if (req.body.image) {
      const base64 = normalizeBase64(req.body.image);
      const buffer = Buffer.from(base64, 'base64');
      qrValue = await readQRCodeFromBuffer(buffer);
    } else {
      return res.status(400).json({ success: false, message: 'No QR input provided.' });
    }

    const existing = await Barcode.findOne({ value: qrValue });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'QR code matched.',
        value: qrValue,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'QR code not found in database.',
        value: qrValue,
      });
    }
  } catch (err) {
    console.error('❌ Error verifying QR:', err.message);
    return res.status(400).json({
      success: false,
      message: err.message,
      error: err.message,
    });
  }
});

module.exports = router;