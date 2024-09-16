// packages
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";

// schemas
import Books from "./schemas/Books.js";

const app = express();
dotenv.config();
app.use(bodyParser.urlencoded({ extended: true }));

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
    const name = req.body.name;
    const author = req.body.author;
    const pages = req.body.pages;

    const dbResponse = await Books.create({ name: name, author: author, pages: pages });
    console.log(dbResponse);
    res.send({ message: "book added to db" });
  });
