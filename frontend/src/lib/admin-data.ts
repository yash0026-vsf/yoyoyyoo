export type DemandLevel = "High" | "Medium" | "Emerging";

export type AnalyticsRow = {
  department: string;
  competency: number;
  training: number;
  gap: number;
  outlook: "Improving" | "Stable" | "Needs Attention";
};

export type TrainingRow = {
  department: string;
  enrolled: number;
  completed: number;
  hours: number;
  completion: number;
};

export type SkillDemand = {
  skill: string;
  currentDemand: number;
  predictedDemand: number;
  growth: number;
  priority: DemandLevel;
  horizon: string;
};

export type SkillGap = {
  skill: string;
  avg_gap: number;
};

export type HeatmapItem = {
  department: string;
  skill: string;
  avg_level: number;
};

export type DemandPrediction = {
  skill: string;
  demand: DemandLevel;
  reason?: string;
};

export type AdminDashboardData = {
  total_employees: number;
  overall_skill_gaps: SkillGap[];
  competency_heatmap: HeatmapItem[];
  training_progress_percent: number;
  skill_demand_predictions?: DemandPrediction[];
};

export type AdminProfile = {
  name: string;
  initials: string;
  role: string;
  subtitle: string;
};

/* ---------------- Admin identity ---------------- */

const mockAdminProfile: AdminProfile = {
  name: "Admin",
  initials: "AD",
  role: "Admin",
  subtitle: "Workforce Intelligence",
};

/* ---------------- Admin dashboard ---------------- */

const mockAdminDashboardData: AdminDashboardData = {
  total_employees: 30,

  overall_skill_gaps: [
    { skill: "Python", avg_gap: 1.8 },
    { skill: "Data Visualization", avg_gap: 1.2 },
    { skill: "SQL", avg_gap: 1.0 },
    { skill: "AI / ML", avg_gap: 0.8 },
  ],

  competency_heatmap: [
    {
      department: "Ministry of Statistics",
      skill: "Python",
      avg_level: 2.1,
    },
    {
      department: "Ministry of Statistics",
      skill: "SQL",
      avg_level: 2.8,
    },
    {
      department: "Ministry of Statistics",
      skill: "Data Visualization",
      avg_level: 2.4,
    },
    {
      department: "Directorate of Economics",
      skill: "Python",
      avg_level: 2.7,
    },
    {
      department: "Directorate of Economics",
      skill: "SQL",
      avg_level: 3.3,
    },
    {
      department: "Directorate of Economics",
      skill: "Data Visualization",
      avg_level: 3.0,
    },
    {
      department: "State Statistics",
      skill: "Python",
      avg_level: 1.9,
    },
    {
      department: "State Statistics",
      skill: "SQL",
      avg_level: 2.2,
    },
    {
      department: "State Statistics",
      skill: "Data Visualization",
      avg_level: 2.5,
    },
  ],

  training_progress_percent: 55,

  skill_demand_predictions: [
    {
      skill: "Python",
      demand: "High",
      reason: "Growing data automation needs",
    },
    {
      skill: "AI / ML",
      demand: "High",
      reason: "Increasing demand for intelligent analytics",
    },
    {
      skill: "Cloud Computing",
      demand: "Emerging",
      reason: "Modernization of statistical infrastructure",
    },
    {
      skill: "APIs & Open Data",
      demand: "Medium",
      reason: "Expanding data exchange requirements",
    },
  ],
};

/* ---------------- Analytics ---------------- */

const mockAnalyticsRows: AnalyticsRow[] = [
  {
    department: "Ministry of Statistics",
    competency: 3.8,
    training: 72,
    gap: 1.1,
    outlook: "Improving",
  },
  {
    department: "Directorate of Economics",
    competency: 3.4,
    training: 61,
    gap: 1.4,
    outlook: "Stable",
  },
  {
    department: "State Statistics",
    competency: 2.9,
    training: 50,
    gap: 1.9,
    outlook: "Needs Attention",
  },
];

/* ---------------- Training ---------------- */

const mockTrainingRows: TrainingRow[] = [
  {
    department: "Ministry of Statistics",
    enrolled: 12,
    completed: 7,
    hours: 184,
    completion: 58,
  },
  {
    department: "Directorate of Economics",
    enrolled: 10,
    completed: 6,
    hours: 162,
    completion: 60,
  },
  {
    department: "State Statistics",
    enrolled: 8,
    completed: 4,
    hours: 96,
    completion: 50,
  },
];

/* ---------------- Skill demand ---------------- */

const mockSkillDemandData: SkillDemand[] = [
  {
    skill: "Python",
    currentDemand: 72,
    predictedDemand: 91,
    growth: 26,
    priority: "High",
    horizon: "12–24 months",
  },
  {
    skill: "Data Visualization",
    currentDemand: 64,
    predictedDemand: 82,
    growth: 28,
    priority: "High",
    horizon: "12–24 months",
  },
  {
    skill: "AI / Machine Learning",
    currentDemand: 38,
    predictedDemand: 76,
    growth: 100,
    priority: "Emerging",
    horizon: "12–24 months",
  },
  {
    skill: "Cloud Computing",
    currentDemand: 31,
    predictedDemand: 61,
    growth: 97,
    priority: "Emerging",
    horizon: "24–36 months",
  },
  {
    skill: "APIs & Open Data",
    currentDemand: 45,
    predictedDemand: 68,
    growth: 51,
    priority: "Medium",
    horizon: "12–24 months",
  },
  {
    skill: "GIS",
    currentDemand: 49,
    predictedDemand: 63,
    growth: 29,
    priority: "Medium",
    horizon: "12–24 months",
  },
];

/*
 * Integration seam:
 *
 * Later the backend team can replace ONLY these getters with API calls.
 * UI components should continue consuming the same return shapes.
 */

export function getAdminProfile(): AdminProfile {
  return mockAdminProfile;
}

export function getAdminDashboardData(): AdminDashboardData {
  return mockAdminDashboardData;
}

export function getAdminAnalyticsRows(): AnalyticsRow[] {
  return mockAnalyticsRows;
}

export function getAdminTrainingRows(): TrainingRow[] {
  return mockTrainingRows;
}

export function getAdminSkillDemandData(): SkillDemand[] {
  return mockSkillDemandData;
}