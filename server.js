import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { readdirSync } from "fs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { loadModels } from "./service/faceService.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const uploadsPath = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use(cors());

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(morgan("dev"));

app.use("/uploads", express.static(uploadsPath));

async function loadRoutes() {
  const routePath = path.join(__dirname, "route");

  const files = readdirSync(routePath).filter(
    (file) => file.endsWith(".js")
  );

  for (const file of files) {
    const routerModule = await import(`./route/${file}`);

    const endpoint = "/" + file.replace(".js", "");

    app.use(endpoint, routerModule.default);

    console.log(`✅ Route loaded: ${endpoint}`);
  }
}

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

async function startServer() {
  try {
    console.log("⏳ Loading face recognition models...");

    await loadModels();

    console.log("✅ Face models loaded");

    await loadRoutes();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:");
    console.error(error);

    process.exit(1);
  }
}

startServer();