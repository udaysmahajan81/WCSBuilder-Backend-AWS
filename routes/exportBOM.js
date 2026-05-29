import express from "express";
import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
//import pool from "../DB/db.js";
import verifyToken from "../middleware/auth.middleware.js";
import Drawing from "dxf-writer";

const router = express.Router();

router.post("/export-bom", verifyToken, async (req, res) => {
  try {
    const { projectNo, projectId } = req.body;
    const departmentId = req.user.departmentId;

    /* ================= GET DEPARTMENT ================= */

    const [dept] = await pool.execute(
      "SELECT DepartmentName FROM departments WHERE DepartmentID = ?",
      [departmentId],
    );

    const departmentName = dept[0].DepartmentName;

    /* ================= FOLDER ================= */

    const deptFolder = path.join(process.cwd(), projectNo, departmentName);

    fs.mkdirSync(deptFolder, { recursive: true });

    /* ================= CREATE EXCEL ================= */

    const bomName = `${projectNo}_${departmentName}.xlsx`;
    const bomPath = path.join(deptFolder, bomName);

    const workbook = new ExcelJS.Workbook();

    //   const sheet = workbook.addWorksheet("BOM");

    // const automationSheet = workbook.addWorksheet("Automation");

    let Mechanicalsheet;
    let automationSheet;

    if (departmentName === "Mechanical") {
      Mechanicalsheet = workbook.addWorksheet("Mechanical BOM");
    }

    /* ================= PROJECT HEADER ================= */

    const bomNumber = "BOM-" + Math.floor(100000 + Math.random() * 900000);

    /* ================= GET LAYOUT ================= */

    const [rows] = await pool.query(
      "SELECT * FROM projectlayout WHERE ProjectID = ?",
      [projectId],
    );

    /* ==============================================================
       MECHANICAL BOM GENERATION
       ============================================================== */

    if (departmentName === "Mechanical") {
      Mechanicalsheet.addRow([`Project : ${projectNo}`]);
      Mechanicalsheet.addRow([`BOM No : ${bomNumber}`]);
      Mechanicalsheet.addRow([]);

      const headerRow = Mechanicalsheet.addRow([
        "ComponentType",
        "Equipment",
        "Motor & Drawing No.",
        "Chain & Drawing No.",
        "Roller & Drawing No.",
        "Leg & Drawing No.",
        "Frame & Drawing No.",
      ]);

      headerRow.font = { bold: true };

      headerRow.alignment = {
        vertical: "middle",
        horizontal: "center",
      };

      for (const row of rows) {
        if (!row.cnv_id) continue;

        let params = {};

        if (row.params_json) {
          if (typeof row.params_json === "string") {
            try {
              params = JSON.parse(row.params_json);
            } catch (err) {
              console.log("JSON parse error:", err);
            }
          } else {
            params = row.params_json;
          }
        }

        console.log("Row Params:", params);

        const typeId = params?.conveyor_type;

        if (!typeId) continue;

        const length = params?.dynamicParameters?.length || row.width || 0;

        const [rules] = await pool.execute(
          `SELECT 
            p.PartName,
            p.DrawingNo,
            r.QtyFactor,
            r.FixedQty
           FROM Component_BOM_Rules r
           JOIN MechanicalParts p ON r.PartID = p.PartID
           WHERE r.StructureID = ?`,

          [typeId],
        );

        console.log("type id :", typeId, "rules:", rules);

        const partMap = {
          Motor: { qty: 0, drawing: "" },
          Chain: { qty: 0, drawing: "" },
          Roller: { qty: 0, drawing: "" },
          Leg: { qty: 0, drawing: "" },
          Frame: { qty: 0, drawing: "" },
        };

        for (const rule of rules) {
          const qty = Math.ceil(
            (length / 1000) * rule.QtyFactor + rule.FixedQty,
          );

          if (partMap.hasOwnProperty(rule.PartName)) {
            partMap[rule.PartName] = {
              qty: qty,
              drawing: rule.DrawingNo || "N/A",
            };
          }
        }

        Mechanicalsheet.addRow([
          row.ItemType,
          row.cnv_id,
          `${partMap.Motor.qty} | ${partMap.Motor.drawing}`,
          `${partMap.Chain.qty} | ${partMap.Chain.drawing}`,
          `${partMap.Roller.qty} | ${partMap.Roller.drawing}`,
          `${partMap.Leg.qty} | ${partMap.Leg.drawing}`,
          `${partMap.Frame.qty} | ${partMap.Frame.drawing}`,
        ]);
      }
    }

    /* ==============================================================
       AUTOMATION SENSOR LIST
  ==============================================================
*/
    let sensorSheet;
    let macrosSheet;
    let plcSheet;
    if (departmentName === "Automation") {
      let params = {};

      if (departmentName === "Automation") {
        sensorSheet = workbook.addWorksheet("Sensors");
        macrosSheet = workbook.addWorksheet("EPLAN Macros");
        plcSheet = workbook.addWorksheet("PLC Program");
      }

      [sensorSheet, macrosSheet, plcSheet].forEach((sheet) => {
        const r1 = sheet.addRow([`Project : ${projectNo}`]);
        const r2 = sheet.addRow([`BOM No : ${bomNumber}`]);
        sheet.addRow([]);

        r1.font = { bold: true };
        r2.font = { bold: true };
      });

      /* ===== HEADERS ===== */

      const sensorHeader = sensorSheet.addRow([
        "ComponentType",
        "Equipment",
        "MHE Sensor",
        "Pallet Sensor",
        "Fork Sensor",
        "Barcode Sensor",
      ]);

      sensorHeader.font = { bold: true };
      sensorHeader.alignment = { horizontal: "center" };

      const macrosHeader = macrosSheet.addRow([
        "ComponentType",
        "Equipment",
        "Macros Name",
      ]);

      macrosHeader.font = { bold: true };

      const plcHeader = plcSheet.addRow([
        "ComponentType",
        "Equipment",
        "PLC Function",
      ]);

      plcHeader.font = { bold: true };

      for (const row of rows) {
        try {
          if (!row || !row.cnv_id) continue;

          /* ================= SAFE PARAMS ================= */
          let params = {};

          if (row.params_json) {
            try {
              params =
                typeof row.params_json === "string"
                  ? JSON.parse(row.params_json)
                  : row.params_json;
            } catch (err) {
              console.log("Invalid JSON:", row.params_json);
              params = {};
            }
          }

          let CategoryID;

          if (row.ItemType === "Conveyor") {
            CategoryID = params?.conveyor_category || -1; // 👈 define in DB
          }

          if (row.ItemType === "SRM") {
            CategoryID = 100; // 👈 define in DB
          }

          if (row.ItemType === "PANEL") {
            CategoryID = 200; // 👈 define in DB
          }

          /* fallback */
          if (!CategoryID) {
            CategoryID = -1;
          }

          /* ================= SENSOR ================= */

          let sensors = {
            mhe: 0,
            pallet: 0,
            fork: 0,
            barcode: 0,
          };

          let sensorRules = [];
          try {
            const result = await pool.execute(
              `SELECT SensorType, QtyFactor, FixedQty
         FROM Automation_Sensor_Rules
         WHERE CategoryID = ?`,
              [CategoryID],
            );
            sensorRules = result[0] || [];
          } catch (err) {
            console.log("Sensor query error:", err);
          }

          for (const rule of sensorRules) {
            const qty = Math.ceil((rule.QtyFactor || 0) + (rule.FixedQty || 0));

            if (rule.SensorType === "MHE") sensors.mhe = qty;
            if (rule.SensorType === "PALLET") sensors.pallet = qty;
            if (rule.SensorType === "FORK") sensors.fork = qty;
            if (rule.SensorType === "BARCODE") sensors.barcode = qty;
          }

          /* ================= INSERT SENSOR ================= */
          sensorSheet.addRow([
            row.ItemType || "",
            row.cnv_id || "",
            sensors.mhe,
            sensors.pallet,
            sensors.fork,
            sensors.barcode,
          ]);

          /* ================= MaCROS ================= */
          let macrosRules = [];
          try {
            const result = await pool.execute(
              `SELECT MacrosType, Qty 
         FROM Automation_Macros_Rules 
         WHERE CategoryID = ?`,
              [CategoryID],
            );
            macrosRules = result[0] || [];
          } catch (err) {
            console.log("Macros query error:", err);
          }

          if (macrosRules.length === 0) {
            macrosSheet.addRow([row.ItemType || "", row.cnv_id || "", "N/A"]);
          } else {
            macrosRules.forEach((m, index) => {
              macrosSheet.addRow([
                row.ItemType || "",
                row.cnv_id || "",
                `${m.MacrosType}-${index + 1}`,
              ]);
            });
          }

          macrosHeader.font = { bold: true };
          macrosHeader.alignment = { horizontal: "center" };

          /* ================= PLC ================= */

          let plcRules = [];
          try {
            const result = await pool.execute(
              `SELECT PLCFunction 
         FROM Automation_PLC_Rules 
         WHERE CategoryID = ?`,
              [CategoryID],
            );
            plcRules = result[0] || [];
          } catch (err) {
            console.log("PLC query error:", err);
          }

          if (plcRules.length === 0) {
            plcSheet.addRow([row.ItemType || "", row.cnv_id || "", "N/A"]);
          } else {
            plcRules.forEach((p) => {
              plcSheet.addRow([
                row.ItemType || "",
                row.cnv_id || "",
                p.PLCFunction,
              ]);
            });
          }
        } catch (err) {
          console.error("❌ Error processing row:", row, err);
        }
      }
    }

    /* ================= TABLE BORDER ================= */

    const applyBorders = (sheet) => {
      if (!sheet) return;
      sheet.eachRow((row, rowNumber) => {
        if (rowNumber < 4) return; // skip project header rows

        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });
    };

    if (sensorSheet) applyBorders(sensorSheet);
    if (macrosSheet) applyBorders(macrosSheet);
    if (plcSheet) applyBorders(plcSheet);
    if (Mechanicalsheet) applyBorders(Mechanicalsheet);

    /* ================= WRITE EXCEL ================= */

    await workbook.xlsx.writeFile(bomPath);

    /* ================= DXF EXPORT ================= */

    const drawing = new Drawing();

    rows.forEach((row) => {
      let params = {};

      if (row.params_json) {
        try {
          params = JSON.parse(row.params_json);
        } catch {}
      }

      const x = row.x;
      const y = row.y;
      const w = row.width;
      const h = row.height;
      const type = row.ItemType;

      if (type === "Conveyor" || type === "SRM") {
        drawing.drawRect(x, y, w, h);
      }

      if (type === "ANNOTATION") {
        const subType = params.subType;

        if (subType === "RECT") drawing.drawRect(x, y, w, h);

        if (subType === "CIRCLE")
          drawing.drawCircle(x + w / 2, y + h / 2, w / 2);

        if (subType === "TEXT")
          drawing.drawText(x, y, 12, 0, row.label_text || "TEXT");
      }
    });

    const dxfName = `${projectNo}_${departmentName}.dxf`;

    const dxfPath = path.join(deptFolder, dxfName);

    fs.writeFileSync(dxfPath, drawing.toDxfString());

    console.log("BOM + DXF Exported");

    res.json({
      success: true,
      bom: bomPath,
      dxf: dxfPath,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({ error: "Export failed" });
  }
});

export default router;
