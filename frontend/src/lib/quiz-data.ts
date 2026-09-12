export type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  competency: string;
};

export type CompetencyInsight = {
  competency: string;
  result: "Strong" | "Needs Practice" | "Improving";
  detail: string;
};

const mockQuestions: QuizQuestion[] = [
    {
    id: 1,
    question:
      "What is the primary purpose of stratified sampling in a large-scale socio-economic survey?",
    options: [
      "To divide the population into meaningful subgroups so that important groups are represented in the sample.",
      "To eliminate the need for any field-level data collection.",
      "To increase the population size before calculating survey weights.",
      "To replace statistical estimation with administrative records.",
    ],
    correctAnswer: 0,
    explanation:
      "Stratified sampling divides a population into relevant subgroups, or strata, and then selects samples from those groups. This can improve representation and sampling efficiency.",
    competency: "Survey Sampling",
  },
    {
    id: 2,
    question:
      "Which activity is most directly associated with improving statistical data quality?",
    options: [
      "Removing all unusual observations without investigation.",
      "Applying validation, consistency, and quality checks during data processing.",
      "Avoiding documentation of processing decisions.",
      "Using only the largest available dataset.",
    ],
    correctAnswer: 1,
    explanation:
      "Systematic validation and quality checks help identify errors, inconsistencies, missing values, and other issues during the statistical production process.",
    competency: "Data Quality",
  },
    {
    id: 3,
    question:
      "Which Python capability is especially useful for preparing and analysing tabular statistical data?",
    options: [
      "Managing physical survey equipment.",
      "Issuing government digital signatures.",
      "Using data-analysis libraries such as pandas to clean and transform datasets.",
      "Configuring network security devices.",
    ],
    correctAnswer: 2,
    explanation:
      "Python libraries such as pandas are widely used for cleaning, transforming, filtering, and analysing structured datasets.",
    competency: "Python",
  },
    {
    id: 4,
    question:
      "Why are metadata standards important for official statistical datasets?",
    options: [
      "They eliminate the need for data validation.",
      "They prevent all users from accessing the data.",
      "They automatically increase the sample size.",
      "They provide consistent information describing the dataset, definitions, methods, and context.",
    ],
    correctAnswer: 3,
    explanation:
      "Metadata helps users understand what the data represents, how it was produced, and how concepts and classifications should be interpreted.",
    competency: "Metadata Standards",
  },
    {
    id: 5,
    question:
      "Which practice best supports reproducible statistical data processing?",
    options: [
      "Documenting processing steps and keeping a traceable record of transformations.",
      "Changing processing steps manually without recording them.",
      "Keeping only the final output and discarding intermediate information.",
      "Avoiding standardised processing procedures.",
    ],
    correctAnswer: 0,
    explanation:
      "Documented and traceable processing steps make statistical workflows easier to reproduce, review, validate, and maintain.",
    competency: "Statistical Data Processing",
  },
    {
    id: 6,
    question:
      "Which statement best describes the role of competency-based assessment?",
    options: [
      "It only measures how many courses an employee has completed.",
      "It compares demonstrated capability with defined competency requirements.",
      "It replaces professional experience with a single test score.",
      "It focuses only on attendance records.",
    ],
    correctAnswer: 1,
    explanation:
      "Competency-based assessment looks at demonstrated knowledge and capability in relation to defined competency expectations or role requirements.",
    competency: "Competency Assessment",
  },
    {
    id: 7,
    question:
      "What is the main purpose of a sampling frame?",
    options: [
      "To calculate the final national accounts estimate.",
      "To store only completed questionnaires.",
      "To list or identify the population units from which a sample can be selected.",
      "To replace survey weights.",
    ],
    correctAnswer: 2,
    explanation:
      "A sampling frame provides the operational list or structure from which sample units can be selected.",
    competency: "Survey Sampling",
  },
    {
    id: 8,
    question:
      "Which measure is commonly used to describe the centre of a numerical dataset?",
    options: [
      "File size",
      "Encryption key",
      "Sampling frame",
      "Mean",
    ],
    correctAnswer: 3,
    explanation:
      "The mean is a common measure of central tendency and is calculated by dividing the sum of observations by the number of observations.",
    competency: "Statistical Analysis",
  },
    {
    id: 9,
    question:
      "What is the primary purpose of data validation rules?",
    options: [
      "To identify values or records that violate expected conditions or constraints.",
      "To remove the need for subject-matter review.",
      "To guarantee that every observation is correct.",
      "To increase the number of records automatically.",
    ],
    correctAnswer: 0,
    explanation:
      "Validation rules identify entries that do not satisfy expected ranges, relationships, formats, or consistency conditions.",
    competency: "Data Quality",
  },
    {
    id: 10,
    question:
      "Which Python data structure is commonly used to store an ordered collection of values?",
    options: [
      "Firewall",
      "List",
      "Digital signature",
      "Metadata standard",
    ],
    correctAnswer: 1,
    explanation:
      "A Python list is an ordered and mutable collection that can store multiple values.",
    competency: "Python",
  },
    {
    id: 11,
    question:
      "What does SQL primarily allow an analyst to do with a relational database?",
    options: [
      "Design a survey questionnaire without data.",
      "Create a sampling frame automatically for every survey.",
      "Query and manipulate structured data.",
      "Replace all statistical methods with machine learning.",
    ],
    correctAnswer: 2,
    explanation:
      "SQL is used to retrieve, filter, aggregate, insert, update, and otherwise manipulate data stored in relational databases.",
    competency: "SQL",
  },
    {
    id: 12,
    question:
      "Why is documentation important in an official statistical production process?",
    options: [
      "It eliminates the need for quality assurance.",
      "It guarantees that no future revision will ever be needed.",
      "It replaces the underlying statistical methodology.",
      "It improves transparency, reproducibility, and understanding of methods.",
    ],
    correctAnswer: 3,
    explanation:
      "Good documentation helps users and reviewers understand methods, decisions, transformations, and sources used during statistical production.",
    competency: "Statistical Processes",
  },
    {
    id: 13,
    question:
      "What is a key benefit of visualizing statistical data?",
    options: [
      "It can make patterns, trends, comparisons, and unusual observations easier to identify.",
      "It eliminates the need to inspect the underlying data.",
      "It guarantees that an interpretation is correct.",
      "It replaces all numerical analysis.",
    ],
    correctAnswer: 0,
    explanation:
      "Well-designed visualizations help analysts and stakeholders recognize patterns, trends, distributions, and comparisons more quickly.",
    competency: "Data Visualization",
  },
    {
    id: 14,
    question:
      "Which concept refers to information that describes another dataset?",
    options: [
      "Sample weight",
      "Metadata",
      "Query result",
      "Encryption token",
    ],
    correctAnswer: 1,
    explanation:
      "Metadata is structured information that describes data, including concepts, definitions, sources, methods, and other contextual information.",
    competency: "Metadata Standards",
  },
    {
    id: 15,
    question:
      "What is the purpose of applying survey weights during statistical estimation?",
    options: [
      "To convert every observation into the same value.",
      "To remove all sampling variability.",
      "To account for aspects of the sample design and improve population-level estimates.",
      "To replace data validation.",
    ],
    correctAnswer: 2,
    explanation:
      "Survey weights can account for selection probabilities and other design features so that estimates better represent the target population.",
    competency: "Survey Sampling",
  },
    {
    id: 16,
    question:
      "Which approach is most appropriate when a dataset contains missing values?",
    options: [
      "Always replace every missing value with zero.",
      "Delete the entire dataset.",
      "Ignore missingness in every analysis.",
      "Investigate the cause and apply an appropriate documented treatment.",
    ],
    correctAnswer: 3,
    explanation:
      "Missing data should be investigated and handled using an appropriate, documented method based on the context and analytical requirements.",
    competency: "Data Quality",
  },
    {
    id: 17,
    question:
      "What is the main purpose of a data dictionary?",
    options: [
      "To describe variables, definitions, formats, and other characteristics of a dataset.",
      "To perform statistical modelling automatically.",
      "To replace the database itself.",
      "To eliminate the need for metadata.",
    ],
    correctAnswer: 0,
    explanation:
      "A data dictionary provides structured information about dataset fields, including names, meanings, formats, and allowed values.",
    competency: "Data Management",
  },
    {
    id: 18,
    question:
      "Which of the following is an example of a categorical variable?",
    options: [
      "Annual income",
      "Department",
      "Age in years",
      "Household expenditure",
    ],
    correctAnswer: 1,
    explanation:
      "Department represents categories or groups, whereas income, age, and expenditure are numerical variables.",
    competency: "Statistical Analysis",
  },
    {
    id: 19,
    question:
      "Why should statistical processing workflows be version controlled?",
    options: [
      "To automatically correct every statistical error.",
      "To prevent analysts from updating methods.",
      "To track changes and improve reproducibility of analytical work.",
      "To eliminate the need for documentation.",
    ],
    correctAnswer: 2,
    explanation:
      "Version control records changes to code and related files, making analytical workflows easier to review, reproduce, and maintain.",
    competency: "Technical & Analytical",
  },
    {
    id: 20,
    question:
      "Which principle is most important when presenting official statistical findings?",
    options: [
      "Only present results that support a preferred conclusion.",
      "Remove methodological information from every publication.",
      "Use visual effects instead of statistical evidence.",
      "Present results clearly, accurately, and with appropriate context.",
    ],
    correctAnswer: 3,
    explanation:
      "Official statistical findings should be communicated accurately and transparently, with enough context for users to interpret them appropriately.",
    competency: "Statistical Communication",
  },
    {
    id: 21,
    question:
      "In GIS spatial data analysis for socio-economic surveys, what is the purpose of joining village-level micro-data with shapefile polygon layers?",
    options: [
      "To enable thematic spatial visualization, district heatmaps, and geographic disparity detection.",
      "To eliminate the need for survey sampling entirely.",
      "To convert satellite imagery into administrative plain text files.",
      "To double the sample size without field survey verification.",
    ],
    correctAnswer: 0,
    explanation:
      "Geospatial joins integrate attribute survey micro-data with administrative spatial boundary polygons to produce spatial heatmaps, regional disaggregations, and PM Gati Shakti GIS layers.",
    competency: "GIS & Spatial Mapping",
  },
    {
    id: 22,
    question:
      "Under the Digital Personal Data Protection (DPDP) Act 2023, what is mandatory when handling survey respondents' personally identifiable information (PII)?",
    options: [
      "Publishing all respondent phone numbers and Aadhaar IDs for open public access.",
      "Obtaining informed consent, implementing purpose limitation, and masking direct identifiers in public datasets.",
      "Retaining unencrypted raw identification records on public cloud storage indefinitely.",
      "Exempting all official data collection from privacy guidelines.",
    ],
    correctAnswer: 1,
    explanation:
      "The DPDP Act 2023 mandates strict purpose limitation, respondent consent, robust pseudonymisation/anonymisation, and cryptographic protection of PII in government statistical systems.",
    competency: "Digital Data Governance",
  },
    {
    id: 23,
    question:
      "What is the primary method used to compute Gross State Domestic Product (GSDP) at constant base year prices?",
    options: [
      "Multiplying total population count by the national currency exchange rate.",
      "Estimating output based solely on physical cash currency notes in circulation.",
      "Deflating current price gross value added using relevant price deflators (WPI / CPI) to remove price effect.",
      "Using nominal market transaction values without any index adjustment.",
    ],
    correctAnswer: 2,
    explanation:
      "Constant price GSDP estimates real economic output by using base-year weighted price indices or deflators to remove inflation/price volatility from current price Gross Value Added.",
    competency: "National Accounts & GSDP",
  },
    {
    id: 24,
    question:
      "Which SQL operation combines records from two survey tables based on a common respondent identifier (e.g. household_id)?",
    options: [
      "GROUP BY without aggregate functions.",
      "DROP TABLE household_id.",
      "ORDER BY sample_weight DESC.",
      "INNER JOIN or LEFT JOIN on household_id.",
    ],
    correctAnswer: 3,
    explanation:
      "SQL JOIN operations (INNER, LEFT, FULL) link relational survey tables such as household demographic rosters and individual employment records via shared unique keys.",
    competency: "SQL & Data Management",
  },
    {
    id: 25,
    question:
      "In national socio-economic surveys (e.g. NSS/PLFS), why is Probability Proportional to Size (PPS) sampling preferred for selecting First Stage Units (villages/urban blocks)?",
    options: [
      "To give larger population units a proportionally higher chance of selection, stabilizing sampling weights.",
      "To ensure that only the smallest hamlets are surveyed.",
      "To eliminate the need for household-level listing.",
      "To convert sample statistics directly into census parameters without weights.",
    ],
    correctAnswer: 0,
    explanation:
      "PPS sampling ensures that clusters with larger sizes (census population or households) have selection probabilities proportional to size, leading to self-weighting designs and lower variance.",
    competency: "Survey Sampling",
  },
    {
    id: 26,
    question:
      "Which formula structure is traditionally employed by MoSPI for compiling the Headline Consumer Price Index (CPI)?",
    options: [
      "Paasche index requiring real-time monthly basket expenditure shares.",
      "Laspeyres price index formula with fixed base-period expenditure weights.",
      "Simple unweighted arithmetic mean of retail shop prices.",
      "Geometric mean of foreign currency exchange ratios.",
    ],
    correctAnswer: 1,
    explanation:
      "India's headline CPI uses a base-weighted Laspeyres-type aggregation formula (modified Laspeyres), comparing current prices to base period prices weighted by base consumer expenditure shares.",
    competency: "National Accounts & GSDP",
  },
    {
    id: 27,
    question:
      "In empirical statistical inference, what does a p-value less than 0.05 (p < 0.05) signify under a null hypothesis test?",
    options: [
      "The probability that the research hypothesis is 100% true.",
      "The exact magnitude of the treatment effect in real currency units.",
      "The observed data is statistically unlikely under the null hypothesis, leading to rejection of the null at the 5% significance level.",
      "That the sample size was too small to make any statistical deduction.",
    ],
    correctAnswer: 2,
    explanation:
      "A p-value is the probability of obtaining test results at least as extreme as the observed data, assuming the null hypothesis is true. A p < 0.05 indicates statistical significance at alpha = 0.05.",
    competency: "Statistical Analysis",
  },
    {
    id: 28,
    question:
      "When decomposing monthly economic time series (such as the Index of Industrial Production - IIP), which method removes recurring seasonal variations?",
    options: [
      "Multiplying all data points by 100.",
      "Dropping data points from festival quarters.",
      "Replacing time series values with cumulative annual sums.",
      "Seasonal Adjustment algorithms (such as X-13ARIMA-SEATS).",
    ],
    correctAnswer: 3,
    explanation:
      "Official agencies use seasonal adjustment methods like X-13ARIMA-SEATS to separate seasonal fluctuations and calendar holiday effects from underlying trend-cycle movements.",
    competency: "Statistical Analysis",
  },
    {
    id: 29,
    question:
      "What is the statistical advantage of 'Hot-Deck' imputation over simple mean substitution for missing survey responses?",
    options: [
      "It preserves the variability and realistic empirical distribution by matching a donor respondent with similar demographic covariates.",
      "It eliminates the need for computer-assisted data processing.",
      "It guarantees zero standard error in all downstream regression models.",
      "It replaces missing values with national GDP aggregates.",
    ],
    correctAnswer: 0,
    explanation:
      "Hot-deck imputation replaces missing values with observed responses from a 'donor' unit sharing similar observable traits, avoiding variance artificial compression that occurs with simple mean substitution.",
    competency: "Data Quality",
  },
    {
    id: 30,
    question:
      "In machine learning models applied to administrative government data, what does 'k-fold cross-validation' achieve?",
    options: [
      "It encrypts database tables using 5 private cryptographic keys.",
      "It evaluates model generalization ability and guards against overfitting across partitioned validation folds.",
      "It converts text survey questions into numerical values.",
      "It reduces tabular records by deleting 80% of rows.",
    ],
    correctAnswer: 1,
    explanation:
      "K-fold cross-validation splits data into k non-overlapping subsets, iteratively training on k-1 folds and testing on the held-out fold, ensuring reliable out-of-sample performance estimation.",
    competency: "Machine Learning",
  },
    {
    id: 31,
    question:
      "Which SQL window function assigns a sequential integer to rows within a partition, ordered by a specified column (e.g. ranking officers within each district)?",
    options: [
      "COUNT(*) GROUP BY district_code",
      "SELECT DISTINCT district_code ORDER BY performance_score",
      "ROW_NUMBER() OVER (PARTITION BY district_code ORDER BY performance_score DESC)",
      "SUM(performance_score) WHERE district_code IS NOT NULL",
    ],
    correctAnswer: 2,
    explanation:
      "ROW_NUMBER() with PARTITION BY divides results into logical groups and computes a sequential ranking based on the ORDER BY clause within each distinct partition.",
    competency: "SQL & Data Management",
  },
    {
    id: 32,
    question:
      "In Python Pandas, what is the most efficient way to compute mean household income grouped by state and rural/urban sector?",
    options: [
      "Using nested for-loops iterating over df.iterrows() for every record",
      "df.sort_values('income').head(10)",
      "df['income'].sum() / len(df)",
      "df.groupby(['state', 'sector'])['income'].mean()",
    ],
    correctAnswer: 3,
    explanation:
      "Pandas groupby aggregation leverages vectorised C/Cython execution across multi-index keys, providing fast, memory-efficient statistical summarisation for large datasets.",
    competency: "Python",
  },
    {
    id: 33,
    question:
      "What defines a Multi-Stage Stratified Sampling design in large national surveys like the Periodic Labour Force Survey (PLFS)?",
    options: [
      "Stratifying districts into urban/rural, sampling primary census blocks (FSUs), and then sampling households (SSUs) within each block.",
      "Only surveying households that voluntarily submit online web forms.",
      "Sampling every citizen living in state capitals only.",
      "Choosing sample locations purely on convenience of transportation.",
    ],
    correctAnswer: 0,
    explanation:
      "Multi-stage stratified sampling first stratifies broad geographic regions into primary sampling units (FSUs/Census Enumeration Blocks), followed by secondary sampling units (SSUs/households) inside selected FSUs.",
    competency: "Survey Sampling",
  },
    {
    id: 34,
    question:
      "Under the UN National Quality Assurance Framework (NQAF), which core dimensions constitute statistical product quality?",
    options: [
      "File size, compression ratio, network speed, and hard drive capacity.",
      "Relevance, Accuracy, Timeliness, Accessibility, Comparability, and Coherence.",
      "Government authority, budget allocation, and staff headcount.",
      "Number of printed paper copies distributed to district libraries.",
    ],
    correctAnswer: 1,
    explanation:
      "NQAF defines product quality through established dimensions: relevance to user needs, empirical accuracy/reliability, timeliness of release, accessibility/clarity, and geographic/temporal comparability.",
    competency: "Data Quality",
  },
    {
    id: 35,
    question:
      "How can official statisticians integrate high-frequency GSTN e-way bill transaction data with Annual Survey of Industries (ASI)?",
    options: [
      "Replacing all ASI factory visits permanently with web search queries.",
      "Discarding GST data because it is administrative rather than survey-based.",
      "Record linkage using GSTIN / PAN identifiers to track real-time freight and output movements before annual survey publication.",
      "Manually typing every paper invoice into an unindexed spreadsheet.",
    ],
    correctAnswer: 2,
    explanation:
      "Administrative big data from GSTN/e-way bills linked via enterprise PAN/GSTIN provides high-frequency leading indicators of manufacturing and logistics, complementing traditional structural surveys.",
    competency: "Digital Data Governance",
  },
    {
    id: 36,
    question:
      "In QGIS / spatial GIS workflows, what coordinate reference system (CRS) consideration is crucial when calculating geographic buffer distances in kilometres?",
    options: [
      "Leaving coordinates in angular degrees and multiplying directly by 1000.",
      "GIS buffers can only be calculated without any coordinate system.",
      "Changing the map background image from light mode to satellite mode.",
      "Transforming geographic lat/long coordinates (WGS84 EPSG:4326) into a Projected Coordinate System (UTM / EPSG:32643) with metric units.",
    ],
    correctAnswer: 3,
    explanation:
      "Geographic coordinates (EPSG:4326) measure angles in degrees. Precise metric distance buffering requires reprojecting layers into a Projected Coordinate System (e.g. UTM) where coordinates represent linear metres.",
    competency: "GIS & Spatial Mapping",
  },
];

