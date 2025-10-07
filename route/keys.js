import e from "express";
import { getKeys, addKey } from "../controller/keys.js";
const roomKeysRouter = e.Router();
// Get all room keys  
roomKeysRouter.get("/", getKeys); 
roomKeysRouter.post("/", addKey)
export default roomKeysRouter;