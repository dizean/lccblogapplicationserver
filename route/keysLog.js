import e from "express";
import { getRoomKeysLog, borrowKey, returnKey } from "../controller/keysLog.js";

const roomKeysLogRouter = e.Router();
// Get all room keys log  
roomKeysLogRouter.get("/", getRoomKeysLog);
roomKeysLogRouter.post("/borrow", borrowKey);
roomKeysLogRouter.put("/return", returnKey); 
export default roomKeysLogRouter; 