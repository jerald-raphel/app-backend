// const express = require("express");
// const multer = require("multer");
// const Jimp = require("jimp");
// const QrCode = require("qrcode-reader");
// const Barcode = require("../models/Barcode");

// const router = express.Router();
// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// router.post("/scan", upload.single("image"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ success: false, message: "Image file is required." });
//     }

//     const imageBuffer = req.file.buffer;

//     // Decode QR using Jimp + qrcode-reader
//     const image = await Jimp.read(imageBuffer);
//     const qr = new QrCode();

//     qr.callback = async (err, value) => {
//       if (err || !value) {
//         return res.status(400).json({
//           success: false,
//           message: "QR not detected or unreadable.",
//           error: err?.message || "No value returned",
//         });
//       }

//       const qrValue = value.result;

//       const barcodeData = await Barcode.findOne({ value: qrValue });

//       if (barcodeData) {
//         return res.json({
//           success: true,
//           message: "QR matched",
//           data: barcodeData,
//         });
//       } else {
//         return res.status(404).json({
//           success: false,
//           message: "Unknown QR",
//         });
//       }
//     };

//     qr.decode(image.bitmap);
//   } catch (error) {
//     console.error("QR Decode error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "QR decode failed",
//       error: error.message,
//     });
//   }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const Jimp = require('jimp');
const QrCode = require('qrcode-reader');

const Barcode = require('../models/Barcode');
const Assignment = require('../models/Assignment');
const Form = require('../models/From'); // 👈 Add your Form model

router.post("/scan", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image file is required." });
    }

    const imageBuffer = req.file.buffer;
    const image = await Jimp.read(imageBuffer);

    const qr = new QrCode();

    qr.callback = async (err, value) => {
      if (err || !value) {
        return res.status(400).json({
          success: false,
          message: "QR not detected or unreadable.",
          error: err?.message || "No QR value returned",
        });
      }

      const qrValue = value.result;

      // Step 1: Find barcode
      const barcodeData = await Barcode.findOne({ value: qrValue });

      if (!barcodeData) {
        return res.status(404).json({
          success: false,
          message: "Unknown QR - No barcode found in DB",
        });
      }

      // Step 2: Find all assignments with this QR
      const assignmentList = await Assignment.find({ value: qrValue });

      const assignmentsWithQuestions = await Promise.all(
        assignmentList.map(async (assignment) => {
          const form = await Form.findById(assignment.formId).select("questions");
          return {
            _id: assignment._id,
            formTitle: assignment.formTitle,
            formId: assignment.formId,
            assignedAt: assignment.assignedAt,
            image: assignment.image,
            questions: form?.questions || [],
          };
        })
      );

      return res.status(200).json({
        success: true,
        barcode: barcodeData.value,
        assignments: assignmentsWithQuestions,
      });
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

router.post("/text", async (req, res) => {
  try {
    const { barcode } = req.body;

    if (!barcode) {
      return res.status(400).json({ success: false, message: "QR value is required" });
    }

    // Step 1: Find barcode
    const barcodeData = await Barcode.findOne({ value: barcode });

    if (!barcodeData) {
      return res.status(404).json({
        success: false,
        message: "Unknown QR - No barcode found in DB",
      });
    }

    // Step 2: Find all assignments with this QR
    const assignmentList = await Assignment.find({ value: barcode });

    const assignmentsWithQuestions = await Promise.all(
      assignmentList.map(async (assignment) => {
        const form = await Form.findById(assignment.formId).select("questions");
        return {
          _id: assignment._id,
          formTitle: assignment.formTitle,
          formId: assignment.formId,
          assignedAt: assignment.assignedAt,
          image: assignment.image,
          questions: form?.questions || [],
        };
      })
    );

    return res.status(200).json({
      success: true,
      barcode: barcode,
      assignments: assignmentsWithQuestions,
    });
  } catch (error) {
    console.error("Text QR decode error:", error);
    return res.status(500).json({
      success: false,
      message: "QR decode from text failed",
      error: error.message,
    });
  }
});

module.exports = router;
