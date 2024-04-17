const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const secretKey = crypto.randomBytes(32).toString("hex");
const empSchema = require("../models/employee");

async function login(req, res) {
  const { name, password } = req.body;
  try {
    const employee = await empSchema.findOne({ name });
    if (!employee) {
      return res.status(400).json({ message: "Employee not found" });
    }
    const passwordMatch = await bcrypt.compare(password, employee.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Incorrect Password" });
    }
    const token = jwt.sign({ empID: employee._id }, secretKey, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getAllEmployees(req, res) {
  try {
    const data = await empSchema.find();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function createEmployee(req, res) {
  const { name, email, password, join_date } = req.body;
  try {
    const hash = await bcrypt.hash(password, 8);
    const newEmployee = new empSchema({
      name,
      email,
      password: hash,
      join_date,
    });
    await newEmployee.save();
    res.status(201).json({ message: "Employee created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function updateEmployee(req, res) {
  const { id } = req.params;
  const { name, email, password, join_date } = req.body;
  try {
    const hash = await bcrypt.hash(password, 8);
    const updatedEmployee = await empSchema.findByIdAndUpdate(
      id,
      {
        name,
        email,
        password: hash,
        join_date,
      },
      { new: true }
    );
    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json({ message: "Employee updated successfully", employee: updatedEmployee });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function deleteEmployee(req, res) {
  const { id } = req.params;
  try {
    const deletedEmployee = await empSchema.findByIdAndDelete(id);
    if (!deletedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json({ message: "Employee deleted successfully", employee: deletedEmployee });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  login,
  getAllEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee
};