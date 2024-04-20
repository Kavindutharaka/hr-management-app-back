const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const secretKey = crypto.randomBytes(32).toString("hex");

const adminLogin = require('../models/admin');

async function login(req,res){
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
      res.cookie('token', token, {
        httpOnly:true,
        secure: true,
        sameSite: 'strict'
      });

      res.status(200).json({ message: "Login successful", token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    login
};