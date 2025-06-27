const express = require("express");
const router = express.Router();
const Assignment = require("../models/Assignment");
const User = require("../models/User");
const Form = require("../models/From");
//const Response = require("../models/Response")
// POST /api/assign
router.post('/', async (req, res) => {
  const { userId, formId } = req.body;

  try {
    const user = await User.findById(userId);
    const form = await Form.findById(formId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    console.log("User found:", user);
    console.log("Form found:", form);

    const newAssignment = new Assignment({
      userId: user._id,
      username: user.username,      // make sure this exists
      formId: form._id,
      formTitle: form.title         // make sure this exists
    });

    await newAssignment.save();

    res.status(201).json({ message: "Assignment saved", assignment: newAssignment });
  } catch (error) {
    console.error("Error in /assign route:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router.post("/assign", async (req, res) => {
  const { userId, formId } = req.body;

  try {
    const user = await User.findById(userId);
    const form = await Form.findById(formId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // ✅ Check if the user is already assigned
    // const isUserAssigned = await Assignment.findOne({ userId });
    // if (isUserAssigned) {
    //   return res.status(400).json({ message: "User is already assigned" });
    // }

    // ✅ Check if the form is already assigned
    const isFormAssigned = await Assignment.findOne({ formId });
    if (isFormAssigned) {
      return res.status(400).json({ message: "Form is already assigned" });
    }

    const newAssignment = new Assignment({
      userId: user._id,
      username: user.username,
      formId: form._id,
      formTitle: form.title,
    });

    await newAssignment.save();

    res.status(201).json({ message: "Assignment saved", assignment: newAssignment });
  } catch (error) {
    console.error("Error in /assign route:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/assigned-users", async (req, res) => {
  try {
    const assignments = await Assignment.find().select("username");

    if (!assignments || assignments.length === 0) {
      return res.status(404).json({ message: "No assignments found" });
    }

    const usernames = assignments.map(a => a.username);
    res.status(200).json({ usernames });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch assigned users", error: error.message });
  }
});
router.get("/assigned-forms", async (req, res) => {
  try {
    const assignments = await Assignment.find().select("formTitle");

    if (!assignments || assignments.length === 0) {
      return res.status(404).json({ message: "No assignments found" });
    }

    const formTitles = assignments.map(a => a.formTitle);
    res.status(200).json({ formTitles });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch assigned forms", error: error.message });
  }
});
router.get("/assigned-user-forms", async (req, res) => {
  try {
    const assignments = await Assignment.find().select("username formTitle");

    if (!assignments || assignments.length === 0) {
      return res.status(404).json({ message: "No assignments found" });
    }

    const result = assignments.map(a => ({
      user: a.username,
      assigned: a.formTitle
    }));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch assigned user-forms", error: error.message });
  }
});
router.get("/assigned-users/count", async (req, res) => {
  try {
    const userCount = await Assignment.countDocuments();
    res.status(200).json({ count: userCount });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch assigned user count", error: error.message });
  }
});
router.get("/assigned-forms/count", async (req, res) => {
  try {
    const formCount = await Assignment.countDocuments();
    res.status(200).json({ count: formCount });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch assigned form count", error: error.message });
  }
});
router.get("/unassigned-users", async (req, res) => {
  try {
    const assignedUserIds = await Assignment.distinct("userId");
    const unassignedUsers = await User.find({ _id: { $nin: assignedUserIds } }).select("username");

    if (!unassignedUsers || unassignedUsers.length === 0) {
      return res.status(404).json({ message: "No unassigned users found" });
    }

    res.status(200).json(unassignedUsers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch unassigned users", error: error.message });
  }
});
router.get("/unassigned-forms", async (req, res) => {
  try {
    const assignedFormIds = await Assignment.distinct("formId");
    const unassignedForms = await Form.find({ _id: { $nin: assignedFormIds } }).select("title");

    if (!unassignedForms || unassignedForms.length === 0) {
      return res.status(404).json({ message: "No unassigned forms found" });
    }

    res.status(200).json(unassignedForms);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch unassigned forms", error: error.message });
  }
});
router.delete("/assign/delete/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const deleted = await Assignment.deleteMany({ username });

    if (deleted.deletedCount === 0) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.status(200).json({ message: "Assignment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete assignment", error: error.message });
  }
});
router.delete('/delete-by-form/:formTitle', async (req, res) => {
  try {
    const { formTitle } = req.params;
    const result = await Assignment.findOneAndDelete({ formTitle });
    if (!result) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    res.status(200).json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete assignment', error: error.message });
  }
});
// router.get('/user/:email', async (req, res) => {
//   try {
//     const userEmail = req.params.email;

//     // Find user by email
//     const user = await User.findOne({ email: userEmail });
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Find assignments and populate formId with title, _id, and questions (with question and answerType fields)
//     const assignments = await Assignment.find({ userId: user._id }).populate({
//       path: 'formId',
//       select: 'title _id questions', // Include questions
//     });

//     const result = assignments.map((assignment) => ({
//       formId: assignment.formId._id,
//       formTitle: assignment.formId.title,
//       assignmentId: assignment._id,
//       questions: assignment.formId.questions.map(q => ({
//         _id: q._id,
//         question: q.question,
//         answerType: q.answerType,
//       })),
//     }));

//     res.json(result);
//   } catch (error) {
//     console.error('Error fetching user assignments:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });


router.get('/user/:email', async (req, res) => {
  try {
    const { email } = req.params;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Find assignments and populate form data
    const assignments = await Assignment.find({ userId: user._id }).populate({
      path: 'formId',
      select: 'title _id questions',
    });

    // Build response
    const result = assignments
      .filter(a => a.formId)
      .map(a => ({
        formId: a.formId._id,
        formTitle: a.formId.title,
        assignmentId: a._id,
        questions: (a.formId.questions || []).map(q => ({
          _id: q._id,
          question: q.question,
          answerType: q.answerType,

          // ✅ Include stored selected dropdown choice
          dropdownChoice: q.dropdownChoice || null,

          // ✅ Include dropdownYesNoAnswer if needed
          dropdownYesNoAnswer: q.dropdownYesNoAnswer || null,

          // ✅ Include imageUri and textField if applicable
          imageUri: q.imageUri || null,
          textField: q.textField || '',

          // ✅ Include selected Yes/No if present
          yesNoAnswer: q.yesNoAnswer || null,
        })),
      }));

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching user assignments:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


router.get('/user/:email/count', async (req, res) => {
  try {
    const userEmail = req.params.email;

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find assignments for the user
    const assignments = await Assignment.find({ userId: user._id });

    // Return only the count
    res.json({ assignedFormCount: assignments.length });
  } catch (error) {
    console.error('Error fetching assigned form count:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/user/:email/assignments-with-response', async (req, res) => {
  try {
    const { email } = req.params;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all assignments for this user
    const assignments = await Assignment.find({ userId: user._id });

    // Get all submitted form titles from Response collection (all users)
    const submittedForms = await Response.find().distinct('formTitle');

    // Build assignments array with hasResponse based on submittedForms array
    const assignmentsWithResponseStatus = assignments.map((assignment) => {
      const hasResponse = submittedForms.includes(assignment.formTitle);
      return {
        assignmentId: assignment._id,
        formTitle: assignment.formTitle,
        hasResponse,
      };
    });

    res.json({
      email,
      assignmentsCount: assignments.length,
      assignments: assignmentsWithResponseStatus,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get("/assigned-users-email", async (req, res) => {
  try {
    // Fetch all assignments and select only the 'email' field
    const assignments = await Assignment.find().select("email -_id"); 
    // "-_id" excludes the MongoDB _id field from results

    if (!assignments || assignments.length === 0) {
      return res.status(404).json({ message: "No assignments found" });
    }

    // Extract emails from assignments
    const emails = assignments.map(a => a.email);

    res.status(200).json({ emails }); // returning array of emails only
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch assigned user emails", error: error.message });
  }
});



module.exports = router;
