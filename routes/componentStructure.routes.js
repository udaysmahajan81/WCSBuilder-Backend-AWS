import express from "express";

import {
  readJson
}
from "../storage/jsonDB.js";

const router = express.Router();

/* ============================= */
/* GET ALL COMPONENTS            */
/* ============================= */

router.get("/", async (req, res) => {

  try {

    const structure =
      await readJson(
        "componentstructure.json",
        {}
      );

    res.json(structure);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error:
        "Failed to load structure"
    });
  }
});

/* ============================= */
/* GET SINGLE FEATURE            */
/* ============================= */

router.get("/:feature", async (req, res) => {

  try {

    const {
      feature
    } = req.params;

    const structure =
      await readJson(
        "componentstructure.json",
        {}
      );

    const result =
      structure[feature];

    if (!result) {

      return res.status(404).json({

        error:
          "Feature not found"
      });
    }

    res.json(result);

  } catch (err) {

    console.error(err);

    res.status(500).json({

      error:
        "Failed to load structure"
    });
  }
});

export default router;