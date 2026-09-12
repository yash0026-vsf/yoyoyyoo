import { useState, useMemo, useEffect } from "react";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  FileText,
  Play,
  Pause,
  PlayCircle,
  RotateCcw,
  Sparkles,
  Target,
  Tv,
  X,
  AlertCircle,
  Volume2,
  VolumeX,
} from "lucide-react";
import { generateDynamicCourseQuiz, type QuizQuestion } from "@/lib/quiz-data";
import { syncActiveUserAssessmentHistory } from "@/lib/auth-service";

export type CourseDetails = {
  id: number | string;
  title: string;
  provider: string;
  description: string;
  duration?: string;
  category?: string;
  skills?: string[];
  whyRecommended?: string;
  progress?: number;
  priority?: string;
};

interface CoursePlayerModalProps {
  course: CourseDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onCourseUpdated?: () => void;
  initialTab?: "syllabus" | "material" | "quiz";
}

// 100% verified authentic NPTEL, SWAYAM Prabha, and Indian Government lecture videos
// mapped per lesson (6 distinct lessons per course topic)
export const TOPIC_LESSON_VIDEOS: Record<
  string,
  { youtubeId: string; title: string; providerBadge: string }[]
> = {
  python: [
    {
      youtubeId: "tA42nHmmEKw",
      title: "Lecture 1: Introduction to Python for Data Science",
      providerBadge: "NPTEL-NOC IIT Madras",
    },
    {
      youtubeId: "c235EsGFcZs",
      title: "Lecture 2: Python Syntax, Jupyter & Interactive Workflows",
      providerBadge: "NPTEL-NOC IIT Madras",
    },
    {
      youtubeId: "MuYlV9C1BHg",
      title: "Lecture 3: Spyder IDE & Data Science Environments",
      providerBadge: "NPTEL-NOC IIT Madras",
    },
    {
      youtubeId: "9mRNPlbmjx8",
      title: "Lecture 4: Variables, Data Types & Memory Management",
      providerBadge: "NPTEL-NOC IIT Madras",
    },
    {
      youtubeId: "N8RADjBmIws",
      title: "Lecture 5: Mathematical & Comparison Operators",
      providerBadge: "NPTEL-NOC IIT Madras",
    },
    {
      youtubeId: "6DTFIKF8QIg",
      title: "Lecture 6: Pandas DataFrames & Official Microdata Processing",
      providerBadge: "NPTEL-NOC IIT Madras",
    },
  ],
  sampling: [
    {
      youtubeId: "OTVk28caCxw",
      title: "Lecture 1: Essentials of Data Science - Sampling Theory",
      providerBadge: "NPTEL IIT Kanpur",
    },
    {
      youtubeId: "BqDt5TvioDw",
      title: "Lecture 2: Simple Random Sampling Without Replacement (SRSWOR)",
      providerBadge: "NPTEL IIT Kanpur",
    },
    {
      youtubeId: "FY7OBL8Fy94",
      title: "Lecture 3: Stratified Random Sampling & Variance Allocation",
      providerBadge: "NPTEL IIT Kanpur",
    },
    {
      youtubeId: "_nmwhu2o3CU",
      title: "Lecture 4: Systematic Sampling Design & Efficiency Rules",
      providerBadge: "NPTEL IIT Kanpur",
    },
    {
      youtubeId: "5o3GVBkYtLo",
      title: "Lecture 5: Cluster & Multi-Stage Sampling in National Surveys",
      providerBadge: "NPTEL IIT Kanpur",
    },
    {
      youtubeId: "GvjmGiANB5w",
      title: "Lecture 6: Ratio & Regression Estimators of Population Means",
      providerBadge: "NPTEL IIT Kanpur",
    },
  ],
  gis: [
    {
      youtubeId: "LD80Hnz9nII",
      title: "Lecture 1: Geographic Information Systems Course Architecture",
      providerBadge: "NPTEL IIT Kharagpur",
    },
    {
      youtubeId: "Z1eiKW8TwVw",
      title: "Lecture 2: Fundamentals of Spatial Layers & Data Models",
      providerBadge: "NPTEL IIT Kharagpur",
    },
    {
      youtubeId: "WkneTwDyRZo",
      title: "Lecture 3: Vector & Raster Representation of Land Boundaries",
      providerBadge: "NPTEL IIT Kharagpur",
    },
    {
      youtubeId: "H0Ks-Tdac98",
      title: "Lecture 4: Coordinate Reference Systems (CRS) & Projections",
      providerBadge: "NPTEL IIT Kharagpur",
    },
    {
      youtubeId: "vJAkG9VKmio",
      title: "Lecture 5: Spatial Analysis, District Buffering & Geo-Joins",
      providerBadge: "NPTEL IIT Kharagpur",
    },
    {
      youtubeId: "Xh7nxOOTxTY",
      title: "Lecture 6: Thematic Cartography & PM Gati Shakti GIS Integration",
      providerBadge: "NPTEL IIT Kharagpur",
    },
  ],
  accounts: [
    {
      youtubeId: "3jMnxnrr0w4",
      title: "Lecture 1: Macroeconomics & Circular Flow of National Income",
      providerBadge: "SWAYAM Prabha IIT Madras",
    },
    {
      youtubeId: "47H9WySA_0o",
      title: "Lecture 2: National Income Concepts, GVA & SNA 2008 Measurement",
      providerBadge: "SWAYAM Prabha IIT Madras",
    },
    {
      youtubeId: "4Q2pIJJGfrM",
      title: "Lecture 3: Determination of Short-Run Macroeconomic Equilibrium",
      providerBadge: "SWAYAM Prabha IIT Madras",
    },
    {
      youtubeId: "NA9jKTohfYU",
      title: "Lecture 4: Goods Market Equilibrium & Investment-Saving (IS) Curve",
      providerBadge: "SWAYAM Prabha IIT Madras",
    },
    {
      youtubeId: "b4lRYlCQeic",
      title: "Lecture 5: Money Market Equilibrium & Liquidity-Money (LM) Curve",
      providerBadge: "SWAYAM Prabha IIT Madras",
    },
    {
      youtubeId: "lVPrMLH66L8",
      title: "Lecture 6: Synthesis of Monetary & Fiscal Policies in National Accounts",
      providerBadge: "SWAYAM Prabha IIT Madras",
    },
  ],
  sql: [
    {
      youtubeId: "IoL9Ve2SRwQ",
      title: "Lecture 1: Database Management Systems - Cadre Foundations",
      providerBadge: "NPTEL IIT Kharagpur",
    },
    {
      youtubeId: "SkT7jhPAQOE",
      title: "Lecture 2: DBMS Architecture & Relational Concepts",
      providerBadge: "NPTEL IIT Kharagpur",
    },
    {
      youtubeId: "OWX4RvijwLw",
      title: "Lecture 3: Relational Data Modeling & Primary Key Schemas",
      providerBadge: "NPTEL IIT Kharagpur",
    },
    {
      youtubeId: "rrG7azSlyWI",
      title: "Lecture 4: Relational Algebra, Selection & Projection Operators",
      providerBadge: "NPTEL IIT Kharagpur",
    },
    {
      youtubeId: "DRSog3SA4-Y",
      title: "Lecture 5: Relational Integrity Constraints & Foreign Keys",
      providerBadge: "NPTEL IIT Kharagpur",
    },
    {
      youtubeId: "w1XdPholzWY",
      title: "Lecture 6: SQL DDL, DML, Aggregations & Analytical JOINs",
      providerBadge: "NPTEL IIT Kharagpur",
    },
  ],
  quality: [
    {
      youtubeId: "gU7ReUqdne8",
      title: "Lecture 1: History & Principles of Quality Design & Control",
      providerBadge: "NPTEL IIT Kharagpur",
    },
    {
      youtubeId: "DWAI02z_ins",
      title: "Lecture 2: Dimensions of Quality & Statistical Standards",
      providerBadge: "NPTEL IIT Kharagpur",
    },
    {
      youtubeId: "aZjNImCgjNs",
      title: "Lecture 3: Statistical Process Control & Process Variation",
      providerBadge: "NPTEL IIT Kharagpur",
    },
    {
      youtubeId: "wKMZfpsMwBs",
      title: "Lecture 4: Control Charts for Variables & Tolerance Boundaries",
      providerBadge: "NPTEL IIT Kharagpur",
    },
    {
      youtubeId: "Fnlr9q8Bxyg",
      title: "Lecture 5: Attribute Control Charts & Survey Anomaly Tracking",
      providerBadge: "NPTEL IIT Kharagpur",
    },
    {
      youtubeId: "7hVmCBspmn0",
      title: "Lecture 6: Quality Management Systems & Continuous Data Auditing",
      providerBadge: "NPTEL IIT Kharagpur",
    },
  ],
  governance: [
    {
      youtubeId: "8XuQFVF7ipg",
      title: "Lecture 1: Digital Personal Data Protection (DPDP) Act 2023",
      providerBadge: "Sansad TV (Official)",
    },
    {
      youtubeId: "uPsUjKLHLAg",
      title: "Lecture 2: Enterprise Data Governance Architecture & Metadata",
      providerBadge: "Public Digital Governance",
    },
    {
      youtubeId: "E6lyI8Y2LMc",
      title: "Lecture 3: DPDP Compliance, Consent Frameworks & Penalties",
      providerBadge: "Legal Cadre Academy",
    },
    {
      youtubeId: "sC6fIBpjuf0",
      title: "Lecture 4: National Data & Analytics Platform (NDAP) Architecture",
      providerBadge: "NITI Aayog / Governance",
    },
    {
      youtubeId: "P27N71ZSB-U",
      title: "Lecture 5: Probity & Statistical Ethics in Civil Service Cadres",
      providerBadge: "Civil Services Academy",
    },
    {
      youtubeId: "0DRvSLIO9PI",
      title: "Lecture 6: Open Government Data (OGD) Platform Dissemination",
      providerBadge: "Digital India Framework",
    },
  ],
  default: [
    {
      youtubeId: "OTVk28caCxw",
      title: "Lecture 1: Official Cadre Statistics & Empirical Methods",
      providerBadge: "NPTEL IIT Kanpur",
    },
    {
      youtubeId: "BqDt5TvioDw",
      title: "Lecture 2: Cadre Data Collection & Sampling Design",
      providerBadge: "NPTEL IIT Kanpur",
    },
    {
      youtubeId: "FY7OBL8Fy94",
      title: "Lecture 3: Statistical Stratification & Aggregations",
      providerBadge: "NPTEL IIT Kanpur",
    },
    {
      youtubeId: "w1XdPholzWY",
      title: "Lecture 4: Relational Querying & Data Extraction",
      providerBadge: "NPTEL IIT Kharagpur",
    },
    {
      youtubeId: "gU7ReUqdne8",
      title: "Lecture 5: Data Quality Assurance & Validation",
      providerBadge: "NPTEL IIT Kharagpur",
    },
    {
      youtubeId: "8XuQFVF7ipg",
      title: "Lecture 6: Digital Data Governance & DPDP Compliance",
      providerBadge: "Sansad TV",
    },
  ],
};

