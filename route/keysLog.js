import e from "express";
import { getRoomKeysLog, borrowKey, returnKey, todayLogs, allLogs } from "../controller/keysLog.js";

const roomKeysLogRouter = e.Router();
// Get all room keys log  
roomKeysLogRouter.get("/", getRoomKeysLog);
roomKeysLogRouter.post("/borrow", borrowKey);
roomKeysLogRouter.put("/return", returnKey); 
roomKeysLogRouter.get("/todayLogs", todayLogs);
roomKeysLogRouter.get("/allLogs", allLogs);
export default roomKeysLogRouter; 