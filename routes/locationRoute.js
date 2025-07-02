const express = require("express");
const router = express.Router();
const Form = require("../models/From");

router.post("/submit", async (req, res) => {
  try {
    const { formId, user, answers, location } = req.body;

    if (!formId || !user?.email || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ success: false, message: "Form not found" });
    }

    // Check if user has already submitted the form
    const alreadySubmitted = form.responses.some((r) => r.user.email === user.email);
    if (alreadySubmitted) {
      return res.status(409).json({ success: false, message: "Form already submitted by this user" });
    }

    // Add new response with location
    const newResponse = {
      user,
      location: {
        place: location?.place || "Unknown", // fallback if missing
        timestamp: location?.timestamp || new Date(),
      },
      answers,
    };

    form.responses.push(newResponse);
    await form.save();

    return res.status(200).json({ success: true, message: "Answers submitted successfully" });
  } catch (error) {
    console.error("Submit error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

module.exports = router;
