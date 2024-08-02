import { raw } from "express";
import Redis from "ioredis";
const rawRedisClient = new Redis();

export const exportedRedisClient = {
  addClick: (time: Date, userId: string) => {
    rawRedisClient.zadd("clicks", time.getTime(), userId);
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
    return clicks.filter(click => click === userId).length;
  },
  getCount: () => {
    return rawRedisClient.get("count");
  },
  truncateQueue: (range: number = 10000) => {
    //remove all clicks older than the given range
    const startTime = Date.now() - range;
    rawRedisClient.zremrangebyscore("clicks", 0, startTime);
  }
};
