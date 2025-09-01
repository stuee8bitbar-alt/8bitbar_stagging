import express from "express";
import {
  createSurvey,
  getAllSurveys,
  getSurvey,
  deleteSurvey,
  submitSurveyResponse,
  getSurveyResponses,
  updateSurvey,
} from "../controllers/survey.controller.js";

const router = express.Router();

// Admin routes
router.post("/", createSurvey); // Create survey
router.get("/", getAllSurveys); // List all surveys
router.get("/:idOrLink", getSurvey); // Get survey by ID or link
router.put("/:idOrLink", updateSurvey); // Update survey
router.delete("/:id", deleteSurvey); // Delete survey
router.get("/:surveyId/responses", getSurveyResponses); // Get all responses for a survey

// Public route
router.post("/:surveyId/submit", submitSurveyResponse); // Submit survey response

export default router;
