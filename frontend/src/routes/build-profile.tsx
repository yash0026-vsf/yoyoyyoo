import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  FileText,
  GraduationCap,
  Sparkles,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { StatSkillWordmark } from "@/components/StatSkillLogo";
import { getCurrentUserProfile, saveCurrentUserProfile } from "@/lib/current-user";
import { getActiveSession, switchActiveUser } from "@/lib/auth-service";
import {
  CADRE_JOB_ROLES,
  CADRE_DEPARTMENTS,
  CADRE_ASSIGNMENTS,
  CADRE_QUALIFICATIONS,
  CADRE_EXPERIENCE_LEVELS,
  validateRoleInput,
  validateNameInput,
} from "@/lib/cadre-options";
import {
  verifyResumeCandidate,
  type ResumeVerificationResult,
} from "@/lib/resume-verifier";

export const Route = createFileRoute("/build-profile")({
  head: () => ({
    meta: [
      { title: "Build Profile — StatSkill" },
      {
        name: "description",
        content: "Build your competency profile and submit evidence for your initial AI assessment.",
      },
    ],
  }),
  component: BuildProfilePage,
});

type ProfileData = {
  name: string;
  designation: string;
  customDesignation: string;
  department: string;
  customDepartment: string;
  currentAssignment: string;
  highestQualification: string;
  yearsOfExperience: string;
  previousTraining: string;
};

function BuildProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData>(() => {
    const currentUser = getCurrentUserProfile();
    const isStandardRole = (CADRE_JOB_ROLES as readonly string[]).includes(currentUser.designation);
    const isStandardDept = (CADRE_DEPARTMENTS as readonly string[]).includes(currentUser.department);

    return {
      name: currentUser.name || "",
      designation: isStandardRole
        ? currentUser.designation
        : currentUser.designation
          ? "Other"
          : "",
      customDesignation: isStandardRole ? "" : currentUser.designation || "",
      department: isStandardDept
        ? currentUser.department
        : currentUser.department
          ? "Other"
          : "",
      customDepartment: isStandardDept ? "" : currentUser.department || "",
      currentAssignment: currentUser.currentAssignment || "",
      highestQualification: currentUser.highestQualification || "",
      yearsOfExperience: currentUser.yearsOfExperience || "",
      previousTraining: currentUser.previousTraining || "",
    };
  });

  const [existingSkills, setExistingSkills] = useState<string[]>(
    () => getCurrentUserProfile().existingSkills,
  );
  const [workExperience, setWorkExperience] = useState(
    () => getCurrentUserProfile().workExperience || "",
  );
  const [newSkill, setNewSkill] = useState("");

  // Resume & Identity Verification State
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isVerifyingResume, setIsVerifyingResume] = useState(false);
  const [resumeVerification, setResumeVerification] = useState<ResumeVerificationResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Effective Role (resolved from select or custom input)
  const effectiveRole = profile.designation === "Other" ? profile.customDesignation : profile.designation;
  const effectiveDepartment = profile.department === "Other" ? profile.customDepartment : profile.department;

  // Real-time validations
  const roleValidation = validateRoleInput(effectiveRole);
  const nameValidation = validateNameInput(profile.name);

  const updateProfile = (field: keyof ProfileData, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  // Re-verify resume when profile name changes if a file is uploaded
  useEffect(() => {
    if (resumeFile && profile.name.trim()) {
      let active = true;
      setIsVerifyingResume(true);
      verifyResumeCandidate(resumeFile, profile.name).then((res) => {
        if (active) {
          setResumeVerification(res);
          setIsVerifyingResume(false);
        }
      });
      return () => {
        active = false;
      };
    }
  }, [profile.name, resumeFile]);

  const addSkill = (skillToAdd?: string) => {
    const skill = (skillToAdd || newSkill).trim();
    if (!skill) return;

    const exists = existingSkills.some(
      (item) => item.toLowerCase() === skill.toLowerCase(),
    );

    if (!exists) setExistingSkills((current) => [...current, skill]);
    if (!skillToAdd) setNewSkill("");
  };

  const removeSkill = (skill: string) => {
    setExistingSkills((current) => current.filter((item) => item !== skill));
  };

  const validateResumeFormat = (file: File) => {
    const allowedExtensions = [".pdf", ".doc", ".docx"];
    const lowerName = file.name.toLowerCase();
    const valid = allowedExtensions.some((extension) =>
      lowerName.endsWith(extension),
    );

    if (!valid) {
      window.alert("Please upload a PDF, DOC or DOCX resume.");
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      window.alert("Resume size must be 10 MB or smaller.");
      return false;
    }

    return true;
  };

  const handleResumeChange = async (file?: File) => {
    if (!file) return;
    if (!validateResumeFormat(file)) return;

    setResumeFile(file);
    setIsVerifyingResume(true);

    try {
      const verificationResult = await verifyResumeCandidate(file, profile.name);
      setResumeVerification(verificationResult);
    } finally {
      setIsVerifyingResume(false);
    }
  };

  const handleAdoptResumeName = () => {
    if (resumeVerification?.detectedName) {
      const newName = resumeVerification.detectedName;
      updateProfile("name", newName);

      // Also sync active user session
      const currentSession = getActiveSession();
      if (currentSession) {
        switchActiveUser({
          ...currentSession,
          name: newName,
        });
      }
    }
  };

  const handleGenerateAssessment = () => {
    // 1. Name Check
    if (!nameValidation.isValid) {
      window.alert(nameValidation.error || "Please enter a valid candidate name.");
      return;
    }

    // 2. Role Check
    if (!roleValidation.isValid) {
      window.alert(roleValidation.error || "Please select or enter a valid cadre role.");
      return;
    }

    // 3. Department Check
    if (!effectiveDepartment.trim()) {
      window.alert("Please specify your ministry or department.");
      return;
    }

    // 4. Skills Check
    if (existingSkills.length === 0) {
      window.alert("Please select or add at least one skill you currently use so the AI can tailor your diagnostic assessment.");
      return;
    }

    // 5. Resume Name Mismatch Block
    if (resumeVerification?.status === "mismatch") {
      window.alert(
        `Cannot proceed: The uploaded resume belongs to "${resumeVerification.detectedName}", but your account is registered as "${profile.name}". Please upload your own resume or update your account name to match.`
      );
      return;
    }

    saveCurrentUserProfile({
      name: profile.name.trim(),
      designation: effectiveRole.trim(),
      department: effectiveDepartment.trim(),
      currentAssignment: profile.currentAssignment.trim(),
      highestQualification: profile.highestQualification.trim(),
      yearsOfExperience: profile.yearsOfExperience.trim(),
      previousTraining: profile.previousTraining.trim(),
      existingSkills,
      workExperience: workExperience.trim(),
      resumeFileName: resumeFile ? resumeFile.name : (getCurrentUserProfile().resumeFileName || ""),
    });

    // Navigate to dynamic AI diagnostic assessment
    navigate({ to: "/ai-assessment-quiz" });
  };

  const profileItems = [
    {
      label: "Candidate Name",
      done: nameValidation.isValid,
    },
    {
      label: "Cadre Designation & Role",
      done: roleValidation.isValid,
    },
    {
      label: "Ministry & Department",
      done: effectiveDepartment.trim().length > 0,
    },
    {
      label: "Assignment & Education",
      done:
        profile.currentAssignment.trim().length > 0 &&
        profile.highestQualification.trim().length > 0,
    },
    {
      label: "Resume Verification",
      done: Boolean(resumeFile) && resumeVerification?.status !== "mismatch",
    },
    { label: "Skills Selected", done: existingSkills.length > 0 },
  ];

  const completedItems = profileItems.filter((item) => item.done).length;
  const profileCompletion = Math.round(
    (completedItems / profileItems.length) * 100,
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center px-4 py-5 lg:px-8">
          <StatSkillWordmark />
        </div>
      </header>

      <main className="px-4 py-7 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <section>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl">
              Build Your Competency Profile
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Select your official Cadre role, department, and verify your credentials for your personalized AI assessment.
            </p>
          </section>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <section className="xl:col-span-8">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      Cadre Identity & Credentials
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Information verified against official civil service benchmarks.
                    </p>
                  </div>
                  <UserRound className="h-5 w-5 text-muted-foreground" />
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Full Name with Validation */}
                  <div>
                    <label className="text-xs font-bold text-foreground">
                      Full Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      value={profile.name}
                      onChange={(e) => updateProfile("name", e.target.value)}
                      placeholder="e.g. Yash"
                      className={`mt-1.5 w-full rounded-lg border bg-background px-3.5 py-2.5 text-xs text-foreground outline-none transition placeholder:text-muted-foreground focus:ring-2 ${
                        profile.name && !nameValidation.isValid
                          ? "border-destructive focus:ring-destructive/20"
                          : "border-border focus:border-accent focus:ring-accent/10"
                      }`}
                    />
                    {profile.name && !nameValidation.isValid && (
                      <p className="mt-1 text-[11px] text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {nameValidation.error}
                      </p>
                    )}
                  </div>

                  {/* Cadre Designation / Job Role (Select with Variety of Options) */}
                  <div>
                    <label className="text-xs font-bold text-foreground">
                      Cadre Job Role / Designation <span className="text-destructive">*</span>
                    </label>
                    <select
                      value={profile.designation}
                      onChange={(e) => updateProfile("designation", e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-xs font-medium text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10"
                    >
                      <option value="">-- Select Cadre Job Role --</option>
                      {CADRE_JOB_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                      <option value="Other">Other (Custom Cadre Designation)...</option>
                    </select>

                    {/* Custom Role Input with Strict Validation */}
                    {profile.designation === "Other" && (
                      <div className="mt-2">
                        <input
                          value={profile.customDesignation}
                          onChange={(e) => updateProfile("customDesignation", e.target.value)}
                          placeholder="Enter custom designation (e.g. Junior Research Fellow)"
                          className={`w-full rounded-lg border bg-background px-3 py-2 text-xs text-foreground outline-none transition ${
                            profile.customDesignation && !roleValidation.isValid
                              ? "border-destructive focus:ring-destructive/20"
                              : "border-border focus:border-accent"
                          }`}
                        />
                        {profile.customDesignation && !roleValidation.isValid && (
                          <p className="mt-1 text-[11px] text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {roleValidation.error}
                          </p>
                        )}
                        {profile.customDesignation && roleValidation.isValid && (
                          <p className="mt-1 text-[11px] text-success flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Recognized role title format.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Ministry / Department (Select with Variety of Options) */}
                  <div>
                    <label className="text-xs font-bold text-foreground">
                      Ministry / Department <span className="text-destructive">*</span>
                    </label>
                    <select
                      value={profile.department}
                      onChange={(e) => updateProfile("department", e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-xs font-medium text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10"
                    >
                      <option value="">-- Select Ministry / Department --</option>
                      {CADRE_DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                      <option value="Other">Other Department / Directorate...</option>
                    </select>

                    {profile.department === "Other" && (
                      <input
                        value={profile.customDepartment}
                        onChange={(e) => updateProfile("customDepartment", e.target.value)}
                        placeholder="Enter ministry or department name"
                        className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none transition focus:border-accent"
                      />
                    )}
                  </div>

                  {/* Current Assignment (Select with Options) */}
                  <div>
                    <label className="text-xs font-bold text-foreground">
                      Current Cadre Assignment
                    </label>
                    <select
                      value={profile.currentAssignment}
                      onChange={(e) => updateProfile("currentAssignment", e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-xs font-medium text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10"
                    >
                      <option value="">-- Select Cadre Assignment --</option>
                      {CADRE_ASSIGNMENTS.map((asg) => (
                        <option key={asg} value={asg}>
                          {asg}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Highest Qualification */}
                  <div>
                    <label className="text-xs font-bold text-foreground">
                      Highest Qualification
                    </label>
                    <select
                      value={profile.highestQualification}
                      onChange={(e) => updateProfile("highestQualification", e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-xs font-medium text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10"
                    >
                      <option value="">-- Select Highest Qualification --</option>
                      {CADRE_QUALIFICATIONS.map((q) => (
                        <option key={q} value={q}>
                          {q}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Years of Experience */}
                  <div>
                    <label className="text-xs font-bold text-foreground">
                      Cadre Experience
                    </label>
                    <select
                      value={profile.yearsOfExperience}
                      onChange={(e) => updateProfile("yearsOfExperience", e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-xs font-medium text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10"
                    >
                      <option value="">-- Select Cadre Experience --</option>
                      {CADRE_EXPERIENCE_LEVELS.map((exp) => (
                        <option key={exp} value={exp}>
                          {exp}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Resume Upload & Candidate Name Verification Section */}
                <div className="mt-6 border-t border-border pt-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        Resume / Cadre Evidence Verification
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        PDF, DOC or DOCX · Candidate identity is cross-checked against your profile name.
                      </p>
                    </div>
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>

                  {!resumeFile ? (
                    <label
                      onDragOver={(event) => {
                        event.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(event) => {
                        event.preventDefault();
                        setIsDragging(false);
                        handleResumeChange(event.dataTransfer.files[0]);
                      }}
                      className={
                        isDragging
                          ? "mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-accent bg-accent/5 px-6 py-8 text-center"
                          : "mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 px-6 py-8 text-center transition hover:border-accent/50 hover:bg-muted/30"
                      }
                    >
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="sr-only"
                        onChange={(event) => handleResumeChange(event.target.files?.[0])}
                      />
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground">
                        <Upload className="h-5 w-5" />
                      </div>
                      <p className="mt-3 text-sm font-semibold text-foreground">Upload your resume</p>
                      <p className="mt-1 text-xs text-muted-foreground">Drag & drop or click to choose (PDF, DOCX)</p>
                    </label>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {/* File Card with Verification Details */}
                      <div
                        className={`rounded-xl border p-4 transition ${
                          resumeVerification?.status === "mismatch"
                            ? "border-destructive/30 bg-destructive/5"
                            : resumeVerification?.status === "verified"
                              ? "border-success/30 bg-success/5"
                              : "border-border bg-muted/30"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                resumeVerification?.status === "mismatch"
                                  ? "bg-destructive/20 text-destructive"
                                  : "bg-success/20 text-success"
                              }`}
                            >
                              <FileText className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{resumeFile.name}</p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                Size: {(resumeFile.size / 1024).toFixed(1)} KB
                              </p>

                              {/* Identity Check Status */}
                              {isVerifyingResume ? (
                                <p className="mt-2 text-xs font-semibold text-accent animate-pulse">
                                  Cross-checking candidate identity on document...
                                </p>
                              ) : resumeVerification?.status === "mismatch" ? (
                                <div className="mt-2 space-y-2">
                                  <div className="flex items-start gap-1.5 text-xs font-semibold text-destructive">
                                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                                    <span>{resumeVerification.message}</span>
                                  </div>
                                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    To maintain authentic MoSPI civil service competency records, the uploaded resume must belong to the logged-in candidate.
                                  </p>
                                  <div className="flex flex-wrap gap-2 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setResumeFile(null);
                                        setResumeVerification(null);
                                      }}
                                      className="rounded-lg border border-destructive/30 bg-background px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10"
                                    >
                                      Upload My Own Resume
                                    </button>
                                    {resumeVerification.detectedName && (
                                      <button
                                        type="button"
                                        onClick={handleAdoptResumeName}
                                        className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground hover:bg-accent/90"
                                      >
                                        Update Account Name to "{resumeVerification.detectedName}"
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-success">
                                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                                  <span>{resumeVerification?.message || "Resume verified."}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setResumeFile(null);
                              setResumeVerification(null);
                            }}
                            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                            aria-label="Remove resume"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Extracted Skills Helper */}
                        {resumeVerification && resumeVerification.detectedSkills.length > 0 && (
                          <div className="mt-3 border-t border-border/50 pt-3">
                            <p className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                              <Sparkles className="h-3.5 w-3.5 text-accent" />
                              AI detected competencies from this resume:
                            </p>
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              {resumeVerification.detectedSkills.map((sk) => {
                                const hasSkill = existingSkills.includes(sk);
                                return (
                                  <button
                                    key={sk}
                                    type="button"
                                    onClick={() => addSkill(sk)}
                                    className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold transition ${
                                      hasSkill
                                        ? "border-success bg-success/10 text-success"
                                        : "border-accent/40 bg-accent/10 text-accent hover:bg-accent/20"
                                    }`}
                                  >
                                    {hasSkill ? `✓ ${sk}` : `+ Add ${sk}`}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Existing Skills Section */}
                <div className="mt-6 border-t border-border pt-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Declared Competencies & Skills</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Select all skills you currently use. The AI engine will dynamically generate diagnostic questions targeting these areas.
                      </p>
                    </div>
                    <GraduationCap className="h-5 w-5 text-muted-foreground" />
                  </div>

                  {existingSkills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {existingSkills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-semibold text-foreground"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            aria-label={`Remove ${skill}`}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex gap-2">
                    <input
                      value={newSkill}
                      onChange={(event) => setNewSkill(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addSkill();
                        }
                      }}
                      className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3.5 py-2 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/10"
                      placeholder="Add custom competency (e.g. Econometric Modeling, PowerBI)"
                    />
                    <button
                      type="button"
                      onClick={() => addSkill()}
                      className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                    >
                      Add
                    </button>
                  </div>

                  <div className="mt-3">
                    <p className="text-[11px] font-medium text-muted-foreground">Standard Cadre Competencies (click to select):</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {[
                        "Survey Sampling",
                        "Python",
                        "SQL",
                        "GIS & Spatial Mapping",
                        "Data Quality",
                        "National Accounts",
                        "Digital Data Governance",
                      ].map((s) => {
                        const selected = existingSkills.some(
                          (skill) => skill.toLowerCase() === s.toLowerCase(),
                        );
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              if (selected) {
                                removeSkill(s);
                              } else {
                                addSkill(s);
                              }
                            }}
                            className={`rounded-md border px-2.5 py-1 text-[11px] font-medium transition ${
                              selected
                                ? "border-accent bg-accent/15 text-accent font-semibold"
                                : "border-border bg-card text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground"
                            }`}
                          >
                            {selected ? `✓ ${s}` : `+ ${s}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Work Experience */}
                <div className="mt-6 border-t border-border pt-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Cadre Experience & Past Work</h3>
                      <p className="mt-1 text-xs text-muted-foreground">Responsibilities, projects, surveys, and analytical workflows.</p>
                    </div>
                    <BriefcaseBusiness className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <textarea
                    value={workExperience}
                    onChange={(event) => setWorkExperience(event.target.value)}
                    rows={4}
                    maxLength={2000}
                    className="mt-3 w-full resize-none rounded-xl border border-border bg-background p-3 text-xs leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/10"
                    placeholder="Describe your responsibilities, surveys managed, and analytical tools used..."
                  />
                </div>

                {/* Bottom Action Bar */}
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border pt-6">
                  <p className="text-xs text-muted-foreground">
                    Your verified profile and skills determine the 10 diagnostic questions in your AI quiz.
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerateAssessment}
                    disabled={resumeVerification?.status === "mismatch"}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-5 py-2.5 text-xs font-bold transition shadow ${
                      resumeVerification?.status === "mismatch"
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : "bg-accent text-accent-foreground hover:bg-accent/90"
                    }`}
                  >
                    Save Profile & Start AI Quiz
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </section>

            {/* Sidebar Completion Checklist */}
            <aside className="xl:col-span-4">
              <div className="sticky top-24 rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Cadre Profile</p>
                    <h2 className="mt-0.5 text-lg font-bold text-foreground">Readiness</h2>
                  </div>
                  <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-bold text-accent">
                    {profileCompletion}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-300"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>

                <div className="divide-y divide-border/60 text-xs">
                  {profileItems.map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-2.5">
                      <span className={item.done ? "text-foreground font-medium" : "text-muted-foreground"}>
                        {item.label}
                      </span>
                      {item.done ? (
                        <Check className="h-4 w-4 text-success shrink-0" />
                      ) : (
                        <span className="text-[11px] font-semibold text-muted-foreground">Required</span>
                      )}
                    </div>
                  ))}
                </div>

                {resumeVerification?.status === "mismatch" && (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>Action required: Upload your own resume or update profile name to proceed.</span>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
