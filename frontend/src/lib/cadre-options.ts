/**
 * Standard Cadre Options & Input Validation Utilities
 *
 * Provides official MoSPI / Civil Service cadre job roles,
 * ministries, departments, qualifications, assignments, and
 * strict input validation to prevent arbitrary or gibberish inputs.
 */

export const CADRE_JOB_ROLES = [
  "Statistical Officer (SSO / JSO)",
  "Data Analyst (Govt. / Cadre)",
  "Assistant Director (Statistics / DES)",
  "Deputy Director (MoSPI / DES)",
  "Field Supervisor / Senior Enumerator",
  "Economic & Statistical Officer (ESO)",
  "Section Officer (Statistical Administration)",
  "Programme Officer (Evaluation & Monitoring)",
  "Joint Director (National Accounts)",
  "GIS & Spatial Intelligence Specialist",
] as const;

export const CADRE_DEPARTMENTS = [
  "Ministry of Statistics and Programme Implementation (MoSPI)",
  "Directorate of Economics & Statistics (DES - State Cadre)",
  "National Statistical Office (NSO - Field Operations Division)",
  "National Sample Survey Office (NSSO - Survey Design & Research)",
  "Central Statistics Office (CSO - National Accounts)",
  "Ministry of Electronics and Information Technology (MeitY)",
  "NITI Aayog (DMEO - Development Monitoring & Evaluation)",
  "Ministry of Health & Family Welfare (Statistics Division)",
  "Ministry of Finance (Department of Economic Affairs)",
  "Department of Agriculture & Farmers Welfare (DES)",
] as const;

export const CADRE_ASSIGNMENTS = [
  "NSS / Field Survey Operations & Multi-stage Sampling",
  "National Accounts Compilation & GSDP Estimation",
  "CPI / Wholesale Price Index (WPI) Price Collection",
  "Data Cleaning, Imputation & Microdata Tabulation",
  "GIS Geospatial Cadastral Mapping & Spatial Analysis",
  "Administrative Data Integration & Tax Transaction Matching",
  "Policy Analytics, Dashboards & SDG Monitoring",
  "Vital Statistics & Demographic Survey Operations",
] as const;

export const CADRE_QUALIFICATIONS = [
  "Master's in Statistics (M.Stat / M.Sc. Statistics)",
  "Master's in Economics / Econometrics (M.A. / M.Sc.)",
  "Master's / Bachelor's in Data Science / Computer Science (M.Tech / B.Tech / MCA)",
  "Bachelor's in Statistics / Mathematics (B.Sc. / B.A.)",
  "Post Graduate Diploma in Applied Statistics / Operations Research",
  "Ph.D. in Statistics / Econometrics / Quantitative Sciences",
  "Civil Service Professional Examination / ISS Qualified",
] as const;

export const CADRE_EXPERIENCE_LEVELS = [
  "Entry Level (0 - 1 Year / Probationer)",
  "Junior Officer (1 - 3 Years)",
  "Mid-Level Officer (3 - 7 Years)",
  "Senior Cadre Officer (7 - 12 Years)",
  "Principal / Lead Director (12+ Years)",
] as const;

// Patterns that indicate keyboard mashing or nonsensical gibberish
const GIBBERISH_PATTERNS = [
  /^(asdf|qwerty|zxcv|hjkl|1234|qazwsx)/i,
  /(.)\1{3,}/, // 4 or more repeated characters (e.g. aaaa, zzzz)
  /^[^aeiouyAEIOUY]{5,}$/, // 5+ consecutive consonants with no vowels (unlikely real English word)
  /^[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+$/, // Pure symbols or digits
];

/**
 * Validates whether an input string is a plausible professional role/job title.
 */
export function validateRoleInput(role: string): {
  isValid: boolean;
  error?: string;
} {
  const trimmed = role.trim();

  if (!trimmed) {
    return { isValid: false, error: "Role / Designation cannot be empty." };
  }

  if (trimmed.length < 3) {
    return {
      isValid: false,
      error: "Role title must be at least 3 characters long.",
    };
  }

  if (trimmed.length > 75) {
    return {
      isValid: false,
      error: "Role title cannot exceed 75 characters.",
    };
  }

  for (const pattern of GIBBERISH_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        isValid: false,
        error: "Please enter a recognized professional title (e.g. Statistical Officer, Research Analyst).",
      };
    }
  }

  // Must contain at least one word character
  if (!/[a-zA-Z]{3,}/.test(trimmed)) {
    return {
      isValid: false,
      error: "Role title must contain valid alphabetic words.",
    };
  }

  return { isValid: true };
}

/**
 * Validates a person's full name.
 */
export function validateNameInput(name: string): {
  isValid: boolean;
  error?: string;
} {
  const trimmed = name.trim();

  if (!trimmed) {
    return { isValid: false, error: "Full Name cannot be empty." };
  }

  if (trimmed.length < 2) {
    return {
      isValid: false,
      error: "Full Name must be at least 2 characters.",
    };
  }

  for (const pattern of GIBBERISH_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        isValid: false,
        error: "Please enter a valid human candidate name.",
      };
    }
  }

  // Must have letters
  if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) {
    return {
      isValid: false,
      error: "Name can only contain alphabetic letters, spaces, hyphens, and periods.",
    };
  }

  return { isValid: true };
}
