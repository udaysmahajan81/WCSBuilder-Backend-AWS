import express from "express";

import {
  readJson,
  writeJson
}
from "../storage/jsonDB.js";

const router = express.Router();

router.get("/:projectId", async (req, res) => {

  const data = await readJson(
    `projects/${req.params.projectId}/measurements.json`,
    []
  );

  res.json(data);
});

router.post("/:projectId", async (req, res) => {

  await writeJson(
    `projects/${req.params.projectId}/measurements.json`,
    req.body
  );

  res.json({
    success: true
  });
});

export default router;