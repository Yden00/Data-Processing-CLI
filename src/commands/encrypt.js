import fs from "node:fs";
import crypto from "node:crypto";
import { pipeline } from "node:stream/promises";

export async function encrypt(inputPath, outputPath, password) {
  if (!fs.existsSync(inputPath)) {
    console.log("Operation failed");
    return;
  }

  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const key = crypto.scryptSync(password, salt, 32);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const writeStream = fs.createWriteStream(outputPath);
  writeStream.write(salt);
  writeStream.write(iv);

  try {
    await pipeline(fs.createReadStream(inputPath), cipher, writeStream);
    fs.appendFileSync(outputPath, cipher.getAuthTag());
    return true;
  } catch {
    console.log("Operation failed");
  }
}
