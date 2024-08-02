import express from "express";
import { redisClient } from "./redis";
const app = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/api/zadd", (req, res) => {
  const { key, value } = req.body;
  redisClient.zadd(key, value, (err, reply) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(reply);
    }
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
