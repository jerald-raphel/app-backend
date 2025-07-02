
// const mongoose = require("mongoose");

// // Question schema (unchanged)
// const QuestionSchema = new mongoose.Schema({
//   question: { type: String, required: true },
//   answerType: {
//     type: String,
//     enum: ["Yes/No", "Upload Image", "Dropdown"],
//     required: true,
//   },
//   dropdownChoices: {
//     type: [String],
//     default: ["Critical", "Zero Tolerance", "Major", "Minor"],
//   },
//   yesNoAnswer: {
//     type: String,
//     enum: ["Yes", "No", null],
//     default: null,
//   },
//   imageUri: {
//     type: String,
//     default: null,
//   },
//   textField: {
//     type: String,
//     default: "",
//   },
//   dropdownChoice: {
//     type: String,
//     enum: ["Critical", "Zero Tolerance", "Major", "Minor", null],
//     default: null,
//   },
//   dropdownYesNoAnswer: {
//     type: String,
//     enum: ["Yes", "No", null],
//     default: null,
//   },
// }, { _id: true });


// // 💬 Answer object inside each form response
// const AnswerSchema = new mongoose.Schema({
//   question: { type: String, required: true },
//   answerType: {
//     type: String,
//     enum: ["Yes/No", "Upload Image", "Dropdown"],
//     required: true,
//   },
//   yesOrNo: {
//     type: String,
//     enum: ["Yes", "No", null],
//     default: null,
//   },
//   dropdownChoice: {
//     type: String,
//     enum: ["Critical", "Zero Tolerance", "Major", "Minor", null],
//     default: null,
//   },
//   dropdownYesOrNo: {
//     type: String,
//     enum: ["Yes", "No", null],
//     default: null,
//   },
//   imageUri: {
//     type: String,
//     default: null,
//   },
//   textField: {
//     type: String,
//     default: "",
//   }
// }, { _id: false });


// // 👤 Response schema: One user's answers for this form
// const ResponseSchema = new mongoose.Schema({
//   user: {
//     email: { type: String, required: true }
//   },
//   answers: [AnswerSchema]
// }, { _id: false });


// // 📄 Final Form schema with questions and responses
// const FormSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   questions: [QuestionSchema],
//   responses: [ResponseSchema], // <-- Embedded answers grouped by form
//   createdAt: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model("Form", FormSchema);


const mongoose = require("mongoose");

// Question schema (unchanged)
const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answerType: {
    type: String,
    enum: ["Yes/No", "Upload Image", "Dropdown"],
    required: true,
  },
  dropdownChoices: {
    type: [String],
    default: ["Critical", "Zero Tolerance", "Major", "Minor"],
  },
  yesNoAnswer: {
    type: String,
    enum: ["Yes", "No", null],
    default: null,
  },
  imageUri: {
    type: String,
    default: null,
  },
  textField: {
    type: String,
    default: "",
  },
  dropdownChoice: {
    type: String,
    enum: ["Critical", "Zero Tolerance", "Major", "Minor", null],
    default: null,
  },
  dropdownYesNoAnswer: {
    type: String,
    enum: ["Yes", "No", null],
    default: null,
  },
}, { _id: true });

// 💬 Answer schema
const AnswerSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answerType: {
    type: String,
    enum: ["Yes/No", "Upload Image", "Dropdown"],
    required: true,
  },
  yesOrNo: {
    type: String,
    enum: ["Yes", "No", null],
    default: null,
  },
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
  imageUri: {
    type: String,
    default: null,
  },
  textField: {
    type: String,
    default: "",
  }
}, { _id: false });

// 📍 Embedded location schema
const LocationSchema = new mongoose.Schema({
  place: { type: String, required: false },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

// 👤 Response schema
const ResponseSchema = new mongoose.Schema({
  user: {
    email: { type: String, required: true }
  },
  location: LocationSchema,  // ✅ Added location here
  answers: [AnswerSchema]
}, { _id: false });

// 📄 Final form schema
const FormSchema = new mongoose.Schema({
  title: { type: String, required: true },
  questions: [QuestionSchema],
  responses: [ResponseSchema], // <-- Embedded responses with location
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Form", FormSchema);
  