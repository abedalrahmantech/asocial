import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "refresh trending hashtags",
  { minutes: 15 },
  internal.cronHandlers.refreshTrending,
);

export default crons;
