import express from "express";
//import pool from "../DB/db.js";

const router = express.Router();
router.post("/save", async (req, res) => {
  try {
    const {
      libraryName,
      source,
      destination,
      parameter1,
      parameter2,
      parameter3,
      parameter4,
      parameter5,
    } = req.body;

    const requiresDestination = ["PALLET_IN", "PALLET_OUT"];

    // ✅ Basic validation
    if (!libraryName || !source) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (requiresDestination.includes(libraryName) && !destination) {
      return res.status(400).json({ error: "Destination required" });
    }

    const finalDestination = destination || null;

    // ✅ Prevent duplicates
    const [existing] = await pool.execute(
      `
      SELECT SrNo FROM equipmentmapping
      WHERE LibraryName = ? AND Source = ?
      `,
      [libraryName, source]
    );

    if (existing.length) {
      return res.status(409).json({
        error: "Mapping already exists",
      });
    }

    // ✅ Insert
    const [result] = await pool.execute(
      `
      INSERT INTO equipmentmapping
      (LibraryName, Source, Destination, LUID, Status, Parameter1, Parameter2, Parameter3, Parameter4, Parameter5)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        libraryName,
        source,
        finalDestination,
        "0",
        "Idle",
        parameter1 || null,
        parameter2 || null,
        parameter3 || null,
        parameter4 || null,
        parameter5 || null,
      ]
    );

    res.json({
      success: true,
      insertedId: result.insertId,
    });

  } catch (err) {
    console.error("DB INSERT ERROR:", err);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
