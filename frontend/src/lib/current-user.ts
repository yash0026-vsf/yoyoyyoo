export type CurrentUserProfile = {
  name: string;
  designation: string;
  department: string;
  currentAssignment: string;
  highestQualification: string;
  yearsOfExperience: string;
  previousTraining: string;
  existingSkills: string[];
  workExperience: string;
  resumeFileName: string;
};

const STORAGE_KEY = "statskill.currentUserProfile";

export const defaultCurrentUserProfile: CurrentUserProfile = {
  name: "",
  designation: "",
  department: "",
  currentAssignment: "",
  highestQualification: "",
  yearsOfExperience: "",
  previousTraining: "",
  existingSkills: [],
  workExperience: "",
  resumeFileName: "",
};

export function getCurrentUserProfile(): CurrentUserProfile {
  if (typeof window === "undefined") return defaultCurrentUserProfile;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultCurrentUserProfile;

    const parsed = JSON.parse(raw) as Partial<CurrentUserProfile>;

    return {
      ...defaultCurrentUserProfile,
      ...parsed,
      existingSkills: Array.isArray(parsed.existingSkills)
        ? parsed.existingSkills.filter(
            (skill): skill is string => typeof skill === "string",
          )
        : defaultCurrentUserProfile.existingSkills,
    };
  } catch {
    return defaultCurrentUserProfile;
  }
}

export function saveCurrentUserProfile(
  profile: CurrentUserProfile,
): void {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function clearCurrentUserProfile(): void {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(STORAGE_KEY);
}

export function getUserInitials(name: string): string {
  if (!name || !name.trim()) return "U";
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}
