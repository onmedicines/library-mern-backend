// packages
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

// schemas
import User from "./schemas/User.js";

const app = express();
dotenv.config();
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

mongoose
  .connect(process.env.ATLAS_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.listen(process.env.PORT, () => {
  console.log(`server started on port ${process.env.PORT} 🎉`);
});

app.route("/").get((req, res) => {
  res.json({ message: "hello" });
});

app.route("/signup").post(async (req, res) => {
  try {
    const { username, password } = req.body;

    /**
     * if user already registered
     * throw an error
     */
    const user = await User.findOne({ username });
    if (user) throw new Error("User already Exists");

    await User.create({ username, password });
    res.json({ message: "user created" });
  } catch (err) {
    res.status(409).json({ error: err.message });
  }
});

app.route("/signin").post(async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) throw new Error("username does not exist!!");
    if (user.password !== password) throw new Error("Password Incorrect!");

    // username and password are valid beyound this point
    // we can generate a jwt
    const accessToken = jwt.sign({ username }, process.env.ACCESS_TOKEN_SECRET);

    res.json({ message: "user logged in!!", books: user.books, accessToken });
  } catch (err) {
    res.json({ error: err.message });
  }
});

function authorizeToken(req, res, next) {
  try {
    const authHeader = req.headers["authorization"]; // format: BEARER <token>
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) throw new Error("cannot be authorized!!");
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) throw err;
      req.username = user.username;
      next();
    });
  } catch (err) {
    res.json({ error: err.message });
  }
}

app.route("/add-book").post(async (req, res) => {
  try {
    const name = req.body.bookName;
    const author = req.body.author;
    const pages = req.body.pages;

    if (!name || !author || !pages) throw new Error("one or more fields missing");

    const dbResponse = await Books.create({ name: name, author: author, pages: pages });
    res.json({ message: "book added to db" });
  } catch (err) {
    console.error(err.message);
    res.json({ message: err.message });
  }
});

app.route("/books").post(authorizeToken, async (req, res) => {
  const username = req.username;
  const user = await User.findOne({ username });

  res.json(user.books);
});
