import express from "express";
import db from "./db/db.js";
import authRouter from "./routes/auth.routes.js";
import postsRouter from "./routes/posts.routes.js";
import uploadsRouter from "./routes/uploads.routes.js";
import commentsRouter from "./routes/comments.routes.js";
import usersRouter from "./routes/users.routes.js";
import chatRouter from "./routes/chat.routes.js";
import groupsRouter from "./routes/groups.routes.js";
import groupsPostsRouter from "./routes/group-posts.routes.js";
import notificationsRouter from "./routes/notifications.routes.js";
import groupNotificationsRouter from "./routes/groups-notifications.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import http from "http";
import { Server } from "socket.io";
import path from "path";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['https://knowlee-fw4c.onrender.com'],
    // origin: true,
    credentials: true,
    
  },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(
  cors({
    origin: ['https://knowlee-fw4c.onrender.com'],
    // origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/", authRouter);
app.use("/", postsRouter);
app.use("/", uploadsRouter);
app.use("/", commentsRouter);
app.use("/", usersRouter);
app.use("/", chatRouter);
app.use("/", groupsRouter);
app.use("/", groupsPostsRouter);
app.use("/", notificationsRouter);
app.use("/", groupNotificationsRouter);

// app.get('/cambiar-contraseña/:token', (req, res) => {
//   console.log(req)
//   proxy.web(req, res, { target: 'https://knowlee-fw4c.onrender.com' });
// });

server.listen(4321, () => {
  // SOCKET.IO
  io.on("connection", (socket) => {
    socket.on("message", (message) => {
      io.emit("message", message);
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
});

