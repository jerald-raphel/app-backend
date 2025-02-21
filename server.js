const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require('./routes/adminRoutes');
const formRoutes = require('./routes/formRoutes')
const app = express();

app.use(express.json()); // For parsing application/json
app.use("/api/auth", authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/',formRoutes)
mongoose.connect("mongodb+srv://jerald-raphel:Jerald07@cluster0.iiysasz.mongodb.net/", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.log("❌ MongoDB connection error:", err));

app.listen(5000, () => {
  console.log(`🚀 Server running on port 5000`);
});
