import * as faceapi from "face-api.js";
import canvas from "canvas";
import path from "path";
import { fileURLToPath } from "url";

const { Canvas, Image, ImageData } = canvas;

faceapi.env.monkeyPatch({
  Canvas,
  Image,
  ImageData,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadModels() {
  const modelPath = path.join(__dirname, "../face-models");
    console.log(modelPath);
  await faceapi.nets.tinyFaceDetector.loadFromDisk(modelPath);

  await faceapi.nets.faceLandmark68Net.loadFromDisk(
    modelPath
  );

  await faceapi.nets.faceRecognitionNet.loadFromDisk(
    modelPath
  );

  console.log("✅ Face models loaded");
}

export {
  faceapi,
  canvas,
  loadModels,
};