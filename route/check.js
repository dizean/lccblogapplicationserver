import express from "express";
import db from "../config/db.js";

const router = express.Router();

// PURE JS distance function (no face-api.js needed)
function euclideanDistance(a, b) {
  let sum = 0;

  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}

router.post("/", async (req, res) => {
  try {
    const { descriptor } = req.body;

    if (!descriptor || descriptor.length !== 128) {
      return res.status(400).json({ message: "Invalid descriptor" });
    }

    const input = descriptor; // already array from frontend

    const query = "SELECT vf.visitor_id, descriptor, name FROM visitors_faces vf LEFT JOIN visitors_log vl ON vf.visitor_id = vl.id;";

    db.query(query, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      let match = null;
      let lowest = 0.5; 

      for (const row of results) {
        const stored = JSON.parse(row.descriptor);

        const distance = euclideanDistance(input, stored);

        if (distance < lowest) {
          lowest = distance;

          match = {
            visitor_id: row.visitor_id,
            name: row.name,
            distance,
          };
        }
      }
console.log(match);
      if (match) {
        return res.json({
          match: true,
          visitor: match,
        });
      }

      return res.json({ match: false });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;