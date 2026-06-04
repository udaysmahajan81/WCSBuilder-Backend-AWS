import express from "express";
import cors from "cors";
import fs from "fs";
import ini from "ini";
import nodes7 from "nodes7";

/* ===================== INTERNAL SERVICES ===================== */

//import plcService from "./services/plc.service.js";

//  import 
//  {
//  updateSimulatorValues
// } 
//  from "./services/plcSimulator.service.js";

//  import {
//  updatePLCValue,
//  getAllPLCValues
//  } 
//  from "./services/plcCache.service.js";

//import {
//  syncPalletInFromPLC
//} from "./services/syncPalletInFromPLC.js";

/* ===================== ROUTES ===================== */

import authRoutes from "./routes/auth.routes.js";

import scadaRoutes from "./routes/scadaimport.routes.js";

import scadaControlRoutes from "./routes/scadaControl.routes.js";

import processStateRoutes from "./routes/processState.routes.js";

import featureRoutes from "./routes/feature.routes.js";

import componentStructureRoute from "./routes/componentStructure.routes.js";

import componentParametersRoute from "./routes/componentParameters.routes.js";

import LayoutHandlingRoutes from "./routes/Layout.routes.js";

import projectRoutes from "./routes/project.routes.js";

//import dxfExport from "./routes/dxfExport.js";

//import exportBOM from "./routes/exportBOM.js";

//import processRoutes from "./routes/processLibraries.js";

import measurementsRoutes from "./routes/measurements.js";

import sensorRoutes from "./routes/sensor.routes.js";

import emailLayoutRoutes
from "./routes/emailLayout.routes.js";

import dotenv from "dotenv";

dotenv.config();
//console.log(process.env.GMAIL_PASS);
/* ===================== EXPRESS ===================== */

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://wcsbuilder-ui-aws.s3-website.ap-south-1.amazonaws.com"
    ],
    credentials: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "OPTIONS"
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization"
    ],
  })
);

app.use(express.json());

/* ===================== CONFIG ===================== */

const PORT = process.env.PORT || 5003;

const ENABLE_PLC = false;

const ENABLE_PLC_MEMORY = true;

const PLC_INI_PATH = "./config/plc.ini";

/* ===================== PLC STATE ===================== */

//let plcConn = null;

//let plcConfig = null;

//let tagsRegistered = false;

//if (ENABLE_PLC) {

//  plcConn = new nodes7();
//}

/* ===================== ROUTES ===================== */

//app.use("/api/mech", exportBOM);

app.use("/api/auth", authRoutes);

app.use("/api/projects", projectRoutes);

app.use("/api/features", featureRoutes);

app.use(
  "/api/component-structure",
  componentStructureRoute
);

app.use(
  "/api/component-parameters",
  componentParametersRoute
);

app.use("/api/scada", LayoutHandlingRoutes);

app.use("/api/scada", scadaRoutes);

app.use(
  "/api/scada-control",
  scadaControlRoutes
);

app.use(
  "/api/layout-email",
  emailLayoutRoutes
);

