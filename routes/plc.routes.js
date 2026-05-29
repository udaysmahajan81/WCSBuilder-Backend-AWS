import express from "express";
import {
  forceBit,
  getPlcStatus,
} from "../controllers/plc.controller.js";

const router = express.Router();

router.post("/plc/force", forceBit);
router.get("/plc/status/:id", getPlcStatus);

export default router;
