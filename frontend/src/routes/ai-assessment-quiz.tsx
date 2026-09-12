import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react";

import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import { getQuizQuestions, getQuizInsights, type QuizQuestion } from "@/lib/quiz-data";
import { getSkillGapRows, saveSkillGapRows, type SkillGapRow } from "@/lib/learner-data";
import { getCurrentUserProfile } from "@/lib/current-user";
import { syncActiveUserAssessmentHistory } from "@/lib/auth-service";
import { CoursePlayerModal, type CourseDetails } from "@/components/dashboard/CoursePlayerModal";

export const Route = createFileRoute("/ai-assessment-quiz")({
  component: AIAssessmentQuizPage,
});

type QuizView = "setup" | "quiz" | "results";

type RecommendedCourse = {
  course_id: string;
  name: string;
  provider: string;
  duration_hours: number;
  description: string;
  reason: string;
  difficulty_level: number;
  category?: string;
  skills?: string[];
};

function AIAssessmentQuizPage() {
  const profile = useMemo(() => getCurrentUserProfile(), []);
  const [view, setView] = useState<QuizView>("quiz");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<number[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<RecommendedCourse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activePlayerCourse, setActivePlayerCourse] = useState<CourseDetails | null>(null);
  const [assessedResultsGaps, setAssessedResultsGaps] = useState<SkillGapRow[]>(() => getSkillGapRows());

  // [AI ADAPTIVE]: Generate 10 questions based on the officer's declared profile skills
  const questions = useMemo(
    () => getQuizQuestions(profile.existingSkills, 10),
    [profile.existingSkills]
  );
  const insights = useMemo(() => getQuizInsights(), []);
  const currentQuestion = questions[currentQuestionIndex];

  const correctCount = questions.reduce((count, question) => {
    return count + (answers[question.id] === question.correctAnswer ? 1 : 0);
  }, 0);

  const score = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;

  const handleAnswer = (optionIndex: number) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionIndex }));
  };

  /* [FIXED]: Handles Real Submission, Skill Gap Updating & Dynamic Gap-Driven Course Recommendations */
  const handleSubmit = async () => {
    setIsSubmitting(true);
    let coursesToDisplay: RecommendedCourse[] = [];

    // 1. Calculate accuracy and performance per tested competency
    const competencyStats: Record<string, { total: number; correct: number }> = {};
    questions.forEach((q) => {
      const comp = q.competency;
      if (!competencyStats[comp]) competencyStats[comp] = { total: 0, correct: 0 };
      competencyStats[comp].total++;
      if (answers[q.id] === q.correctAnswer) {
        competencyStats[comp].correct++;
      }
    });

    const getEmpiricalLevel = (
      compSubstring: string,
      fallbackRatio: number
    ): { level: number; label: string } => {
      const key = Object.keys(competencyStats).find((k) =>
        k.toLowerCase().includes(compSubstring.toLowerCase())
      );
      const ratio =
        key && competencyStats[key].total > 0
          ? competencyStats[key].correct / competencyStats[key].total
          : fallbackRatio;

      if (ratio >= 0.75) return { level: 4, label: "Advanced" };
      if (ratio >= 0.5) return { level: 3, label: "Intermediate" };
      if (ratio >= 0.25) return { level: 2, label: "Foundational" };
      return { level: 1, label: "Novice" };
    };

    const overallRatio = questions.length > 0 ? correctCount / questions.length : 0.5;
    const samplingLvl = getEmpiricalLevel("sampling", overallRatio);
    const pythonLvl = getEmpiricalLevel("python", overallRatio);
    const gisLvl = getEmpiricalLevel("gis", overallRatio);
    const nationalLvl = getEmpiricalLevel("national", overallRatio);
    const qualityLvl = getEmpiricalLevel("quality", overallRatio);
    const governanceLvl = getEmpiricalLevel("governance", overallRatio);

    const assessedGaps: SkillGapRow[] = [
      {
        skill: "Survey Design & Sampling",
        category: "Statistical",
        description: "Survey design, stratification and sampling estimation",
        currentLevel: samplingLvl.level,
        currentLabel: samplingLvl.label,
        requiredLevel: 4,
        requiredLabel: "Advanced",
        gap: Math.max(0, 4 - samplingLvl.level),
        priority:
          4 - samplingLvl.level >= 2
            ? "High"
            : 4 - samplingLvl.level === 1
              ? "Moderate"
              : "Low",
      },
      {
        skill: "Python for Statistical Computing",
        category: "Technical",
        description: "Pandas, NumPy, automated data validation and processing",
        currentLevel: pythonLvl.level,
        currentLabel: pythonLvl.label,
        requiredLevel: 4,
        requiredLabel: "Advanced",
        gap: Math.max(0, 4 - pythonLvl.level),
        priority:
          4 - pythonLvl.level >= 2
            ? "High"
            : 4 - pythonLvl.level === 1
              ? "Moderate"
              : "Low",
      },
      {
        skill: "GIS & Spatial Data Analysis",
        category: "Technical",
        description: "QGIS, spatial mapping and geospatial micro-data analysis",
        currentLevel: gisLvl.level,
        currentLabel: gisLvl.label,
        requiredLevel: 3,
        requiredLabel: "Intermediate",
        gap: Math.max(0, 3 - gisLvl.level),
        priority:
          3 - gisLvl.level >= 2
            ? "High"
            : 3 - gisLvl.level === 1
              ? "Moderate"
              : "Low",
      },
      {
        skill: "National Accounts & GSDP Estimation",
        category: "Statistical",
        description: "National accounts concepts, price indices and state estimation methods",
        currentLevel: nationalLvl.level,
        currentLabel: nationalLvl.label,
        requiredLevel: 4,
        requiredLabel: "Advanced",
        gap: Math.max(0, 4 - nationalLvl.level),
        priority:
          4 - nationalLvl.level >= 2
            ? "High"
            : 4 - nationalLvl.level === 1
              ? "Moderate"
              : "Low",
      },
      {
        skill: "Statistical Data Quality & Validation",
        category: "Statistical",
        description: "NQAF standards, consistency rules, and modern imputation",
        currentLevel: qualityLvl.level,
        currentLabel: qualityLvl.label,
        requiredLevel: 4,
        requiredLabel: "Advanced",
        gap: Math.max(0, 4 - qualityLvl.level),
        priority:
          4 - qualityLvl.level >= 2
            ? "High"
            : 4 - qualityLvl.level === 1
              ? "Moderate"
              : "Low",
      },
      {
        skill: "Digital Data Governance",
        category: "Governance",
        description: "Data privacy, DPDP Act 2023, and government data standards",
        currentLevel: governanceLvl.level,
        currentLabel: governanceLvl.label,
        requiredLevel: 3,
        requiredLabel: "Intermediate",
        gap: Math.max(0, 3 - governanceLvl.level),
        priority:
          3 - governanceLvl.level >= 2
            ? "High"
            : 3 - governanceLvl.level === 1
              ? "Moderate"
              : "Low",
      },
    ];

    try {
      const formattedAnswers = Object.entries(answers).map(([qId, opt]) => ({
        question_id: String(qId),
        selected_option: opt,
      }));

      // 2. Call Backend API if available
      const res = await fetch("http://127.0.0.1:8000/submit-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quiz_id: "quiz-session-live",
          employee_id: "E001",
          designation: "Statistical Officer",
          answers: formattedAnswers,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        coursesToDisplay = data.recommended_courses || [];
      }
    } catch (e) {
      console.warn("Backend offline, applying client-side adaptive calculation:", e);
    }

    // 3. Client-side adaptive gap engine: Recommend 2 distinct courses matching top deficit competencies
    if (coursesToDisplay.length === 0) {
      const competencyCoursesCatalog: Record<
        string,
        {
          course_id: string;
          name: string;
          provider: string;
          category: string;
          duration_hours: number;
          description: string;
          reasonPrefix: string;
          skills: string[];
          difficulty_level: number;
        }
      > = {
        "Survey Design & Sampling": {
          course_id: "sd-301",
          name: "Survey Sampling Methodology & Field Audits",
          provider: "MoSPI / NSSTA",
          category: "Statistical",
          duration_hours: 15,
          description: "Stratified multistage sampling, design effects, and sample weight calibrations.",
          reasonPrefix: "Closes assessed foundational deficit in Survey Design & Sampling.",
          skills: ["Sampling Theory", "Stratification", "Sample Weighting", "Field Audits"],
          difficulty_level: 3,
        },
        "Python for Statistical Computing": {
          course_id: "py-302",
          name: "Python for Official Statistics & Microdata Pipelines",
          provider: "iGOT Karmayogi / NPTEL",
          category: "Technical",
          duration_hours: 18,
          description: "Applied Python, Pandas DataFrames, and NumPy for national survey microdata pipelines.",
          reasonPrefix: "Directly bridges your assessed Python programming gap to cadre Level 4 standard.",
          skills: ["Python", "Pandas", "NumPy", "Microdata Pipelines"],
          difficulty_level: 3,
        },
        "GIS & Spatial Data Analysis": {
          course_id: "gis-201",
          name: "Spatial Analytics & GIS for District Statistics",
          provider: "ISRO / MoSPI GIS Lab",
          category: "Technical",
          duration_hours: 14,
          description: "Geospatial boundary mapping, QGIS raster & vector processing for regional reporting.",
          reasonPrefix: "Addresses identified gap in spatial data analysis and district boundary integration.",
          skills: ["QGIS", "Spatial Analytics", "Boundary Mapping", "Thematic Cartography"],
          difficulty_level: 3,
        },
        "National Accounts & GSDP Estimation": {
          course_id: "na-401",
          name: "SNA Framework & Macroeconomic Indicator Compilation",
          provider: "Central Statistics Office / UN-SD",
          category: "Statistical",
          duration_hours: 20,
          description: "System of National Accounts (SNA), deflators, GVA computation, and GDP revisions.",
          reasonPrefix: "Bridges macroeconomic accounts compilation and index estimation gap.",
          skills: ["National Accounts", "SNA 2008", "GSDP Deflators", "Price Indices"],
          difficulty_level: 4,
        },
        "Statistical Data Quality & Validation": {
          course_id: "dq-305",
          name: "Statistical Data Quality Assurance & Imputation Frameworks",
          provider: "MoSPI Data Innovation Lab",
          category: "Statistical",
          duration_hours: 12,
          description: "UN NQAF data quality assurance, logical audit rules, outlier detection, and donor imputation.",
          reasonPrefix: "Closes gap in automated data validation and statistical consistency checks.",
          skills: ["UN NQAF", "Data Imputation", "Validation Rules", "Audit Trails"],
          difficulty_level: 3,
        },
        "Digital Data Governance": {
          course_id: "gov-204",
          name: "Digital Data Governance & Statistical Ethics",
          provider: "NSSTA / NITI Aayog",
          category: "Governance",
          duration_hours: 10,
          description: "DPDP Act compliance, statistical confidentiality, microdata anonymization, and public dissemination.",
          reasonPrefix: "Builds essential compliance, DPDP Act 2023, and data protection competencies.",
          skills: ["Data Governance", "DPDP Act 2023", "Anonymization", "Cadre Ethics"],
          difficulty_level: 2,
        },
      };

      if (score >= 90) {
        // High performer: Recommend two distinct Level 5 advanced executive courses
        coursesToDisplay = [
          {
            course_id: "sd-501",
            name: "National Survey Methodology Architecture & Masterclass",
            provider: "MoSPI / UN-DESA",
            category: "Statistical",
            duration_hours: 24,
            description: "Designing national statistical frameworks, UN-DESA standards, and multi-round microdata integration.",
            reason: "Master Level 5 executive competencies to exceed cadre benchmarks.",
            difficulty_level: 5,
            skills: ["Advanced Survey Architecture", "UN Standards", "Executive Oversight"],
          },
          {
            course_id: "ml-502",
            name: "High-Frequency Economic Nowcasting & Statistical Machine Learning",
            provider: "MoSPI Innovation Cell",
            category: "Technical",
            duration_hours: 22,
            description: "Advanced predictive modeling, high-frequency GST/satellite data integration, and nowcasting macroeconomic trends.",
            reason: "Directly advances frontier statistical computing skills for senior technical cadre.",
            difficulty_level: 5,
            skills: ["Machine Learning", "Nowcasting", "Predictive Analytics"],
          },
        ];
      } else {
        // Sort evaluated gaps descending to pick top 2 distinct areas
        const sortedByGap = [...assessedGaps].sort((a, b) => {
          if (b.gap !== a.gap) return b.gap - a.gap;
          return a.currentLevel - b.currentLevel;
        });

        // Pick top 2 distinct competencies
        const topSkills = sortedByGap.slice(0, 2);

        coursesToDisplay = topSkills.map((gapItem) => {
          const catalogEntry = competencyCoursesCatalog[gapItem.skill] || {
            course_id: "cadre-300",
            name: `${gapItem.skill} Professional Competency`,
            provider: "iGOT Karmayogi",
            category: gapItem.category,
            duration_hours: 15,
            description: `Comprehensive training in ${gapItem.skill} for official statistical cadres.`,
            reasonPrefix: `Addresses assessed Level ${gapItem.currentLevel} gap against required Level ${gapItem.requiredLevel}.`,
            skills: [gapItem.skill],
            difficulty_level: gapItem.requiredLevel,
          };

          return {
            course_id: catalogEntry.course_id,
            name: catalogEntry.name,
            provider: catalogEntry.provider,
            category: catalogEntry.category,
            duration_hours: catalogEntry.duration_hours,
            description: catalogEntry.description,
            reason: `${catalogEntry.reasonPrefix} Current Level ${gapItem.currentLevel} vs Target Level ${gapItem.requiredLevel}.`,
            difficulty_level: catalogEntry.difficulty_level,
            skills: catalogEntry.skills,
          };
        });
      }
    }

    setRecommendedCourses(coursesToDisplay);

    // 4. Dynamically save assessment result, measured skill gaps, and courses to storage
    const evaluatedLevel = score >= 80 ? 4 : score >= 60 ? 3 : 2;
    const requiredLevel = 4;
    const calculatedGap = evaluatedLevel - requiredLevel;

    if (typeof window !== "undefined") {
      // 4a. Save official assessment score and verified level
      localStorage.setItem(
        "user_assessed_gap",
        JSON.stringify({
          score: { percentage: score },
          current_level: evaluatedLevel,
          target_level: requiredLevel,
          gap: calculatedGap,
          skill: "Survey Design & Statistical Computing",
          assessed_at: new Date().toISOString(),
        })
      );

      // 4b. Save assessed skill gap matrix
      saveSkillGapRows(assessedGaps);
      setAssessedResultsGaps(assessedGaps);

      // 4c. Save empirical competency assessment domain scores
      const samplingRow = assessedGaps.find((r) => r.skill.toLowerCase().includes("sampling"));
      const pythonRow = assessedGaps.find((r) => r.skill.toLowerCase().includes("python"));
      const govRow = assessedGaps.find((r) => r.skill.toLowerCase().includes("governance"));

      const levelToScore = (lvl: number, base: number) => {
        if (lvl >= 4) return Math.min(95, Math.max(85, base));
        if (lvl === 3) return Math.min(85, Math.max(72, Math.round(base * 0.88)));
        if (lvl === 2) return Math.min(68, Math.max(55, Math.round(base * 0.70)));
        return Math.max(35, Math.round(base * 0.50));
      };

      const evaluatedCompetencies = [
        { name: "Statistical", score: levelToScore(samplingRow?.currentLevel ?? 3, score) },
        { name: "Technical", score: levelToScore(pythonRow?.currentLevel ?? 2, score) },
        { name: "Digital Governance", score: levelToScore(govRow?.currentLevel ?? 3, score) },
        { name: "Behavioural", score: Math.round(score * 0.9) },
      ];
      localStorage.setItem("user_assessed_competencies", JSON.stringify(evaluatedCompetencies));

      // 4d. Save personalized recommended courses measuring the gap with distinct categories & skills
      const targetedPaths: LearningPathRecommendation[] = coursesToDisplay.map(
        (c, idx) => ({
          id: idx + 1,
          title: c.name,
          description: c.description,
          provider: c.provider,
          category: c.category || "Technical",
          duration: `${c.duration_hours} hours`,
          skills: c.skills || ["Survey Design", "Data Analysis"],
          status: "Recommended",
          progress: 0,
          priority: c.difficulty_level >= 4 ? "High" : "Medium",
          whyRecommended: c.reason,
          courseUrl: "https://igotkarmayogi.gov.in",
        })
      );
      localStorage.setItem("active_learning_paths", JSON.stringify(targetedPaths));
    }

    // Persist assessment scores, gaps, and learning paths to the active user's permanent account
    syncActiveUserAssessmentHistory();

    setIsSubmitting(false);
    setView("results");
  };

  return (
    <div className="flex min-h-screen bg-muted/40">
      <DashboardSidebar className="sticky top-0 hidden h-screen lg:flex" />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopBar onMenuClick={() => undefined} />

        <main className="flex-1 px-4 py-6 lg:px-7 lg:py-7">
          <div className="mx-auto max-w-6xl space-y-5">
            {view === "quiz" && (
              <>
                {/* [AI TAILORED HEADER]: Displays declared skills being assessed */}
                <div className="rounded-xl border border-accent/30 bg-accent-soft/20 p-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-accent">
                      <Sparkles className="h-4 w-4" />
                      <span>AI Adaptive Assessment — Tailored to Your Declared Profile</span>
                    </div>
                    <Link
                      to="/build-profile"
                      className="text-xs font-semibold text-accent hover:underline inline-flex items-center gap-1"
                    >
                      Update Skills & Profile →
                    </Link>
                  </div>
                  <p className="mt-1 text-xs text-foreground">
                    Assessing <span className="font-bold">{profile.name || "Officer"}</span> ({profile.designation || "Statistical Cadre"}) across your declared competencies:
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {profile.existingSkills && profile.existingSkills.length > 0 ? (
                      profile.existingSkills.map((s) => (
                        <span
                          key={s}
                          className="rounded-md border border-accent/40 bg-card px-2.5 py-1 text-[11px] font-semibold text-accent"
                        >
                          ✓ {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-muted-foreground italic">
                        Core Statistical Operations, Survey Sampling & Data Quality
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-accent">
                      Adaptive Competency Assessment
                    </span>
                    <h2 className="mt-1 text-lg font-bold text-foreground">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </h2>
                  </div>
                  <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent">
                    {currentQuestion?.competency}
                  </span>
                </div>

                <div className="mt-6">
                  <h3 className="text-base font-semibold text-foreground">
                    {currentQuestion?.question}
                  </h3>

                  <div className="mt-4 space-y-2.5">
                    {currentQuestion?.options.map((option, idx) => {
                      const selected = answers[currentQuestion.id] === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAnswer(idx)}
                          className={`flex w-full items-center gap-3 rounded-lg border p-3.5 text-left text-xs font-medium transition ${
                            selected
                              ? "border-accent bg-accent-soft/40 text-foreground"
                              : "border-border hover:bg-muted/30 text-muted-foreground"
                          }`}
                        >
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                              selected ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{option}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-8 flex justify-between border-t border-border pt-4">
                  <button
                    type="button"
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex((i) => i - 1)}
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </button>

                  {currentQuestionIndex === questions.length - 1 ? (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleSubmit}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground hover:bg-accent/90"
                    >
                      {isSubmitting ? "Evaluating..." : "Submit Assessment"}
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCurrentQuestionIndex((i) => i + 1)}
                      className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground hover:bg-accent/90"
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

            {/* [FIXED]: Results View with Dynamic Course Recommendations */}
            {view === "results" && (
              <div className="space-y-6">
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-success">
                        Assessment Complete & Verified
                      </span>
                      <h1 className="mt-1 text-2xl font-bold text-foreground">
                        Verified Competency Score: {score}%
                      </h1>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Answered {correctCount} of {questions.length} questions correctly. Skill gap profile has been updated!
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentQuestionIndex(0);
                        setAnswers({});
                        setView("quiz");
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Retake
                    </button>
                  </div>
                </div>

                {/* [VERIFIED SKILL GAP PROFILE]: Evaluated Competencies & Deficits */}
                <section className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                    <div>
                      <div className="flex items-center gap-2 text-foreground">
                        <Target className="h-5 w-5 text-accent" />
                        <h2 className="text-lg font-bold">Your Assessed Skill Gap Profile</h2>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Empirical comparison of your verified quiz performance against Statistical Cadre benchmark levels:
                      </p>
                    </div>
                    <Link
                      to="/skill-gap-analysis"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
                    >
                      View Full Analysis <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-border bg-muted/50 font-semibold text-muted-foreground">
                        <tr>
                          <th className="p-3">Competency Area</th>
                          <th className="p-3 text-center">Verified Level</th>
                          <th className="p-3 text-center">Target Level</th>
                          <th className="p-3 text-center">Current Gap</th>
                          <th className="p-3 text-center">Action Priority</th>
                          <th className="p-3 text-center">Actions Needed</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-foreground">
                        {(assessedResultsGaps.length > 0 ? assessedResultsGaps : getSkillGapRows()).map((row) => {
                          const deficit = row.requiredLevel - row.currentLevel;
                          const hasDeficit = deficit > 0;
                          return (
                            <tr key={row.skill} className="hover:bg-muted/20 transition">
                              <td className="p-3">
                                <p className="font-bold text-foreground">{row.skill}</p>
                                <p className="text-[11px] text-muted-foreground">{row.description}</p>
                              </td>
                              <td className="p-3 text-center font-bold">
                                <span className="rounded bg-muted/70 px-2 py-1 text-xs text-foreground">
                                  Level {row.currentLevel} ({row.currentLabel})
                                </span>
                              </td>
                              <td className="p-3 text-center font-bold">
                                <span className="rounded bg-muted/70 px-2 py-1 text-xs text-foreground">
                                  Level {row.requiredLevel} ({row.requiredLabel})
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                {hasDeficit ? (
                                  <span className="inline-flex items-center gap-1 rounded bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive">
                                    -{deficit} {deficit === 1 ? "Level Deficit" : "Levels Deficit"}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded bg-success/10 px-2.5 py-1 text-xs font-bold text-success">
                                    <Check className="h-3 w-3" /> Benchmark Met
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-center">
                                <span
                                  className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold border ${
                                    deficit >= 2 || row.priority === "High"
                                      ? "bg-destructive/10 text-destructive border-destructive/20"
                                      : deficit === 1 || row.priority === "Moderate"
                                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                        : "bg-success/10 text-success border-success/20"
                                  }`}
                                >
                                  {deficit >= 2 || row.priority === "High"
                                    ? "High Priority"
                                    : deficit === 1 || row.priority === "Moderate"
                                      ? "Moderate Priority"
                                      : "Meets Requirement"}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                {hasDeficit ? (
                                  <Link
                                    to="/learning-paths"
                                    className="inline-flex items-center gap-1 rounded bg-accent px-2.5 py-1 text-[11px] font-bold text-accent-foreground hover:bg-accent/90 transition shadow-sm"
                                  >
                                    Bridge Gap <ArrowRight className="h-3 w-3" />
                                  </Link>
                                ) : (
                                  <span className="text-[11px] text-muted-foreground font-medium flex items-center justify-center gap-1">
                                    <Check className="h-3 w-3 text-success" /> Benchmark Met
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* [FIXED]: Targeted Course Recommendations Section */}
                <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-foreground">
                    <BookOpen className="h-5 w-5 text-accent" />
                    <h2 className="text-lg font-bold">Recommended Courses to Close Skill Gap</h2>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Targeted modules from iGOT Karmayogi and MoSPI designed to bridge your verified gap:
                  </p>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {recommendedCourses.map((c) => (
                      <div key={c.course_id} className="rounded-xl border border-border bg-muted/20 p-4 space-y-2 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="rounded bg-accent-soft px-2 py-0.5 text-[10px] font-bold text-accent">
                              {c.provider}
                            </span>
                            <span className="text-xs font-semibold text-muted-foreground">{c.duration_hours} Hours</span>
                          </div>
                          <h3 className="text-sm font-bold text-foreground">{c.name}</h3>
                          <p className="text-xs text-muted-foreground">{c.description}</p>
                          <div className="rounded-lg bg-accent/10 p-2 text-[11px] font-medium text-accent">
                            ✓ {c.reason}
                          </div>
                        </div>

                        <div className="pt-2 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setActivePlayerCourse({
                                id: c.course_id,
                                title: c.name,
                                provider: c.provider,
                                description: c.description,
                                duration: `${c.duration_hours} Hours`,
                                category: c.category || "Statistical",
                                skills: c.skills || ["Applied Cadre Competency"],
                                whyRecommended: c.reason,
                                priority: c.difficulty_level >= 4 ? "High" : "Medium",
                              })
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground hover:bg-accent/90 transition"
                          >
                            Launch Course in StatSkill <ArrowRight className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setActivePlayerCourse({
                                id: c.course_id,
                                title: c.name,
                                provider: c.provider,
                                description: c.description,
                                duration: `${c.duration_hours} Hours`,
                                category: c.category || "Statistical",
                                skills: c.skills || ["Applied Cadre Competency"],
                                whyRecommended: c.reason,
                                priority: c.difficulty_level >= 4 ? "High" : "Medium",
                              })
                            }
                            className="inline-flex items-center gap-1 rounded-lg border border-accent/40 bg-accent/10 px-2.5 py-1.5 text-xs font-semibold text-accent hover:bg-accent/20 transition"
                          >
                            <Sparkles className="h-3 w-3" /> AI Quiz
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Navigation options after completing assessment */}
                <div className="flex flex-wrap items-center justify-end gap-3">
                  <Link
                    to="/competency-assessment"
                    className="inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-4 py-2.5 text-xs font-semibold text-accent hover:bg-accent/20"
                  >
                    <Award className="h-4 w-4" />
                    View Competency Assessment
                  </Link>

                  <Link
                    to="/learning-paths"
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    <BookOpen className="h-4 w-4 text-accent" />
                    Open Learning Paths
                  </Link>

                  <Link
                    to="/skill-gap-analysis"
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    View Skill Gap Analysis
                  </Link>

                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    Go to Dashboard <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <CoursePlayerModal
        course={activePlayerCourse}
        isOpen={!!activePlayerCourse}
        onClose={() => setActivePlayerCourse(null)}
      />
    </div>
  );
}