/*app.use(
  "/api/process-state",
  processStateRoutes
);

app.use(
  "/api/process-libraries",
  processRoutes
);

app.use("/api/scada", dxfExport);

app.use(
  "/api/measurements",
  measurementsRoutes
);

app.use("/api", sensorRoutes); 

/* ===================== PLC FORCE ===================== 

app.post("/api/plc/force", async (req, res) => {

  try {

    const { plc, values } = req.body;

    if (!plc || !Array.isArray(values)) {

      return res.status(400).json({
        error: "Invalid payload"
      });
    }

    await updateSimulatorValues(
      plc,
      values
    );

    if (ENABLE_PLC_MEMORY) {

      for (const item of values) {

        plcService.upsert(
          item.PLC,
          item.db,
          item.value
        );

        updatePLCValue(
          item.db,
          item.value
        );
      }
    }

    res.json({
      success: true,
      updated: values.length
    });

  } catch (err) {

    console.error(
      "PLC force error:",
      err
    );

    res.status(500).json({
      error: "PLC update failed"
    });
  }
});

===================== PLC MEMORY ===================== 

app.get("/api/plc-memory", (req, res) => {

  try {

    const memory =
      plcService.getAll();

    const result =
      Object.values(memory).map(
        item => ({

          DBAddress:
            item.dbAddress,

          DBValue:
            item.rawWord
        })
      );

    res.json(result);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Memory read failed"
    });
  }
});

 ===================== PLC VALUES ===================== 

app.get("/api/scada/values", (req, res) => {

  try {

    const values =
      getAllPLCValues();

    res.json(values);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error:
        "PLC memory read failed"
    });
  }
});

 ===================== PLC BY ID ===================== 

app.get("/api/plc/:cnv_id", (req, res) => {

  const data =
    plcService.get(req.params.cnv_id);

  if (!data) {

    return res.status(404).json({
      error: "Not found"
    });
  }

  res.json(data);
});

 ===================== PLC FUNCTIONS ===================== 

function loadPlcIni(path) {

  if (!fs.existsSync(path)) {

    throw new Error(
      "PLC INI file not found"
    );
  }

  const cfg = ini.parse(
    fs.readFileSync(path, "utf-8")
  );

  return {

    plc: {

      Name: cfg.PLC.Name,

      Version: cfg.PLC.Version,

      IP: cfg.PLC.IP,

      Rack: Number(cfg.PLC.Rack),

      Slot: Number(cfg.PLC.Slot)
    },

    addresses:
      cfg.DB_ADDRESSES || {}
  };
}

async function connectPLC() {

  if (!ENABLE_PLC) return;

  return new Promise(
    (resolve, reject) => {

      plcConn.initiateConnection(

        {
          host:
            plcConfig.plc.IP,

          port: 102,

          rack:
            plcConfig.plc.Rack,

          slot:
            plcConfig.plc.Slot
        },

        err =>
          err
            ? reject(err)
            : resolve()
      );
    }
  );
}
*/
async function readPLCAndStore() {

  if (!ENABLE_PLC) return;

  const tags =
    Object.keys(
      plcConfig.addresses
    );

  if (!tagsRegistered) {

    plcConn.setTranslationCB(
      tag => tag
    );

    plcConn.addItems(tags);

    tagsRegistered = true;
  }

  plcConn.readAllItems(
    async (err, values) => {

      if (err) {

        console.error(
          "PLC read error:",
          err.message
        );

        return;
      }

      try {

        for (const addr of tags) {

          updatePLCValue(
            addr,
            values[addr]
          );
        }

      } catch (e) {

        console.error(
          "PLC cache error:",
          e.message
        );
      }
    }
  );
}

/* ===================== STARTUP ===================== 

(async () => {

  try {

    if (ENABLE_PLC) {

      plcConfig =
        loadPlcIni(
          PLC_INI_PATH
        );

      await connectPLC();

      console.log(
        "PLC connected"
      );

      setInterval(
        readPLCAndStore,
        1000
      );
    }

    setInterval(
      syncPalletInFromPLC,
      1000
    );

  } catch (err) {

    console.error(
      "Startup failed:",
      err
    );
  }
})();

/* ===================== HEALTH ===================== */

app.get("/api/health", (req, res) => {

  res.json({

    status: "OK",

    time: new Date()
  });
});

/* ===================== ERROR HANDLER ===================== */

app.use((err, req, res, next) => {

  console.error(err);

  res.status(500).json({
    error:
      "Internal Server Error"
  });
});

/* ===================== START SERVER ===================== */

app.listen(PORT, () => {

  console.log(
    `WCS MASTER backend running on port ${PORT}`
  );
});

/* ===================== SHUTDOWN ===================== */

process.on("SIGINT", () => {

  console.log("Shutting down...");

  if (plcConn) {

    plcConn.dropConnection();
  }

  process.exit();
});