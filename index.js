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
  console.log(`server started on port ${process.env.PORT}`);
});

app
  .route("/")
  .get((req, res) => {
    res.json({ message: "hello" });
  })
  .post(async (req, res) => {
    try {
      const { bookName, authorName, numberOfPages, summary, rating } = req.body;

      if (!bookName || !authorName || !numberOfPages || !rating) throw new Error("book name, author name, number of pages and rating are required fields");

      const dbResponse = await Books.create({
        bookName,
        authorName,
        numberOfPages,
        summary,
        rating,
      });
      res.json({ message: "book added to db" });
    } catch (err) {
      console.error(err.message);
      res.json({ message: err.message });
    }
  });

app.route("/all-books").get(async (req, res) => {
  const dbResponse = await Books.find();
  console.log(dbResponse); // logs
  res.json(dbResponse);
});
