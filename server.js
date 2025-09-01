const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const mysql = require("mysql");

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public")); // serve index.html

//  MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",         // change if you have another username
  password: "admin",         // set your MySQL password
  database: "contactdb",
  port: "3307"
});

db.connect((err) => {
  if (err) {
    console.error(" DB connection failed:", err);
    return;
  }
  console.log(" Connected to MySQL Database");
});

//  POST /contact handler
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).send(" All fields are required!");
  }

  try {
    //  Save to MySQL
    const sql = "INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)";
    db.query(sql, [name, email, message], (err) => {
      if (err) {
        console.error(" DB Insert Error:", err);
        return res.status(500).send("Error saving to database");
      }
    });

    //  Setup transporter
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ankitah6123@gmail.com",
        pass: "mccd bgfq uuuj afat" // Gmail App Password
      }
    });

    //  Mail options
    let mailOptions = {
      from: `"${name}" <${email}>`,
      to: "ankitah6123@gmail.com",
      subject: `📩 New Contact Form Message`,
      text: `You received a new message from your website:

Name: ${name}
Email: ${email}
Message: ${message}
`
    };

    //  Send email
    await transporter.sendMail(mailOptions);

    res.send("✅ Thank you! Your message has been sent & stored.");
  } catch (err) {
    console.error(" Error:", err);
    res.status(500).send("Error sending message.");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(` Server running at http://192.168.1.5:${PORT}`);
});
