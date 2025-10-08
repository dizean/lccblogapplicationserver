import e from "express";
import { allLogs, getVisitorsLog, loginVisitor, logoutVisitor, todayLogs  } from "../controller/visitors.js";

const visitorRouter = e.Router();
visitorRouter.get("/", getVisitorsLog);
visitorRouter.post("/in", loginVisitor);
visitorRouter.put("/out", logoutVisitor);
visitorRouter.get("/todayLogs", todayLogs);
visitorRouter.get("/allLogs", allLogs);
export default visitorRouter;