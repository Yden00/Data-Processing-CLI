import fs from "node:fs";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

export async function csvToJson(inputPath, outputPath) {
  if (!fs.existsSync(inputPath)) {
    console.log("Operation failed");
    return false;
  }

  let headers = null;
  let leftover = "";
  let isFirstObject = true;

  function processLine(stream, line) {
    const trimmed = line.trim();
    if (!trimmed) return;

    if (headers === null) {
      headers = trimmed.split(",");
    } else {
      const values = trimmed.split(",");
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = values[i] ?? "";
      });

      const jsonStr = JSON.stringify(obj);

      if (isFirstObject) {
        stream.push("[\n  " + jsonStr);
        isFirstObject = false;
      } else {
        stream.push(",\n  " + jsonStr);
      }
    }
  }

  const csvTransform = new Transform({
    decodeStrings: true,

    transform(chunk, _encoding, callback) {
      const text = leftover + chunk.toString();
      const lines = text.split("\n");
      leftover = lines.pop();

      for (const line of lines) {
        processLine(this, line);
      }

      callback();
    },

    flush(callback) {
      if (leftover.trim()) {
        processLine(this, leftover);
      }

      if (isFirstObject) {
        this.push("[]");
      } else {
        this.push("\n]");
      }

      callback();
    },
  });

  try {
    await pipeline(
      fs.createReadStream(inputPath),
      csvTransform,
      fs.createWriteStream(outputPath),
    );
    return true;
  } catch {
    console.log("Operation failed");
    return false;
  }
}
