const mongoose = require("mongoose");

const managerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  designation: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    default: "manager", // Set default role to "manager"
  },
});

const Manager = mongoose.model("Manager", managerSchema);

module.exports = Manager;
