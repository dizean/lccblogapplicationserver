import e from "express";
import { getVisitorsLog, loginVisitor, logoutVisitor  } from "../controller/visitors.js";

const visitorRouter = e.Router();
visitorRouter.get("/", getVisitorsLog);
visitorRouter.post("/in", loginVisitor);
visitorRouter.put("/out", logoutVisitor);
export default visitorRouter;