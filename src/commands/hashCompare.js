import fs from "node:fs";
import crypto from "node:crypto";
import { pipeline } from "node:stream/promises";

const SUPPORTED = ["sha256", "md5", "sha512"];

export async function hashCompare(inputPath, hashPath, algorithm = "sha256") {
  if (!fs.existsSync(inputPath) || !fs.existsSync(hashPath)) {
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
  const expected = fs.readFileSync(hashPath, "utf8").trim().toLowerCase();

  console.log(digest.toLowerCase() === expected ? "OK" : "MISMATCH");
  return true;
}
