const express = require("express");
const emp = express.Router();
const empController = require("../controller/empController");
const empAuth = require("../controller/empAuth");
const {authenticate} = require("../controller/adminController")
const attendController = require('../controller/attandController');

emp.post("/login", empController.login);
emp.get("/", empController.getAllEmployees);
emp.post("/", empController.createEmployee);
emp.post("/checkin",attendController.checkIn);
emp.post("/checkout",attendController.checkOut);
emp.get("/attendance",attendController.getAttanceByUserID);
emp.get("/leave",empController.getApplications);
emp.post("/leave",empController.applyLeave);
emp.put("/leave/:id",empController.editLeave);
emp.get("/:id",authenticate, empController.getEmpById);
emp.put("/:id",authenticate, empController.updateEmployee);
emp.delete("/:id",authenticate, empController.deleteEmployee);
emp.get("/logout",empAuth.logout);

module.exports = emp;
