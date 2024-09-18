// packages
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";

// schemas
import Books from "./schemas/Books.js";

const app = express();
dotenv.config();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

mongoose
  .connect(process.env.ATLAS_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.listen(process.env.PORT, () => {
  console.log(`serever started on port ${process.env.PORT}`);
});

app
  .route("/")
  .get((req, res) => {
    res.json({ message: "hello" });
  })
  .post(async (req, res) => {
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

app.route("/all-books").get(async (req, res) => {
  const dbResponse = await Books.find();
  res.json(dbResponse);
});
