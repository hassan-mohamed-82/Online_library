import express from "express";
import http from "http";
import { Server } from "socket.io";
import ApiRoute from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import { NotFound } from "./Errors";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { connectDB } from "./models/connection";
import path from "path";

dotenv.config();

const app = express();
connectDB();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: "*" }));
app.use(cookieParser());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// ===============================
// 🔥 الحل النهائي لملفات uploads
// ===============================
const uploadsDir = path.resolve(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsDir));
// ===============================

// Routes
app.use("/api", ApiRoute);

// Not found handler
app.use((req, res, next) => {
  throw new NotFound("Route not found");
});
app.use(errorHandler);

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

// Start server
server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
