const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const User = require('../models/User');
const Manager = require("../models/manager");

const router = express.Router();

// Admin Login Route
// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   // Find the admin by email
//   const admin = await Admin.findOne({ email });
//   if (!admin) {
//     return res.status(404).json({ message: "Admin not found. Please set up the admin first." });
//   }

//   // Compare the password with the hashed password in the database
//   const isMatch = await bcrypt.compare(password, admin.password);
//   if (!isMatch) {
//     return res.status(400).json({ message: "Invalid email or password" });
//   }

//   // Generate a token for the authenticated admin
//   const token = jwt.sign({ email: admin.email }, "your-secret-key", { expiresIn: "1h" });
//   res.status(200).json({ message: "Login successful", token });
// });






router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Find the admin by email
      const admin = await Admin.findOne({ email });
      if (admin) {
        // Compare the password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
          return res.status(400).json({ message: "Invalid email or password" });
        }
  
        // Generate a token for the authenticated admin
        const token = jwt.sign({ email: admin.email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: "1h" });
        return res.status(200).json({ message: "Login successful", token, role: 'admin' });
      }
  
      // Check if the email exists in the User collection
      const user = await User.findOne({ email });
      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: "Invalid email or password" });
        }
  
        // Generate a token for the authenticated user
        const token = jwt.sign({ email: user.email, role: 'user' }, process.env.JWT_SECRET, { expiresIn: "1h" });
        return res.status(200).json({ message: "Login successful", token, role: 'user' });
      }
  
      // Check if the email exists in the Manager collection
      const manager = await Manager.findOne({ email });
      if (manager) {
        const isMatch = await bcrypt.compare(password, manager.password);
        if (!isMatch) {
          return res.status(400).json({ message: "Invalid email or password" });
        }
  
        // Generate a token for the authenticated manager
        const token = jwt.sign({ email: manager.email, role: 'manager' }, process.env.JWT_SECRET, { expiresIn: "1h" });
        return res.status(200).json({ message: "Login successful", token, role: 'manager' });
      }
  
      return res.status(404).json({ message: "Email not found in any collection" });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "An error occurred during login. Please try again." });
    }
  });
  
// Check if admin exists
router.get("/check-admin", async (req, res) => {
  try {
    const admin = await Admin.findOne();
    if (admin) {
      return res.status(200).json({ adminExists: true });
    }
    return res.status(200).json({ adminExists: false });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Setup Admin credentials (first-time setup)
router.post("/setup-admin", async (req, res) => {
  const { email, password } = req.body;

  // Check if an admin already exists
  const existingAdmin = await Admin.findOne();
  if (existingAdmin) {
    return res.status(400).json({ message: "Admin credentials are already set." });
  }

  // Validate the email format (only Gmail addresses)
  const emailRegex = /^[a-z0-9]+@gmail\.com$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format. Please enter a valid Gmail address." });
  }

  // Hash the password before saving it to the database
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new admin document
  const newAdmin = new Admin({
    email,
    password: hashedPassword,
  });

  try {
    // Save the new admin to the database
    await newAdmin.save();
    res.status(201).json({ message: "Admin setup successful. You can now access the home screen." });
  } catch (error) {
    res.status(500).json({ message: "Failed to set up admin." });
  }
});

module.exports = router;