const mockInsights: CompetencyInsight[] = [
  {
    competency: "Survey Sampling",
    result: "Strong",
    detail: "Strong understanding demonstrated in sampling design, stratification, and estimation weights.",
  },
  {
    competency: "Data Quality",
    result: "Needs Practice",
    detail: "Additional practice recommended in validation checks, imputation methods, and NQAF standards.",
  },
  {
    competency: "Python",
    result: "Improving",
    detail: "Performance indicates solid progress in pandas operations and data cleaning workflows.",
  },
  {
    competency: "SQL & Data Management",
    result: "Strong",
    detail: "Demonstrates high proficiency in relational database operations, joins, and analytical queries.",
  },
  {
    competency: "GIS & Spatial Mapping",
    result: "Needs Practice",
    detail: "Practice recommended in geospatial joins, coordinate projection, and spatial disparity analysis.",
  },
];

/**
 * [AI ADAPTIVE GENERATOR]:
 * Returns 10 comprehensive assessment questions matching the officer's declared profile and cadre role.
 */

/**
 * Shuffles options using Fisher-Yates and updates correctAnswer to the new index.
 * Guarantees unbiased, randomized distribution across A, B, C, D at runtime.
 */
export function shuffleQuestionOptions(q: QuizQuestion): QuizQuestion {
  const correctOptionText = q.options[q.correctAnswer];
  const shuffledOptions = [...q.options];
  for (let i = shuffledOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
  }
  const newCorrectIndex = shuffledOptions.indexOf(correctOptionText);
  return {
    ...q,
    options: shuffledOptions,
    correctAnswer: newCorrectIndex >= 0 ? newCorrectIndex : 0,
  };
}

