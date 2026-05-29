import express from "express";
//import { getDB } from "../services/dbManager.js";

const router = express.Router();

router.get("/import", async (req, res) => {
  try {
    const db = getDB();

    /* ================= SCADA ENABLE CHECK ================= */
    const [statusRows] = await db.execute(
      "SELECT SettingValue FROM system_settings WHERE SettingKey='SCADA_ENABLED'"
    );

    const enabled =
      statusRows.length && statusRows[0].SettingValue === "1";

    if (!enabled && req.user?.group === "Client") {
      return res.status(403).json({
        error: "SCADA not activated by installer"
      });
    }

    /* ================= LOAD LAYOUT ================= */
    const [layoutRows] = await db.execute(
      `SELECT item_type FROM LayoutObjs WHERE status = 'Active'`
    );

    const items = [];

    for (const row of layoutRows) {
      const table = row.item_type;
      const [rows] = await db.execute(`SELECT * FROM ${table}`);

      rows.forEach((r) => {
        const item = {
          id: r.id,
          type: table,
          cnv_id: r.cnv_id,
          x: r.x,
          y: r.y,
          width: r.width,
          height: r.height,
          rotation: r.rotation ?? 0,
          carriageX: r.carriage_x ?? 0,
          text: r.label_text ?? "",
          params: r.params_json ? JSON.parse(r.params_json) : {},
        };

        /* Only SRM has rack geometry */
        if (table === "SRM") {
          item.rack = {
            sections: r.rack_sections,
            bayWidth: r.rack_bay_width,
            height: r.rack_height,
            gap: r.rack_gap,
          };
        }

        items.push(item);
      });
    }

    /* ================= EQUIPMENT MAPPING ================= */
    const [equipRows] = await db.execute(`SELECT * FROM Equipmentmapping`);
    const equipmentMap = {};

    equipRows.forEach((row) => {
      const key = row.Source?.trim().toUpperCase();
      equipmentMap[key] = row;
    });

    /* ================= PLC DB MAPPING ================= */
    const [plcRows] = await db.execute(`SELECT * FROM PLCDB`);
    const plcMap = {};

    plcRows.forEach((row) => {
      const key = row.EquipmentID?.trim().toUpperCase();

      if (!plcMap[key]) plcMap[key] = {};

      plcMap[key][row.DataType] = {
        address: row.DBAddress,
        value: row.DBValue,
      };
    });

    /* ================= MERGE ================= */
    const merged = items.map((item) => {
      if (!item.cnv_id) {
        return { ...item, equipment: null, plc: null };
      }

      const key = item.cnv_id.trim().toUpperCase();

      return {
        ...item,
        equipment: equipmentMap[key] || null,
        plc: plcMap[key] || null,
      };
    });

    /* ================= AUTO ENABLE AFTER FIRST IMPORT ================= */
    await db.execute(
      "UPDATE system_settings SET SettingValue='1' WHERE SettingKey='SCADA_ENABLED'"
    );

    res.json(merged);

  } catch (err) {
    console.error("IMPORT SCADA ERROR:", err.message);
    res.status(500).json({ error: "Import failed" });
  }
});

export default router;