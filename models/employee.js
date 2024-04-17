const mongoose = require("mongoose");

const employee = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    join_date: Date
});

module.exports = mongoose.model('employees',employee);