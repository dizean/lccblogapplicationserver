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

export const loginVisitor = async (req, res) => {
    try {
        const { name, purpose, gate, id, image } = req.body;
        const query =
            "INSERT INTO visitors_log (name, purpose, gate, id, date, logged_in, logged_out) VALUES (?, ?, ?, ?, CURDATE(), NOW(), NULL)";

        db.query(query, [name, purpose, gate, id], async (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            const logId = result.insertId;

            if (image) {
                try {
                    // convert base64 → file
                    const fileName = `${Date.now()}_visitor.jpg`;
                    const filePath = path.join(process.cwd(), "uploads", fileName);

                    const base64Data = image.replace(
                        /^data:image\/\w+;base64,/,
                        ""
                    );

                    fs.writeFileSync(filePath, base64Data, "base64");

                    // load image for face-api
                    const img = await canvas.loadImage(filePath);

                    const detection = await faceapi
                        .detectSingleFace(
                            img,
                            new faceapi.TinyFaceDetectorOptions()
                        )
                        .withFaceLandmarks()
                        .withFaceDescriptor();

                    if (!detection) {
                        return res.status(400).json({
                            message: "No face detected",
                        });
                    }

                    const descriptor = Array.from(detection.descriptor);

                    const faceQuery =
                        "INSERT INTO visitor_faces (visitor_id, image_path, descriptor) VALUES (?, ?, ?)";

                    db.query(
                        faceQuery,
                        [id, fileName, JSON.stringify(descriptor)],
                        (err2) => {
                            if (err2) {
                                return res.status(500).json({
                                    error: err2.message,
                                });
                            }

                            return res.status(201).json({
                                message: "Visitor logged + face saved",
                                logId,
                                faceSaved: true,
                            });
                        }
                    );
                } catch (faceErr) {
                    console.error(faceErr);

                    return res.status(500).json({
                        message: "Face processing failed",
                    });
                }
            } else {
                return res.status(201).json({
                    message: "Visitor logged (no face)",
                    logId,
                });
            }
        });
    } catch (err) {
        return res.status(500).json({
            error: err.message,
        });
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