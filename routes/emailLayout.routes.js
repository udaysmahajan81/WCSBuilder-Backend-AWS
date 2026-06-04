import express from "express";
import nodemailer from "nodemailer";

import { readJson } from "../storage/jsonDB.js";

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "udays.mahajan81@gmail.com",
    pass: "ueuv hssa dtex kyqp",
  },
});

router.post("/send-layout", async (req, res) => {
  try {
    const { projectId, email } = req.body;

    const projects = await readJson("projects/projects.json", []);

    const project = projects.find((p) => p.ProjectID === Number(projectId));

    if (!project) {
      return res.status(404).json({
        error: "Project not found",
      });
    }

    const layout = await readJson(
      `projects/${projectId}/${projectId}_layout.json`,
      null,
    );

    if (!layout) {
      return res.status(404).json({
        error: "Layout not found",
      });
    }

    await transporter.sendMail({
      from: process.env.GMAIL_USER,

      to: email,

      subject: `${project.ProjectName} Layout File`,

      text: `Attached is the layout for project ${project.ProjectName}`,

      attachments: [
        {
          filename: `${project.ProjectName}_layout.json`,

          content: JSON.stringify(layout, null, 2),
        },
      ],
    });

    res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

export default router;
