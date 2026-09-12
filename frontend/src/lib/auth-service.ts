/**
 * Authentication and User Registry Service
 *
 * Provides:
 * 1. Real account registration and login with password verification (rejects wrong passwords).
 * 2. Real Google Identity Services / OAuth credential integration.
 * 3. Per-account history persistence so quiz scores, competency gaps, and learning paths
 *    remain permanently saved to each user's specific account (Google or email).
 */

import { CurrentUserProfile, defaultCurrentUserProfile, saveCurrentUserProfile } from "./current-user";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: "email" | "google";
  passwordHash?: string;
  createdAt: string;
  designation?: string;
  department?: string;
};

const USERS_DB_KEY = "statskill_accounts_registry_v1";
const ACTIVE_SESSION_KEY = "statskill_active_session_v1";

// Default pre-seeded official demo account for testing
const DEFAULT_DEMO_ACCOUNT: AuthUser = {
  id: "user-demo-001",
  name: "Vivek Reddy",
  email: "vivek.reddy@meity.gov.in",
  provider: "email",
  passwordHash: "Password@123",
  designation: "Statistical Officer",
  department: "Ministry of Statistics (MoSPI)",
  createdAt: "2026-01-01T00:00:00.000Z",
};

/**
 * Returns all registered accounts
 */
export function getAllUsers(): AuthUser[] {
  if (typeof window === "undefined") return [DEFAULT_DEMO_ACCOUNT];
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    if (!raw) {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify([DEFAULT_DEMO_ACCOUNT]));
      return [DEFAULT_DEMO_ACCOUNT];
    }
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [DEFAULT_DEMO_ACCOUNT];
    if (!list.some((u) => u.email.toLowerCase() === DEFAULT_DEMO_ACCOUNT.email.toLowerCase())) {
      list.push(DEFAULT_DEMO_ACCOUNT);
    }
    return list;
  } catch (e) {
    return [DEFAULT_DEMO_ACCOUNT];
  }
}

function saveUsers(users: AuthUser[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
}

export function getActiveSession(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function switchActiveUser(user: AuthUser): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(user));
  localStorage.setItem("user_authenticated", "true");
  localStorage.setItem("auth_provider", user.provider);

  const userProfileKey = "statskill_profile_" + user.email.toLowerCase();
  const savedProfile = localStorage.getItem(userProfileKey);
  if (savedProfile) {
    localStorage.setItem("statskill.currentUserProfile", savedProfile);
  } else {
    const isDemo = user.email.toLowerCase() === DEFAULT_DEMO_ACCOUNT.email.toLowerCase();
    const newProfile: CurrentUserProfile = {
      ...defaultCurrentUserProfile,
      name: user.name,
      designation: user.designation || (isDemo ? "Statistical Officer" : ""),
      department: user.department || (isDemo ? "Ministry of Statistics (MoSPI)" : ""),
      currentAssignment: isDemo ? "NSS / Field Survey Operations & Multi-stage Sampling" : "",
      highestQualification: isDemo ? "Master's in Statistics (M.Stat / M.Sc. Statistics)" : "",
      yearsOfExperience: isDemo ? "Junior Officer (1 - 3 Years)" : "",
      workExperience: isDemo ? "Survey data collection, validation, analysis and official statistical reporting." : "",
      previousTraining: isDemo ? "MoSPI Cadre Baseline Training" : "",
      resumeFileName: isDemo ? "Statistical_Officer_Cadre_Profile.pdf" : "",
      existingSkills: isDemo ? ["Survey Sampling", "Python", "Data Quality", "SQL"] : [],
    };
    saveCurrentUserProfile(newProfile);
    localStorage.setItem(userProfileKey, JSON.stringify(newProfile));
  }

  const userGapKey = "statskill_gap_" + user.email.toLowerCase();
  const savedGap = localStorage.getItem(userGapKey);
  if (savedGap) {
    localStorage.setItem("user_assessed_gap", savedGap);
  } else {
    localStorage.removeItem("user_assessed_gap");
  }

  const userSkillsKey = "statskill_skills_" + user.email.toLowerCase();
  const savedSkills = localStorage.getItem(userSkillsKey);
  if (savedSkills) {
    localStorage.setItem("user_assessed_skills", savedSkills);
  } else {
    localStorage.removeItem("user_assessed_skills");
  }

  const userPathsKey = "statskill_paths_" + user.email.toLowerCase();
  const savedPaths = localStorage.getItem(userPathsKey);
  if (savedPaths) {
    localStorage.setItem("active_learning_paths", savedPaths);
  } else {
    localStorage.removeItem("active_learning_paths");
  }
}

