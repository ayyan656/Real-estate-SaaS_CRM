import dotenv from "dotenv";
dotenv.config(); 
import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import session from "express-session";
import "./config/passport.js"; 
import passport from "passport";
import connectDB from "./db.js";
import userRoutes from "./routes/userRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  },
});
const PORT = process.env.PORT || 5000;

// CORS
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Connect DB
connectDB();

// Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// API
app.use("/api/users", userRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/auth", authRoutes);

// 404
app.use("*", (req, res) =>
  res.status(404).json({ message: "Route not found" })
);

server.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  // You can emit initial dashboard data here if needed
});

// Export io for use in controllers/routes
export { io };
