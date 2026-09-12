/**
 * Resume Identity & Candidate Verification Engine
 *
 * Verifies that an uploaded resume actually belongs to the authenticated
 * candidate/officer rather than another individual.
 *
 * Prevents name mismatches (e.g. uploading "Rajesh Kumar" while registered as "Yash")
 * and extracts claimed cadre skills.
 */

export interface ResumeVerificationResult {
  status: "verified" | "mismatch" | "generic";
  detectedName: string | null;
  profileName: string;
  message: string;
  suggestedAction?: "none" | "reupload_or_update";
  detectedSkills: string[];
}

const COMMON_CADRE_SUFFIXES = [
  /\b(senior\s+)?statistical\s+officer\b/gi,
  /\bjso\b/gi,
  /\bsso\b/gi,
  /\bdata\s+analyst\b/gi,
  /\bfield\s+supervisor\b/gi,
  /\bassistant\s+director\b/gi,
  /\bdeputy\s+director\b/gi,
  /\bjoint\s+director\b/gi,
  /\bresearch\s+officer\b/gi,
  /\beconomic\s+officer\b/gi,
  /\bcadre\b/gi,
  /\bprofile\b/gi,
  /\bresume\b/gi,
  /\bcv\b/gi,
  /\bbiodata\b/gi,
  /\bofficial\b/gi,
  /\bgovt\b/gi,
  /\bdes\b/gi,
  /\bmospi\b/gi,
  /\bmeity\b/gi,
  /\bpdf\b/gi,
  /\bdocx\b/gi,
  /\bdoc\b/gi,
  /\btest\b/gi,
];

const KNOWN_SKILL_KEYWORDS: Record<string, string> = {
  python: "Python",
  pandas: "Python",
  numpy: "Python",
  sql: "SQL",
  postgresql: "SQL",
  mysql: "SQL",
  gis: "GIS & Spatial Mapping",
  qgis: "GIS & Spatial Mapping",
  arcgis: "GIS & Spatial Mapping",
  spatial: "GIS & Spatial Mapping",
  "survey design": "Survey Sampling",
  sampling: "Survey Sampling",
  stratified: "Survey Sampling",
  nss: "Survey Sampling",
  plfs: "Survey Sampling",
  "national accounts": "National Accounts",
  gsdp: "National Accounts",
  cpi: "National Accounts",
  deflator: "National Accounts",
  "data quality": "Data Quality",
  imputation: "Data Quality",
  validation: "Data Quality",
  governance: "Digital Data Governance",
  privacy: "Digital Data Governance",
  dpdp: "Digital Data Governance",
};

/**
 * Extracts candidate name from file name and raw text contents.
 */
export async function extractCandidateName(file: File): Promise<{
  nameFromFilename: string | null;
  nameFromContent: string | null;
  detectedSkills: string[];
  rawSnippet: string;
}> {
  // 1. Clean filename
  const baseName = file.name.replace(/\.[^/.]+$/, ""); // remove extension
  let cleaned = baseName.replace(/[_\-.]+/g, " ");

  // Strip known cadre roles and suffixes
  for (const pattern of COMMON_CADRE_SUFFIXES) {
    cleaned = cleaned.replace(pattern, " ");
  }
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  // Words that look like a person's name (2-3 capitalized or alphabetical words, at least 2 chars each)
  const nameWords = cleaned.split(" ").filter((w) => /^[a-zA-Z]{2,}$/.test(w));
  const nameFromFilename = nameWords.length >= 2 ? nameWords.join(" ") : null;

  // 2. Read first chunk of text from the file (up to 32KB)
  let contentText = "";
  try {
    const slice = file.slice(0, 32768);
    contentText = await slice.text();
  } catch {
    contentText = "";
  }

  // 3. Scan for candidate name headers in text
  let nameFromContent: string | null = null;
  const namePatterns = [
    /(?:Candidate\s*Name|Full\s*Name|Name)\s*[:\-–]\s*([A-Za-z\s.]{3,35})/i,
    /Curriculum\s*Vitae\s*[-–—:]*\s*([A-Za-z\s.]{3,35})/i,
  ];

  for (const pattern of namePatterns) {
    const match = contentText.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim();
      if (candidate.split(/\s+/).length >= 2 && candidate.length >= 4) {
        nameFromContent = candidate;
        break;
      }
    }
  }

  // 4. Extract skills mentioned in filename and content
  const fullScan = (cleaned + " " + contentText).toLowerCase();
  const foundSkills = new Set<string>();
  for (const [kw, canonical] of Object.entries(KNOWN_SKILL_KEYWORDS)) {
    if (fullScan.includes(kw)) {
      foundSkills.add(canonical);
    }
  }

  return {
    nameFromFilename,
    nameFromContent,
    detectedSkills: Array.from(foundSkills),
    rawSnippet: contentText.slice(0, 200),
  };
}

/**
 * Compares an uploaded resume file against the logged in user's profile name.
 */
export async function verifyResumeCandidate(
  file: File,
  userProfileName: string
): Promise<ResumeVerificationResult> {
  const normUser = userProfileName.trim();
  const userTokens = normUser
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length >= 2);

  const { nameFromFilename, nameFromContent, detectedSkills } =
    await extractCandidateName(file);

  const detectedCandidateName = nameFromFilename || nameFromContent;

  // If no specific candidate name was detected in filename or text (e.g. "resume.pdf", "cadre_cv.docx")
  if (!detectedCandidateName) {
    return {
      status: "generic",
      detectedName: null,
      profileName: normUser,
      message: `Standard document accepted. Assigned to authenticated officer ${normUser || "Candidate"}.`,
      suggestedAction: "none",
      detectedSkills,
    };
  }

  // Check token overlap
  const detectedTokens = detectedCandidateName
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length >= 2);

  // An overlap exists if at least one significant name token (first or last name) matches
  const hasTokenMatch = userTokens.some((uToken) =>
    detectedTokens.some((dToken) => dToken === uToken || (dToken.length >= 4 && uToken.includes(dToken)))
  );

  if (hasTokenMatch) {
    return {
      status: "verified",
      detectedName: detectedCandidateName,
      profileName: normUser,
      message: `Identity Verified: Document matches candidate name "${normUser}".`,
      suggestedAction: "none",
      detectedSkills,
    };
  }

  // Definite mismatch: The document is named after or belongs to a different person
  return {
    status: "mismatch",
    detectedName: detectedCandidateName,
    profileName: normUser,
    message: `Candidate Name Mismatch: The uploaded resume belongs to "${detectedCandidateName}", but your logged-in account name is "${normUser}".`,
    suggestedAction: "reupload_or_update",
    detectedSkills,
  };
}
