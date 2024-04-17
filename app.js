const express = require("express");
const bodyParser = require("body-parser");
const adminRoutes = require('./routes/adminRoutes'); // Import admin routes
const db = require('./config/db');
const empRoutes = require('./routes/empRoutes');

const app = express();
const PORT = 3001;

app.use(bodyParser.json());

app.use('/admin', adminRoutes);
app.use('/employee', empRoutes);

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});


db.on('error', (error) => {
  console.error("Database connection error:", error);
  process.exit(1); 
});
