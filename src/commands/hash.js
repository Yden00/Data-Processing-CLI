import fs from "node:fs";
import crypto from "node:crypto";
import { pipeline } from "node:stream/promises";

const SUPPORTED = ["sha256", "md5", "sha512"];

export async function hash(inputPath, algorithm = "sha256", save = false) {
  if (!fs.existsSync(inputPath)) {
    console.log("Operation failed");
    return;
  }

  if (!SUPPORTED.includes(algorithm)) {
    console.log("Operation failed");
    return;
  }

  const hashObj = crypto.createHash(algorithm);

  try {
    await pipeline(fs.createReadStream(inputPath), hashObj);
  } catch {
    console.log("Operation failed");
    return;
  }

  const digest = hashObj.digest("hex");
  console.log(`${algorithm}: ${digest}`);

  if (save) {
    const savePath = inputPath + "." + algorithm;
    fs.writeFileSync(savePath, digest);
  }
  return true;
}
