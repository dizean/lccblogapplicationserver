import db from "../config/db.js";

export const getEmployeesLog = (req, res) => {
    const query = `SELECT
                    name,el.date, time_in, time_out, employee_id
                    FROM employees e
                    INNER JOIN employees_log el ON e.id = el.employee_id
                    ORDER BY el.id DESC
                    `;
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(results);
    }
    );
};

export const time_in = (req, res) => {
    const { id } = req.body;
    const query = "INSERT INTO employees_log (employee_id, date, time_in, time_out) VALUES (?, CURDATE(), NOW(), NULL)";
    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: "Time-in recorded successfully", logId: result.insertId });
    }
    );
};

export const time_out = (req, res) => {
    const { id } = req.body;
    const checkQuery = `
        SELECT * FROM employees_log 
        WHERE employee_id = ? AND date = CURDATE() 
        ORDER BY time_in DESC LIMIT 1
    `;

    db.query(checkQuery, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (results.length > 0 && !results[0].time_out) {
            const updateQuery = `
                UPDATE employees_log 
                SET time_out = NOW() 
                WHERE id = ? 
            `;
            db.query(updateQuery, [results[0].id], (err2, result2) => {
                if (err2) {
                    return res.status(500).json({ error: err2.message });
                }
                return res.status(200).json({ message: "Time-out recorded successfully" });
            });
        } else {
            const insertQuery = `
                INSERT INTO employees_log (employee_id, date, time_out) 
                VALUES (?, CURDATE(), NOW())
            `;
            db.query(insertQuery, [id], (err3, result3) => {
                if (err3) {
                    return res.status(500).json({ error: err3.message });
                }
                return res.status(200).json({ message: "Time-out only recorded successfully" });
            });
        }
    });
};
