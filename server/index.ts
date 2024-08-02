import express from "express";
import { exportedRedisClient } from "./redis";
const app = express();
import cors from "cors";

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/api/click/:userId", async (req, res) => {
  const now = new Date();
  const userId = req.params.userId;
  exportedRedisClient.addClick(now, userId);
  const bufferCount = await exportedRedisClient.countClicksInTimeRange(userId);
  console.log(`Fetched buffer count for user ${userId}: ${bufferCount}`);
  res.status(200).json({ bufferCount });
});
app.get("/api/count/", async (req, res) => {
  const count = await exportedRedisClient.getCount();
  res.json({ count });
});
app.get("/api/buffer/:userId", async (req, res) => {
  const userId = req.params.userId;
  const bufferCount = await exportedRedisClient.countClicksInTimeRange(userId);
  res.json({ bufferCount });
});
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