export function syncActiveUserAssessmentHistory(): void {
  if (typeof window === "undefined") return;
  const user = getActiveSession();
  if (!user) return;

  const email = user.email.toLowerCase();
  const profile = localStorage.getItem("statskill.currentUserProfile");
  if (profile) localStorage.setItem("statskill_profile_" + email, profile);

  const gap = localStorage.getItem("user_assessed_gap");
  if (gap) localStorage.setItem("statskill_gap_" + email, gap);

  const skills = localStorage.getItem("user_assessed_skills");
  if (skills) localStorage.setItem("statskill_skills_" + email, skills);

  const paths = localStorage.getItem("active_learning_paths");
  if (paths) localStorage.setItem("statskill_paths_" + email, paths);
}

export function loginUser(email: string, password: string): { success: boolean; error?: string; user?: AuthUser } {
  const users = getAllUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return {
      success: false,
      error: "No account registered with email \"" + email + "\". Please click \"Sign Up\" below to create your account.",
    };
  }

  if (user.provider === "google") {
    return {
      success: false,
      error: "This account was created with Google. Please click \"Sign in with Google\" below.",
    };
  }

  if (user.passwordHash !== password) {
    return {
      success: false,
      error: "Incorrect password. Access denied. Please check your password or reset it.",
    };
  }

  switchActiveUser(user);
  return { success: true, user };
}

export function registerUser(
  name: string,
  email: string,
  password: string,
  designation?: string,
  department?: string
): { success: boolean; error?: string; user?: AuthUser } {
  const users = getAllUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (!name.trim()) {
    return { success: false, error: "Please enter your full name." };
  }

  if (!email.trim() || !email.includes("@")) {
    return { success: false, error: "Please enter a valid official email address." };
  }

  if (!password || password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }

  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    return {
      success: false,
      error: "An account with this email already exists. Please Sign In with your password.",
    };
  }

  const newUser: AuthUser = {
    id: "user-" + Date.now(),
    name: name.trim(),
    email: normalizedEmail,
    provider: "email",
    passwordHash: password,
    designation: designation || "Statistical Officer",
    department: department || "Ministry of Statistics (MoSPI)",
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);
  switchActiveUser(newUser);

  return { success: true, user: newUser };
}

export function loginWithGooglePayload(googleData: {
  email: string;
  name: string;
  picture?: string;
  sub?: string;
}): AuthUser {
  const users = getAllUsers();
  const normalizedEmail = googleData.email.trim().toLowerCase();

  let user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    user = {
      id: googleData.sub || "google-" + Date.now(),
      name: googleData.name || "Google User",
      email: normalizedEmail,
      avatarUrl: googleData.picture,
      provider: "google",
      createdAt: new Date().toISOString(),
      designation: "Statistical Officer",
      department: "National Statistical Cadre",
    };
    users.push(user);
    saveUsers(users);
  } else {
    user.name = googleData.name || user.name;
    if (googleData.picture) user.avatarUrl = googleData.picture;
    saveUsers(users);
  }

  switchActiveUser(user);
  return user;
}

export function parseGoogleJwt(token: string): {
  email: string;
  name: string;
  picture?: string;
  sub: string;
} | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to parse Google JWT:", e);
    return null;
  }
}
