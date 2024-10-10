import mongoose from "mongoose";

const bookSchema = mongoose.Schema({
  bookName: { type: String, required: true },
  authorName: { type: String, required: true },
  numberOfPages: { type: Number, required: true },
  summary: { type: String, required: false },
  rating: { type: Number, required: true },
});

export default mongoose.model("Books", bookSchema);
