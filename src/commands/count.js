import fs, { existsSync } from "node:fs";

export async function count(filepath) {
  if (existsSync(filepath)) {
    const output = {
      lines: 0,
      words: 0,
      characters: 0,
    };
    const readable = fs.createReadStream(filepath, { highWaterMark: 16 });
    let leftover = "";
    return new Promise((resolve, reject) => {
      readable.on("data", (chunk) => {
        const raw = chunk.toString();
        const text = leftover + raw;
        const lines = text.split("\n");
        leftover = lines.pop();
        output.lines += lines.length;
        output.words += lines.reduce(
          (acc, curr) =>
            acc + curr.split(/\s+/).filter((el) => el != "").length,
          0,
        );
        output.characters += lines.reduce((acc, curr) => acc + curr.length, 0);
      });
      readable.on("end", () => {
        if (leftover) {
          output.lines += 1;
          output.words += leftover
            .split(/\s+/)
            .filter((el) => el !== "").length;
          output.characters += leftover.length;
        }
        resolve(output);
      });
      readable.on("error", () => reject());
    });
  } else {
    console.log("Operation failed");
    return false;
  }
}
