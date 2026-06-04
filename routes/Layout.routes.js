import express from "express";

import {
  readJson,
  writeJson
}
from "../storage/jsonDB.js";

const router = express.Router();

router.post(
"/save/:projectId",
async (req, res) => {

  try {

    const { projectId } = req.params;

    const {
      items,
      floorPlan
    } = req.body;

    const payload = {
      projectId,
      floorPlan,
      items,
      updatedAt:
        new Date().toISOString()
    };

    await writeJson(
      `projects/${projectId}/${projectId}_layout.json`,
      payload
    );

    res.json({
      success: true
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Layout save failed"
    });
  }
});

router.get(
"/layout/import/:projectId",
async (req, res) => {

  try {

    const layout = await readJson(
      `projects/${req.params.projectId}/${req.params.projectId}_layout.json`,
      {
        items: [],
        floorPlan: null
      }
    );

    res.json(layout);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Import failed"
    });
  }
});

export default router;