import { workerData, parentPort } from "node:worker_threads";
import fs from "node:fs";
import readline from "node:readline";

const { inputPath, start, end } = workerData;

const stats = {
  total: 0,
  levels: {},
  status: {},
  paths: {},
  responseTimeSum: 0,
};

const stream = fs.createReadStream(inputPath, { start, end });
const rl = readline.createInterface({ input: stream });

rl.on("line", (line) => {
  const parts = line.split(" ");
  if (parts.length < 7) return;

  const level = parts[1];
  const statusCode = parseInt(parts[3]);
  const responseTimeMs = parseFloat(parts[4]);
  const urlPath = parts[6];

  stats.total++;

  stats.levels[level] = (stats.levels[level] || 0) + 1;

  let statusClass;
  if (statusCode >= 200 && statusCode < 300) statusClass = "2xx";
  else if (statusCode >= 300 && statusCode < 400) statusClass = "3xx";
  else if (statusCode >= 400 && statusCode < 500) statusClass = "4xx";
  else if (statusCode >= 500 && statusCode < 600) statusClass = "5xx";
  if (statusClass) stats.status[statusClass] = (stats.status[statusClass] || 0) + 1;

  stats.paths[urlPath] = (stats.paths[urlPath] || 0) + 1;
  stats.responseTimeSum += responseTimeMs || 0;
});

rl.on("close", () => {
  parentPort.postMessage(stats);
});
