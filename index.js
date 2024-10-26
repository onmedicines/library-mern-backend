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
app.use(cors());
app.use(express.json());
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

// Functions
function authenticate(req, res, next) {
  try {
    const authHeader = req.headers["authorization"]; // format: BEARER <token>
    // console.log(authHeader);
    const token = authHeader && authHeader.split(" ")[1];
    // console.log(token);
    if (!token) throw new Error("cannot be authorized!!");
    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
      if (err) return res.status(401).json({ errorAuthenticateToken: err.message });
      req.username = user.username;
      next();
    });
  } catch (err) {
    res.status(401).json({ errorAuthenticate: err.message });
  }
}

// Routes
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
    let user = await User.findOne({ username });
    if (user) throw new Error("User already Exists");

    user = await User.create({ username, password });
    jwt.sign({ username }, process.env.SECRET_KEY, (err, token) => {
      res.status(200).json({ message: "user created", user, token });
    });
  } catch (err) {
    res.status(409).json({ errorSignup: err.message });
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
    jwt.sign({ username }, process.env.SECRET_KEY, (err, token) => {
      res.status(200).json({ message: "user logged in!!", user, token });
    });
  } catch (err) {
    res.json({ errorSignin: err.message });
  }
});

app.route("/user").post(authenticate, async (req, res) => {
  try {
    const bookName = req.body.bookName;
    const authorName = req.body.authorName;
    const pages = req.body.pages || null;
    const summary = req.body.summary || "";
    const rating = req.body.rating;

    if (!bookName || !authorName || !rating) throw new Error("one or more fields missing");

    await User.findOneAndUpdate({ username: req.username }, { $push: { books: { bookName, authorName, pages, summary, rating } } });
    res.status(200).json({ message: "book added to db" });
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ errorUser: err.message });
  }
});

app.route("/books").post(authenticate, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.username });
    res.status(200).json(user.books);
  } catch (error) {
    res.status(500).json({ errorBooks: error.message });
  }
});
