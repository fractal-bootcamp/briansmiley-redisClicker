import express from "express";
import { exportedRedisClient } from "./redis";
const app = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/api/click", (req, res) => {
  const body = req.body;
  const { user, timeStamp } = body;
  exportedRedisClient.addClick(timeStamp, user);
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
