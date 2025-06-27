const express = require("express");
const bcrypt = require("bcrypt");
const Manager = require("../models/manager");
const router = express.Router();
const User = require('../models/User');
const jwt = require("jsonwebtoken");

// Add manager (existing)
router.post("/manageradd", async (req, res) => {
  const { name, designation, email, password, role } = req.body;

  if (!name || !designation || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newManager = new Manager({
      name,
      designation,
      email,
      password: hashedPassword,
      role,
    });

    await newManager.save();

    res.status(201).json({ message: "Manager added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to add manager", error: error.message });
  }
});

// Add user or manager depending on role (existing)
router.post("/add", async (req, res) => {
  const { name, designation, email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: "Email, password, and role are required" });
  }

  const emailRegex = /^[a-z0-9]+@gmail\.com$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists as a User" });
    }

    const existingManager = await Manager.findOne({ email });
    if (existingManager) {
      return res.status(400).json({ message: "Email already exists as a Manager" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let newEntity;
    let responseMessage;

    if (role === "Manager") {
      newEntity = new Manager({
        name,
        designation,
        email,
        password: hashedPassword,
        role,
      });
      responseMessage = "Manager added successfully";
    } else if (role === "User") {
      newEntity = new User({
        username: name,
        email,
        password: hashedPassword,
        role,
      });
      responseMessage = "User added successfully";
    } else {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    await newEntity.save();

    const token = jwt.sign(
      { id: newEntity._id, role: newEntity.role, email: newEntity.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: responseMessage,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add user/manager", error: error.message });
  }
});

// Get all managers (existing)
router.get("/", async (req, res) => {
  try {
    const managers = await Manager.find();
    res.status(200).json(managers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch managers", error: error.message });
  }
});
router.get("/count", async (req, res) => {
  try {
    const count = await Manager.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch managers count", error: error.message });
  }
});
// Delete manager by email (new route)
router.delete("/:email", async (req, res) => {
  try {
    const deletedManager = await Manager.findOneAndDelete({ email: req.params.email });

    if (!deletedManager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    res.status(200).json({ message: "Manager deleted successfully" });
  } catch (error) {
    console.error("Delete manager error:", error);
    res.status(500).json({ message: "Failed to delete manager", error: error.message });
  }
});

module.exports = router;
