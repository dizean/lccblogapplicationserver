import db from "../config/db.js";

// Get all room_keys_log
export const getRoomKeysLog = (req, res) => {
    const q = `SELECT
        k.id AS id,
        kl.key_id, 
        k.room,
        kl.date,
        eb.name AS borrowed_by_name,
        kl.time_borrowed,
        er.name AS returned_by_name,
        kl.time_returned
        FROM \`keys\` k
        INNER JOIN keys_log kl ON k.id = kl.key_id
        INNER JOIN employees eb ON kl.borrowed_by = eb.id  
        LEFT JOIN employees er ON kl.returned_by = er.id
        ORDER BY kl.date DESC, kl.time_borrowed DESC
`;
    db.query(q, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data);
    });
}

export const borrowKey = (req, res) => {
    const { keyId, employeeId } = req.body;
    console.log(keyId, employeeId);
    const q = "INSERT INTO keys_log (key_id, date, borrowed_by, time_borrowed) VALUES (?, CURDATE(), ?, NOW())";
    db.query(q, [keyId, employeeId], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(201).json({ message: "Key borrowed successfully", logId: data.insertId });
    });
}

export const returnKey = (req, res) => {
    const { keyId, employeeId } = req.body;
    const q = "UPDATE keys_log SET returned_by = ?, time_returned = NOW() WHERE key_id = ? AND date = CURDATE() AND time_returned IS NULL";
    db.query(q, [employeeId, keyId], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.affectedRows === 0) {
            return res.status(404).json({ message: "Log entry not found or key already returned" });
        }
        return res.status(200).json({ message: "Key returned successfully" });
    });
}