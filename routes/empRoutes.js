const express = require("express");
const emp = express.Router();
const empController = require("../controller/empController");

emp.post("/login", empController.login);
emp.get("/", empController.getAllEmployees);
emp.post("/", empController.createEmployee);
emp.put("/:id",empController.updateEmployee);
emp.delete("/:id",empController.deleteEmployee);
emp.get("/leave", empController.getApplications);
emp.post("/leave", empController.applyLeave);
emp.put("/leave/:id", empController.editLeave);

module.exports = emp;