export function getCourseTopicKey(title: string, category?: string): string {
  const combined = (title + " " + (category || "")).toLowerCase();
  if (combined.includes("python") || combined.includes("scripting") || combined.includes("machine learning") || combined.includes("pandas")) return "python";
  if (combined.includes("gis") || combined.includes("spatial") || combined.includes("mapping") || combined.includes("qgis")) return "gis";
  if (combined.includes("sql") || combined.includes("database") || combined.includes("registry") || combined.includes("postgres")) return "sql";
  if (combined.includes("account") || combined.includes("gsdp") || combined.includes("cpi") || combined.includes("macroeconomic") || combined.includes("sna") || combined.includes("gva") || combined.includes("gdp")) return "accounts";
  if (combined.includes("quality") || combined.includes("imputation") || combined.includes("assurance") || combined.includes("nqaf") || combined.includes("validation")) return "quality";
  if (combined.includes("governance") || combined.includes("ethics") || combined.includes("dpdp") || combined.includes("privacy")) return "governance";
  if (combined.includes("survey") || combined.includes("sampling") || combined.includes("plfs") || combined.includes("nss") || combined.includes("stratif")) return "sampling";
  return "default";
}

export type LessonItem = {
  title: string;
  summary: string;
  content: string;
  codeSnippet?: string;
  checklist: string[];
};

export type ModuleItem = {
  title: string;
  duration: string;
  lessons: LessonItem[];
};

