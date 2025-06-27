// const express = require("express");
// const bcrypt = require("bcrypt");
// const User = require("../models/User");
// const router = express.Router();

// // Route to Add a New User
// router.post("/add", async (req, res) => {
//   const { email, username, password, role } = req.body;

//   if (!email || !username || !password) {
//     return res.status(400).json({ error: "Please provide email, username, and password" });
//   }

//   try {
//     // Check if the user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ error: "User already exists" });
//     }

//     // Hash the password before saving
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create the new user
//     const newUser = new User({
//       email,
//       username,
//       password: hashedPassword,
//       role: role || "user", // Default role is "user"
//     });

//     await newUser.save();
//     res.status(201).json({ message: "User added successfully" });
//   } catch (error) {
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // Route to Get All Users (Example for Admin Use)
// router.get("/", async (req, res) => {
//   try {
//     const users = await User.find();
//     res.status(200).json(users);
//   } catch (error) {
//     console.error('Error fetching users:', error); // Log the error
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // Route to Update User Role (Admin Only)
// router.put("/updateRole/:id", async (req, res) => {
//   const { role } = req.body;

//   if (!role || !["user", "admin"].includes(role)) {
//     return res.status(400).json({ error: "Invalid role" });
//   }

//   try {
//     const user = await User.findById(req.params.id);

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     user.role = role;
//     await user.save();
//     res.status(200).json({ message: "User role updated successfully" });
//   } catch (error) {
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // Route to Delete a User (Admin Only)
// // Route to Delete a User (Admin Only)
// router.delete("/:email", async (req, res) => {
//   try {
//     // Option 1: Use findOneAndDelete (recommended)
//     const user = await User.findOneAndDelete({ email: req.params.email });

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     const io = req.app.locals.io;
//     const count = await User.countDocuments();
//     io.emit("userCountUpdated", { count });

//     res.status(200).json({ message: "User deleted successfully", count });
//   } catch (error) {
//     console.error("Delete user error:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// });


// router.get("/count", async (req, res) => {
//   try {
//     const count = await User.countDocuments();
//     res.status(200).json({ count });
//   } catch (error) {
//     console.error('Error fetching user count:', error);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// module.exports = router;




const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const router = express.Router();

// Route to Add a New User
router.post("/add", async (req, res) => {
  const { email, username, password, role } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ error: "Please provide email, username, and password" });
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      role: role || "user", // Default role is "user"
    });

    await newUser.save();

    // Emit updated user count to all connected clients
    const io = req.app.locals.io;
    const count = await User.countDocuments();
    io.emit("userCountUpdated", { count });

    res.status(201).json({ message: "User added successfully", count });
  } catch (error) {
    console.error("Add user error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Route to Get All Users (Example for Admin Use)
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: "Server error" });
  }
});

// Route to Update User Role (Admin Only)
router.put("/updateRole/:id", async (req, res) => {
  const { role } = req.body;

  if (!role || !["user", "admin"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.role = role;
    await user.save();
    res.status(200).json({ message: "User role updated successfully" });
  } catch (error) {
    console.error("Update role error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Route to Delete a User (Admin Only)
router.delete("/:email", async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ email: req.params.email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Emit updated user count after deletion
    const io = req.app.locals.io;
    const count = await User.countDocuments();
    io.emit("userCountUpdated", { count });

    res.status(200).json({ message: "User deleted successfully", count });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Route to Get Current User Count
router.get("/count", async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    console.error('Error fetching user count:', error);
    res.status(500).json({ error: "Server error" });
  }
});



router.get('/by-email/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select('username');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ username: user.username }); // ✅ return correct field
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
