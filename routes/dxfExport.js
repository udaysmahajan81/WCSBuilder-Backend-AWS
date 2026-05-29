import express from "express";
//import pool from "../DB/db.js";
import Drawing from "dxf-writer";

const router = express.Router();

router.get("/layout/export-dxf/:projectId", async (req, res) => {
  const { projectId } = req.params;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM projectlayout WHERE ProjectID = ?",
      [projectId]
    );

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

      /* ================= CONVEYOR ================= */
      if (type === "Conveyor") {
        drawing.drawRect(x, y, w, h);
      }

      /* ================= SRM ================= */
      if (type === "SRM") {
        drawing.drawRect(x, y, w, h);
      }

      /* ================= ANNOTATIONS ================= */
      if (type === "ANNOTATION") {
        const subType = params.subType;

        if (subType === "RECT") {
          drawing.drawRect(x, y, w, h);
        }

        if (subType === "CIRCLE") {
          drawing.drawCircle(x + w / 2, y + h / 2, w / 2);
        }

        if (subType === "TEXT") {
          drawing.drawText(
            x,
            y,
            12,
            0,
            row.label_text || "TEXT"
          );
        }

        if (subType === "ARROW_RIGHT") {
          drawing.drawLine(x, y, x + w, y);
        }

        if (subType === "ARROW_LEFT") {
          drawing.drawLine(x + w, y, x, y);
        }

        if (subType === "ARROW_UP") {
          drawing.drawLine(x, y + h, x, y);
        }

        if (subType === "ARROW_DOWN") {
          drawing.drawLine(x, y, x, y + h);
        }
      }
    });

    const dxfString = drawing.toDxfString();

    res.setHeader("Content-Type", "application/dxf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=layout-${projectId}.dxf`
    );

    res.send(dxfString);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DXF export failed" });
  }
});

export default router;