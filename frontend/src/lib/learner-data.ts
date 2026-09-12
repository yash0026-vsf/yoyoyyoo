export type DashboardSummaryStat = {
  label: string;
  tag: string;
  tagTone: "success" | "accent" | "neutral";
  value: string;
  valueNote: string;
  footnote: string;
  progress: number;
};

export type CompetencyDomain = {
  icon: string;
  title: string;
  description: string;
  score: number;
  status: string;
  tone: "success" | "destructive" | "neutral";
};

export type CompetencyScore = {
  name: string;
  score: number | null;
};

export type RadarPoint = {
  dimension: string;
  current: number;
  target: number;
};

export type RadarLegendItem = {
  label: string;
  gap: boolean;
};

export type SkillGapSummary = {
  icon: string;
  title: string;
  severity: string;
  current: string;
  required: string;
  rationale: string;
  critical: boolean;
};

export type SkillGapRow = {
  skill: string;
  category: "Technical" | "Statistical" | "Governance" | "Managerial";
  description: string;
  currentLevel: number;
  currentLabel: string;
  requiredLevel: number;
  requiredLabel: string;
  gap: number;
  priority: "High" | "Moderate" | "Low" | "On Target";
};

export type SkillGapDomain = {
  domain: string;
  gap: number;
  note: string;
};

export type LearningPathRecommendation = {
  id: number;
  title: string;
  description: string;
  whyRecommended?: string;
  provider: "iGOT" | "NSSTA" | "NIC & iGOT";
  category: string;
  duration: string;
  skills: string[];
  status: "Recommended" | "In Progress" | "Completed";
  progress: number;
  priority: "High" | "Medium";
  courseUrl?: string;
};

// Alias for compatibility
export type LearningRecommendation = LearningPathRecommendation;

export type CompetencyAssessmentState = {
  status: "Pending" | "Processing" | "Ready" | "Completed";
};

/* ---------------- Dashboard ---------------- */

export function getSummaryStats(): DashboardSummaryStat[] {
  if (typeof window !== "undefined") {
    const session = localStorage.getItem("user_assessed_gap");
    if (session) {
      try {
        const data = JSON.parse(session);
        const scorePct = data.score?.percentage ?? 80;

        // Calculate dynamic learning stats from real course progress
        const paths = getLearningRecommendations();
        let totalCompletedHours = 0;
        let totalProgressSum = 0;
        let inProgressCount = 0;

        if (paths.length > 0) {
          paths.forEach((p) => {
            const match = p.duration?.match(/(\d+(\.\d+)?)/);
            const courseHours = match ? parseFloat(match[1]) : 4;
            const progressVal =
              typeof p.progress === "number"
                ? Math.max(0, Math.min(100, p.progress))
                : 0;
            totalCompletedHours += (courseHours * progressVal) / 100;
            totalProgressSum += progressVal;
            if (p.status === "In Progress" || progressVal > 0) {
              inProgressCount++;
            }
          });
        }

        const avgProgress =
          paths.length > 0
            ? Math.round(totalProgressSum / paths.length)
            : 0;
        const formattedHours = totalCompletedHours.toFixed(1);
        const hoursTargetPct = Math.min(
          100,
          Math.round((totalCompletedHours / 50) * 100),
        );

        return [
          {
            label: "Overall Competency",
            tag: "Verified",
            tagTone: "success",
            value: `${scorePct}%`,
            valueNote: `Level ${data.current_level} Verified`,
            footnote: "Empirical score from AI Quiz Engine",
            progress: scorePct,
          },
          {
            label: "Learning Progress",
            tag: avgProgress > 0 ? "Active" : "Not Started",
            tagTone: avgProgress > 0 ? "accent" : "neutral",
            value: `${avgProgress}%`,
            valueNote:
              paths.length > 0
                ? `across ${paths.length} recommended tracks`
                : "tracks not started",
            footnote:
              inProgressCount > 0
                ? `${inProgressCount} active module(s) in progress`
                : "Start an NPTEL/iGOT course to begin",
            progress: avgProgress,
          },
          {
            label: "Total Learning Hours",
            tag: totalCompletedHours > 0 ? "Logged" : "Not Started",
            tagTone: totalCompletedHours > 0 ? "accent" : "neutral",
            value: formattedHours,
            valueNote: "hrs",
            footnote:
              totalCompletedHours > 0
                ? `${formattedHours} of 50.0 hrs annual target logged`
                : "Target: 50 hrs for fiscal year",
            progress: hoursTargetPct,
          },
          {
            label: "Active Paths",
            tag: inProgressCount > 0 ? "In Progress" : "Available",
            tagTone: inProgressCount > 0 ? "accent" : "neutral",
            value: String(inProgressCount),
            valueNote:
              paths.length > 0
                ? `of ${paths.length} tracks started`
                : "no active tracks",
            footnote:
              inProgressCount > 0
                ? `${inProgressCount} course(s) currently being studied`
                : `${paths.length} recommended course(s) ready`,
            progress: avgProgress,
          },
        ];
      } catch (e) {
        // Fallback to initial
      }
    }
  }

  // [CLEAN INITIAL STATE]: New user has not taken an assessment yet
  return [
    {
      label: "Overall Competency",
      tag: "Pending",
      tagTone: "neutral",
      value: "0%",
      valueNote: "Awaiting Assessment",
      footnote: "Take the AI Quiz to evaluate competency",
      progress: 0,
    },
    {
      label: "Learning Progress",
      tag: "Not Started",
      tagTone: "neutral",
      value: "0%",
      valueNote: "across 0 active tracks",
      footnote: "Explore recommended learning paths",
      progress: 0,
    },
    {
      label: "Total Learning Hours",
      tag: "Not Started",
      tagTone: "neutral",
      value: "0.0",
      valueNote: "hrs",
      footnote: "Target: 50 hrs for fiscal year",
      progress: 0,
    },
    {
      label: "Active Paths",
      tag: "Not Started",
      tagTone: "neutral",
      value: "0",
      valueNote: "tracks in progress",
      footnote: "No remedial tracks active yet",
      progress: 0,
    },
  ];
}