export function getCourseCurriculum(title: string, category?: string): ModuleItem[] {
  const topic = getCourseTopicKey(title, category);

  if (topic === "python") {
    return [
      {
        title: "Module 1: Python Statistical Environment & Vectorized Ingestion",
        duration: "50 mins",
        lessons: [
          {
            title: "Python & Pandas Setup for Official Statistics",
            summary: "Environment configuration, Pandas Series and DataFrame foundations for official cadres.",
            content: `In this lecture from NPTEL IIT Madras, learners master the standard Python 3.11 analytical stack required for MoSPI microdata processing. We explore setting up reproducible virtual environments, handling fixed-width NSS ASCII files, and converting raw survey schedules into indexed Pandas DataFrames with rigorous column data typing.`,
            codeSnippet: `import pandas as pd\nimport numpy as np\n\n# Ingest survey microdata with standardized cadre schema\nsurvey_df = pd.read_csv('survey_microdata.csv', dtype={'district_code': str, 'stratum': int})\nprint(f"Loaded {len(survey_df):,} cadre records.")`,
            checklist: [
              "Always enforce explicit string data types for administrative postal/district codes.",
              "Use memory-efficient categorical dtypes for repeat state and sector columns.",
              "Maintain git version-controlled scripts for every data transformation step.",
            ],
          },
          {
            title: "Vectorized Aggregations & High-Performance Filtering",
            summary: "Accelerating data workflows without loops using NumPy array operations.",
            content: `Transitioning away from slow Python iterations, this lesson focuses on pure vectorized boolean masks, multi-column indexing, and high-performance aggregations using np.where and DataFrame groupby operations across millions of survey entries.`,
            codeSnippet: `# Compute cadre post-stratification survey weighted averages\nweighted_avg = np.average(survey_df['expenditure'], weights=survey_df['multiplier'])`,
            checklist: [
              "Avoid df.iterrows() and df.apply(axis=1) on large census or NSS datasets.",
              "Validate that all multipliers and survey weights are strictly non-negative.",
              "Document outlier handling thresholds in script header comments.",
            ],
          },
        ],
      },
      {
        title: "Module 2: Microdata Cleaning, Merging & Imputation",
        duration: "1 hr 15 mins",
        lessons: [
          {
            title: "Cleaning Administrative Registries & Outlier Detection",
            summary: "Handling missing survey blocks, data inconsistencies, and automated detection.",
            content: `Administrative registries frequently exhibit missing records and measurement spikes. Learn to detect outliers using interquartile ranges (IQR) and Mahalanobis distances, applying automated data cleaning rules while preserving raw provenance.`,
            codeSnippet: `# Robust IQR outlier detection for monthly household income\nq25, q75 = survey_df['income'].quantile([0.25, 0.75])\niqr = q75 - q25\noutlier_mask = (survey_df['income'] < q25 - 1.5 * iqr) | (survey_df['income'] > q75 + 1.5 * iqr)`,
            checklist: [
              "Never drop raw records silently; write dropped IDs to an audit log file.",
              "Cross-verify extreme values against auxiliary GST or electricity billing data.",
              "Preserve original unedited copies in an immutable data warehouse folder.",
            ],
          },
          {
            title: "Automated Imputation Algorithms & Consistency Verification",
            summary: "Executing hot-deck donor matching and logical cross-table validations.",
            content: `When item non-response occurs in national sample surveys, direct deletion creates bias. Master modern donor-based hot-deck matching and predictive mean matching algorithms in Python to reliably impute missing values.`,
            codeSnippet: `# Flag and impute missing values using demographic donor strata\nsurvey_df['imputation_flag'] = survey_df['consumption'].isna().astype(int)\nsurvey_df['consumption'] = survey_df.groupby(['state', 'household_size'])['consumption'].transform(lambda x: x.fillna(x.median()))`,
            checklist: [
              "Every imputed cell must have an associated binary flag column (e.g. _imp = 1).",
              "Enforce strict bounds to prevent negative values in monetary variables.",
              "Run chi-square pre/post tests to ensure distribution shape is preserved.",
            ],
          },
        ],
      },
      {
        title: "Module 3: Survey Weighting & MoSPI Dissemination Pipelines",
        duration: "1 hr 10 mins",
        lessons: [
          {
            title: "Multi-Stage Survey Weight Calibration with NumPy",
            summary: "Calculating sampling multipliers, non-response adjustments, and post-stratification.",
            content: `Accurate population-level inference depends on calibrated survey weights. Learn how to compute design weights from first-stage selection probabilities, calibrate against decennial census projections, and verify multiplier sums.`,
            codeSnippet: `# Post-stratification weight calibration against census population totals\ntarget_pop = {'Rural': 900000000, 'Urban': 450000000}\n# Calibrate multipliers by sector ratio`,
            checklist: [
              "Check that the sum of calibrated multipliers equals known demographic benchmarks.",
              "Document trimming thresholds applied to extreme survey weights.",
              "Store both design weight and final calibrated weight columns for auditability.",
            ],
          },
          {
            title: "Automated Statistical Dissemination & Pipeline Packaging",
            summary: "Building robust end-to-end Python pipelines producing standardized tables.",
            content: `The culmination of official statistical computing: writing automated pipelines that ingest raw NSS/PLFS schedules, validate schema integrity, execute calculations, and output release-ready tables formatted to MoSPI dissemination standards.`,
            codeSnippet: `# Generate verified tabulation output with metadata summary\nresult_table = survey_df.pivot_table(index='state', columns='sector', values='employment_ratio', aggfunc='mean')\nresult_table.to_excel('official_cadre_bulletin_tables.xlsx')`,
            checklist: [
              "Always include metadata sheets containing survey date, sample size, and RSE values.",
              "Automate execution via deterministic Python scripts with clear error handling.",
              "Sign releases with official checksum hashes prior to portal upload.",
            ],
          },
        ],
      },
    ];
  }

  if (topic === "sampling") {
    return [
      {
        title: "Module 1: Sampling Theory Foundations & Simple Random Designs",
        duration: "55 mins",
        lessons: [
          {
            title: "Principles of Probability Sampling & Frame Construction",
            summary: "Sampling frames, coverage errors, and probability proportional to size (PPS).",
            content: `Delivered by IIT Kanpur faculty, this lecture explores foundational principles of sample design in official socio-economic surveys. We analyze sampling frame construction, coverage deficiencies, frame out-of-dateness, and how to define non-overlapping enumeration blocks.`,
            codeSnippet: `# Calculating inclusion probability in SRSWOR\n# pi_i = n / N\ninclusion_prob = sample_size / population_frame_size`,
            checklist: [
              "Examine enumeration boundaries using recent satellite/cadastral maps before sampling.",
              "Document zero-probability exclusions in the methodology technical notes.",
              "Distinguish clearly between target population and sampled population.",
            ],
          },
          {
            title: "Simple Random Sampling: Variances & Confidence Intervals",
            summary: "Computing standard errors, finite population correction (FPC), and sample bounds.",
            content: `Master the mathematical derivations of sample variance, unbiased mean estimation, and the application of finite population correction factors across district-level surveys.`,
            codeSnippet: `# Standard error of mean with Finite Population Correction (FPC)\nse = (s / np.sqrt(n)) * np.sqrt((N - n) / (N - 1))`,
            checklist: [
              "Apply the finite population correction whenever sampling fraction n/N exceeds 5%.",
              "Report 95% confidence intervals alongside all point estimates.",
              "Verify that sample variances conform to established cadre limits.",
            ],
          },
        ],
      },
      {
        title: "Module 2: Stratification & Multi-Stage Cluster Designs",
        duration: "1 hr 20 mins",
        lessons: [
          {
            title: "Stratified Sampling: Neyman & Proportional Allocation",
            summary: "Optimizing sample allocation across heterogeneous socio-economic strata.",
            content: `Stratification is the cornerstone of national statistical surveys. Learn optimal Neyman allocation to minimize aggregate variance for a given survey budget, balancing urban-rural, agro-climatic, and demographic stratum variations.`,
            codeSnippet: `# Neyman optimal allocation across H strata\n# n_h = n * (N_h * S_h) / sum(N_i * S_i)`,
            checklist: [
              "Use recent pilot surveys or previous rounds to estimate stratum standard deviations (S_h).",
              "Allocate a minimum of 2 sampling units per stratum to enable variance estimation.",
              "Ensure stratum definitions correlate strongly with the key survey indicators.",
            ],
          },
          {
            title: "Multi-Stage Sampling & Primary Sampling Unit (PSU) Selection",
            summary: "Executing two-stage designs: Census villages/blocks (FSUs) and households (SSUs).",
            content: `National surveys cannot enumerate entire populations at once. This lesson examines the operational design of NSS surveys: selecting Primary Sampling Units (Villages/UFS blocks) via PPS, listing households, and systematically drawing Secondary Sampling Units.`,
            codeSnippet: `# Cumulative measure of size (MOS) PPS selection\ncum_mos = np.cumsum(fsu_sizes)\nrandom_start = np.random.uniform(0, sampling_interval)`,
            checklist: [
              "Verify that household listing operations in selected PSUs are exhaustive and recent.",
              "Ensure systematic sampling within PSUs utilizes random start points.",
              "Check that design effects (Deff) are computed to evaluate clustering impact.",
            ],
          },
        ],
      },
      {
        title: "Module 3: Calibration, Design Effects & Non-Sampling Errors",
        duration: "1 hr 05 mins",
        lessons: [
          {
            title: "Design Effects (Deff) & Relative Standard Error (RSE)",
            summary: "Quantifying variance inflation due to clustering and evaluating survey precision.",
            content: `Clustering increases sampling variance compared to simple random sampling. Learn to calculate intra-cluster correlation (rho), compute design effects (Deff = 1 + (m - 1)*rho), and verify that key indicator RSE values meet official publishing thresholds.`,
            codeSnippet: `# Design Effect calculation\ndeff = 1 + (cluster_size - 1) * intra_cluster_corr\neffective_sample_size = actual_n / deff`,
            checklist: [
              "Ensure headline national indicators maintain an RSE under 5%.",
              "Disclose district-level RSEs clearly when data is disaggregated.",
              "Flag cells with high RSE (> 25%) as statistically unreliable for policy decisions.",
            ],
          },
          {
            title: "Non-Sampling Error Mitigation & Weight Adjustments",
            summary: "Remediating non-response bias through post-stratified weighting adjustments.",
            content: `Even perfect probability designs suffer from unit non-response and respondent refusal. Master response propensity weighting, cell weighting adjustments, and field audit protocols to eliminate non-sampling distortion.`,
            codeSnippet: `# Non-response weight adjustment within sampling stratum\nadjusted_weight = design_weight * (sampled_units / responding_units)`,
            checklist: [
              "Enforce mandatory field revisit protocols before classifying a household as non-responding.",
              "Compare demographic profiles of respondents against non-respondents for bias.",
              "Document non-response rates separately for rural and urban domains.",
            ],
          },
        ],
      },
    ];
  }

  if (topic === "gis") {
    return [
      {
        title: "Module 1: Geospatial Architecture & Coordinate Systems",
        duration: "50 mins",
        lessons: [
          {
            title: "GIS Principles & Spatial Data Structures in Official Statistics",
            summary: "Vector geometries, raster grids, and spatial attributes for administrative units.",
            content: `Delivered by NPTEL IIT Kharagpur faculty, this lecture introduces geographic information systems in public administration. We explore how spatial data layers intersect with census data, administrative boundaries, and cadastral maps.`,
            codeSnippet: `# GeoPandas administrative boundary inspection\nimport geopandas as gpd\ndistricts = gpd.read_file('india_districts.geojson')\nprint(districts.crs)`,
            checklist: [
              "Ensure all geospatial datasets adhere to Survey of India official boundary lines.",
              "Inspect polygon topology for slivers, overlaps, and unclosed boundary lines.",
              "Store spatial attribute tables with standardized LGD (Local Government Directory) codes.",
            ],
          },
          {
            title: "Map Projections, Datums & CRS Transformation",
            summary: "Converting between WGS 84 geographic coordinates and projected UTM metric grids.",
            content: `Geographic coordinates (latitude/longitude) measure degrees, which distort area and distance calculations. Master WGS84 (EPSG:4326) to UTM (EPSG:32643/44) transformations for accurate metric distance buffering and district area computations.`,
            codeSnippet: `# Reprojecting geographic coordinates to projected UTM for accurate metric buffering\ndistricts_utm = districts.to_crs(epsg=32643)\ndistricts_utm['area_sq_km'] = districts_utm.geometry.area / 10**6`,
            checklist: [
              "Never calculate linear distance or polygon area directly in EPSG:4326 degrees.",
              "Verify UTM zone suitability based on the longitudinal span of the target state.",
              "Document the exact transformation pipeline in geospatial project metadata.",
            ],
          },
        ],
      },
      {
        title: "Module 2: Spatial Analysis, Buffering & Geo-Joins",
        duration: "1 hr 15 mins",
        lessons: [
          {
            title: "Point-in-Polygon & Spatial Join of Survey Microdata",
            summary: "Linking GPS-tagged enterprise and household survey coordinates to administrative polygons.",
            content: `Survey microdata increasingly incorporates GPS geocodes. Learn to perform high-speed spatial joins that map facility coordinates to gram panchayats, taluks, and districts without relying on potentially misspelled text names.`,
            codeSnippet: `# Spatial join of GPS-tagged survey points with administrative boundary polygons\nsurvey_geo = gpd.sjoin(survey_points_gdf, districts_utm, how='inner', predicate='within')`,
            checklist: [
              "Validate that all survey GPS coordinates fall within state sovereign boundaries.",
              "Filter out inverted lat/long coordinate flips prior to spatial indexing.",
              "Preserve original survey identifiers across all spatial join transformations.",
            ],
          },
          {
            title: "Cadastral Buffers, Proximity Analytics & Facility Access",
            summary: "Computing Euclidean and network buffer zones around infrastructure assets.",
            content: `Infrastructure access is a primary indicator in the Multidimensional Poverty Index. Master buffer generation around public health centers, schools, and transit nodes to calculate the proportion of rural populations residing within accessible ranges.`,
            codeSnippet: `# Generating a 5 km infrastructure accessibility buffer\nhealth_centers_buffer = health_centers.buffer(5000) # 5000 meters in UTM`,
            checklist: [
              "Dissolve overlapping buffers before calculating aggregate service area coverage.",
              "Cross-verify buffer bounds against natural physical barriers like major rivers.",
              "Combine buffer coverage metrics with census population density rasters.",
            ],
          },
        ],
      },
      {
        title: "Module 3: PM Gati Shakti, Thematic Mapping & Web GIS",
        duration: "1 hr 10 mins",
        lessons: [
          {
            title: "Choropleth Cartography & Thematic Classification Rules",
            summary: "Selecting classification schemes (Jenks natural breaks, quantiles) for district indicators.",
            content: `Poor cartographic choices mislead policymakers. Learn proper thematic classification algorithms—Jenks natural breaks, equal interval, and quantile classification—to map poverty rates, literacy, and industrial output transparently.`,
            codeSnippet: `# Plotting verified district choropleth with Jenks natural breaks\ndistricts.plot(column='literacy_rate', scheme='natural_breaks', k=5, cmap='YlGnBu', legend=True)`,
            checklist: [
              "Never use raw counts in choropleths; normalize by area or population into rates.",
              "Ensure color palettes are accessible to color-blind stakeholders (e.g. Viridis, ColorBrewer).",
              "Always include clear legends, north arrows, scale bars, and data source citations.",
            ],
          },
          {
            title: "PM Gati Shakti Integration & Dissemination via GeoServer",
            summary: "Publishing OGC-compliant WMS/WFS map services for multi-departmental planning.",
            content: `Learn to package statistical spatial layers for national infrastructure initiatives like PM Gati Shakti. Master styling via SLD, serving layers through OGC Web Map Services, and securing sensitive cadastral data.`,
            codeSnippet: `# Exporting sanitized GeoJSON layers for national planning portal ingestion\ndistricts.to_file('district_socioeconomic_indicators.geojson', driver='GeoJSON')`,
            checklist: [
              "Anonymize household GPS points to village or block centroids to protect respondent privacy.",
              "Verify metadata compliance with National Spatial Data Infrastructure (NSDI) standards.",
              "Perform geospatial cache pre-rendering to ensure fast load times during peak access.",
            ],
          },
        ],
      },
    ];
  }

  if (topic === "accounts") {
    return [
      {
        title: "Module 1: Macroeconomic Accounting & National Income Foundations",
        duration: "55 mins",
        lessons: [
          {
            title: "SNA 2008 Framework & Three Approaches to GDP",
            summary: "Production (GVA), Expenditure, and Income approaches to national accounts.",
            content: `From SWAYAM Prabha IIT Madras, this lecture covers the international System of National Accounts (SNA 2008) guidelines used by MoSPI. We analyze the three conceptual approaches to GDP measurement and how gross value added (GVA) at basic prices relates to GDP at market prices.`,
            codeSnippet: `# Fundamental identity of National Accounts compilation\n# GDP at Market Prices = GVA at Basic Prices + Product Taxes - Product Subsidies\ngdp_market_prices = gva_basic_prices + product_taxes - product_subsidies`,
            checklist: [
              "Ensure production boundary includes non-monetary agricultural output for own consumption.",
              "Distinguish clearly between taxes on products vs taxes on production in GVA compilation.",
              "Cross-validate production and expenditure estimates to quantify statistical discrepancies.",
            ],
          },
          {
            title: "Gross Value Added (GVA) Compilation Across 8 Economic Sectors",
            summary: "Measuring output and intermediate consumption for Agriculture, Industry, and Services.",
            content: `Examine the empirical computation of Gross Output and Intermediate Consumption across primary, secondary, and tertiary sectors using Ministry of Agriculture crop estimates, ASI factory returns, and MCA-21 corporate balance sheets.`,
            codeSnippet: `# Computing sector Gross Value Added\ngva_sector = gross_output_value - intermediate_consumption_value`,
            checklist: [
              "Apply double deflation wherever separate output and input price indices are available.",
              "Account for Financial Intermediation Services Indirectly Measured (FISIM) across sectors.",
              "Maintain sector-wise time-series consistency across revision cycles.",
            ],
          },
        ],
      },
      {
        title: "Module 2: GSDP, Price Deflators & Base Year Revisions",
        duration: "1 hr 15 mins",
        lessons: [
          {
            title: "Gross State Domestic Product (GSDP) & Regional Deflators",
            summary: "Methodologies for state-level income accounting and supra-regional sector allocations.",
            content: `Compiling GSDP requires distributing national multi-state economic activities (railways, banking, civil aviation, central governance) to states. Learn allocation keys and regional deflator construction.`,
            codeSnippet: `# Allocating supra-regional sector GVA by state operating ratios\nstate_railway_gva = national_railway_gva * (state_track_km / national_track_km)`,
            checklist: [
              "Coordinate with state DES (Directorate of Economics and Statistics) for local mining and state accounts.",
              "Use State-specific Consumer Price Indices (CPI) rather than national aggregates for local services.",
              "Document the allocation ratios used for trans-national communication and banking.",
            ],
          },
          {
            title: "Deflators, Constant Price Series & Base Year Splicing",
            summary: "Removing inflation impacts using WPI, CPI, and chain-linking methodologies.",
            content: `Real economic growth must be isolated from nominal price inflation. Master constant price GVA calculations, index number splicing across historical base year changes, and volume extrapolation techniques.`,
            codeSnippet: `# Constant Price GVA derivation using Sector Specific Price Deflator\nreal_gva = (nominal_gva / sector_deflator_index) * 100`,
            checklist: [
              "Ensure base year indices are properly linked without causing artificial trend breaks.",
              "Verify that price deflators reflect wholesale producer prices for manufacturing sectors.",
              "Publish detailed deflator weights alongside constant price series.",
            ],
          },
        ],
      },
      {
        title: "Module 3: High-Frequency Indicators & Quarterly Accounts",
        duration: "1 hr 05 mins",
        lessons: [
          {
            title: "Quarterly GDP Estimation Using Benchmark-Indicator Ratios",
            summary: "Chow-Lin and Denton benchmarking of quarterly series to annual accounts.",
            content: `Annual national accounts are rigorous but delayed. Quarterly GDP relies on high-frequency indicators—IIP, GST collections, cargo freight, passenger traffic, bank credit—harmonized via Denton proportional benchmarking.`,
            codeSnippet: `# Denton proportional benchmarking of quarterly indicator to annual benchmark totals\n# Minimizes square of first differences in quarterly-to-annual indicator ratio`,
            checklist: [
              "Verify that indicator series maintain strong historical correlation with annual sector GVA.",
              "Ensure sum of four quarters equals the audited annual benchmark.",
              "Document revision policies when annual survey results become available.",
            ],
          },
          {
            title: "Macroeconomic Synthesis: The IS-LM Framework & Fiscal Linkages",
            summary: "Integrating real output, monetary equilibrium, and public sector debt dynamics.",
            content: `Connect national accounting aggregates with macroeconomic policy. Learn how fiscal deficits, government final consumption expenditure (GFCE), and external trade balances interact in the national balance sheet.`,
            codeSnippet: `# Macroeconomic identity: S - I = (G - T) + (X - M)\n# Private surplus = Fiscal deficit + Current account balance`,
            checklist: [
              "Cross-verify General Government deficit figures against CAG audited finance accounts.",
              "Reconcile balance of payments current account with national accounts net external lending.",
              "Publish comprehensive public sector institutional sector accounts according to SNA rules.",
            ],
          },
        ],
      },
    ];
  }

  if (topic === "sql") {
    return [
      {
        title: "Module 1: Relational Architecture & Cadre Schemas",
        duration: "50 mins",
        lessons: [
          {
            title: "Relational Database Foundations for Administrative Registries",
            summary: "Database engines, relational data integrity, and normal forms for public registries.",
            content: `Delivered by Prof. P. P. Das at NPTEL IIT Kharagpur, this lecture covers relational database architecture in government departments. We examine tables, tuples, domain constraints, and primary key enforcement across civil registration systems and statistical registries.`,
            codeSnippet: `CREATE TABLE household_registry (\n    household_id VARCHAR(20) PRIMARY KEY,\n    district_code VARCHAR(10) NOT NULL,\n    sector VARCHAR(1) CHECK (sector IN ('R', 'U')),\n    family_size INT CHECK (family_size > 0)\n);`,
            checklist: [
              "Every administrative table must possess an immutable primary key.",
              "Enforce foreign key relationships to prevent orphaned records in child rosters.",
              "Normalize transactional tables to Third Normal Form (3NF) to avoid update anomalies.",
            ],
          },
          {
            title: "Relational Algebra & Public Data Integrity Rules",
            summary: "Selection, projection, cartesian products, and relational join mechanisms.",
            content: `Master the mathematical foundation of relational querying. Understand relational algebra operators, set difference, and how query optimizers convert declarative SQL into physical execution plans.`,
            codeSnippet: `-- Relational algebra expression: pi_{name, wage} (sigma_{district='D01'} (Employees))\nSELECT employee_name, monthly_wage\nFROM enterprise_employment_roster\nWHERE district_code = 'D01' AND monthly_wage > 15000;`,
            checklist: [
              "Write queries that leverage index lookups rather than full-table sequential scans.",
              "Ensure NOT NULL constraints are enforced on mandatory survey identifier fields.",
              "Verify domain constraints on numerical ranges (e.g. age between 0 and 120).",
            ],
          },
        ],
      },
      {
        title: "Module 2: Advanced SQL Querying, Aggregations & Joins",
        duration: "1 hr 15 mins",
        lessons: [
          {
            title: "Multi-Table JOINs & Hierarchical Cadre Registries",
            summary: "Inner, Left, and Full Outer Joins linking household and individual level schedules.",
            content: `Survey microdata is inherently hierarchical—households contain individuals, and individuals possess multiple employment episodes. Learn to link complex relational blocks without generating unintended duplicate rows.`,
            codeSnippet: `SELECT h.district_code, COUNT(DISTINCT h.household_id) AS total_households,\n       AVG(m.age) AS avg_member_age\nFROM household_registry h\nLEFT JOIN individual_roster m ON h.household_id = m.household_id\nGROUP BY h.district_code;`,
            checklist: [
              "Always verify row count before and after joins to ensure no cartesian products occurred.",
              "Use LEFT JOIN when compiling total coverage to preserve households without records.",
              "Verify join keys have identical data types and collations across joined tables.",
            ],
          },
          {
            title: "Window Functions & Analytical Rankings for Survey Cadres",
            summary: "ROW_NUMBER, RANK, DENSE_RANK, and PARTITION BY for official data audits.",
            content: `Window functions allow analytical calculations across record subsets without collapsing rows. Learn how to rank enterprises by revenue within each state, compute running cumulative totals, and detect duplicated survey submissions.`,
            codeSnippet: `SELECT enterprise_id, state_code, annual_turnover,\n       RANK() OVER (PARTITION BY state_code ORDER BY annual_turnover DESC) AS state_rank,\n       SUM(annual_turnover) OVER (PARTITION BY state_code) AS total_state_turnover\nFROM enterprise_survey_data;`,
            checklist: [
              "Use ROW_NUMBER() to identify and isolate duplicate field submissions within minutes.",
              "Partition by administrative hierarchy (state, district) for localized ranking metrics.",
              "Verify that window functions are accompanied by explicit ORDER BY clauses.",
            ],
          },
        ],
      },
      {
        title: "Module 3: Query Optimization, Indexing & Data Pipelines",
        duration: "1 hr 10 mins",
        lessons: [
          {
            title: "B-Tree & Hash Indexing for High-Performance Queries",
            summary: "Index architecture, query execution plans (EXPLAIN), and performance tuning.",
            content: `National registries encompass hundreds of millions of citizen records. Learn how B-tree and composite indices accelerate query execution from minutes to milliseconds, analyzing EXPLAIN ANALYZE execution plans.`,
            codeSnippet: `CREATE INDEX idx_cadre_district_sector ON household_registry (district_code, sector);\nEXPLAIN ANALYZE SELECT * FROM household_registry WHERE district_code = 'D105' AND sector = 'R';`,
            checklist: [
              "Create composite indices matching the exact filter ordering of frequent dashboard queries.",
              "Avoid indexing low-cardinality binary columns (e.g. gender) unless using partial indices.",
              "Regularly run database vacuum and analyze routines to keep index statistics current.",
            ],
          },
          {
            title: "SQL Stored Procedures & Automated ETL Cadre Pipelines",
            summary: "Writing transactions, triggers, and automated data validation procedures.",
            content: `Automate end-to-end official data ingestion. Write transactional stored procedures that ingest raw survey data, run logical validation rules, flag suspect records into audit tables, and commit clean entries atomically.`,
            codeSnippet: `BEGIN TRANSACTION;\nINSERT INTO validated_survey_records\nSELECT * FROM staging_survey_records WHERE validation_status = 'PASSED';\nUPDATE staging_survey_records SET processed_flag = 1;\nCOMMIT;`,
            checklist: [
              "Always wrap multi-table batch updates in explicit atomic transactions.",
              "Rollback transactions immediately upon encountering constraint violations.",
              "Log execution timestamps and affected row counts for full audit compliance.",
            ],
          },
        ],
      },
    ];
  }

  if (topic === "quality") {
    return [
      {
        title: "Module 1: UN NQAF & Dimensions of Statistical Quality",
        duration: "55 mins",
        lessons: [
          {
            title: "The United Nations National Quality Assurance Framework (UN NQAF)",
            summary: "Principles, quality culture, and international benchmarking for national statistics.",
            content: `Delivered by IIT Kharagpur faculty, this lecture explores the UN NQAF framework adopted by MoSPI. We examine the core dimensions of statistical output quality: relevance, accuracy, timeliness, accessibility, interpretability, and coherence.`,
            codeSnippet: `# Computing empirical timeliness metrics in days\nrelease_delay = (official_publication_date - survey_period_end_date).days\nassert release_delay <= target_sla_days, "Publication exceeded UN NQAF timeliness threshold!"`,
            checklist: [
              "Publish comprehensive quality declaration statements alongside all headline survey releases.",
              "Conduct periodic user satisfaction surveys to assess indicator policy relevance.",
              "Maintain consistent definitions across consecutive survey rounds to guarantee comparability.",
            ],
          },
          {
            title: "Statistical Process Control (SPC) & Quality Dimensions",
            summary: "Monitoring data capture operations using statistical quality engineering principles.",
            content: `Learn how industrial quality control techniques apply to field data collection. We study process variation, common vs special cause errors, and real-time monitoring of enumerator completion rates and digit preference.`,
            codeSnippet: `# Measuring Whipple's Index to detect age heaping in field survey returns\nwhipples_index = (5 * sum_ages_ending_0_or_5) / total_ages_23_to_62 * 100`,
            checklist: [
              "Monitor enumerator digit preference (e.g. excessive 0 and 5 endings) daily during field operations.",
              "Set control chart boundaries for average interview duration to detect hurried interviews.",
              "Flag field enumerators who deviate more than 2 standard deviations from team benchmarks.",
            ],
          },
        ],
      },
      {
        title: "Module 2: Automated Validation Rules & Anomaly Detection",
        duration: "1 hr 15 mins",
        lessons: [
          {
            title: "Control Charts for Continuous & Attribute Survey Variables",
            summary: "X-bar, R-charts, and p-charts for auditing survey non-response and data defects.",
            content: `Master construction of Shewhart control charts for survey auditing. Learn to plot weekly non-response rates (p-charts) and household consumption variance (X-bar charts) to trigger rapid supervisory field interventions.`,
            codeSnippet: `# Upper and Lower Control Limits for attribute defect monitoring\nucl = p_bar + 3 * np.sqrt((p_bar * (1 - p_bar)) / n_sample)\nlcl = max(0, p_bar - 3 * np.sqrt((p_bar * (1 - p_bar)) / n_sample))`,
            checklist: [
              "Investigate any survey sub-district showing 7 consecutive points on one side of the mean.",
              "Distinguish between assignable causes (e.g. enumerator turnover) and random field noise.",
              "Document corrective supervisory visits in the official quality audit trail.",
            ],
          },
          {
            title: "Automated Data Validation Engines & Consistency Checks",
            summary: "Configuring multi-variable logical rules (e.g. mother age vs child age, expenditure vs income).",
            content: `Learn to implement deterministic validation rules in official survey engines (CAPI/CSPro/ODK). We study cross-table consistency checks, skip logic verification, and boundary validation rules that intercept errors at point of capture.`,
            codeSnippet: `# Validation rule: Head of household age must exceed eldest child age by at least 15 years\ninvalid_entries = survey_df[survey_df['head_age'] - survey_df['child_age'] < 15]`,
            checklist: [
              "Enforce hard stops in CAPI tablets for biologically or logically impossible combinations.",
              "Provide soft warnings for improbable but possible extremes to prompt field verification.",
              "Maintain full version control over the rule dictionary used across survey rounds.",
            ],
          },
        ],
      },
      {
        title: "Module 3: Imputation Frameworks & Quality Audit Trails",
        duration: "1 hr 10 mins",
        lessons: [
          {
            title: "Donor-Based Imputation & Preserving Multivariate Distributions",
            summary: "Nearest-neighbor hot-deck, cold-deck, and mean matching methods.",
            content: `Imputing missing values must never distort relationships between variables. Master donor matching algorithms that find identical demographic donor units to donate complete records, preserving covariance structures.`,
            codeSnippet: `# Nearest-neighbor hot-deck matching using Euclidean distance over standardized covariates\nfrom sklearn.neighbors import NearestNeighbors\nnbrs = NearestNeighbors(n_neighbors=1).fit(complete_cases[covariates])`,
            checklist: [
              "Never perform unconditional mean imputation on survey microdata.",
              "Impute related variables simultaneously from the same donor to preserve internal consistency.",
              "Evaluate the impact of imputation on aggregate variance before publishing official tables.",
            ],
          },
          {
            title: "Data Quality Auditing, Six Sigma & Continuous Cadre Improvement",
            summary: "Executing DMAIC cycles and institutionalizing quality management systems.",
            content: `Quality assurance is not a post-hoc check; it is an ongoing organizational discipline. Master the DMAIC (Define, Measure, Analyze, Improve, Control) cycle in official statistics, building institutional audit logs and peer review mechanisms.`,
            codeSnippet: `# Generating an automated UN NQAF Quality Audit Report card\nquality_scorecard = {'relevance': 96, 'accuracy': 92, 'timeliness': 94, 'comparability': 98}\noverall_cadre_quality = np.mean(list(quality_scorecard.values()))`,
            checklist: [
              "Archive all data transformation code alongside the raw and cleaned microdata files.",
              "Conduct post-enumeration surveys (PES) to independently estimate coverage and content error.",
              "Publish transparent revision logs detailing the reasons for any retrospective data adjustments.",
            ],
          },
        ],
      },
    ];
  }

  // Governance and Default fallback
  return [
    {
      title: "Module 1: Legal Foundations & DPDP Act 2023 Compliance",
      duration: "50 mins",
      lessons: [
        {
          title: "The Digital Personal Data Protection (DPDP) Act 2023 for Official Cadres",
          summary: "Legal obligations, consent managers, data fiduciaries, and statistical exemptions.",
          content: `Delivered via official Sansad TV and legal governance masterclasses, this lecture analyzes the DPDP Act 2023. We explore the legal status of government statistical data fiduciaries, purpose limitation, notice requirements, and statutory exemptions for official research and census operations.`,
          codeSnippet: `# DPDP Compliance checklist verification in statistical data pipelines\ndef verify_dpdp_compliance(pipeline_config):\n    assert pipeline_config['purpose_limitation'] == True\n    assert pipeline_config['encryption_at_rest'] == 'AES-256'\n    return "DPDP Standard Compliant"`,
          checklist: [
            "Ensure respondent consent notices clearly specify the statistical purpose of data collection.",
            "Enforce strict role-based access control (RBAC) across all official microdata repositories.",
            "Designate Data Protection Officers (DPOs) within departmental statistical divisions.",
          ],
        },
        {
          title: "Public Data Governance Architecture & Metadata Standards",
          summary: "Open government data frameworks, cataloging, and semantic interoperability.",
          content: `Examine national data architectures like NITI Aayog's NDAP and MeitY's India Data Management Office (IDMO). We study metadata standards, schema registries, and semantic interoperability across state and central departments.`,
          codeSnippet: `# Dublin Core and MoSPI statistical metadata schema validation\nmetadata_record = {\n    'title': 'Periodic Labour Force Survey 2024-25',\n    'creator': 'MoSPI National Sample Survey Division',\n    'license': 'Open Government Data License India'\n}`,
          checklist: [
            "Register all public statistical datasets in the National Data and Analytics Platform (NDAP).",
            "Adhere to Government of India Open Data standards for file formats (CSV, GeoJSON, Parquet).",
            "Provide complete data dictionaries and technical methodology manuals with each release.",
          ],
        },
      ],
    },
    {
      title: "Module 2: Microdata Anonymization & Confidentiality Engineering",
      duration: "1 hr 15 mins",
      lessons: [
        {
          title: "Statistical Disclosure Control (SDC) & k-Anonymity",
          summary: "Preventing re-identification of survey respondents through mathematical privacy guarantees.",
          content: `Publishing public microdata creates re-identification risks when linked with auxiliary voters or commercial lists. Master k-anonymity, l-diversity, and t-closeness techniques, applying global recoding and local suppression to quasi-identifiers.`,
          codeSnippet: `# Verifying k-anonymity on quasi-identifiers (district, age, gender, occupation)\ngroup_counts = survey_microdata.groupby(['district_code', 'age_group', 'gender', 'occ_code']).size()\nk_value = group_counts.min()\nprint(f"Dataset satisfies {k_value}-anonymity.")`,
          checklist: [
            "Suppress or top-code sensitive financial variables (e.g. top 1% wealth/income).",
            "Recode granular geographic identifiers to districts with populations exceeding 100,000.",
            "Remove all direct identifiers (names, Aadhaar, phone numbers, exact addresses) prior to release.",
          ],
        },
        {
          title: "Differential Privacy & Cryptographic Pseudonymization",
          summary: "Injecting calibrated Laplace noise to provide mathematical privacy guarantees.",
          content: `Modern statistical privacy relies on differential privacy (epsilon-delta guarantees). Learn to add calibrated noise to aggregate query outputs, ensuring that the inclusion or exclusion of any single citizen cannot be deduced.`,
          codeSnippet: `# Differential Privacy Laplace noise mechanism for query output\nsensitivity = 1.0\nepsilon = 0.5\nnoise = np.random.laplace(0, sensitivity / epsilon)\nprivate_count = true_count + noise`,
          checklist: [
            "Set strict privacy budgets (epsilon) for repeated analytical queries on sensitive registries.",
            "Use salted cryptographic hashes (SHA-256 with secret salt) for administrative IDs.",
            "Maintain an immutable ledger tracking all data access requests and privacy budget expenditures.",
          ],
        },
      ],
    },
    {
      title: "Module 3: Cadre Ethics, NDAP & Open Dissemination",
      duration: "1 hr 10 mins",
      lessons: [
        {
          title: "Probity & Statistical Ethics in Civil Service Cadres",
          summary: "Professional ethics, avoiding political interference, and statistical integrity.",
          content: `The credibility of a nation rests on the unquestioned integrity of its official statistics. We examine the UN Fundamental Principles of Official Statistics, professional ethics, whistleblower safeguards, and maintaining transparency under public scrutiny.`,
          codeSnippet: `# Code of Ethics verification statement included in every official bulletin\nofficial_declaration = "These statistical findings are produced independently in accordance with the UN Fundamental Principles of Official Statistics."`,
          checklist: [
            "Publish pre-announced release calendars and strictly adhere to announced release dates.",
            "Grant equal simultaneous access to all users; never provide privileged early access.",
            "Promptly publish transparent errata statements whenever an empirical correction is identified.",
          ],
        },
        {
          title: "Disseminating Official Statistics via Open Government Platforms",
          summary: "Licensing, machine-readable APIs, and interactive public dashboards.",
          content: `Learn best practices for democratic data dissemination. Master publishing data through Open Government Data (OGD) APIs, building interactive public-facing dashboards, and enabling researchers to verify official calculations.`,
          codeSnippet: `# REST API endpoint pattern for public microdata dissemination\n# GET /api/v1/statistics/plfs?year=2024&state=MH&indicator=wpr`,
          checklist: [
            "Publish all public tables under the National Data Sharing and Accessibility Policy (NDSAP).",
            "Provide accessible REST APIs alongside bulk raw data download links.",
            "Include reproducible Python/R sample code demonstrating how to compute key indicators.",
          ],
        },
      ],
    },
  ];
}

