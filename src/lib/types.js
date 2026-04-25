/**
 * Shared type definitions for the FairMIND Fairness platform.
 * These mirror the Pydantic models from the original FastAPI backend.
 */

/**
 * @typedef {Object} BiasScore
 * @property {string} category - The demographic group name
 * @property {number} score - Fairness score (0-100)
 * @property {string} status - "Pass" | "Warning" | "Fail"
 * @property {string} details - Human-readable details string
 */

/**
 * @typedef {Object} AuditResponse
 * @property {number} overall_fairness_score - Aggregate fairness percentage
 * @property {BiasScore[]} categories - Per-group bias scores
 * @property {string} summary - Textual analysis summary
 */

/**
 * @typedef {Object} HistoryEntry
 * @property {number} id
 * @property {string} datasetName
 * @property {string} domain - "Healthcare" | "Finance" | "Hiring"
 * @property {number} originalScore
 * @property {string} mitigation - Strategy name
 * @property {number} newScore
 * @property {string} date - ISO date string
 */

// Domain options used across the app
export const DOMAINS = ["Universal", "Healthcare", "Finance", "Hiring"];

// Status thresholds matching backend logic
export const SCORE_THRESHOLDS = {
  PASS: 90,
  WARNING: 80,
};
