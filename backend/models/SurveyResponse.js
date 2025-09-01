import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  answer: mongoose.Schema.Types.Mixed, // Can be string, array, etc.
});

const surveyResponseSchema = new mongoose.Schema({
  survey: { type: mongoose.Schema.Types.ObjectId, ref: "Survey", required: true },
  userDetails: {
    name: String,
    email: String,
    phone: String,
  },
  answers: [answerSchema],
  submittedAt: { type: Date, default: Date.now },
});

const SurveyResponse = mongoose.model("SurveyResponse", surveyResponseSchema);
export default SurveyResponse;
