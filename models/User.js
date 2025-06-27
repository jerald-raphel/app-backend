const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ["User", "Manager"], // Can extend with more roles if needed
    default: "User", // Default role is "user"
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
