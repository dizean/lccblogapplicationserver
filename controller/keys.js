import db from "../config/db.js";
// 0 - Available, 1 - Unavailable
// 0 - Active, 1 - Inactive
// Get all room_keys
export const getKeys = (req, res) => {
    const q = "SELECT * FROM `keys`";
    db.query(q, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data);
    });
}

export const addKey = (req, res) => {
    const { name, location, status } = req.body;
    const q = "INSERT INTO `keys` (`room`, `location`, `status`, `active`) VALUES (?)";
    const values = [name, location, status, 0]; // 0 - Active
    db.query(q, [values], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(201).json("Key added successfully");
    });
}