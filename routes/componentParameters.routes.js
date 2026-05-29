import express from "express";

import { readJson }
from "../storage/jsonDB.js";

const router = express.Router();

router.get(
"/:feature/:type/:category",
async (req, res) => {

  try {

    const {
      feature,
      type,
      category
    } = req.params;

    const allParams = await readJson(
      "componentparameters.json",
      {}
    );

    const params =
      allParams?.[feature]
               ?. [type]
               ?. [category]
               ?.Parameters || [];

    res.json(params);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Parameter load failed"
    });
  }
});

export default router;