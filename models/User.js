const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the user schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Hash the password before saving the user document
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Only hash the password if it has been modified

  try {
    const salt = await bcrypt.genSalt(10); // Generate a salt with 10 rounds
    this.password = await bcrypt.hash(this.password, salt); // Hash the password using the salt
    next();
  } catch (error) {
    next(error);
  }
});

// Add a method to compare passwords during login
userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password); // Compare the input password with the hashed password
};

// Create and export the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
