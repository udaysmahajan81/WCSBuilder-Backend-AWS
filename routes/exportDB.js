import express from "express";
//import pool from "../DB/db.js";

const router = express.Router();

router.get("/export-db/:projectId", async (req, res) => {
  const { projectId } = req.params;

  try {
    let sql = "-- WCS Viewer Export\n\n";

    /* =========================
       GET ALL TABLES
    ========================= */
    const [tables] = await pool.query(`SHOW TABLES`);

    for (const row of tables) {
      const tableName = Object.values(row)[0];

      /* =========================
         1️⃣ TABLE STRUCTURE
      ========================= */
      const [createTable] = await pool.query(
        `SHOW CREATE TABLE \`${tableName}\``,
      );

      sql += `-- Table: ${tableName}\n`;
      sql += createTable[0]["Create Table"] + ";\n\n";

      /* =========================
         2️⃣ TABLE DATA (FILTERED)
      ========================= */

      let query = `SELECT * FROM \`${tableName}\``;
      let params = [];

      if (projectId && projectId !== "all") {
        /* 🎯 PROJECT FILTER LOGIC */

        if (tableName === "projects") {
          query = `SELECT * FROM projects WHERE ProjectID = ?`;
          params = [projectId];
        } else if (tableName === "projectlayout") {
          query = `SELECT * FROM projectlayout WHERE ProjectID = ?`;
          params = [projectId];
        } else if (tableName === "Equipmentmapping") {
          query = `
            SELECT * FROM Equipmentmapping 
            WHERE Source IN (
              SELECT cnv_id FROM projectlayout WHERE ProjectID = ?
            )
          `;
          params = [projectId];
        } else if (tableName === "PLCDB") {
          query = `
            SELECT * FROM PLCDB 
            WHERE EquipmentID IN (
              SELECT cnv_id FROM projectlayout WHERE ProjectID = ?
            )
          `;
          params = [projectId];
        } else {
          // ✅ IMPORTANT: EXPORT FULL DATA for all other tables
          query = `SELECT * FROM \`${tableName}\``;
          params = [];
        }
      }

      const [rows] = await pool.query(query, params);

      if (rows.length) {
        const columns = Object.keys(rows[0]).join(", ");

        rows.forEach((r) => {
          const values = Object.values(r)
            .map((v) =>
              v === null ? "NULL" : `'${String(v).replace(/'/g, "''")}'`,
            )
            .join(", ");

          sql += `INSERT INTO \`${tableName}\` (${columns}) VALUES (${values});\n`;
        });

        sql += "\n";
      }
    }

    /* =========================
       3️⃣ STORED PROCEDURES
    ========================= */
    if (!projectId || projectId === "all") {
      const [procedures] = await pool.query(
        `SHOW PROCEDURE STATUS WHERE Db = DATABASE()`,
      );

      for (const proc of procedures) {
        const [createProc] = await pool.query(
          `SHOW CREATE PROCEDURE \`${proc.Name}\``,
        );

        sql += `-- Procedure: ${proc.Name}\n`;
        sql += createProc[0]["Create Procedure"] + ";\n\n";
      }
    }

    /* =========================
       4️⃣ TRIGGERS
    ========================= */
    if (!projectId || projectId === "all") {
      const [triggers] = await pool.query(`SHOW TRIGGERS`);

      for (const trg of triggers) {
        const [createTrigger] = await pool.query(
          `SHOW CREATE TRIGGER \`${trg.Trigger}\``,
        );

        sql += `-- Trigger: ${trg.Trigger}\n`;
        sql += createTrigger[0]["SQL Original Statement"] + ";\n\n";
      }
    }

    /* =========================
       DOWNLOAD FILE
    ========================= */

    const fileName =
      projectId && projectId !== "all"
        ? `WCS_PROJECT_${projectId}.sql`
        : `WCS_FULL_EXPORT.sql`;

    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

    res.setHeader("Content-Type", "text/plain");

    res.send(sql);
  } catch (err) {
    console.error("EXPORT ERROR:", err);
    res.status(500).json({ error: "Export failed" });
  }
});

export default router;
