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

export type LearningRecommendation = LearningPathRecommendation;

export type CompetencyAssessmentState = {
  status: "Pending" | "Processing" | "Ready" | "Completed";
};

const mockSummaryStats: DashboardSummaryStat[] = [
  {
    label: "Overall Competency",
    tag: "+6%",
    tagTone: "success",
    value: "74%",
    valueNote: "Level 3 Proficient",
    footnote: "DES State Average: 68%",
    progress: 74,
  },
  {
    label: "Learning Progress",
    tag: "On Track",
    tagTone: "success",
    value: "68%",
    valueNote: "across active tracks",
    footnote: "Blended NSSTA & iGOT modules",
    progress: 68,
  },
  {
    label: "Total Learning Hours",
    tag: "Logged",
    tagTone: "neutral",
    value: "42.5",
    valueNote: "hrs",
    footnote: "Logged this fiscal year (Target: 50 hrs)",
    progress: 85,
  },
  {
    label: "Active Paths",
    tag: "In Progress",
    tagTone: "accent",
    value: "2",
    valueNote: "tracks in remedial",
    footnote: "Python Automation & GIS Spatial",
    progress: 50,
  },
];

const mockCompetencyDomains: CompetencyDomain[] = [
  {
    icon: "analytics",
    title: "Statistical Sciences",
    description: "Survey Sampling, Price Statistics & SDG Metrics",
    score: 82,
    status: "Exceeds Benchmark (80%)",
    tone: "success",
  },
  {
    icon: "terminal",
    title: "Technical & Analytical",
    description: "SPSS, Python scripting & GIS Spatial micro-data",
    score: 61,
    status: "Gap: -14% (Target: 75%)",
    tone: "destructive",
  },
  {
    icon: "policy",
    title: "Digital Governance",
    description: "DPDP Act 2023, Metadata Standards & DPI",
    score: 88,
    status: "Exceeds Benchmark (70%)",
    tone: "success",
  },
  {
    icon: "account_tree",
    title: "Managerial & Field Lead",
    description: "Field Enumeration, Coordination & Quality Audits",
    score: 76,
    status: "Meets Benchmark (75%)",
    tone: "neutral",
  },
];

const mockRadarData: RadarPoint[] = [
  { dimension: "Survey Sampling", current: 88, target: 80 },
  { dimension: "Visualization", current: 75, target: 75 },
  { dimension: "Python", current: 42, target: 75 },
  { dimension: "Nat. Accounts", current: 52, target: 75 },
  { dimension: "Price Stats", current: 80, target: 75 },
  { dimension: "SDG Metrics", current: 90, target: 80 },
  { dimension: "GIS Spatial", current: 48, target: 75 },
  { dimension: "Governance", current: 85, target: 70 },
];

const mockRadarLegend: RadarLegendItem[] = [
  { label: "Survey Sampling (88%)", gap: false },
  { label: "Visualization (75%)", gap: false },
  { label: "Python (42% GAP)", gap: true },
  { label: "Nat. Accounts (52%)", gap: false },
  { label: "Price Stats (80%)", gap: false },
  { label: "SDG Metrics (90%)", gap: false },
  { label: "GIS Spatial (48% GAP)", gap: true },
  { label: "Governance (85%)", gap: false },
];

export function getSummaryStats() {
  return mockSummaryStats;
}

export function getCompetencyDomains() {
  return mockCompetencyDomains;
}

export function getRadarData() {
  return mockRadarData;
}

export function getRadarLegend() {
  return mockRadarLegend;
}

const mockDefaultCompetencies: CompetencyScore[] = [
  { name: "Statistical", score: null },
  { name: "Technical", score: null },
  { name: "Digital Governance", score: null },
  { name: "Behavioural", score: null },
];

const mockOverallCompetency = 74;
const mockCompetencyAssessmentState: CompetencyAssessmentState = {
  status: "Ready",
};

export function getDefaultCompetencies() {
  return mockDefaultCompetencies;
}

export function getOverallCompetency() {
  return mockOverallCompetency;
}

export function getCompetencyAssessmentState() {
  return mockCompetencyAssessmentState;
}

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

export function getSkillGapSummaries() {
  return mockSkillGapSummaries;
}

export function getSkillGapRows(): SkillGapRow[] {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("user_assessed_skills");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback to default
      }
    }
  }
  return mockSkillGapRows;
}

export function saveSkillGapRows(rows: SkillGapRow[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("user_assessed_skills", JSON.stringify(rows));
  }
}

export function getSkillGapDomains() {
  return mockSkillGapDomains;
}

export function getPriorityGapCount(): number {
  return getSkillGapRows().filter((r) => r.gap < 0).length;
}

const mockLearningRecommendations: LearningPathRecommendation[] = [
  {
    id: 1,
    title: "Python for Official Statistics",
    description:
      "Build practical Python skills for statistical data processing, analysis, and automation.",
    provider: "iGOT",
    category: "Technical",
    duration: "8 hours",
    skills: ["Python", "Data Analysis", "Automation"],
    status: "Recommended",
    progress: 0,
    priority: "High",
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
  },
  {
    id: 3,
    title: "SQL for Data Management",
    description:
      "Develop practical SQL capabilities for querying, transforming, and managing statistical datasets.",
    provider: "iGOT",
    category: "Technical",
    duration: "5 hours",
    skills: ["SQL", "Data Management"],
    status: "Recommended",
    progress: 0,
    priority: "Medium",
  },
  {
    id: 4,
    title: "Effective Data Visualization",
    description:
      "Learn how to communicate statistical findings through clear and effective visualizations.",
    provider: "iGOT",
    category: "Technical",
    duration: "4 hours",
    skills: ["Visualization", "Communication"],
    status: "Recommended",
    progress: 0,
    priority: "Medium",
  },
];

export function getLearningRecommendations(): LearningPathRecommendation[] {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("active_learning_paths");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback to default
      }
    }
  }
  return mockLearningRecommendations;
}

export function saveLearningRecommendations(paths: LearningPathRecommendation[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("active_learning_paths", JSON.stringify(paths));
  }
}