export function getCompetencyDomains(): CompetencyDomain[] {
  if (typeof window !== "undefined") {
    const session = localStorage.getItem("user_assessed_gap");
    if (session) {
      try {
        const data = JSON.parse(session);
        const scorePct = data.score?.percentage ?? 80;
        const compScores = getCurrentCompetencies();
        const statScore = compScores.find((c) => c.name === "Statistical")?.score ?? scorePct;
        const techScore = compScores.find((c) => c.name === "Technical")?.score ?? Math.round(scorePct * 0.85);
        const govScore = compScores.find((c) => c.name.includes("Governance"))?.score ?? Math.round(scorePct * 0.9);
        const leadScore = compScores.find((c) => c.name.includes("Behavioural"))?.score ?? Math.round(scorePct * 0.78);

        return [
          {
            icon: "analytics",
            title: "Statistical Sciences",
            description: "Survey Sampling, Price Statistics & SDG Metrics",
            score: statScore,
            status: statScore >= 70 ? "Benchmark Met" : `Gap: -${Math.max(0, 70 - statScore)}%`,
            tone: statScore >= 70 ? "success" : "destructive",
          },
          {
            icon: "terminal",
            title: "Technical & Analytical",
            description: "Python scripting, SQL data pipelines & GIS Spatial",
            score: techScore,
            status: techScore >= 75 ? "Benchmark Met" : `Gap: -${Math.max(0, 75 - techScore)}%`,
            tone: techScore >= 75 ? "success" : "destructive",
          },
          {
            icon: "policy",
            title: "Digital Governance",
            description: "DPDP Act 2023, Metadata Standards & DPI",
            score: govScore,
            status: govScore >= 70 ? "Benchmark Met" : `Gap: -${Math.max(0, 70 - govScore)}%`,
            tone: govScore >= 70 ? "success" : "destructive",
          },
          {
            icon: "account_tree",
            title: "Managerial & Field Lead",
            description: "Field Enumeration, Coordination & Quality Audits",
            score: leadScore,
            status: leadScore >= 70 ? "Benchmark Met" : `Gap: -${Math.max(0, 70 - leadScore)}%`,
            tone: leadScore >= 70 ? "success" : "destructive",
          },
        ];
      } catch (e) {}
    }
  }

  // [CLEAN INITIAL STATE]: 0% across all domains
  return [
    {
      icon: "analytics",
      title: "Statistical Sciences",
      description: "Survey Sampling, Price Statistics & SDG Metrics",
      score: 0,
      status: "Awaiting Assessment",
      tone: "neutral",
    },
    {
      icon: "terminal",
      title: "Technical & Analytical",
      description: "SPSS, Python scripting & GIS Spatial micro-data",
      score: 0,
      status: "Awaiting Assessment",
      tone: "neutral",
    },
    {
      icon: "policy",
      title: "Digital Governance",
      description: "DPDP Act 2023, Metadata Standards & DPI",
      score: 0,
      status: "Awaiting Assessment",
      tone: "neutral",
    },
    {
      icon: "account_tree",
      title: "Managerial & Field Lead",
      description: "Field Enumeration, Coordination & Quality Audits",
      score: 0,
      status: "Awaiting Assessment",
      tone: "neutral",
    },
  ];
}

