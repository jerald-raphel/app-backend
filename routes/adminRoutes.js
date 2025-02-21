const express = require('express');
const User = require('../models/User');
const router = express.Router();
const bcrypt = require('bcrypt');

// Route for creating a new user

router.post('/create-user', async (req, res) => {
  const { name, number, email, password } = req.body;

  // Ensure all required fields are provided
  if (!name || !number || !email || !password) {
    return res.status(400).json({ message: 'All fields (name, number, email, password) are required' });
  }

  try {
    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create the new user with plain-text password
    const newUser = new User({ name, number, email, password });

    // Save the user to the database
    await newUser.save();

    return res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error creating user', error });
  }
});


router.get('/users', async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find();

    // If no users are found
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    // Return the users
    return res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching users', error });
  }
});
// Update user details
router.put('/users/:id', async (req, res) => {
  const { name, number, email } = req.body;

  // Validate input
  if (!name || !number || !email) {
    return res.status(400).json({ message: 'Name, number, and email are required' });
  }

  try {
    // Find the user by ID and update
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, number, email },
      { new: true }  // This ensures that the updated document is returned
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating user', error });
  }
});

// Delete user by ID
router.delete('/users/:id', async (req, res) => {
  try {
    // Find the user by ID and delete
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting user', error });
  }
});




module.exports = router;
