import db from "../config/db.js";

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

export const loginVisitor = (req, res) => {
    const { name, purpose } = req.body;
    const query = "INSERT INTO visitors_log (name, purpose, date, logged_in, logged_out) VALUES (?, ?, CURDATE(), NOW(), NULL)";
    db.query(query, [name, purpose], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: "Visitor logged in successfully", logId: result.insertId });
    }
    );
}

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