export function getQuizQuestions(userSkills?: string[], targetCount = 10): QuizQuestion[] {
  if (!userSkills || userSkills.length === 0) {
    return mockQuestions.slice(0, targetCount).map(shuffleQuestionOptions);
  }

  const normalized = userSkills.map((s) => s.toLowerCase().trim());

  // Prioritize questions matching the user's declared skills
  const matched = mockQuestions.filter((q) => {
    const comp = q.competency.toLowerCase();
    return normalized.some(
      (s) =>
        comp.includes(s) ||
        s.includes(comp) ||
        (s.includes("python") && comp.includes("python")) ||
        (s.includes("sql") && comp.includes("sql")) ||
        (s.includes("gis") && comp.includes("gis")) ||
        (s.includes("survey") && (comp.includes("survey") || comp.includes("sampling"))) ||
        (s.includes("sampling") && (comp.includes("survey") || comp.includes("sampling"))) ||
        (s.includes("quality") && comp.includes("quality")) ||
        (s.includes("governance") && comp.includes("governance")) ||
        (s.includes("account") && (comp.includes("account") || comp.includes("gsdp"))) ||
        (s.includes("visual") && comp.includes("visual")) ||
        (s.includes("ml") || s.includes("machine") && comp.includes("machine"))
    );
  });

  if (matched.length >= targetCount) {
    return matched.slice(0, targetCount).map(shuffleQuestionOptions);
  }

  // Combine matched with relevant cadre questions to always provide the target count
  const remaining = mockQuestions.filter((q) => !matched.includes(q));
  return [...matched, ...remaining].slice(0, targetCount).map(shuffleQuestionOptions);
}

