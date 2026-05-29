import express from "express";
//import pool from "../DB/db.js";

const router = express.Router();

router.get("/sensor-details/:categoryCode", async (req, res) => {
  const { categoryCode } = req.params;

  try {
    // 1️⃣ Category
    const [category] = await pool.query(
      "SELECT * FROM CategoryMaster WHERE CategoryCode = ?",
      [categoryCode]
    );

    if (!category.length) {
      return res.status(404).json({ message: "Category not found" });
    }

    // 2️⃣ Sensor Config
    const [sensorConfig] = await pool.query(
      "SELECT * FROM ConveyorSensorConfig WHERE CategoryCode = ?",
      [categoryCode]
    );

    if (!sensorConfig.length) {
      return res.json({
        CategoryCode: categoryCode,
        Description: category[0].Description,
        TotalSensors: 0,
        Sensors: []
      });
    }

    const sensorRow = sensorConfig[0];

    // 3️⃣ Active Sensors
    const activeSensors = Object.keys(sensorRow).filter(
      key => key !== "CategoryCode" && sensorRow[key] == 1
    );

    // 4️⃣ Get Positions (FULL DATA)
    let positions = [];
    if (activeSensors.length > 0) {
      const [posData] = await pool.query(
        "SELECT * FROM SensorPositionConfig WHERE SensorKey IN (?)",
        [activeSensors]
      );
      positions = posData;
    }

    // 5️⃣ Map FULL DETAILS
    const sensors = activeSensors.map(sensor => {
      const pos = positions.find(p => p.SensorKey === sensor);

      return {
        SensorKey: sensor,
        PositionType: pos ? pos.PositionType : null,
        OffsetX: pos ? pos.OffsetX : null,
        OffsetY: pos ? pos.OffsetY : null
      };
    });

    // 6️⃣ Final Response
    res.json({
      CategoryCode: category[0].CategoryCode,
      Description: category[0].Description,
      TotalSensors: sensors.length,
      Sensors: sensors
    });

  } catch (err) {
    console.error("Sensor API error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
export default router;