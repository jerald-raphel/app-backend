const express = require('express');
const multer = require('multer');
const Jimp = require('jimp');
const {
  BrowserMultiFormatReader,
  RGBLuminanceSource,
  BinaryBitmap,
  HybridBinarizer,
} = require('@zxing/library');

const Barcode = require('../models/Barcode');

const router = express.Router();

// Use memory storage instead of disk
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('barcodeImage'), async (req, res) => {
  try {
    const buffer = req.file.buffer;

    const image = await Jimp.read(buffer);
    const luminanceSource = new RGBLuminanceSource(
      new Uint8ClampedArray(image.bitmap.data),
      image.bitmap.width,
      image.bitmap.height
    );

    const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));
    const reader = new BrowserMultiFormatReader();
    const result = reader.decode(binaryBitmap);

    // Save scanned code to MongoDB
    await Barcode.create({ code: result.getText() });

    res.json({ success: true, code: result.getText() });
  } catch (err) {
    console.error('Error decoding barcode:', err.message);
    res.status(500).json({ success: false, message: 'Failed to read barcode' });
  }
});

module.exports = router;
