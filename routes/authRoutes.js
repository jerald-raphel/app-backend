const express = require('express');
const router = express.Router();
const Detail = require('../models/UserModel');  // Import the Detail model
const User = require('../models/User');
const mongoose = require('mongoose');
const Form = require('../models/Form');

// Now you can use the Form model here



const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET; // You should store this in environment variables

router.get("/user/:email", async (req, res) => {
  const { email } = req.params;
  
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
router.post('/add', async (req, res) => {
  const { email, password, details } = req.body;
  
  try {
    // Check if the number already exists in the collection
    const existingNumber = await Detail.findOne({ 'details.number': details.number });

    if (existingNumber) {
      return res.status(400).json({ message: 'The number already exists in the database.' });
    }

    const existingUser = await Detail.findOne({ email });

    if (existingUser) {
      // If the user exists, add the details
      existingUser.details.push(details);
      await existingUser.save();
      return res.status(200).json({ message: 'Details added successfully' });
    }

    // If the user does not exist, create a new user and add details
    const newUser = new Detail({ email, password, details: [details] });
    await newUser.save();
    res.status(200).json({ message: 'User created and details added' });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred while processing the request.' });
  }
});



// routes.js

router.get('/answers', async (req, res) => {
  try {
    const { number } = req.query; // Get number from query parameters

    // If 'number' is provided, find details with that number
    const filter = number ? { 'details.number': number } : {};

    // Fetch details with their answers
    const details = await Detail.find(filter).populate({
      path: 'details.answers',
      model: 'Answer', // Ensure the correct model is referenced
    });

    if (!details || details.length === 0) {
      return res.status(404).json({ message: 'No details found' });
    }

    res.status(200).json(details);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred while fetching answers.' });
  }
});
router.get('/d/:email', async (req, res) => {
  try {
    const { email } = req.params; // Get email from URL parameters

    // Find details for the provided email
    const details = await Detail.find({ email })  // Search for the email at the parent level
      .populate({
        path: 'details.answers',  // Populate answers within the details
        model: 'Answer',  // Ensure the Answer model is used to populate the answers
      });

    if (!details || details.length === 0) {
      return res.status(404).json({ message: 'No details found for the provided email' });
    }

    res.status(200).json(details);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred while fetching answers.' });
  }
});


// routes.js
router.get('/getDetails', async (req, res) => {
  try {
    const { number } = req.query;  // Get the 'number' from the query parameters

    let filter = {};
    if (number) {
      filter = { 'details.number': number };  // If 'number' is provided, filter by it
    }

    // Fetch details based on 'number' (if provided) and populate the answers and associated questions
    const userDetails = await User.find(filter)
      .populate({
        path: 'details.answers.questionId',  // Populate 'questionId' in answers
        model: 'Question',                   // Model to populate from
        select: 'question'                   // Select the 'question' field only
      })
      .select('details')  // Only select the 'details' field (including answers)
      .exec();            // Explicitly call exec to handle promises

    if (!userDetails || userDetails.length === 0) {
      return res.status(404).json({ message: 'User details not found' });
    }

    // Format the details and include the populated question
    const formattedDetails = userDetails.map(user => {
      return user.details.map(detail => {
        return {
          name: detail.name,
          answers: detail.answers.map(answer => {
            return {
              question: answer.questionId ? answer.questionId.question : "No question",  // Ensure the question is populated
              answer: answer.answer
            };
          })
        };
      });
    }).flat();

    res.status(200).json(formattedDetails);  // Return the formatted details with questions and answers
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred while fetching details.' });
  }
});






// routes.js

router.get('/data', async (req, res) => {
  try {
    // Get all users with their details, excluding answers
    const usersDetails = await Detail.find({}, { 'details.answers': 0 }); // This will exclude the 'answers' field in 'details'

    if (!usersDetails || usersDetails.length === 0) {
      return res.status(404).json({ message: 'No details found' });
    }

    res.status(200).json(usersDetails); // Send only the details data without the answers
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred while fetching the details.' });
  }
});


// Route to store answers (responses) to a specific form and question
router.post("/responses", async (req, res) => {
  try {
    const { formId, questionId, answer } = req.body;

    // Validate if the required data is present
    if (!formId || !questionId || answer === undefined) {
      return res.status(400).json({ error: "formId, questionId, and answer are required" });
    }

    // Check if the form and question exist in the database
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    // Create a new response for the specific question in the form
    const newResponse = new Response({
      formId,
      questionId,
      answer
    });

    // Save the response to the database
    await newResponse.save();

    // Respond with the created response
    res.status(201).json(newResponse);
  } catch (error) {
    console.error("Error saving response: ", error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET: Retrieve all surveys for a specific detail by number
router.get('/details/:number/surveys', async (req, res) => {
  const { number } = req.params;

  try {
    // Find the user who has the detail with the given number
    const user = await Detail.findOne({ 'details.number': number });

    if (!user) {
      return res.status(404).json({ message: 'Detail not found' });
    }

    // Find the specific detail entry
    const detail = user.details.find(d => d.number === number);

    if (!detail || !detail.surveys) {
      return res.status(200).json({ surveys: [] });
    }

    res.status(200).json({ surveys: detail.surveys });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred while processing the request.' });
  }
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Basic email and password validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Compare the password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { email: user.email, name: user.name, number: user.number },
      process.env.JWT_SECRET,  // Make sure JWT_SECRET is set in your .env file
      { expiresIn: '1h' }  // Token expires in 1 hour
    );

    // Return success response
    res.status(200).json({
      message: 'Login successful',
      token,
      user: { name: user.name, email: user.email, number: user.number }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Admin Login Route - Specifically for 'admin@gmail.com' and '000000'
// Admin login route for 'admin@gmail.com' and password '000000'
router.post('/admin-login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (email === 'admin@gmail.com' && password === '000000') {
      console.log('Admin login successful');
      return res.status(200).json({ message: 'Admin login successful', isAdmin: true });
    }
    return res.status(400).json({ message: 'Invalid admin credentials' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});




router.post('/details/:number/survey', async (req, res) => {
  try {
    // Find the detail by the number parameter
    const detail = await Detail.findOne({ 'details.number': req.params.number });

    if (!detail) {
      return res.status(404).json({ error: 'Detail not found' });
    }

    // Check if the answers array is passed in the request body
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Answers are required in the correct format' });
    }

    // Loop through the answers array and check if each question exists
    for (let i = 0; i < answers.length; i++) {
      const { question, answer } = answers[i];

      // Find the form containing the question
      const form = await Form.findOne({ 'questions.question': question });
      if (!form) {
        return res.status(404).json({ error: `Form containing the question '${question}' not found` });
      }

      // Find the corresponding question within the form
      const questionRecord = form.questions.find(q => q.question === question);

      if (!questionRecord) {
        return res.status(404).json({ error: `Question '${question}' not found in the form` });
      }

      // Check if the question has already been answered
      let questionAnswered = false;
      detail.details.forEach(detailItem => {
        if (detailItem.number === req.params.number) {
          const existingAnswerIndex = detailItem.answers.findIndex(
            (ans) => ans.questionId.toString() === questionRecord._id.toString()
          );

          // If the answer exists, update it
          if (existingAnswerIndex !== -1) {
            detailItem.answers[existingAnswerIndex].answer = answer;
            detailItem.answers[existingAnswerIndex].updatedAt = new Date();
            questionAnswered = true;
          } else {
            // If the answer doesn't exist, push it
            detailItem.answers.push({
              questionId: questionRecord._id,
              answer,
              question: questionRecord.question,  // Using the actual question text from the Question model
              answerType: questionRecord.answerType,  // Adding answer type (Yes/No or Upload Image)
              selectedAnswer: questionRecord.selectedAnswer,  // Storing selected answer if any
              imageUri: questionRecord.imageUri,  // Storing image URI if available
              formId: form._id  // Adding formId to answer
            });
          }
        }
      });

      // If the question was answered and updated, skip adding the answer again
      if (questionAnswered) continue;
    }

    // Save the updated detail record
    await detail.save();

    // Return the updated detail
    res.status(200).json(detail);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});



// GET route to get answers for a specific survey by detail number and formId
router.get('/details/:number/survey', async (req, res) => {
  try {
    // Find the detail by the number parameter
    const detail = await Detail.findOne({ 'details.number': req.params.number });

    if (!detail) {
      return res.status(404).json({ error: 'Detail not found' });
    }

    // Get all the questions from the form
    const form = await Form.findOne();
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // Get all the questions from the form
    const unansweredQuestions = form.questions.filter(q => {
      // Check if the question has already been answered
      return !detail.details.some(detailItem => {
        return detailItem.answers.some(answer => answer.questionId.toString() === q._id.toString());
      });
    });

    // Return the unanswered questions
    res.status(200).json({ unansweredQuestions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to update survey answers for a specific form and user
router.put('/details/:number/survey/:formId', async (req, res) => {
  try {
    const { number, formId } = req.params;
    const { selectedAnswer, imageUri } = req.body;  // Fields to be updated for the survey

    // Validate if the formId is valid
    if (!mongoose.Types.ObjectId.isValid(formId)) {
      return res.status(400).json({ error: 'Invalid formId' });
    }

    // Find the user and form details
    const updatedDocument = await Main.findOneAndUpdate(
      { 'details.number': number, 'details.surveys.formId': formId },
      {
        $set: {
          'details.$.surveys.$[survey].selectedAnswer': selectedAnswer,
          'details.$.surveys.$[survey].imageUri': imageUri
        }
      },
      {
        new: true,
        runValidators: true,
        arrayFilters: [{ 'survey.formId': mongoose.Types.ObjectId(formId) }]  // This ensures we update the correct survey answer
      }
    );

    if (!updatedDocument) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    return res.status(200).json(updatedDocument);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


