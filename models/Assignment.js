// const mongoose = require("mongoose");

// const assignmentSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   username: { type: String, required: true }, // store username as string
//   formId: { type: mongoose.Schema.Types.ObjectId, ref: "Form", required: true },
//   formTitle: { type: String, required: true }, // store form title as string
//   assignedAt: { type: Date, default: Date.now }
// });

// const Assignment = mongoose.model("Assignment", assignmentSchema);

// module.exports = Assignment;


const mongoose = require("mongoose");

// const assignmentSchema = new mongoose.Schema({
//   value: { type: String, required: true },           // QR/barcode value
//   image: { type: String, required: true },           // base64 or URI
//   formId: { type: mongoose.Schema.Types.ObjectId, ref: "Form", required: true },
//   formTitle: { type: String, required: true },
//   assignedAt: { type: Date, default: Date.now }
// });

// const Assignment = mongoose.model("Assignment", assignmentSchema);
// module.exports = Assignment;


const assignmentSchema = new mongoose.Schema({
  value: { type: String, required: true }, // QR/barcode value
  image: { type: String, required: true }, // base64 or URI
  formId: { type: mongoose.Schema.Types.ObjectId, ref: "Form", required: true },
  formTitle: { type: String, required: true },
  assignedAt: { type: Date, default: Date.now },
  isSubmitted: { type: Boolean, default: false }, // ✅ New field
});

const Assignment = mongoose.model("Assignment", assignmentSchema);
module.exports = Assignment;
