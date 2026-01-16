import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const { factCheck } = await import("./factCheck.js");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  console.log("🟢 Connected:", socket.id);

  socket.on("TRANSCRIPT_FINAL", async (data) => {
    console.log("🎤 Claim:", data.text);

    try {
      const analysis = await factCheck(data.text);

      io.emit("FACT_RESULT", {
        speakerId: data.speakerId,
        claim: data.text,
        ...analysis,
        timestamp: Date.now()
      });
    } catch (err) {
      console.error("❌ Fact check error", err);
      io.emit("FACT_ERROR", {
        speakerId: data.speakerId,
        error: "Failed to process fact check"
      });
    }
  });

  socket.on("error", (error) => {
    console.error("⚠️ Socket error:", socket.id, error);
  });

  socket.on("disconnect", () => {
    console.log("🔌 Disconnected:", socket.id);
  });
});

server.listen(2000, () =>
  console.log("🚀 Server running at http://localhost:2000")
);
