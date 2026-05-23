import express from "express";
import fs from "fs";
import path from "path";
import db from "../config/db.js";
import { faceapi, canvas } from "../service/faceService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { descriptor } = req.body;

    if (!descriptor || descriptor.length !== 128) {
      return res.status(400).json({ message: "Invalid descriptor" });
    }

    const input = new Float32Array(descriptor);

    const query = "SELECT * FROM visitors_faces";

    db.query(query, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      let match = null;
      let lowest = 0.5;

      for (const row of results) {
        const stored = JSON.parse(row.descriptor);

        const storedArr = new Float32Array(stored);

        const distance = faceapi.euclideanDistance(input, storedArr);

        if (distance < lowest) {
          lowest = distance;

          match = {
            visitor_id: row.visitor_id,
            distance,
          };
        }
      }

      if (match) {
        return res.json({ match: true, visitor: match });
      }

      return res.json({ match: false });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;