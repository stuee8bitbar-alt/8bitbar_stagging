import Survey from "../models/Survey.js";
import SurveyResponse from "../models/SurveyResponse.js";
import mongoose from "mongoose";

// Admin: Create a new survey
export const createSurvey = async (req, res) => {
  try {
    const { title, questions } = req.body;
    // Generate a unique link (could be a slug or ObjectId)
    const link = new mongoose.Types.ObjectId().toString();
    const survey = await Survey.create({ title, questions, link });
    res.status(201).json({ success: true, survey });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: Get all surveys
export const getAllSurveys = async (req, res) => {
  try {
    const surveys = await Survey.find();
    res.status(200).json({ success: true, surveys });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: Get survey by ID or link
export const getSurvey = async (req, res) => {
  try {
    const { idOrLink } = req.params;
    const survey = await Survey.findOne({ $or: [ { _id: idOrLink }, { link: idOrLink } ] });
    if (!survey) return res.status(404).json({ success: false, message: "Survey not found" });
    res.status(200).json({ success: true, survey });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: Delete survey
export const deleteSurvey = async (req, res) => {
  try {
    const { id } = req.params;
    await Survey.findByIdAndDelete(id);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: Update survey
export const updateSurvey = async (req, res) => {
  try {
    const { idOrLink } = req.params;
    const { title, questions } = req.body;
    const survey = await Survey.findOneAndUpdate(
      { $or: [ { _id: idOrLink }, { link: idOrLink } ] },
      { title, questions },
      { new: true }
    );
    if (!survey) return res.status(404).json({ success: false, message: "Survey not found" });
    res.status(200).json({ success: true, survey });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Public: Submit survey response
export const submitSurveyResponse = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const { userDetails, answers } = req.body;
    const response = await SurveyResponse.create({ survey: surveyId, userDetails, answers });
    res.status(201).json({ success: true, response });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: Get all responses for a survey
export const getSurveyResponses = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const responses = await SurveyResponse.find({ survey: surveyId });
    res.status(200).json({ success: true, responses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
