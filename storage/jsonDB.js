import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

function sanitizeJson(obj) {

  return JSON.parse(
    JSON.stringify(
      obj,
      (key, value) => {

        if (
          typeof value === "number" &&
          isNaN(value)
        ) {
          return null;
        }

        if (value === undefined) {
          return null;
        }

        if (value === Infinity) {
          return null;
        }

        return value;
      }
    )
  );
}

export async function readJson(file, defaultValue = null) {
  try {
    const filePath = path.join(DATA_DIR, file);

    console.log("READING FILE:", filePath);

    const data = await fs.readFile(filePath, "utf8");

    console.log("FILE FOUND");

    return JSON.parse(data);

  } catch (err) {

    console.log("READ ERROR:", err.message);

    return defaultValue;
  }
}
export async function writeJson(file, data) {

  const filePath = path.join(DATA_DIR, file);

  await ensureDir(path.dirname(filePath));

  const cleanData = sanitizeJson(data);

  await fs.writeFile(
    filePath,
    JSON.stringify(cleanData, null, 2),
    "utf8"
  );
}