import mongoose from "mongoose";

const bookSchema = mongoose.Schema({
  name: { type: String, required: true },
  author: { type: String, required: true },
  pages: { type: Number, required: true },
  summary: { type: String, required: false },
  rating: { type: Number, required: true },
});

export default mongoose.model("Books", bookSchema);
