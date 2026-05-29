import express from "express";
//import pool from "../DB/db.js";

const router = express.Router();

/* ===================== PROCESS STATE ===================== */

router.get("/:sourceId", async (req, res) => {

  try {

    const [rows] = await pool.execute(

      `
      SELECT Status
      FROM srmqueue
      WHERE SourceID = ?
      ORDER BY SrNo DESC
      LIMIT 1
      `,
      [req.params.sourceId]

    );


    if (!rows.length) {

      return res.json({

        state: "Idle"

      });

    }


    const status = rows[0].Status;


    if (status === "Active") {

      return res.json({

        state: "Triggered"

      });

    }


    if (status === "Executing") {

      return res.json({

        state: "Executing"

      });

    }


    res.json({

      state: "Idle"

    });

  }

  catch (err) {

    console.error(err);

    res.json({

      state: "Idle"

    });

  }

});


export default router;