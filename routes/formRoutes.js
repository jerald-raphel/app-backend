// const express = require("express");
// const router = express.Router();
// const Form = require("../models/"); // ✅ Ensure this matches your filename exactly

// // ✅ Create a new form
// router.post("/forms", async (req, res) => {
//   try {
//     const { title, questions } = req.body;

//     // Optional validation for dropdownChoice
//     for (const q of questions) {
//       if (q.answerType === "Dropdown" && !["Critical", "Zero Tolerance", "Major", "Minor"].includes(q.answer?.dropdownChoice)) {
//         return res.status(400).json({ error: "Invalid dropdownChoice value" });
//       }
//     }

//     const newForm = new Form({ title, questions });
//     await newForm.save();
//     res.status(201).json(newForm);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // ✅ Get all forms
// router.get("/forms", async (req, res) => {
//   try {
//     const forms = await Form.find().select("title questions createdAt");
//     if (!forms || forms.length === 0) {
//       return res.status(404).json({ message: "No forms found" });
//     }
//     res.json(forms);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // ✅ Get form count
// router.get("/forms/count", async (req, res) => {
//   try {
//     const count = await Form.countDocuments({ title: { $exists: true, $ne: "" } });
//     res.status(200).json({ count });
//   } catch (error) {
//     res.status(500).json({ message: "Failed to fetch form count", error: error.message });
//   }
// });

// // ✅ Get a single form by ID
// router.get("/forms/:id", async (req, res) => {
//   try {
//     const form = await Form.findById(req.params.id);
//     if (!form) {
//       return res.status(404).json({ message: "Form not found" });
//     }
//     res.json(form);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // ✅ Update a form
// router.put("/forms/:id", async (req, res) => {
//   try {
//     const { questions, title } = req.body;
//     const form = await Form.findById(req.params.id);

//     if (!form) {
//       return res.status(404).json({ message: "Form not found" });
//     }

//     if (title) form.title = title;

//     if (questions && Array.isArray(questions)) {
//       form.questions = questions.map((q, index) => {
//         const existing = form.questions[index] || {};

//         return {
//           question: q.question || existing.question,
//           answerType: q.answerType || existing.answerType,
//           answer: {
//             questionId: q._id || existing._id,
//             selectedAnswer: q.answerType === "Yes/No" ? q.selectedAnswer || null : null,
//             imageUri: q.answerType === "Upload Image" ? q.imageUri || null : null,
//             textField: q.answerType === "Upload Image" ? q.textField || null : null,
//             dropdownChoice: q.answerType === "Dropdown" ? q.dropdownChoice || null : null,
//           }
//         };
//       });
//     }

//     await form.save();
//     res.json(form);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // ✅ Delete a form
// router.delete("/forms/:id", async (req, res) => {
//   try {
//     const deleted = await Form.findByIdAndDelete(req.params.id);
//     if (!deleted) {
//       return res.status(404).json({ message: "Form not found" });
//     }
//     res.json({ message: "Form deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // ✅ Get question count
// router.get("/questions/count", async (req, res) => {
//   try {
//     const forms = await Form.find().select("questions");
//     if (!forms || forms.length === 0) {
//       return res.status(404).json({ message: "No questions found" });
//     }

//     const totalCount = forms.reduce((acc, form) => {
//       return acc + (form.questions?.length || 0);
//     }, 0);

//     res.status(200).json({ count: totalCount });
//   } catch (error) {
//     res.status(500).json({ message: "Failed to fetch questions count", error: error.message });
//   }
// });

// // ✅ Get all form titles/questions
// router.get("/", async (req, res) => {
//   try {
//     const forms = await Form.find({}, "title questions");
//     res.json(forms);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // ✅ Submit answers
// router.put("/forms/:id/submit-answers", async (req, res) => {
//   try {
//     const formId = req.params.id;
//     const { answers } = req.body;

//     if (!answers || !Array.isArray(answers)) {
//       return res.status(400).json({ error: "Answers array is required" });
//     }

//     const form = await Form.findById(formId);
//     if (!form) {
//       return res.status(404).json({ message: "Form not found" });
//     }

//     for (const ans of answers) {
//       const question = form.questions.id(ans.questionId);
//       if (!question) continue;

//       question.answer = {
//         questionId: ans.questionId,
//         selectedAnswer: ans.selectedAnswer || null,
//         imageUri: ans.imageUri || null,
//         textField: ans.textField || null,
//         dropdownChoice: ans.dropdownChoice || null,
//       };
//     }

//     await form.save();
//     res.json({ message: "Answers updated successfully", form });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// module.exports = router;



const express = require("express");
const router = express.Router();
const Form = require("../models/From");

// ✅ Create a new form
// router.post("/forms", async (req, res) => {
//   try {
//     const { title, questions } = req.body;
//     const newForm = new Form({ title, questions });
//     await newForm.save();
//     res.status(201).json(newForm);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });
router.post("/create", async (req, res) => {
  try {
    const { title, questions } = req.body;

    if (!title || !Array.isArray(questions)) {
      return res.status(400).json({ message: "Invalid form data." });
    }

    const form = new Form({ title, questions });
    await form.save();

    res.status(201).json({ message: "Form created successfully.", form });
  } catch (err) {
    console.error("Form creation error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});


// ✅ Get all forms
router.get("/forms", async (req, res) => {
  try {
    const forms = await Form.find().select("title questions createdAt");
    if (!forms || forms.length === 0) {
      return res.status(404).json({ message: "No forms found" });
    }
    res.json(forms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get a single form by ID
router.get("/forms/:id", async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }
    res.json(form);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get form count
router.get("/forms/count", async (req, res) => {
  try {
    const count = await Form.countDocuments({ title: { $exists: true, $ne: "" } });
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch form count", error: error.message });
  }
});

// ✅ Get total question count
router.get("/questions/count", async (req, res) => {
  try {
    const forms = await Form.find().select("questions");
    const totalCount = forms.reduce((acc, form) => {
      return acc + (form.questions?.length || 0);
    }, 0);
    res.status(200).json({ count: totalCount });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch questions count", error: error.message });
  }
});

// ✅ Update a form
router.put("/forms/:id", async (req, res) => {
  try {
    const { title, questions } = req.body;
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    if (title) form.title = title;
    if (questions && Array.isArray(questions)) {
      form.questions = questions;
    }

    await form.save();
    res.json(form);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Delete a form
router.delete("/forms/:id", async (req, res) => {
  try {
    const deleted = await Form.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Form not found" });
    }
    res.json({ message: "Form deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Submit or update answers for a form
router.put("/forms/:id/submit-answers", async (req, res) => {
  try {
    const formId = req.params.id;
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({ error: "Answers array is required" });
    }

    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    for (const ans of answers) {
      const question = form.questions.id(ans.questionId);
      if (!question) continue;

      const updatedAnswer = {
        questionId: ans.questionId,
        selectedAnswer: ans.selectedAnswer ?? null,
        dropdownChoice: ans.dropdownChoice ?? null,
        imageUri: ans.imageUri ?? null,
        textField: ans.textField ?? "",
      };

      question.answer = updatedAnswer;
    }

    await form.save();
    res.json({ message: "Answers updated successfully", form });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
