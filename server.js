import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { readdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Function to load routes
async function loadRoutes() {
  const files = readdirSync(path.join(__dirname, "route"));

  for (const file of files) {
    const routerModule = await import(`./route/${file}`);
    const routePath = "/" + file.replace(".js", "");
    app.use(routePath, routerModule.default);
  }
}

async function startServer() {
  await loadRoutes(); // wait for routes to load

  app.get("/", (req, res) => {
    res.status(200).json({ message: "Hello, World!" });
  });

  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
}

startServer();
