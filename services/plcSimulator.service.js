// plcSimulator.service.js
//import pool from "../DB/db.js";

export async function updateSimulatorValues(plc, values) {
  for (const item of values) {
    const [result] = await pool.execute(
      `
      UPDATE PLCDB
      SET DBValue = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE DBAddress = ?
      `,
      [
        item.value,
        item.db
      ]
    );

    // 🔍 DEBUG (TEMPORARY)
    if (result.affectedRows === 0) {
      console.warn(
        "No row updated for",
        item.db
      );
    }
  }
}
