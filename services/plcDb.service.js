//import pool from "../DB/db.js";

export async function upsertPlcValue(plc, address, dataType, value) {
  await pool.execute(
    `
    INSERT INTO PLCDB
      (PLCName, PLCIP, Rack, Slot, middleware, DataType, DBValue)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      DBValue = VALUES(DBValue),
      updatedAt = CURRENT_TIMESTAMP
    `,
    [
      plc.Name,
      plc.IP,
      plc.Rack,
      plc.Slot,
      address,
      dataType || "WORD",
      value ?? 0
    ]
  );
}
