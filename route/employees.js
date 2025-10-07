import e from "express";
import { getEmployees, getEmployeeById, addEmployee, updateEmployee, deleteEmployee } from "../controller/employees.js";

const employeesRouter = e.Router();

employeesRouter.post("/", addEmployee);
employeesRouter.get("/", getEmployees);
employeesRouter.get("/:id", getEmployeeById);
employeesRouter.put("/:id", updateEmployee);
employeesRouter.delete("/:id", deleteEmployee);


export default employeesRouter;
