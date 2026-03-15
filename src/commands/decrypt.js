import fs from "node:fs";
import crypto from "node:crypto";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

export async function decrypt(inputPath, outputPath, password) {
  if (!fs.existsSync(inputPath)) {
    console.log("Operation failed");
    return;
  }

  const HEADER_SIZE = 28;
  const TAG_SIZE = 16;

  let headerBuffer = Buffer.alloc(0);
  let headerDone = false;
  let decipher = null;
  let tailBuffer = Buffer.alloc(0);

  const decryptTransform = new Transform({
    transform(chunk, _encoding, callback) {
      if (!headerDone) {
        headerBuffer = Buffer.concat([headerBuffer, chunk]);
        if (headerBuffer.length >= HEADER_SIZE) {
          const salt = headerBuffer.subarray(0, 16);
          const iv = headerBuffer.subarray(16, 28);
          const key = crypto.scryptSync(password, salt, 32);
          decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
          headerDone = true;
          tailBuffer = headerBuffer.subarray(HEADER_SIZE);
          headerBuffer = null;
        }
      } else {
        tailBuffer = Buffer.concat([tailBuffer, chunk]);
      }

      if (headerDone && tailBuffer.length > TAG_SIZE) {
        const toDecrypt = tailBuffer.subarray(0, tailBuffer.length - TAG_SIZE);
        tailBuffer = tailBuffer.subarray(tailBuffer.length - TAG_SIZE);
        try {
          this.push(decipher.update(toDecrypt));
        } catch (e) {
          return callback(e);
        }
      }

      callback();
    },

    flush(callback) {
      try {
        decipher.setAuthTag(tailBuffer);
        this.push(decipher.final());
        callback();
      } catch {
        callback(new Error("auth failed"));
      }
    },
  });

  try {
    await pipeline(
      fs.createReadStream(inputPath),
      decryptTransform,
      fs.createWriteStream(outputPath),
    );
    return true;
  } catch {
    console.log("Operation failed");
  }
}
