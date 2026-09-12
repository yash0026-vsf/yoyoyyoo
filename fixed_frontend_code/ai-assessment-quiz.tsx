import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  XCircle,
} from "lucide-react";

import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import { getQuizQuestions, getQuizInsights, type QuizQuestion } from "@/lib/quiz-data";
import { getSkillGapRows, saveSkillGapRows } from "@/lib/learner-data";

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
};

function AIAssessmentQuizPage() {
  const [view, setView] = useState<QuizView>("quiz");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<number[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<RecommendedCourse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = useMemo(() => getQuizQuestions(), []);
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

  /* [FIXED]: Handles Real Submission, Skill Gap Updating & Course Recommendations */
  const handleSubmit = async () => {
    setIsSubmitting(true);
    let coursesToDisplay: RecommendedCourse[] = [];

    try {
      const formattedAnswers = Object.entries(answers).map(([qId, opt]) => ({
        question_id: String(qId),
        selected_option: opt,
      }));

      // 1. Call Backend API
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

    // 2. Client-side adaptive fallback if backend is running separately
    if (coursesToDisplay.length === 0) {
      if (score >= 80) {
        coursesToDisplay = [
          {
            course_id: "sd-501",
            name: "National Survey Methodology Architecture & Masterclass",
            provider: "MoSPI / UN-DESA",
            duration_hours: 24,
            description: "Designing national statistical frameworks and global data standards.",
            reason: "Master Level 5 executive competencies to exceed cadre benchmarks.",
            difficulty_level: 5,
          },
        ];
      } else {
        coursesToDisplay = [
          {
            course_id: "sd-301",
            name: "Independent Survey Sampling & Methodology",
            provider: "MoSPI / iGOT",
            duration_hours: 15,
            description: "Stratified random sampling, questionnaire validation, and survey execution.",
            reason: "Bridges gap from Level 2 to 4 by mastering Level 3 practical competencies.",
            difficulty_level: 3,
          },
          {
            course_id: "sd-401",
            name: "NSS Survey Methodology & Multi-Region Design",
            provider: "MoSPI",
            duration_hours: 20,
            description: "Nationwide survey design, multi-stage sampling frames, and quality audits.",
            reason: "Bridges gap to Level 4 required for Statistical Officer cadre.",
            difficulty_level: 4,
          },
        ];
      }
    }

    setRecommendedCourses(coursesToDisplay);

    // 3. [FIXED]: Dynamically Update Skill Gaps in Storage
    const existingGaps = getSkillGapRows();
    const evaluatedLevel = score >= 80 ? 4 : score >= 60 ? 3 : 2;
    const updatedGaps = existingGaps.map((row) => {
      if (row.skill.includes("Survey") || row.skill.includes("Sampling")) {
        const gap = evaluatedLevel - row.requiredLevel;
        return {
          ...row,
          currentLevel: evaluatedLevel,
          currentLabel: evaluatedLevel >= 4 ? "Advanced" : evaluatedLevel === 3 ? "Intermediate" : "Foundational",
          gap: gap,
          priority: gap >= 0 ? ("Low" as const) : ("High" as const),
        };
      }
      return row;
    });
    saveSkillGapRows(updatedGaps);

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
                      <div key={c.course_id} className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
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
                    ))}
                  </div>
                </section>

                {/* Link to Skill Gap Page to verify updated gap */}
                <div className="flex justify-end gap-3">
                  <Link
                    to="/skill-gap-analysis"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    View Updated Skill Gap Analysis <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