export function getRadarData(): RadarPoint[] {
  if (typeof window !== "undefined") {
    const session = localStorage.getItem("user_assessed_gap");
    if (session) {
      try {
        const data = JSON.parse(session);
        const scorePct = data.score?.percentage ?? 80;
        const savedRows = localStorage.getItem("user_assessed_skills");
        let samplingLvl = 3;
        let pythonLvl = 2;
        let gisLvl = 2;
        let natAccountsLvl = 2;
        let qualityLvl = 3;
        let govLvl = 2;

        if (savedRows) {
          try {
            const rows = JSON.parse(savedRows) as SkillGapRow[];
            const findLevel = (str: string) =>
              rows.find((r) => r.skill.toLowerCase().includes(str.toLowerCase()))?.currentLevel;
            const sL = findLevel("sampling");
            const pL = findLevel("python");
            const gL = findLevel("gis");
            const nL = findLevel("national");
            const qL = findLevel("quality");
            const gvL = findLevel("governance");
            if (sL !== undefined) samplingLvl = sL;
            if (pL !== undefined) pythonLvl = pL;
            if (gL !== undefined) gisLvl = gL;
            if (nL !== undefined) natAccountsLvl = nL;
            if (qL !== undefined) qualityLvl = qL;
            if (gvL !== undefined) govLvl = gvL;
          } catch (e) {}
        }

        const levelToPct = (lvl: number, base: number) => {
          if (lvl >= 4) return Math.min(95, Math.max(85, base));
          if (lvl === 3) return Math.min(82, Math.max(70, Math.round(base * 0.85)));
          if (lvl === 2) return Math.min(65, Math.max(50, Math.round(base * 0.65)));
          return Math.max(30, Math.round(base * 0.45));
        };

        return [
          { dimension: "Survey Sampling", current: levelToPct(samplingLvl, scorePct), target: 80 },
          { dimension: "Visualization", current: levelToPct(qualityLvl, scorePct), target: 75 },
          { dimension: "Python", current: levelToPct(pythonLvl, scorePct), target: 75 },
          { dimension: "Nat. Accounts", current: levelToPct(natAccountsLvl, scorePct), target: 75 },
          { dimension: "Price Stats", current: Math.round(scorePct * 0.9), target: 75 },
          { dimension: "SDG Metrics", current: Math.round(scorePct * 0.88), target: 80 },
          { dimension: "GIS Spatial", current: levelToPct(gisLvl, scorePct), target: 75 },
          { dimension: "Governance", current: levelToPct(govLvl, scorePct), target: 70 },
        ];
      } catch (e) {}
    }
  }

  return [
    { dimension: "Survey Sampling", current: 0, target: 80 },
    { dimension: "Visualization", current: 0, target: 75 },
    { dimension: "Python", current: 0, target: 75 },
    { dimension: "Nat. Accounts", current: 0, target: 75 },
    { dimension: "Price Stats", current: 0, target: 75 },
    { dimension: "SDG Metrics", current: 0, target: 80 },
    { dimension: "GIS Spatial", current: 0, target: 75 },
    { dimension: "Governance", current: 0, target: 70 },
  ];
}

