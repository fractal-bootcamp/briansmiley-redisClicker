import { raw } from "express";
import Redis from "ioredis";
const rawRedisClient = new Redis();

export const exportedRedisClient = {
  addClick: (time: Date, userId: string) => {
    const value = userId + ":" + time.getTime().toString();
    rawRedisClient.zadd("clicks", time.getTime(), value);
    rawRedisClient.incr("count");
  },
  /**Returns the number of clicks from the given user in the time range */
  countClicksInTimeRange: async (
    userId: string,
    milliseconds: number = 10000
  ) => {
    const startTime = Date.now() - milliseconds;
    const endTime = Date.now();
    const clicks = await rawRedisClient.zrangebyscore(
      "clicks",
      startTime,
      endTime
    );
    console.log(
      `startTime: ${startTime}, endTime: ${endTime},userId: ${userId}, clicks: ${clicks}`
    );
    return clicks.filter(click => click.startsWith(userId)).length;
  },
  getCount: async () => {
    const count = await rawRedisClient.get("count");
    return parseInt(count ?? "0");
  },
  truncateQueue: (range: number = 10000) => {
    //remove all clicks older than the given range
    const startTime = Date.now() - range;
    rawRedisClient.zremrangebyscore("clicks", "-inf", startTime);
  }
};
