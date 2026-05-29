import express from "express";
import mysql from "mysql2/promise";

const router = express.Router();

router.get("/check-db", async (req, res) => {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "YOUR_PASSWORD",
    });

    const [rows] = await connection.query(`
      SHOW DATABASES LIKE 'WCS_DB'
    `);

    if (rows.length > 0) {
      return res.json({ installed: true });
    }

    return res.json({ installed: false });

  } catch (err) {
    console.error(err);
    res.status(500).json({ installed: false });
  } finally {
    if (connection) await connection.end();
  }
});

export default router;