export function getRadarLegend(): RadarLegendItem[] {
  const radar = getRadarData();
  return radar.map((entry) => ({
    label: entry.dimension,
    gap: entry.current > 0 && entry.current < entry.target,
  }));
}

/* ---------------- Learner competency assessment ---------------- */

export const defaultBaselineCompetencies: CompetencyScore[] = [
  { name: "Statistical", score: 60 },
  { name: "Technical", score: 50 },
  { name: "Digital Governance", score: 45 },
  { name: "Behavioural", score: 55 },
];

export function getInitialCompetencies(): CompetencyScore[] {
  return defaultBaselineCompetencies;
}

export function getCurrentCompetencies(): CompetencyScore[] {
  if (typeof window !== "undefined") {
    const assessed = localStorage.getItem("user_assessed_competencies");
    if (assessed) {
      try {
        const parsed = JSON.parse(assessed) as CompetencyScore[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {}
    }

    const gapSession = localStorage.getItem("user_assessed_gap");
    if (gapSession) {
      try {
        const gapData = JSON.parse(gapSession);
        const scorePct = gapData.score?.percentage ?? 80;
        return [
          { name: "Statistical", score: scorePct },
          { name: "Technical", score: Math.round(scorePct * 0.85) },
          { name: "Digital Governance", score: Math.round(scorePct * 0.9) },
          { name: "Behavioural", score: Math.round(scorePct * 0.88) },
        ];
      } catch (e) {}
    }
  }

  return [
    { name: "Statistical", score: null },
    { name: "Technical", score: null },
    { name: "Digital Governance", score: null },
    { name: "Behavioural", score: null },
  ];
}

export function getDefaultCompetencies(): CompetencyScore[] {
  return getCurrentCompetencies();
}

export function getOverallCompetency(): number {
  if (typeof window !== "undefined") {
    const session = localStorage.getItem("user_assessed_gap");
    if (session) {
      try {
        const data = JSON.parse(session);
        if (typeof data.score?.percentage === "number") {
          return data.score.percentage;
        }
      } catch (e) {}
    }
  }
  return 0;
}

export function getCompetencyAssessmentState(): CompetencyAssessmentState {
  if (typeof window !== "undefined") {
    if (hasUserCompletedAssessment()) {
      return { status: "Completed" };
    }
  }
  return { status: "Ready" };
}

/* ---------------- Learner skill gaps ---------------- */

const mockSkillGapSummaries: SkillGapSummary[] = [
  {
    icon: "terminal",
    title: "Python for Survey Automation & Data Cleaning",
    severity: "-2 Levels",
    current: "Level 1 (Beginner)",
    required: "Level 3 (Operational)",
    rationale:
      "Required for automated validation of 79th Round NSSO unit-level data without manual script reliance.",
    critical: true,
  },
  {
    icon: "map",
    title: "GIS & Spatial Data Systems",
    severity: "-1 Level",
    current: "Level 2 (Developing)",
    required: "Level 3 (Operational)",
    rationale:
      "Needed for integrating PM Gati Shakti geospatial layers with village-level micro-data reports.",
    critical: false,
  },
  {
    icon: "account_balance",
    title: "National Accounts & GSDP Disaggregation",
    severity: "-1 Level",
    current: "Level 2 (Developing)",
    required: "Level 3 (Operational)",
    rationale:
      "Calculation of constant base price methodology for upcoming State Budget documentation.",
    critical: false,
  },
];

const mockSkillGapRows: SkillGapRow[] = [
  {
    skill: "Python for Statistical Computing",
    category: "Technical",
    description: "Pandas, NumPy, data processing and automation",
    currentLevel: 2,
    currentLabel: "Foundational",
    requiredLevel: 4,
    requiredLabel: "Advanced",
    gap: -2,
    priority: "High",
  },
  {
    skill: "GIS & Spatial Data Analysis",
    category: "Technical",
    description: "QGIS, spatial mapping and geospatial analysis",
    currentLevel: 2,
    currentLabel: "Foundational",
    requiredLevel: 3,
    requiredLabel: "Intermediate",
    gap: -1,
    priority: "Moderate",
  },
  {
    skill: "National Accounts & GSDP Estimation",
    category: "Statistical",
    description: "National accounts concepts and state estimation methods",
    currentLevel: 2,
    currentLabel: "Foundational",
    requiredLevel: 4,
    requiredLabel: "Advanced",
    gap: -2,
    priority: "High",
  },
  {
    skill: "Survey Design & Sampling",
    category: "Statistical",
    description: "Survey design, stratification and sampling estimation",
    currentLevel: 4,
    currentLabel: "Advanced",
    requiredLevel: 3,
    requiredLabel: "Intermediate",
    gap: 1,
    priority: "Low",
  },
  {
    skill: "Digital Data Governance",
    category: "Governance",
    description: "Data privacy, protection and government data standards",
    currentLevel: 4,
    currentLabel: "Advanced",
    requiredLevel: 3,
    requiredLabel: "Intermediate",
    gap: 1,
    priority: "Low",
  },
  {
    skill: "Field Operations & Quality Control",
    category: "Managerial",
    description: "Field coordination, supervision and quality audits",
    currentLevel: 3,
    currentLabel: "Intermediate",
    requiredLevel: 4,
    requiredLabel: "Advanced",
    gap: -1,
    priority: "Moderate",
  },
];

const mockSkillGapDomains: SkillGapDomain[] = [
  {
    domain: "Technical & Analytical",
    gap: 14,
    note: "Python, GIS and automated data workflows",
  },
  {
    domain: "Statistical Sciences",
    gap: 8,
    note: "National accounts and advanced estimation",
  },
  {
    domain: "Managerial & Field Operations",
    gap: 4,
    note: "Field coordination and quality controls",
  },
  {
    domain: "Digital Governance",
    gap: 0,
    note: "Current competency meets the role benchmark",
  },
];

export function hasUserCompletedAssessment(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const saved = localStorage.getItem("user_assessed_skills");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return true;
    }
    const gap = localStorage.getItem("user_assessed_gap");
    if (gap) {
      const parsed = JSON.parse(gap);
      if (parsed && typeof parsed.gap === "number") return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function getSkillGapSummaries(): SkillGapSummary[] {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("user_assessed_skills");
    if (saved) {
      try {
        const rows: SkillGapRow[] = JSON.parse(saved);
        if (Array.isArray(rows) && rows.length > 0) {
          const deficitRows = rows.filter(
            (r) => r.requiredLevel > r.currentLevel || r.priority === "High" || r.priority === "Moderate"
          );
          if (deficitRows.length > 0) {
            return deficitRows.slice(0, 4).map((r) => {
              const def = r.requiredLevel - r.currentLevel;
              return {
                icon: r.skill.toLowerCase().includes("python")
                  ? "terminal"
                  : r.skill.toLowerCase().includes("gis")
                    ? "map"
                    : r.skill.toLowerCase().includes("account")
                      ? "account_balance"
                      : "analytics",
                title: r.skill,
                severity: def > 0 ? `-${def} ${def === 1 ? "Level" : "Levels"}` : "Meets Benchmark",
                current: `Level ${r.currentLevel} (${r.currentLabel})`,
                required: `Level ${r.requiredLevel} (${r.requiredLabel})`,
                rationale: `Cadre role benchmark deficit of ${def} ${def === 1 ? "level" : "levels"} identified against official standard.`,
                critical: def >= 2 || r.priority === "High",
              };
            });
          }
        }
      } catch (e) {}
    }
  }
  return [];
}

export function getSkillGapRows(): SkillGapRow[] {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("user_assessed_skills");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {}
    }
  }
  // A new user ID has no assessed skill gaps until they complete the AI quiz
  return [];
}

