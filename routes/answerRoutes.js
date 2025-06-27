// const express = require("express");
// const router = express.Router();
// const Answer = require("../models/Answer");

// // POST /responses/submit - Submit multiple answers
// router.post("/submit", async (req, res) => {
//   try {
//    const { formTitle, formId, answers } = req.body;


//     if (!formTitle || !Array.isArray(answers) || answers.length === 0) {
//       return res.status(400).json({ message: "Form title and answers are required." });
//     }

//     const savedAnswers = [];

//     for (const ans of answers) {
//       const {
//         question,
//         answerType,
//         yesOrNo,
//         dropdownChoice,
//         dropdownYesOrNo,
//         imageUri,
//         textField,
//         user
//       } = ans;

//       // ✅ Updated Validation (removed user.name)
//       if (!question || !answerType || !user?.email) {
//         return res.status(400).json({ message: "Missing required fields in an answer." });
//       }

//       const answer = new Answer({
//         formId,
//         formTitle,
//         question,
//         answerType,
//         yesOrNo,
//         dropdownChoice,
//         dropdownYesOrNo,
//         imageUri,
//         textField,
//         user,
//       });

//       const saved = await answer.save();
//       savedAnswers.push(saved);
//     }

//     res.status(201).json({
//       success: true,
//       message: "Answers submitted successfully.",
//       data: savedAnswers,
//     });
//   } catch (error) {
//     console.error("Error submitting answers:", error);
//     res.status(500).json({ success: false, message: "Internal server error." });
//   }
// });

// module.exports = router;



const express = require("express");
const router = express.Router();
const Form = require("../models/From");

// POST /responses/submit - Submit multiple answers to a form
router.post("/submit", async (req, res) => {
  try {
    const { formId, answers, user } = req.body;

    if (!formId || !user?.email || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "formId, user email, and answers are required." });
    }

    // Step 1: Find the form
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: "Form not found." });
    }

    // Step 2: Create the new response object
    const response = {
      user: {
        email: user.email
      },
      answers: answers.map((ans) => ({
        question: ans.question,
        answerType: ans.answerType,
        yesOrNo: ans.yesOrNo || null,
        dropdownChoice: ans.dropdownChoice || null,
        dropdownYesOrNo: ans.dropdownYesOrNo || null,
        imageUri: ans.imageUri || null,
        textField: ans.textField || ""
      }))
    };

    // Step 3: Push the response to the form's responses array
    form.responses.push(response);

    // Step 4: Save the updated form
    await form.save();

    res.status(201).json({
      success: true,
      message: "Answers submitted successfully.",
      data: response,
    });
  } catch (error) {
    console.error("Error submitting answers:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

module.exports = router;