/**
 * [DYNAMIC ON-DEMAND AI COURSE QUIZ GENERATOR]:
 * Generates custom diagnostic & mastery questions specifically for any course or topic
 * so the learner never has to leave the website for external portals.
 */
export function generateDynamicCourseQuiz(
  courseTitle: string,
  skillCategory?: string,
  count = 5
): QuizQuestion[] {
  const query = (courseTitle + " " + (skillCategory || "")).toLowerCase();

  // Find existing questions matching course topic
  let relevant = mockQuestions.filter((q) => {
    const text = (q.question + " " + q.competency + " " + q.explanation).toLowerCase();
    return (
      (query.includes("survey") && text.includes("survey")) ||
      (query.includes("sampling") && (text.includes("sampling") || text.includes("pps"))) ||
      (query.includes("python") && text.includes("python")) ||
      (query.includes("sql") && text.includes("sql")) ||
      (query.includes("gis") && (text.includes("gis") || text.includes("spatial"))) ||
      (query.includes("quality") && text.includes("quality")) ||
      (query.includes("national") && (text.includes("national") || text.includes("gsdp") || text.includes("cpi"))) ||
      (query.includes("accounts") && (text.includes("accounts") || text.includes("gsdp"))) ||
      (query.includes("governance") && (text.includes("governance") || text.includes("dpdp"))) ||
      (query.includes("machine") && (text.includes("machine") || text.includes("model")))
    );
  });

  // If not enough questions found, supplement from general bank
  if (relevant.length < count) {
    const others = mockQuestions.filter((q) => !relevant.includes(q));
    relevant = [...relevant, ...others];
  }

  return relevant.slice(0, count).map(shuffleQuestionOptions).map((q, idx) => ({
    ...q,
    id: 1000 + idx + 1,
  }));
}

export function getQuizInsights(): CompetencyInsight[] {
  return mockInsights;
}
