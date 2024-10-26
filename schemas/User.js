import mongoose from "mongoose";

const bookSchema = mongoose.Schema({
  bookName: { type: String, required: true },
  authorName: { type: String, required: true },
  pages: { type: Number, required: false },
  rating: { type: Number, required: true },
  summary: { type: String, required: false },
});

const userSchema = mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  books: [bookSchema],
});

export default mongoose.model("User", userSchema);
