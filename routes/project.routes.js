import express from "express";

import {
  readJson,
  writeJson
} from "../storage/jsonDB.js";

const router = express.Router();

/* =========================================================
   GET ALL PROJECTS
========================================================= */

router.get("/", async (req, res) => {

  try {

    const projects = await readJson(
      "projects/projects.json",
      []
    );

    const activeProjects = projects.filter(
      p => p.Status === "Active"
    );

    res.json(activeProjects);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Project fetch failed"
    });
  }
});

/* =========================================================
   CREATE PROJECT
========================================================= */

router.post("/", async (req, res) => {

  try {

    const {
      projectNumber,
      projectName
    } = req.body;

    const projects = await readJson(
      "projects/projects.json",
      []
    );

    /* CHECK EXISTING */

    const existing = projects.find(
      p => p.ProjectNumber === projectNumber
    );

    if (existing) {

      return res.json({
        success: true,
        ProjectID: existing.ProjectID,
        ProjectNumber: existing.ProjectNumber,
        ProjectName: existing.ProjectName,
        alreadyExists: true
      });
    }

    /* CREATE NEW */

    const nextId =
      projects.length > 0
        ? Math.max(
            ...projects.map(
              p => p.ProjectID
            )
          ) + 1
        : 1;

    const newProject = {

      ProjectID: nextId,

      ProjectNumber: projectNumber,

      ProjectName: projectName,

      Status: "Active",

      CreatedOn:
        new Date().toISOString()
    };

    projects.push(newProject);

    await writeJson(
      "projects/projects.json",
      projects
    );

    res.json({

      success: true,

      ProjectID: newProject.ProjectID,

      ProjectNumber:
        newProject.ProjectNumber,

      ProjectName:
        newProject.ProjectName,

      alreadyExists: false
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Project save failed"
    });
  }
});

/* =========================================================
   UPDATE PROJECT
========================================================= */

router.put("/:id", async (req, res) => {

  try {

    const {
      projectNumber,
      projectName
    } = req.body;

    const projects = await readJson(
      "projects/projects.json",
      []
    );

    const index = projects.findIndex(
      p =>
        p.ProjectID ===
        Number(req.params.id)
    );

    if (index === -1) {

      return res.status(404).json({
        error: "Project not found"
      });
    }

    projects[index] = {

      ...projects[index],

      ProjectNumber: projectNumber,

      ProjectName: projectName,

      UpdatedOn:
        new Date().toISOString()
    };

    await writeJson(
      "projects/projects.json",
      projects
    );

    res.json({
      success: true
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Project update failed"
    });
  }
});

export default router;