export function saveSkillGapRows(rows: SkillGapRow[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("user_assessed_skills", JSON.stringify(rows));
  }
}

export function getSkillGapDomains(): SkillGapDomain[] {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("user_assessed_skills");
    if (saved) {
      try {
        const rows: SkillGapRow[] = JSON.parse(saved);
        if (Array.isArray(rows) && rows.length > 0) {
          const techGaps = rows.filter((r) => r.category === "Technical");
          const statGaps = rows.filter((r) => r.category === "Statistical");
          const govGaps = rows.filter((r) => r.category === "Governance");

          const calcDomainGap = (list: SkillGapRow[]) => {
            if (list.length === 0) return 0;
            const totalDeficit = list.reduce(
              (sum, r) => sum + Math.max(0, r.requiredLevel - r.currentLevel),
              0
            );
            return totalDeficit * 5;
          };

          return [
            {
              domain: "Technical & Analytical",
              gap: calcDomainGap(techGaps),
              note: "Python, GIS and automated data workflows",
            },
            {
              domain: "Statistical Sciences",
              gap: calcDomainGap(statGaps),
              note: "National accounts, sampling and estimation",
            },
            {
              domain: "Managerial & Field Operations",
              gap: 0,
              note: "Field coordination and quality controls",
            },
            {
              domain: "Digital Governance",
              gap: calcDomainGap(govGaps),
              note: "DPDP Act compliance and official standards",
            },
          ];
        }
      } catch (e) {}
    }
  }
  return [];
}

