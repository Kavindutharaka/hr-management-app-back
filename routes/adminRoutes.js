const express = require("express");
const admin = express.Router();

const adminController = require('../controller/adminController');
const attendController = require('../controller/attandController');

admin.post("/login", adminController.login );
admin.get("/leave", adminController.getApplications );
admin.post("/leave", adminController.approveApplications );
admin.get("/attendance",attendController.getAttandance);

module.exports = admin;
