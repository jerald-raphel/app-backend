// const express = require("express");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const mongoose = require("mongoose");

// dotenv.config();
// const app = express();

// // Middleware
// app.use(express.json());
// app.use(cors());

// // Routes
// const managerRoutes = require("./routes/managerRoutes");
// const adminRoutes = require("./routes/adminRoutes");
// const userRoutes = require("./routes/userRoutes");
// const submissionRoutes = require("./routes/submissions");
// const formRoutes = require("./routes/formRoutes");
// const assignRoute = require("./routes/assign");
// app.use("/api/admin", adminRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/managers", managerRoutes);
// app.use("/submissions",submissionRoutes);
// app.use("/formRoutes",formRoutes);
// app.use("/assign",assignRoute)
// // MongoDB Connection
// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => console.log("MongoDB Connected"))
//     .catch(err => console.error(err));

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const User = require("./models/User");

dotenv.config();

const app = express();
const server = http.createServer(app);

// Setup Socket.IO with CORS
const io = new Server(server, {
  cors: { origin: "*" }, // Adjust in production
});

// 🧠 Store io in app for reuse in routes
app.locals.io = io;

// ✅ Middleware
app.use(express.json({ limit: "10mb" })); // To handle large base64 images
app.use(express.urlencoded({ extended: true })); // To handle form-data (e.g., file uploads)
app.use(cors());

// ✅ Debug: Log all incoming request bodies
app.use((req, res, next) => {
  if (req.method !== 'GET') {
    console.log("🟢 Incoming Request:", req.method, req.path);
    console.log("📦 Body:", req.body);
  }
  next();
});

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ✅ Socket.IO Connection
io.on("connection", async (socket) => {
  console.log("🔌 Client connected:", socket.id);

  try {
    const count = await User.countDocuments();
    socket.emit("userCountUpdated", { count });
  } catch (error) {
    console.error("❌ Error sending user count:", error);
  }

  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected:", socket.id);
  });
});

// ✅ Routes
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/managers", require("./routes/managerRoutes"));
app.use("/formRoutes", require("./routes/formRoutes"));
app.use("/assign", require("./routes/assign"));
app.use("/answer", require("./routes/answerRoutes"));
app.use("/barcode", require("./routes/barcode")); // for save and fetch
app.use("/barcode-scan", require("./routes/barcodeRoute")); // for verification
app.use("/location", require("./routes/locationRoute"));
// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
