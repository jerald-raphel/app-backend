const express = require("express");
const Form = require("../models/Form");

const router = express.Router();

// ✅ Create a new form
router.post("/forms", async (req, res) => {
  try {
    const { title, questions } = req.body;
    const newForm = new Form({ title, questions });
    await newForm.save();
    res.status(201).json(newForm);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get all forms


// Get forms with questions and answer types
router.get("/forms", async (req, res) => {
  try {
    // Fetch all forms with questions and answer types
    const forms = await Form.find().select("title questions");

    // If no forms are found, return a message
    if (!forms || forms.length === 0) {
      return res.status(404).json({ message: "No forms found" });
    }

    // Send the fetched forms as a response
    res.json(forms);
  } catch (error) {
    // Return error message in case of an exception
    res.status(500).json({ error: error.message });
  }
});






// ✅ Update a form by ID
router.put("/forms/:id", async (req, res) => {
  try {
    // Destructure the updated questions from the request body
    const { questions } = req.body;

    // Ensure the form exists
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // If questions are provided in the request, update them
    if (questions && Array.isArray(questions)) {
      form.questions = form.questions.map((question, index) => {
        if (questions[index]) {
          question.question = questions[index].question || question.question;
          question.answerType = questions[index].answerType || question.answerType;

          // Handle selectedAnswer for Yes/No questions
          if (question.answerType === "Yes/No") {
            question.selectedAnswer = questions[index].selectedAnswer || question.selectedAnswer;
          }

          // Handle imageUri for image-based questions
          if (question.answerType === "Upload Image") {
            question.imageUri = questions[index].imageUri || question.imageUri;
          }
        }
        return question;
      });
    }

    // Save the updated form to the database
    const updatedForm = await form.save();
    res.json(updatedForm);
  } catch (error) {
    console.error("Error saving form:", error);
    res.status(500).json({ error: error.message });
  }
});



// ✅ Delete a form by ID
router.delete("/forms/:id", async (req, res) => {
  try {
    await Form.findByIdAndDelete(req.params.id);
    res.json({ message: "Form deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
