import express from "express";

import {
  getUserFeatures
}
from "../controllers/feature.controller.js";

const router = express.Router();

router.get(
  "/",
  getUserFeatures
);

export default router;
