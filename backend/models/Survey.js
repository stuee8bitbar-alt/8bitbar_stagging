import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  type: { type: String, enum: ["text", "radio", "checkbox"], default: "text" },
  options: [String], // For radio/checkbox
});

const surveySchema = new mongoose.Schema({
  title: { type: String, required: true },
  questions: [questionSchema],
  link: { type: String, required: true, unique: true }, // e.g., /survey/:link
  createdAt: { type: Date, default: Date.now },
});

const Survey = mongoose.model("Survey", surveySchema);
export default Survey;