export function getPriorityGapCount(): number {
  return getSkillGapRows().filter(
    (r) => r.requiredLevel > r.currentLevel || r.priority === "High" || r.priority === "Moderate"
  ).length;
}

/* ---------------- [FIXED]: Learning Recommendations (Clean unstarted state) ---------------- */

const mockLearningRecommendations: LearningPathRecommendation[] = [
  {
    id: 1,
    title: "Python for Official Statistics",
    description:
      "Build practical Python skills for statistical data processing, analysis, and automation.",
    provider: "iGOT Karmayogi",
    category: "Technical",
    duration: "8 hours",
    skills: ["Python", "Data Analysis", "Automation"],
    status: "Recommended",
    progress: 0,
    priority: "High",
    whyRecommended: "Addresses verified gap in survey automated data cleaning.",
    courseUrl: "https://igotkarmayogi.gov.in",
  },
  {
    id: 2,
    title: "Data Quality and Metadata Standards",
    description:
      "Strengthen your understanding of data quality frameworks, metadata, and statistical standards.",
    provider: "NSSTA",
    category: "Statistical",
    duration: "6 hours",
    skills: ["Data Quality", "Metadata", "Standards"],
    status: "Recommended",
    progress: 0,
    priority: "High",
    whyRecommended: "Required to align micro-data with national statistical standards.",
    courseUrl: "https://igotkarmayogi.gov.in",
  },
  {
    id: 3,
    title: "SQL for Data Management",
    description:
      "Develop practical SQL capabilities for querying, transforming, and managing statistical datasets.",
    provider: "iGOT Karmayogi",
    category: "Technical",
    duration: "5 hours",
    skills: ["SQL", "Data Management"],
    status: "Recommended",
    progress: 0,
    priority: "Medium",
    whyRecommended: "Essential for querying administrative registries and surveys.",
    courseUrl: "https://igotkarmayogi.gov.in",
  },
  {
    id: 4,
    title: "Effective Data Visualization",
    description:
      "Learn how to communicate statistical findings through clear and effective visualizations.",
    provider: "iGOT Karmayogi",
    category: "Technical",
    duration: "4 hours",
    skills: ["Visualization", "Communication"],
    status: "Recommended",
    progress: 0,
    priority: "Medium",
    whyRecommended: "Supports dashboard presentations for departmental stakeholders.",
    courseUrl: "https://igotkarmayogi.gov.in",
  },
];

export function getLearningRecommendations(): LearningPathRecommendation[] {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("active_learning_paths");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // Fallback
      }
    }
  }
  // For unassessed users, there are no recommendations until the quiz is completed
  return [];
}

export function saveLearningRecommendations(paths: LearningPathRecommendation[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("active_learning_paths", JSON.stringify(paths));
  }
}