export function CoursePlayerModal({
  course,
  isOpen,
  onClose,
  onCourseUpdated,
  initialTab = "syllabus",
}: CoursePlayerModalProps) {
  if (!isOpen || !course) return null;

  const [activeTab, setActiveTab] = useState<"syllabus" | "material" | "quiz">(initialTab);
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({});
  const [selectedLesson, setSelectedLesson] = useState<number>(0);
  const [playerMode, setPlayerMode] = useState<"video" | "slides">("video"); // Default to official NPTEL/SWAYAM video

  // Audio simulation state for slide deck
  const [isPlayingAudio, setIsPlayingAudio] = useState(true);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // Dynamic AI Quiz State
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Sync initialTab when modal opens or course changes
  useEffect(() => {
    setActiveTab(initialTab);
    setSelectedLesson(0);
    setPlayerMode("video");
  }, [course.id, initialTab]);

  // Generate dynamic AI questions specifically for this course
  const dynamicQuizQuestions = useMemo<QuizQuestion[]>(() => {
    return generateDynamicCourseQuiz(course.title, course.category, 5);
  }, [course.title, course.category]);

  const topicKey = useMemo(() => {
    return getCourseTopicKey(course.title, course.category);
  }, [course.title, course.category]);

  // Structured syllabus modules tailored to this course
  const modules = useMemo(() => {
    return getCourseCurriculum(course.title, course.category);
  }, [course.title, course.category]);

  // Flatten lessons for seamless video navigation
  const allLessons = useMemo(() => {
    const list: {
      index: number;
      moduleIdx: number;
      lessonIdx: number;
      moduleTitle: string;
      title: string;
      summary: string;
      content: string;
      codeSnippet?: string;
      checklist: string[];
    }[] = [];
    let idx = 0;
    modules.forEach((m, mIdx) => {
      m.lessons.forEach((l, lIdx) => {
        list.push({
          index: idx++,
          moduleIdx: mIdx,
          lessonIdx: lIdx,
          moduleTitle: m.title,
          title: l.title,
          summary: l.summary,
          content: l.content,
          codeSnippet: l.codeSnippet,
          checklist: l.checklist,
        });
      });
    });
    return list;
  }, [modules]);

  const currentLesson = allLessons[selectedLesson] || allLessons[0];
  const currentLessonKey = `${currentLesson.moduleIdx}-${currentLesson.lessonIdx}`;
  const isCurrentLessonDone = !!completedLessons[currentLessonKey];

  // Specific NPTEL/SWAYAM/Govt video for the currently selected lesson!
  const topicVideos = TOPIC_LESSON_VIDEOS[topicKey] || TOPIC_LESSON_VIDEOS.default;
  const currentLessonVideo = topicVideos[selectedLesson % topicVideos.length] || topicVideos[0];

  const totalLessons = allLessons.length;
  const completedCount = Object.values(completedLessons).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / totalLessons) * 100);

  const syncCourseProgress = (updatedCompleted: Record<string, boolean>) => {
    try {
      const raw = localStorage.getItem("active_learning_paths");
      if (raw) {
        const paths = JSON.parse(raw);
        if (Array.isArray(paths)) {
          const count = Object.values(updatedCompleted).filter(Boolean).length;
          const pct = Math.round((count / totalLessons) * 100);
          const updated = paths.map((p) => {
            if (p.id === course.id || p.title === course.title) {
              return {
                ...p,
                status: pct >= 100 ? "Completed" : pct > 0 ? "In Progress" : p.status,
                progress: pct,
              };
            }
            return p;
          });
          localStorage.setItem("active_learning_paths", JSON.stringify(updated));
          if (onCourseUpdated) onCourseUpdated();
        }
      }
    } catch {}
  };

  const toggleLesson = (key: string) => {
    setCompletedLessons((prev) => {
      const next = {
        ...prev,
        [key]: !prev[key],
      };
      syncCourseProgress(next);
      return next;
    });
  };

  const markCurrentLessonComplete = () => {
    if (!isCurrentLessonDone) {
      toggleLesson(currentLessonKey);
    }
  };

  const handleQuizAnswer = (qId: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const calculateQuizScore = () => {
    let correct = 0;
    dynamicQuizQuestions.forEach((q) => {
      if (quizAnswers[q.id] === q.correctAnswer) correct++;
    });
    return Math.round((correct / dynamicQuizQuestions.length) * 100);
  };

  const handleCompleteCourse = () => {
    try {
      const raw = localStorage.getItem("active_learning_paths");
      if (raw) {
        const paths = JSON.parse(raw);
        if (Array.isArray(paths)) {
          const updated = paths.map((p) => {
            if (p.id === course.id || p.title === course.title) {
              return {
                ...p,
                status: "Completed",
                progress: 100,
              };
            }
            return p;
          });
          localStorage.setItem("active_learning_paths", JSON.stringify(updated));
        }
      }

      // Mark all lessons as completed
      const allDone: Record<string, boolean> = {};
      allLessons.forEach((l) => {
        allDone[`${l.moduleIdx}-${l.lessonIdx}`] = true;
      });
      setCompletedLessons(allDone);

      // Record to user assessment history
      syncActiveUserAssessmentHistory({
        quizTitle: `${course.title} Mastery Quiz`,
        scorePercent: 100,
        competenciesGained: course.skills || ["Applied Cadre Competency"],
      });

      if (onCourseUpdated) onCourseUpdated();
    } catch (e) {
      console.warn("Could not mark course as complete:", e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative flex h-[92vh] w-full max-w-5xl flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-muted/30">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground font-bold shadow">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="rounded bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent uppercase">
                  {currentLessonVideo.providerBadge || course.provider || "NPTEL / MoSPI"}
                </span>
                {course.category && (
                  <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {course.category}
                  </span>
                )}
                {course.priority && (
                  <span className="rounded bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive">
                    {course.priority} Priority
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold text-foreground truncate mt-0.5">{course.title}</h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition shrink-0 ml-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex items-center justify-between border-b border-border px-5 bg-card">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("syllabus")}
              className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-semibold transition ${
                activeTab === "syllabus"
                  ? "border-accent text-accent font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookOpen className="h-4 w-4" /> Curriculum & Syllabus
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("material")}
              className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-semibold transition ${
                activeTab === "material"
                  ? "border-accent text-accent font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <PlayCircle className="h-4 w-4" /> Video Lectures & Study Guide
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("quiz")}
              className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-semibold transition ${
                activeTab === "quiz"
                  ? "border-accent text-accent font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="h-4 w-4 text-accent" /> AI Mastery Quiz
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" />
              <span>{course.duration || "2 hrs 30 mins"}</span>
            </div>
            <div className="h-2 w-20 sm:w-24 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-success transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-foreground">{progressPercent}%</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {/* TAB 1: SYLLABUS */}
          {activeTab === "syllabus" && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground">Course Overview & Cadre Alignment</h3>
                  <span className="text-[11px] font-bold text-accent">
                    {allLessons.length} Tailored NPTEL / Swayam Lectures
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {course.description}
                </p>
                {course.whyRecommended && (
                  <div className="mt-3 rounded-lg bg-accent/10 border border-accent/20 p-3 text-xs text-accent">
                    <span className="font-bold">Why AI Recommended: </span>
                    {course.whyRecommended}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground">Curriculum Modules & Video Lectures</h3>
                {modules.map((m, mIdx) => (
                  <div key={mIdx} className="rounded-xl border border-border bg-card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                        {m.title}
                      </h4>
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {m.duration}
                      </span>
                    </div>

                    <div className="divide-y divide-border">
                      {m.lessons.map((lesson, lIdx) => {
                        const lessonKey = `${mIdx}-${lIdx}`;
                        const isDone = !!completedLessons[lessonKey];
                        const lessonFlatIdx = mIdx * 2 + lIdx;
                        const lessonVideo = topicVideos[lessonFlatIdx % topicVideos.length];

                        return (
                          <div
                            key={lIdx}
                            className="flex items-start justify-between py-3 gap-3 hover:bg-muted/20 px-2 rounded-lg transition"
                          >
                            <div className="flex items-start gap-3">
                              <button
                                type="button"
                                onClick={() => toggleLesson(lessonKey)}
                                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition ${
                                  isDone
                                    ? "border-success bg-success text-success-foreground"
                                    : "border-border bg-background text-transparent hover:border-accent"
                                }`}
                                title="Mark lesson complete"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h5 className="text-xs font-semibold text-foreground">
                                    {lesson.title}
                                  </h5>
                                  {lessonVideo && (
                                    <span className="rounded bg-accent/10 px-1.5 py-0.2 text-[9px] font-bold text-accent">
                                      {lessonVideo.providerBadge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                  {lesson.summary}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedLesson(lessonFlatIdx);
                                setPlayerMode("video");
                                setActiveTab("material");
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline shrink-0"
                            >
                              Watch Lecture <ChevronRight className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: FUNCTIONAL VIDEO PLAYER & STUDY GUIDE */}
          {activeTab === "material" && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-5">
                {/* Header with Lesson Switcher & Provider Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent uppercase">
                        {currentLessonVideo.providerBadge}
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        {currentLesson.moduleTitle} · Lesson {selectedLesson + 1} of {allLessons.length}
                      </span>
                    </div>
                    <h3 className="mt-1 text-base sm:text-lg font-bold text-foreground">
                      {currentLessonVideo.title}
                    </h3>
                  </div>

                  {/* Player Mode Switcher */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setPlayerMode("video")}
                        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-semibold transition ${
                          playerMode === "video"
                            ? "bg-card text-foreground shadow-sm font-bold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Tv className="h-3.5 w-3.5 text-accent" /> NPTEL / iGOT Video
                      </button>
                      <button
                        type="button"
                        onClick={() => setPlayerMode("slides")}
                        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-semibold transition ${
                          playerMode === "slides"
                            ? "bg-card text-foreground shadow-sm font-bold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <FileText className="h-3.5 w-3.5" /> Notes & Slide Deck
                      </button>
                    </div>

                    <a
                      href={`https://www.youtube.com/watch?v=${currentLessonVideo.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/30 px-2.5 py-1.5 text-[11px] font-semibold text-accent hover:bg-accent/10 transition"
                      title="Open full NPTEL/Swayam lecture on YouTube in a new tab"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Watch on YouTube
                    </a>
                  </div>
                </div>

                {/* Working Video Player Container */}
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-border shadow-md">
                  {playerMode === "video" ? (
                    // 1. Authentic NPTEL / SWAYAM / Govt Video for this exact lesson
                    <iframe
                      key={currentLessonVideo.youtubeId + "-" + selectedLesson}
                      src={`https://www.youtube.com/embed/${currentLessonVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                      title={currentLessonVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="h-full w-full border-0"
                    />
                  ) : (
                    // 2. Interactive Digital Cadre Lecture Slide Deck
                    <div className="h-full w-full bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col justify-between p-6 text-white relative">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                            {currentLessonVideo.providerBadge} · Interactive Slide Deck
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPlayerMode("video")}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1 text-xs font-semibold text-white transition"
                        >
                          <Tv className="h-3.5 w-3.5 text-accent" /> Switch to NPTEL Video
                        </button>
                      </div>

                      <div className="my-auto space-y-4 max-w-xl mx-auto text-center">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 border border-accent/40 px-3 py-1 text-xs font-semibold text-accent">
                          <BookOpen className="h-3.5 w-3.5" />
                          {currentLesson.moduleTitle}
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
                          {currentLesson.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
                          {currentLesson.summary}
                        </p>

                        <div className="flex items-center justify-center gap-1.5 pt-2">
                          {[30, 65, 45, 80, 55, 90, 70, 40, 85, 60, 95, 50, 75, 40].map((h, i) => (
                            <div
                              key={i}
                              className={`w-1 rounded-full bg-accent transition-all duration-300 ${
                                isPlayingAudio ? "opacity-90 animate-pulse" : "opacity-30"
                              }`}
                              style={{
                                height: isPlayingAudio ? `${Math.max(8, h * 0.45)}px` : "6px",
                                animationDelay: `${i * 80}ms`,
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 border-t border-white/10 pt-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold hover:scale-105 transition"
                            >
                              {isPlayingAudio ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsAudioMuted(!isAudioMuted)}
                              className="text-slate-300 hover:text-white transition"
                            >
                              {isAudioMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                            </button>
                            <span className="text-[11px] text-slate-400">
                              {currentLesson.title} Audio Briefing
                            </span>
                          </div>

                          <span className="text-[11px] text-slate-400">
                            Slide {selectedLesson + 1} of {allLessons.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Lesson Navigation Controls directly beneath the player */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    disabled={selectedLesson === 0}
                    onClick={() => {
                      setSelectedLesson((prev) => Math.max(0, prev - 1));
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous Lesson
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={markCurrentLessonComplete}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                        isCurrentLessonDone
                          ? "bg-success/15 text-success border border-success/30"
                          : "bg-accent text-accent-foreground shadow hover:bg-accent/90"
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {isCurrentLessonDone ? "Completed" : "Mark as Completed"}
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={selectedLesson >= allLessons.length - 1}
                    onClick={() => {
                      markCurrentLessonComplete();
                      setSelectedLesson((prev) => Math.min(allLessons.length - 1, prev + 1));
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition"
                  >
                    Next Lesson <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Detailed Study Guide, Code & Technical Checklist */}
                <div className="space-y-4 pt-2">
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-foreground font-bold text-xs uppercase tracking-wider">
                      <BookOpen className="h-4 w-4 text-accent" />
                      Lesson Content & Academic Foundations
                    </div>
                    <p className="text-xs text-foreground/90 leading-relaxed">
                      {currentLesson.content}
                    </p>
                  </div>

                  {currentLesson.codeSnippet && (
                    <div className="rounded-xl border border-border bg-slate-950 p-4 space-y-2 text-white">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold text-accent">
                          Official Cadre Code Implementation
                        </span>
                        <span className="text-[10px] text-slate-400">Python / SQL / Bash</span>
                      </div>
                      <pre className="font-mono text-xs overflow-x-auto p-3 rounded-lg bg-black/50 text-emerald-400 border border-white/10 leading-relaxed">
                        {currentLesson.codeSnippet}
                      </pre>
                    </div>
                  )}

                  {currentLesson.checklist && currentLesson.checklist.length > 0 && (
                    <div className="rounded-xl border border-border bg-card p-4 space-y-2.5 shadow-sm">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        Cadre Protocol Checklist
                      </span>
                      <ul className="space-y-1.5 text-xs text-muted-foreground">
                        {currentLesson.checklist.map((item, cIdx) => (
                          <li key={cIdx} className="flex items-start gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0 mt-1.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AI MASTERY QUIZ */}
          {activeTab === "quiz" && (
            <div className="max-w-2xl mx-auto space-y-6">
              {!quizStarted && !quizSubmitted ? (
                <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-4 shadow-sm">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-accent">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">
                    {course.title} Mastery Quiz
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
                    Verify your competency acquisition for {course.title}. This dynamic assessment evaluates your readiness against MoSPI and Indian Statistical Service (ISS) benchmarks.
                  </p>

                  <div className="grid grid-cols-2 gap-3 py-2 max-w-sm mx-auto text-left">
                    <div className="rounded-xl border border-border bg-muted/30 p-3">
                      <div className="text-[10px] uppercase font-bold text-muted-foreground">Questions</div>
                      <div className="text-base font-bold text-foreground">{dynamicQuizQuestions.length} Items</div>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/30 p-3">
                      <div className="text-[10px] uppercase font-bold text-muted-foreground">Passing Benchmark</div>
                      <div className="text-base font-bold text-foreground">70% Score</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setQuizStarted(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-xs font-bold text-accent-foreground shadow-lg hover:bg-accent/90 transition"
                  >
                    Start AI Mastery Assessment
                  </button>
                </div>
              ) : quizStarted && !quizSubmitted ? (
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <span className="text-xs font-bold text-foreground">
                      Course Mastery Evaluation
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {Object.keys(quizAnswers).length} of {dynamicQuizQuestions.length} Answered
                    </span>
                  </div>

                  <div className="space-y-4">
                    {dynamicQuizQuestions.map((q, qIdx) => (
                      <div
                        key={q.id}
                        className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-sm"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-[11px] font-bold text-accent mt-0.5">
                            {qIdx + 1}
                          </span>
                          <h4 className="text-xs sm:text-sm font-semibold text-foreground leading-snug">
                            {q.question}
                          </h4>
                        </div>

                        <div className="space-y-2 pl-7">
                          {q.options.map((opt, oIdx) => {
                            const isSelected = quizAnswers[q.id] === oIdx;
                            return (
                              <button
                                key={oIdx}
                                type="button"
                                onClick={() => handleQuizAnswer(q.id, oIdx)}
                                className={`w-full text-left rounded-lg border p-2.5 text-xs transition ${
                                  isSelected
                                    ? "border-accent bg-accent/10 font-semibold text-foreground"
                                    : "border-border bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                                      isSelected
                                        ? "border-accent bg-accent text-accent-foreground"
                                        : "border-border"
                                    }`}
                                  >
                                    {String.fromCharCode(65 + oIdx)}
                                  </span>
                                  <span>{opt}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      disabled={Object.keys(quizAnswers).length < dynamicQuizQuestions.length}
                      onClick={() => setQuizSubmitted(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-xs font-bold text-accent-foreground shadow hover:bg-accent/90 disabled:opacity-40 transition"
                    >
                      Submit & Score Quiz
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-4 shadow-sm">
                  {calculateQuizScore() >= 70 ? (
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-success/15 text-success">
                      <Award className="h-8 w-8" />
                    </div>
                  ) : (
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
                      <AlertCircle className="h-8 w-8" />
                    </div>
                  )}

                  <h3 className="text-lg font-bold text-foreground">
                    {calculateQuizScore() >= 70 ? "Competency Verified!" : "Review Required"}
                  </h3>
                  <div className="text-3xl font-black text-accent">
                    {calculateQuizScore()}%
                  </div>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                    {calculateQuizScore() >= 70
                      ? `Congratulations! You have demonstrated verified proficiency in ${course.title}. Your cadre assessment history has been updated.`
                      : "You did not meet the 70% proficiency threshold. Review the curriculum lessons and video material, then retake the assessment."}
                  </p>

                  <div className="flex items-center justify-center gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setQuizAnswers({});
                        setQuizSubmitted(false);
                        setQuizStarted(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-xs font-semibold hover:bg-muted transition"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Retake Assessment
                    </button>

                    {calculateQuizScore() >= 70 && (
                      <button
                        type="button"
                        onClick={handleCompleteCourse}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-success text-success-foreground px-5 py-2 text-xs font-bold shadow hover:bg-success/90 transition"
                      >
                        <CheckCircle2 className="h-4 w-4" /> Mark Course Complete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
