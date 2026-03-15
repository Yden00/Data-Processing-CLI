import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Worker } from "node:worker_threads";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findLineStart(inputPath, approxStart) {
  return new Promise((resolve) => {
    const stream = fs.createReadStream(inputPath, {
      start: approxStart,
      end: approxStart + 1024,
    });
    let buf = "";
    stream.on("data", (chunk) => {
      buf += chunk.toString();
      const nlIdx = buf.indexOf("\n");
      if (nlIdx !== -1) {
        stream.destroy();
        resolve(approxStart + nlIdx + 1);
      }
    });
    stream.on("end", () => resolve(approxStart + buf.length));
    stream.on("close", () => {});
  });
}

function runWorker(inputPath, start, end) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      path.join(__dirname, "../workers/logWorker.js"),
      { workerData: { inputPath, start, end } },
    );
    worker.on("message", resolve);
    worker.on("error", reject);
  });
}

export async function logStats(inputPath, outputPath) {
  if (!fs.existsSync(inputPath)) {
    console.log("Operation failed");
    return;
  }

  const fileSize = fs.statSync(inputPath).size;
  const numWorkers = os.cpus().length;
  const chunkSize = Math.ceil(fileSize / numWorkers);

  const boundaries = [0];
  for (let i = 1; i < numWorkers; i++) {
    const approx = i * chunkSize;
    if (approx < fileSize) {
      boundaries.push(await findLineStart(inputPath, approx));
    }
  }
  boundaries.push(fileSize);

  const workerPromises = [];
  for (let i = 0; i < boundaries.length - 1; i++) {
    const start = boundaries[i];
    const end = boundaries[i + 1] - 1;
    if (start <= end) {
      workerPromises.push(runWorker(inputPath, start, end));
    }
  }

  const results = await Promise.all(workerPromises);

  const merged = {
    total: 0,
    levels: {},
    status: {},
    paths: {},
    responseTimeSum: 0,
  };

  for (const r of results) {
    merged.total += r.total;
    merged.responseTimeSum += r.responseTimeSum;
    for (const [k, v] of Object.entries(r.levels)) {
      merged.levels[k] = (merged.levels[k] || 0) + v;
    }
    for (const [k, v] of Object.entries(r.status)) {
      merged.status[k] = (merged.status[k] || 0) + v;
    }
    for (const [k, v] of Object.entries(r.paths)) {
      merged.paths[k] = (merged.paths[k] || 0) + v;
    }
  }

  const topPaths = Object.entries(merged.paths)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([p, count]) => ({ path: p, count }));

  const output = {
    total: merged.total,
    levels: merged.levels,
    status: merged.status,
    topPaths,
    avgResponseTimeMs:
      merged.total > 0
        ? Math.round((merged.responseTimeSum / merged.total) * 100) / 100
        : 0,
  };

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  return true;
}
