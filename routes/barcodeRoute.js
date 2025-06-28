const express = require("express");
const multer = require("multer");
const Jimp = require("jimp");
const QrCode = require("qrcode-reader");
const Barcode = require("../models/Barcode");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/scan", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image file is required." });
    }

    const imageBuffer = req.file.buffer;

    // Decode QR using Jimp + qrcode-reader
    const image = await Jimp.read(imageBuffer);
    const qr = new QrCode();

    qr.callback = async (err, value) => {
      if (err || !value) {
        return res.status(400).json({
          success: false,
          message: "QR not detected or unreadable.",
          error: err?.message || "No value returned",
        });
      }

      const qrValue = value.result;

      const barcodeData = await Barcode.findOne({ value: qrValue });

      if (barcodeData) {
        return res.json({
          success: true,
          message: "QR matched",
          data: barcodeData,
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Unknown QR",
        });
      }
    };

    qr.decode(image.bitmap);
  } catch (error) {
    console.error("QR Decode error:", error);
    return res.status(500).json({
      success: false,
      message: "QR decode failed",
      error: error.message,
    });
  }
});

module.exports = router;
