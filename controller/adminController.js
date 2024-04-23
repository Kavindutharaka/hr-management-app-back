const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const secretKey = crypto.randomBytes(32).toString("hex");

const adminLogin = require("../models/admin");
const leaveApplication = require("../models/leaveApplication");

function authenticate(req, res, next) {
  const token = req.cookies.adminToken;
  console.log(token);
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    } else {
      return res.status(401).json({ message: "Unauthorized" });
    }
  }
}

async function login(req, res) {
  const { username, password } = req.body;
  try {
    const admin = await adminLogin.findOne({ username });

    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }
    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }
    const token = jwt.sign({ adminID: admin._id }, secretKey, {
      expiresIn: "1h",
    });
    res.cookie("adminToken", token, {
      httpOnly: true,
      // secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getApplications(req, res) {
  try {
    const data = await leaveApplication.find({ status: "pending" });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function approveApplications(req, res) {
  const { _id, status } = req.body;
  try {
    const approveApplication = await leaveApplication.findByIdAndUpdate(
      _id,
      {
        status: status,
      },
      { new: true }
    );
    if (!approveApplication) {
      return res.status(404).json({ message: "application not found" });
    }
    res.json({
      message: `${status} successfully`,
      application: approveApplication,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  login,
  authenticate,
  getApplications,
  approveApplications,
};
