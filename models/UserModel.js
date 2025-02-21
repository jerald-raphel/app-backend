// const mongoose = require('mongoose');

// // Schema for storing answers
// const answerSchema = new mongoose.Schema({
//   questionId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Question',  // Reference to the Question model
//     required: true,
//   },
//   answer: {
//     type: mongoose.Schema.Types.Mixed,  // This allows flexibility (could be string, number, file URI, etc.)
//     required: true,
//   },
//   formId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Form',  // Reference to the Form model
//     required: true,
//   },
// }, { timestamps: true });

// // Schema for the details of a user (or an entity)
// const detailSchema = new mongoose.Schema({
//   email: { type: String, required: true },  // Email of the user, required for the parent level
//   password: { type: String, required: true },  // Password for the user
//   details: [{
//     name: { type: String, required: true },  // Name of the entity or user in the detail
//     members: { type: String, required: true },  // The number of members associated with the detail
//     number: { type: String, required: true, unique: true },  // Unique number for the detail
//     location: { type: String, required: true },  // Location of the detail
//     doorNumber: { type: String, required: true },  // Door number
//     email: { type: String, required: false },  // Optional email specific to the detail (if any)
    
//     answers: [answerSchema]  // Replace surveySchema with answerSchema
//   }]
// }, { timestamps: true });  // Adding timestamps to track creation and updates

// module.exports = mongoose.model('Detail', detailSchema);  // Export the model





const mongoose = require('mongoose');

// Updated AnswerSchema to store the question text directly
const AnswerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  question: { type: String },  // Make it optional
  answer: { type: String, required: true },
  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form' },
}, { timestamps: true });


// Schema for the details of a user (or an entity)
const detailSchema = new mongoose.Schema({
  email: { type: String, required: true },  // Email of the user, required for the parent level
  password: { type: String, required: true },  // Password for the user
  details: [{
    name: { type: String, required: true },  // Name of the entity or user in the detail
    members: { type: String, required: true },  // The number of members associated with the detail
    number: { type: String, required: true, unique: true },  // Unique number for the detail
    location: { type: String, required: true },  // Location of the detail
    doorNumber: { type: String, required: true },  // Door number
    email: { type: String, required: false },  // Optional email specific to the detail (if any)
    answers: [AnswerSchema]  // Include answers directly in the details
  }]
}, { timestamps: true });  // Adding timestamps to track creation and updates

module.exports = mongoose.model('Detail', detailSchema);  // Export the model
