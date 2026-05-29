
import express from "express";
//import { getDB } from "../services/dbManager.js";

const router = express.Router();

/* Get Status */
router.get("/status", async (req, res) => {
  try {
    const db = getDB();

    const [rows] = await db.execute(
      "SELECT SettingValue FROM system_settings WHERE SettingKey = 'SCADA_ENABLED'"
    );

    const enabled =
      rows.length && rows[0].SettingValue === "1";

    res.json({ enabled });
  } catch (err) {
    res.status(500).json({ enabled: false });
  }
});

/* Enable */
router.post("/enable", async (req, res) => {
  try {
    const db = getDB();

    await db.execute(
      "UPDATE system_settings SET SettingValue='1' WHERE SettingKey='SCADA_ENABLED'"
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

/* Disable */
router.post("/disable", async (req, res) => {
  try {
    const db = getDB();

    await db.execute(
      "UPDATE system_settings SET SettingValue='0' WHERE SettingKey='SCADA_ENABLED'"
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

export default router;