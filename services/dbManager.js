import mysql from "mysql2/promise";
import fs from "fs";
import ini from "ini";

let pool = null;

export async function initDBFromIni() {
  const configText = fs.readFileSync("./config/DBConn.ini", "utf-8");
  const parsed = ini.parse(configText);

  const dbConfig = parsed.DATABASE;

  pool = mysql.createPool({
    host: dbConfig.Host,
    user: dbConfig.User,
    password: dbConfig.Password,
    database: dbConfig.Database,
    waitForConnections: true,
    connectionLimit: 10,
  });

  const conn = await pool.getConnection();
  await conn.ping();
  conn.release();

  console.log("✅ DB auto-connected from INI");
}

export function getDB() {
  if (!pool) throw new Error("DB not initialized");
  return pool;
}