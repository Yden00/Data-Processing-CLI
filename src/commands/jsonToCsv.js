import fs from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

export async function jsonToCsv(inputPath, outputPath) {
  if (!fs.existsSync(inputPath)) {
    console.log("Operation failed");
    return;
  }

  let rawJson = "";

  const readStream = fs.createReadStream(inputPath, { encoding: "utf8" });
  readStream.on("data", (chunk) => (rawJson += chunk));

  await new Promise((resolve, reject) => {
    readStream.on("end", resolve);
    readStream.on("error", reject);
  });

  let data;
  try {
    data = JSON.parse(rawJson);
  } catch {
    console.log("Operation failed");
    return;
  }

  if (!Array.isArray(data) || data.length === 0) {
    console.log("Operation failed");
    return;
  }

  const headers = Object.keys(data[0]);
  const lines = [headers.join(",")];
  for (const obj of data) {
    lines.push(headers.map((h) => obj[h] ?? "").join(","));
  }

  const readable = Readable.from([lines.join("\n")]);

  try {
    await pipeline(readable, fs.createWriteStream(outputPath));
    return true;
  } catch {
    console.log("Operation failed");
  }
}
