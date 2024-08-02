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
  const bufferCount = await exportedRedisClient.countClicksInTimeRange(userId);
  if (bufferCount >= 10) return res.status(429).json({ bufferCount });
  exportedRedisClient.addClick(now, userId);
  return res.status(200).json({ bufferCount });
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
//every 15 seconds, truncate the queue to the last 11 seconds
const interval = setInterval(async () => {
  //log the fac tthat we are truncating the queue, the current length of the queue, then log the new length after truncation
  console.log("Truncating queue...");
  const beforeLength = await exportedRedisClient.countClicksInTimeRange("", 0);
  console.log(`Queue length before truncation: ${beforeLength}`);
  const removed = await exportedRedisClient.truncateQueue(11000);
  const afterLength = await exportedRedisClient.countClicksInTimeRange("");
  console.log(
    `Queue length after truncation: ${afterLength}; removed ${removed} items`
  );
}, 15000);
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
