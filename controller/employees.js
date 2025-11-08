import db from "../config/db.js";
// 0 - active, 1 - inactive
export const addEmployee = (req, res) => {
    const { name, classification, status } = req.body;
    const query = "INSERT INTO employees (name, classification, status, active) VALUES (?, ?, ?, 0)";
    db.query(query, [name, classification, status], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: "Employee added successfully", employeeId: result.insertId });
    }
    );
};

export const getEmployees = (req, res) => {
    const query = "SELECT * FROM employees WHERE active = 0";
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(results);
    }
    );
};

export const getEmployeeById = (req, res) => {
    const { id } = req.params;
    const query = "SELECT * FROM employees WHERE id = ? AND active = 0";
    db.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }
        res.status(200).json(results[0]);
    }
    );
};

export const updateEmployee = (req, res) => {
    const { id } = req.params;
    const { name, type } = req.body;
    const query = "UPDATE employees SET name = ?, classification = ?, status = ? WHERE id = ? AND active = 0";
    db.query(query, [name, type, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Employee not found or inactive" });
        }
        res.status(200).json({ message: "Employee updated successfully" });
    }
    );
};

export const deleteEmployee = (req, res) => {
    const { id } = req.params;
    const query = "UPDATE employees SET active = 1 WHERE id = ? AND active = 0";
    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Employee not found or already inactive" });
        }
        res.status(200).json({ message: "Employee marked as inactive successfully" });
    }
    );
};