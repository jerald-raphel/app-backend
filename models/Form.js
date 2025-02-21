const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },  // Changed from 'text' to 'question'
  answerType: { type: String, enum: ["Yes/No", "Upload Image"], required: true },
  selectedAnswer: { type: String, enum: ["Yes", "No"], default: null },
  imageUri: { type: String, default: null },
});

const FormSchema = new mongoose.Schema({
  title: { type: String, required: true },
  questions: [QuestionSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Form", FormSchema);




// const mongoose = require('mongoose');

// const QuestionSchema = new mongoose.Schema({
//   question: { type: String, required: true },
//   answerType: { type: String, enum: ['Yes/No', 'Upload Image'], required: true },
//   selectedAnswer: { type: String, enum: ['Yes', 'No'], default: null },
//   imageUri: { type: String, default: null },
// });

// const Question = mongoose.model('Question', QuestionSchema);  // Register the Question model

// const FormSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],  // Reference Question model
//   createdAt: { type: Date, default: Date.now },
// });

// const Form = mongoose.model('Form', FormSchema);

// module.exports = Form;

