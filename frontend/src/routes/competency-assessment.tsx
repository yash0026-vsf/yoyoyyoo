import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  Target,
} from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import { CompetencyRadar } from "@/components/dashboard/DashboardSections";
import { getCurrentUserProfile } from "@/lib/current-user";
import {
  getCompetencyAssessmentState,
  getCurrentCompetencies,
  getInitialCompetencies,
  getOverallCompetency,
  getSkillGapRows,
  hasUserCompletedAssessment,
  type CompetencyScore,
} from "@/lib/learner-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/competency-assessment")({
  head: () => ({
    meta: [
      { title: "Competency Assessment — StatSkill" },
      {
        name: "description",
        content: "Review your AI-generated competency assessment and start the diagnostic quiz.",
      },
    ],
  }),
  component: CompetencyAssessmentPage,
});

type ProfileData = {
  name: string;
  designation: string;
  department: string;
  currentAssignment: string;
  highestQualification: string;
  yearsOfExperience: string;
  previousTraining: string;
};

function CompetencyAssessmentPage() {
  const savedProfile = getCurrentUserProfile();

  const profile: ProfileData = {
    name: savedProfile.name,
    designation: savedProfile.designation,
    department: savedProfile.department,
    currentAssignment: savedProfile.currentAssignment,
    highestQualification: savedProfile.highestQualification,
    yearsOfExperience: savedProfile.yearsOfExperience,
    previousTraining: savedProfile.previousTraining,
  };

  const existingSkills = savedProfile.existingSkills;
  const workExperience = savedProfile.workExperience;
  const resumeFileName = savedProfile.resumeFileName;

  const isAssessed = hasUserCompletedAssessment();
  const assessmentState = getCompetencyAssessmentState();
  const currentCompetencies = getCurrentCompetencies();
  const verifiedScore = getOverallCompetency();
  const assessedSkills = getSkillGapRows();

  // Baseline competency calculated from profile credentials and experience
  const baselineScore = useMemo(() => {
    let base = 52;
    if (existingSkills.length > 0) base += Math.min(14, existingSkills.length * 2);
    if (profile.highestQualification) base += 4;
    if (profile.yearsOfExperience && profile.yearsOfExperience !== "0") base += 4;
    return Math.min(68, base);
  }, [existingSkills.length, profile.highestQualification, profile.yearsOfExperience]);

  const initialCompetencyScores = useMemo<CompetencyScore[]>(() => [
    { name: "Statistical", score: Math.round(baselineScore * 1.05) },
    { name: "Technical", score: Math.round(baselineScore * 0.92) },
    { name: "Digital Governance", score: Math.round(baselineScore * 0.88) },
    { name: "Behavioural", score: Math.round(baselineScore * 0.98) },
  ], [baselineScore]);

  const verifiedLevel = verifiedScore >= 80 ? 4 : verifiedScore >= 60 ? 3 : 2;

  return (
    <div className="flex min-h-screen bg-muted/40">
      <DashboardSidebar className="sticky top-0 hidden h-screen lg:flex" />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopBar onMenuClick={() => undefined} />

        <main className="flex-1 px-4 py-7 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-6xl space-y-6">
            {/* Header */}
            <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <Link to="/dashboard" className="hover:text-foreground">Dashboard</Link>
                  <span>/</span>
                  <span className="text-foreground">Competency Assessment</span>
                </div>
                <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl">
                  Competency Assessment
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  {isAssessed
                    ? "Your cadre competency has been empirically verified via the AI Diagnostic Quiz Engine."
                    : "Your baseline competency is established from your profile and resume. Complete the diagnostic quiz to verify."}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isAssessed ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3.5 py-1.5 text-xs font-bold text-success border border-success/30">
                    <CheckCircle2 className="h-4 w-4" /> Assessment Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3.5 py-1.5 text-xs font-bold text-accent border border-accent/20">
                    <Clock className="h-4 w-4" /> Awaiting Diagnostic
                  </span>
                )}
              </div>
            </section>

            {/* Initial Baseline Competency Card */}
            <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-accent">
                      Initial Baseline Competency
                    </span>
                    <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      Profile & Evidence
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-3">
                    <span className="text-5xl font-extrabold tracking-tight text-foreground">
                      {baselineScore}%
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">
                      Pre-diagnostic baseline
                    </span>
                  </div>
                  <p className="mt-3 max-w-xl text-xs leading-relaxed text-muted-foreground">
                    Baseline score established from your profile credentials ({profile.designation || "Cadre Officer"}), education, and verified resume evidence. The AI diagnostic quiz validates and refines each competency domain.
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Link
                      to="/ai-assessment-quiz"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground transition hover:bg-accent/90"
                    >
                      <Sparkles className="h-4 w-4" />
                      {isAssessed ? "Retake Diagnostic Quiz" : "Start Diagnostic Quiz"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      to="/build-profile"
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3.5 py-2 text-xs font-semibold text-foreground transition hover:bg-muted"
                    >
                      Update Profile & Skills
                    </Link>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Baseline Domain Breakdown
                  </p>
                  <CompetencyGrid items={initialCompetencyScores} />
                </div>
              </div>
            </section>

            {/* Current Competency Section (Dynamically updated by Quiz) */}
            <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Current Competency
                    </p>
                    {isAssessed && (
                      <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-[10px] font-bold text-success border border-success/25">
                        Level {verifiedLevel} Cadre Verified
                      </span>
                    )}
                  </div>
                  <h2 className="mt-1 text-lg font-bold text-foreground">
                    {isAssessed
                      ? "Verified Competency & Domain Assessment"
                      : "Updated after diagnostic assessment"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {isAssessed
                      ? "Empirical scores evaluated from your AI assessment quiz against cadre benchmarks."
                      : "Complete the diagnostic quiz to establish your empirical competency rating."}
                  </p>
                </div>

                {isAssessed ? (
                  <div className="flex items-center gap-4 bg-muted/40 px-4 py-2.5 rounded-xl border border-border">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-muted-foreground">Verified Score</p>
                      <p className="text-3xl font-extrabold text-foreground">{verifiedScore}%</p>
                    </div>
                    <div className="border-l border-border pl-3">
                      <span className="inline-block rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-bold text-success">
                        +{Math.max(0, verifiedScore - baselineScore)}% Gain
                      </span>
                      <p className="text-[10px] text-muted-foreground mt-0.5">vs Pre-assessment</p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> Awaiting diagnostic
                  </div>
                )}
              </div>

              <div className="mt-5">
                <CompetencyGrid items={currentCompetencies} isVerified={isAssessed} />
              </div>

              {!isAssessed ? (
                <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-accent/30 bg-accent-soft/30 p-4">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-accent shrink-0" />
                    <div className="text-xs">
                      <p className="font-bold text-foreground">Ready to take your Diagnostic Quiz?</p>
                      <p className="text-muted-foreground">
                        The AI engine assesses your profile across 10 cadre questions to calibrate your competency rating.
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/ai-assessment-quiz"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground hover:bg-accent/90 transition shadow-sm"
                  >
                    Start Diagnostic Quiz <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-xs">
                  <span className="text-muted-foreground">
                    Verified through NSSTA & MoSPI adaptive testing standards.
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      to="/skill-gap-analysis"
                      className="inline-flex items-center gap-1 font-semibold text-accent hover:underline"
                    >
                      View Skill Gap Analysis <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </section>

            {/* Dynamic Competency Radar */}
            <CompetencyRadar showAction={false} />

            {/* Assessed Skills & Cadre Benchmark Deficits (Active after Quiz) */}
            {isAssessed && assessedSkills.length > 0 && (
              <section className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-accent" />
                    <h2 className="text-base font-bold text-foreground">
                      Evaluated Cadre Skills & Benchmark Deficits
                    </h2>
                  </div>
                  <Link
                    to="/skill-gap-analysis"
                    className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
                  >
                    Full Gap Report <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {assessedSkills.map((skill) => (
                    <div
                      key={skill.skill}
                      className="rounded-lg border border-border bg-muted/20 p-3.5 space-y-2 flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            {skill.category}
                          </span>
                          <span
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full",
                              skill.gap > 0
                                ? "bg-destructive/10 text-destructive border border-destructive/20"
                                : "bg-success/10 text-success border border-success/20"
                            )}
                          >
                            {skill.gap > 0 ? `-${skill.gap} Level Deficit` : "Benchmark Met"}
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-foreground">{skill.skill}</h3>
                        <p className="text-[11px] text-muted-foreground">{skill.description}</p>
                      </div>

                      <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                        <span className="text-muted-foreground text-[11px]">
                          Level {skill.currentLevel} ({skill.currentLabel})
                        </span>
                        {skill.gap > 0 ? (
                          <Link
                            to="/learning-paths"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-accent hover:underline"
                          >
                            Bridge Gap <ArrowRight className="h-3 w-3" />
                          </Link>
                        ) : (
                          <span className="text-[11px] font-medium text-success flex items-center gap-0.5">
                            <Check className="h-3 w-3" /> Target Met
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Assessment Context & Evidence */}
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-foreground">Assessment Context</h2>
                  <Link to="/build-profile" className="text-xs font-semibold text-accent hover:underline">
                    Edit Details
                  </Link>
                </div>
                <div className="mt-4 space-y-2.5">
                  <InfoRow label="Officer Name" value={profile.name || "Candidate"} />
                  <InfoRow label="Designation" value={profile.designation || "Not provided"} />
                  <InfoRow label="Department" value={profile.department || "Not provided"} />
                  <InfoRow label="Assignment" value={profile.currentAssignment || "Not provided"} />
                  <InfoRow label="Qualification" value={profile.highestQualification || "Not provided"} />
                  <InfoRow label="Experience" value={profile.yearsOfExperience ? `${profile.yearsOfExperience} Years` : "Not provided"} />
                  {profile.previousTraining && (
                    <InfoRow label="Training History" value={profile.previousTraining} />
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <h2 className="text-base font-bold text-foreground">Evidence & Credential Inputs</h2>
                <p className="mt-1 text-xs text-muted-foreground">Verified inputs used for the competency baseline.</p>

                <div className="mt-4 rounded-lg border border-success/20 bg-success/5 p-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {resumeFileName || "Candidate Competency Profile"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Verified Identity Evidence for:{" "}
                        <span className="font-semibold text-foreground">{profile.name || "Candidate"}</span>{" "}
                        {profile.designation ? `(${profile.designation})` : ""}
                      </p>
                    </div>
                  </div>
                </div>

                {existingSkills.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Declared Competency Skills ({existingSkills.length})
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {existingSkills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md border border-border bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-foreground"
                        >
                          ✓ {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Work Experience Summary
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {workExperience || "No detailed work history provided."}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function CompetencyGrid({
  items,
  isVerified = false,
}: {
  items: CompetencyScore[];
  isVerified?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((item) => {
        const hasScore = item.score !== null;
        const scoreVal = item.score ?? 0;
        const levelLabel =
          scoreVal >= 80
            ? "Level 4 (Advanced)"
            : scoreVal >= 65
              ? "Level 3 (Intermediate)"
              : scoreVal >= 50
                ? "Level 2 (Foundational)"
                : "Level 1 (Novice)";

        return (
          <div
            key={item.name}
            className="rounded-lg border border-border bg-muted/30 p-4 transition hover:bg-muted/40"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground">{item.name}</p>
              {hasScore && isVerified && (
                <span className="text-[10px] font-bold text-accent bg-accent-soft px-2 py-0.5 rounded">
                  {levelLabel}
                </span>
              )}
            </div>

            <div className="mt-2 flex items-baseline justify-between">
              <p className="text-2xl font-extrabold text-foreground">
                {hasScore ? `${scoreVal}%` : "--"}
              </p>
              {!hasScore && (
                <span className="text-[11px] text-muted-foreground italic">
                  Awaiting diagnostic
                </span>
              )}
            </div>

            {hasScore && (
              <div className="mt-2.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    scoreVal >= 75 ? "bg-accent" : scoreVal >= 60 ? "bg-amber-500" : "bg-destructive"
                  )}
                  style={{ width: `${Math.min(100, Math.max(5, scoreVal))}%` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/40 px-3.5 py-2.5">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <span className="max-w-[65%] truncate text-right text-xs font-medium text-foreground">{value}</span>
    </div>
  );
}
