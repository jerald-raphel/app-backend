const mongoose = require("mongoose");

const AnswerSchema = new mongoose.Schema({
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Form',
  },
  formTitle: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  answerType: {
    type: String,
    enum: ["Yes/No", "Upload Image", "Dropdown"],
    required: true,
  },

  // For Yes/No questions
  yesOrNo: {
    type: String,
    enum: ["Yes", "No", null],
    default: null,
  },

  // For Dropdown questions
  dropdownChoice: {
    type: String,
    enum: ["Critical", "Zero Tolerance", "Major", "Minor", null],
    default: null,
  },
  dropdownYesOrNo: {
    type: String,
    enum: ["Yes", "No", null],
    default: null,
  },

  // For Upload Image
  imageUri: {
    type: String,
    default: null,
  },

  // Optional comment
  textField: {
    type: String,
    default: "",
  },

  // User details
  user: {
    email: { type: String, required: true },
  },
}, { timestamps: true });

module.exports = mongoose.model("Answer", AnswerSchema);
