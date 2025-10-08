import e from "express";
import { time_in, time_out, getEmployeesLog, todayLogs, allLogs } from "../controller/employeesLog.js";
const employeesLogRouter = e.Router();
// Get all employees log  
employeesLogRouter.get("/", getEmployeesLog);
// Employee time-in
employeesLogRouter.post("/time-in", time_in);
// Employee time-out
employeesLogRouter.post("/time-out", time_out);
employeesLogRouter.get("/todayLogs", todayLogs);
employeesLogRouter.get("/allLogs", allLogs);
export default employeesLogRouter;