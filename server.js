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
const User = require("./models/User");  // Import User model to get count on connection

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" } // Adjust origin as needed in production
});

// Middleware
app.use(express.json());
app.use(cors());

// Store io in app.locals for use in routes
app.locals.io = io;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

// Socket.IO connection
io.on("connection", async (socket) => {
  console.log("Client connected:", socket.id);

  // Emit current user count immediately on connection
  try {
    const count = await User.countDocuments();
    socket.emit("userCountUpdated", { count });
  } catch (error) {
    console.error("Error sending user count on connection:", error);
  }

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Routes
const managerRoutes = require("./routes/managerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const formRoutes = require("./routes/formRoutes");
const assignRoute = require("./routes/assign");
//const responseRoutes = require("./routes/responseRoutes")
const answerRoutes = require("./routes/answerRoutes");
const barcode = require("./routes/barcode");
const barcodeRoute = require("./routes/barcodeRoute");

app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/managers", managerRoutes);
app.use("/formRoutes", formRoutes);
app.use("/assign", assignRoute);
//app.use("/responses",responseRoutes);
app.use("/answer", answerRoutes);
app.use("/barcode",barcode);
app.use('/barcode-scan', barcodeRoute);
// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
