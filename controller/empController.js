const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const DOMPurify = require("isomorphic-dompurify");

const secretKey = crypto.randomBytes(32).toString("hex");
const empSchema = require("../models/employee");
const leaveApplication = require("../models/leaveApplication");

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
    const sanitizeName = DOMPurify.sanitize(name);
    const sanitizemail = DOMPurify.sanitize(email);
    const sanitizeDate = DOMPurify.sanitize(join_date);
    const newEmployee = new empSchema({
      name: sanitizeName,
      email: sanitizemail,
      password: hash,
      join_date: sanitizeDate,
    });
    await newEmployee.save();
    res.status(201).json({ message: "Employee created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getEmpById(req,res){
  const { id } = req.params;
  try{
    const getDataById = await empSchema.findById(id);
    if(!getDataById){
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json({
      data: getDataById,
      message: "Employee get successfully"
    });
  }catch(err){
    res.status(500).json({ message: "Internal server error" });
  }
}

async function updateEmployee(req, res) {
  const { id } = req.params;
  const { name, email, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 8);
    const sanitizeName = DOMPurify.sanitize(name);
    const sanitizemail = DOMPurify.sanitize(email);
    // const sanitizeDate = DOMPurify.sanitize(join_date);
    const updatedEmployee = await empSchema.findByIdAndUpdate(
      id,
      {
        name: sanitizeName,
        email: sanitizemail,
        password: hash
        // join_date: sanitizeDate,
      },
      { new: true }
    );
    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json({
      message: "Employee updated successfully",
      employee: updatedEmployee,
    });
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
    res.json({
      message: "Employee deleted successfully",
      employee: deletedEmployee,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getApplications(req, res) {
  try {
    const data = await leaveApplication.find();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function applyLeave(req, res) {
  const { emp_id, start_date, end_date, reason } = req.body;
  try {
    const employee = await empSchema.findById(emp_id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    if (endDate <= startDate) {
      return res.status(400).json({ message: "End date must be after start date" });
    }

    const sanitizeReason = DOMPurify.sanitize(reason);

    const newLeave = new leaveApplication({
      emp_id,
      start_date: startDate,
      end_date: endDate,
      reason: sanitizeReason,
      status: "pending",
      created_at: Date.now(),
    });
    await newLeave.save();
    res.status(200).json({ message: "Leave sent successfully" });
  
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}
async function editLeave(req, res) {
  const { id } = req.params;
  const { emp_id, start_date, end_date, reason } = req.body;
  try {
    const employee = await empSchema.findById(emp_id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    if (endDate <= startDate) {
      return res.status(400).json({ message: "End date must be after start date" });
    }

    const sanitizeReason = DOMPurify.sanitize(reason);

    const editLeave = await leaveApplication.findByIdAndUpdate(
      id,
      {
      emp_id,
      start_date: startDate,
      end_date: endDate,
      reason: sanitizeReason,
      status: "pending",
      created_at: Date.now(),
    },
    { new: true}
    );
    
    if(!editLeave){
      return res.status(404).json({ message: "Cant Edit" });
    }
   res.json({
    message: "Edit Successfully",
    leave: editLeave,
   });
  
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
  deleteEmployee,
  applyLeave,
  editLeave,
  getApplications,
  getEmpById
};
