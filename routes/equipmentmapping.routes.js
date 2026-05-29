import express from "express";

import {
  readJson,
  writeJson
}
from "../storage/jsonDB.js";

const router = express.Router();

router.post("/save", async (req, res) => {

  try {

    const mappings = await readJson(
      "equipmentmapping.json",
      []
    );

    const exists = mappings.find(
      m =>
        m.LibraryName === req.body.libraryName &&
        m.Source === req.body.source
    );

    if (exists) {

      return res.status(409).json({
        error: "Mapping already exists"
      });
    }

    const newItem = {

      SrNo: Date.now(),

      LibraryName: req.body.libraryName,

      Source: req.body.source,

      Destination:
        req.body.destination || null,

      LUID: "0",

      Status: "Idle",

      Parameter1:
        req.body.parameter1 || null,

      Parameter2:
        req.body.parameter2 || null,

      Parameter3:
        req.body.parameter3 || null,

      Parameter4:
        req.body.parameter4 || null,

      Parameter5:
        req.body.parameter5 || null
    };

    mappings.push(newItem);

    await writeJson(
      "equipmentmapping.json",
      mappings
    );

    res.json({
      success: true
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Save failed"
    });
  }
});

export default router;