const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require('mongoose-encryption');
require('dotenv').config()

mongoose.connect("mongodb+srv://"+process.env.DB_USER+":"+process.env.DB_PASSWORD+"@test-01.osnd89h.mongodb.net/UserDB?retryWrites=true&w=majority&ssl=true", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Create Schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

// Encryption Plugin
 // Replace with your strong secret key
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

// Create Model
const User = mongoose.model("User", userSchema);

const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  const newUser = new User({ email, password });

  try {
    await newUser.save();
    res.render("secrets");
  } catch (err) {
    console.error(err);
    res.send("Error saving user to database.");
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const foundUser = await User.findOne({ email: username }).exec();

    if (foundUser) {
      if (foundUser.password === password) {
        res.render("secrets");
      } else {
        res.send("Incorrect password.");
      }
    } else {
      res.send("User not found.");
    }
  } catch (err) {
    console.error(err);
    res.send("Error finding user.");
  }
});

app.get("/logout", (req, res) => {
  res.redirect("/");
});

app.get("/secrets", (req, res) => {
  res.render("secrets");
});

app.get("/", (req, res) => {
  res.render("home");
});

app.listen(3000, () => {
  console.log("Server opened on port 3000");
});
