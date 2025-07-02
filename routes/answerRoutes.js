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
// router.post("/submit", async (req, res) => {
//   try {
//     const { formId, answers, user } = req.body;

//     if (!formId || !user?.email || !Array.isArray(answers) || answers.length === 0) {
//       return res.status(400).json({ message: "formId, user email, and answers are required." });
//     }

//     // Step 1: Find the form
//     const form = await Form.findById(formId);
//     if (!form) {
//       return res.status(404).json({ message: "Form not found." });
//     }

//     // 🔒 Step 2: Check if the user already submitted the form
//     const alreadySubmitted = form.responses.some(r => r.user.email === user.email);
//     if (alreadySubmitted) {
//       return res.status(409).json({
//         success: false,
//         message: "You have already submitted this form."
//       });
//     }

//     // ✅ Step 3: Prepare the response
//     const response = {
//       user: {
//         email: user.email
//       },
//       answers: answers.map((ans) => ({
//         question: ans.question,
//         answerType: ans.answerType,
//         yesOrNo: ans.selectedAnswer || ans.yesOrNo || null,
//         dropdownChoice: ans.dropdownChoice || null,
//         dropdownYesOrNo: ans.dropdownYesOrNo || null,
//         imageUri: ans.imageUri || null,
//         textField: ans.textField || ""
//       }))
//     };

//     // Step 4: Save the response
//     form.responses.push(response);
//     await form.save();

//     res.status(201).json({
//       success: true,
//       message: "Answers submitted successfully.",
//       data: response,
//     });
//   } catch (error) {
//     console.error("Error submitting answers:", error);
//     res.status(500).json({ success: false, message: "Internal server error." });
//   }
// });



router.post("/submit", async (req, res) => {
  try {
    const { formId, answers, user, location } = req.body;

    if (!formId || !user?.email || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "formId, user email, and answers are required." });
    }

    // Step 1: Find the form
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: "Form not found." });
    }

    // 🔒 Step 2: Check if the user already submitted the form
    const alreadySubmitted = form.responses.some(r => r.user.email === user.email);
    if (alreadySubmitted) {
      return res.status(409).json({
        success: false,
        message: "You have already submitted this form."
      });
    }

    // ✅ Step 3: Prepare the response with location
    const response = {
      user: {
        email: user.email
      },
      location: {
        place: location?.place || "Unknown",
        timestamp: location?.timestamp || new Date()
      },
      answers: answers.map((ans) => ({
        question: ans.question,
        answerType: ans.answerType,
        yesOrNo: ans.selectedAnswer || ans.yesOrNo || null,
        dropdownChoice: ans.dropdownChoice || null,
        dropdownYesOrNo: ans.dropdownYesOrNo || null,
        imageUri: ans.imageUri || null,
        textField: ans.textField || ""
      }))
    };

    // Step 4: Save the response
    form.responses.push(response);
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

  router.get('/forms/response-details', async (req, res) => {
  try {
    const forms = await Form.find();

    const allResponses = [];

    forms.forEach(form => {
      const formTitle = form.title;

      form.responses.forEach(response => {
        const userEmail = response.user?.email || "Unknown";
        const location = response.location || {};
        const place = location.place || "Unknown";
        const timestamp = location.timestamp || null;

        response.answers.forEach(answer => {
          allResponses.push({
            title: formTitle,
            question: answer.question,
            answer: answer.yesOrNo || answer.dropdownYesOrNo || null,
            dropdownChoice: answer.dropdownChoice || null,
            textField: answer.textField || "",
            imageUri: answer.imageUri || null,
            user: userEmail,
            location: {
              place,
              timestamp
            }
          });
        });
      });
    });

    res.status(200).json({ success: true, count: allResponses.length, data: allResponses });
  } catch (error) {
    console.error('Error fetching response details:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
router.get('/submitted-forms', async (req, res) => {
  try {
    // Find forms where responses array has at least one item
    const submittedForms = await Form.find({ 'responses.0': { $exists: true } }).select('title');

    const titles = submittedForms.map((form) => form.title);

    res.status(200).json({ submittedForms: titles });
  } catch (error) {
    console.error('Error fetching submitted forms:', error);
    res.status(500).json({ error: 'Failed to fetch submitted forms' });
  }
});
module.exports = router;
