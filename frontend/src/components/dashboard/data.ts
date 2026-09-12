import {
  getCurrentUserProfile,
} from "@/lib/current-user";
import {
  getCompetencyDomains,
  getLearningRecommendations,
  getRadarData,
  getRadarLegend,
  getSkillGapSummaries,
  getSummaryStats,
} from "@/lib/learner-data";

/**
 * Compatibility layer for the existing dashboard components.
 *
 * Learner identity comes from the shared current-user profile.
 * Dashboard presentation data remains behind getters so the integration
 * teammate can swap the implementation for API data without redesigning UI.
 */
export const officer = {
  get name() {
    return getCurrentUserProfile().name || "Learner";
  },

  get shortRole() {
    return getCurrentUserProfile().designation || "Learner";
  },

  get role() {
    const profile = getCurrentUserProfile();
    return [profile.designation, profile.department]
      .filter(Boolean)
      .join(" · ") || "Learner";
  },

  get cadre() {
    const profile = getCurrentUserProfile();
    return profile.department || "Statistical Workforce";
  },

  cadreId: "",
  syncLabel: "Profile data source ready",
};

export const summaryStats = getSummaryStats();
export const competencyDomains = getCompetencyDomains();
export const radarData = getRadarData();
export const radarLegend = getRadarLegend();
export const skillGaps = getSkillGapSummaries();

/**
 * The dashboard cards use a legacy presentation shape (track/rating/reason/
 * level/statusLabel/cta). Keep that presentation adapter separate from the
 * richer learning recommendation contract used by /learning-paths.
 */
export const learningPaths = getLearningRecommendations().map((path) => ({
  track: `${path.provider} · ${path.category}`,
  rating: "—",
  title: path.title,
  reason:
    path.whyRecommended ??
    path.description,
  duration: path.duration,
  level: path.category,
  provider: path.provider,
  progress: path.progress,
  statusLabel:
    path.status === "In Progress"
      ? `${path.progress}% Completed`
      : path.status,
  cta: path.status === "In Progress" ? "Resume Module" : "View Path",
  courseUrl: path.courseUrl,
}));
