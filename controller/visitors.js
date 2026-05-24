import db from "../config/db.js";
import path from "path";
import fs from "fs";
export const getVisitorsLog = (req, res) => {
    const query = `SELECT * FROM visitors_log ORDER BY date DESC`;
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(results);
    }
    );
}

export const loginVisitor = async (req, res) => {
  try {
    const { name, purpose, gate, id, image, descriptor, mode } = req.body;

    const finalDescriptor =
      Array.isArray(descriptor)
        ? descriptor
        : JSON.parse(descriptor || "[]");

    if (!finalDescriptor || finalDescriptor.length !== 128) {
      return res.status(400).json({
        message: "Invalid or missing face descriptor",
      });
    }

    // STEP 1: ALWAYS LOG VISIT
    const logQuery =
      "INSERT INTO visitors_log (name, purpose, gate, id_type, date, logged_in, logged_out) VALUES (?, ?, ?, ?, CURDATE(), NOW(), NULL)";

    db.query(logQuery, [name, purpose, gate, id], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const logId = result.insertId;

      // STEP 2: IF EXISTING USER → STOP HERE
    //   if (mode !== "NEW") {
    //     return res.json({
    //       message: "Existing visitor logged",
    //       logId,
    //     });
    //   }

      // STEP 3: NEW USER MUST HAVE IMAGE
      if (!image) {
        return res.status(400).json({
          message: "Image required for new visitor",
          logId,
        });
      }

      // STEP 4: SAVE FACE DATA
      db.query(
        "INSERT INTO visitors_faces (visitor_id, descriptor, image_path) VALUES (?, ?, ?)",
        [logId, JSON.stringify(finalDescriptor), image],
        (err2) => {
          if (err2) {
            return res.status(500).json({ error: err2.message });
          }

          return res.json({
            message: "Visitor saved + face stored",
            logId,
          });
        }
      );
    });
  } catch (err) {
    console.log("🔥 ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const logoutVisitor = (req, res) => {
    const { id } = req.body;
    const query = "UPDATE visitors_log SET logged_out = NOW() WHERE id = ? AND logged_out IS NULL AND date = CURDATE()";
    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "No active visitor record found" });
        }
        res.status(200).json({ message: "Visitor logged out successfully" });
    }
    );
}

export const todayLogs = (req, res) => {
    const query = `SELECT
                    name AS Name,
                    purpose AS Purpose,
                    gate AS Gate,
                    id_type AS ID_Type,
                    DATE_FORMAT(logged_in, '%h:%i %p') AS Time_Checked_In,
                    DATE_FORMAT(logged_out, '%h:%i %p') AS Time_Checked_Out
                    FROM visitors_log vl
                    WHERE vl.date = CURDATE()
                    ORDER BY vl.date DESC;
                    `;
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(results);
    }
    );
}

export const allLogs = (req, res) => {
    const query = `SELECT
    name Name,
    DATE_FORMAT(vl.date, '%M %d, %Y') Date,
    purpose Purpose,
    gate AS Gate,
    id_type AS ID_Type,
    DATE_FORMAT(logged_in, '%h:%i %p') AS Time_Checked_In,
    DATE_FORMAT(logged_out, '%h:%i %p') AS Time_Checked_Out
    FROM visitors_log vl
    ORDER BY vl.date DESC`;
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(results);
    }
    );
}

export const range = (req, res) => {
    const { start, end } = req.query;

    if (!start || !end) {
        return res.status(400).json({ error: "Start and end dates are required" });
    }

    if (new Date(start) > new Date(end)) {
        return res.status(400).json({ error: "Invalid date range" });
    }

    const query = `
        SELECT
            name AS Name,
            DATE_FORMAT(vl.date, '%M %d, %Y') AS Date,
            purpose AS Purpose,
            gate AS Gate,
            id_type AS ID_Type,
            DATE_FORMAT(logged_in, '%h:%i %p') AS Time_Checked_In,
            DATE_FORMAT(logged_out, '%h:%i %p') AS Time_Checked_Out
        FROM visitors_log vl
        WHERE vl.date BETWEEN ? AND ?
        ORDER BY vl.date DESC, vl.logged_in DESC
    `;

    db.query(query, [start, end], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(results);
    });
};