import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Filter,
  GraduationCap,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import { getCurrentUserProfile } from "@/lib/current-user";
import {
  getLearningRecommendations,
  type LearningPathRecommendation,
} from "@/lib/learner-data";
import { CoursePlayerModal } from "@/components/dashboard/CoursePlayerModal";

export const Route = createFileRoute("/learning-paths")({
  component: LearningPathsPage,
});

type LearningPathStatus = LearningPathRecommendation["status"];
type LearningPath = LearningPathRecommendation;

function StatusBadge({ status }: { status: LearningPathStatus }) {
  const styles = {
    Recommended: "bg-orange-50 text-orange-700 border-orange-100",
    "In Progress": "bg-blue-50 text-blue-700 border-blue-100",
    Completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function LearningPathCard({
  path,
  onLaunch,
}: {
  path: LearningPath;
  onLaunch: (path: LearningPath, defaultTab?: "syllabus" | "material" | "quiz") => void;
}) {
  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
              <BookOpen className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <h3 className="text-sm font-bold leading-5 text-foreground">
                {path.title}
              </h3>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                <span>{path.provider}</span>

                <span className="inline-flex items-center gap-1">
                  <Clock3 className="h-3 w-3" />
                  {path.duration}
                </span>

                <span>{path.category}</span>
              </div>
            </div>
          </div>

          <StatusBadge status={path.status} />
        </div>

        <p className="text-xs leading-5 text-muted-foreground">
          {path.description}
        </p>

        {path.whyRecommended ? (
          <div className="rounded-lg bg-muted/40 px-3 py-2.5">
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-accent" />

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Why recommended
                </p>

                <p className="mt-1 text-[11px] leading-4.5 text-muted-foreground">
                  {path.whyRecommended}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-1.5">
          {path.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-md border border-border bg-background px-2 py-1 text-[10px] font-medium text-muted-foreground"
            >
              {skill}
            </span>
          ))}
        </div>

        {path.status === "In Progress" && (
          <div>
            <div className="mb-1.5 flex items-center justify-between text-[10px]">
              <span className="font-medium text-muted-foreground">
                Learning progress
              </span>

              <span className="font-bold text-foreground">
                {path.progress}%
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${path.progress}%` }}
              />
            </div>
          </div>
        )}

        {path.status === "Completed" && (
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-success">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Learning path completed
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Target className="h-3.5 w-3.5" />
            {path.priority} priority
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onLaunch(path, "quiz")}
              className="inline-flex items-center gap-1 rounded-lg border border-accent/40 bg-accent/10 px-2.5 py-1.5 text-[11px] font-semibold text-accent hover:bg-accent/20 transition"
              title="Generate dynamic AI quiz for this course"
            >
              <Sparkles className="h-3 w-3" /> AI Quiz
            </button>
            <button
              type="button"
              onClick={() => onLaunch(path, "syllabus")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-[11px] font-semibold text-accent-foreground transition hover:bg-accent/90"
            >
              {path.status === "In Progress" ? "Continue Course" : "Launch Course"}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function LearningPathsPage() {
  const currentUser = getCurrentUserProfile();
  const [learningPaths, setLearningPaths] = useState<LearningPathRecommendation[]>([]);
  const [activePlayerCourse, setActivePlayerCourse] = useState<LearningPath | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setLearningPaths(getLearningRecommendations());
  }, [reloadKey]);

  const [activeFilter, setActiveFilter] =
    useState<"All" | LearningPathStatus>("All");

  const filteredPaths =
    activeFilter === "All"
      ? learningPaths
      : learningPaths.filter((path) => path.status === activeFilter);

  const recommendedCount = learningPaths.filter(
    (path) => path.status === "Recommended",
  ).length;

  const inProgressCount = learningPaths.filter(
    (path) => path.status === "In Progress",
  ).length;

  const completedCount = learningPaths.filter(
    (path) => path.status === "Completed",
  ).length;

  const focusAreas = new Set(
    learningPaths.flatMap((path) => path.skills),
  ).size;

  return (
    <div className="min-h-screen bg-page-bg">
      <DashboardSidebar className="fixed inset-y-0 left-0 z-30 hidden w-72 lg:flex" />

      <div className="min-h-screen lg:pl-72">
        <DashboardTopBar />

        <main className="px-4 py-6 lg:px-7 lg:py-7">
          <div className="mx-auto max-w-6xl space-y-5">
            <section>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-medium text-accent">
                    Personalized Learning
                  </p>

                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
                    Learning Paths
                  </h1>

                  
                </div>

                <Link
                  to="/skill-gap-analysis"
                  className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted"
                >
                  <Target className="h-3.5 w-3.5" />
                  Review Skill Gaps
                </Link>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <SummaryCard
                label="Recommended"
                value={recommendedCount}
                icon={<Sparkles className="h-3.5 w-3.5" />}
                iconClass="bg-orange-50 text-orange-600"
              />

              <SummaryCard
                label="In Progress"
                value={inProgressCount}
                icon={<TrendingUp className="h-3.5 w-3.5" />}
                iconClass="bg-blue-50 text-blue-600"
              />

              <SummaryCard
                label="Completed"
                value={completedCount}
                icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                iconClass="bg-emerald-50 text-emerald-600"
              />

              <SummaryCard
                label="Focus Areas"
                value={focusAreas}
                icon={<GraduationCap className="h-3.5 w-3.5" />}
                iconClass="bg-muted text-muted-foreground"
              />
            </section>

            <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-foreground">
                  Your Learning Paths
                </h2>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  Explore recommendations and continue active learning.
                </p>
              </div>

              <div className="flex w-fit items-center gap-1 overflow-x-auto rounded-lg border border-border bg-card p-1">
                <div className="px-1.5 text-muted-foreground">
                  <Filter className="h-3.5 w-3.5" />
                </div>

                {(["All", "Recommended", "In Progress", "Completed"] as const).map(
                  (filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setActiveFilter(filter)}
                      className={`whitespace-nowrap rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition ${
                        activeFilter === filter
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {filter}
                    </button>
                  ),
                )}
              </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-2">
              {filteredPaths.map((path) => (
                <LearningPathCard
                  key={path.id}
                  path={path}
                  onLaunch={(p) => setActivePlayerCourse(p)}
                />
              ))}
            </section>

            {filteredPaths.length === 0 && (
              <div className="rounded-xl border border-dashed border-border bg-card px-5 py-12 text-center">
                <BookOpen className="mx-auto h-9 w-9 text-muted-foreground/50" />

                <h3 className="mt-3 text-base font-bold text-foreground">
                  {learningPaths.length === 0
                    ? "No Course Recommendations Yet"
                    : "No learning paths in this category"}
                </h3>

                <p className="mt-1.5 max-w-md mx-auto text-xs text-muted-foreground leading-relaxed">
                  {learningPaths.length === 0
                    ? "Personalized courses from iGOT Karmayogi and MoSPI are recommended based on the competency gaps measured during your AI Assessment Quiz. Complete the diagnostic assessment to generate your personalized path."
                    : "Try selecting another category or clear your filter to view available courses."}
                </p>

                {learningPaths.length === 0 && (
                  <Link
                    to="/ai-assessment-quiz"
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-xs font-semibold text-accent-foreground transition hover:bg-accent/90"
                  >
                    <Sparkles className="h-4 w-4" />
                    Take AI Assessment Quiz
                  </Link>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <CoursePlayerModal
        course={activePlayerCourse}
        isOpen={!!activePlayerCourse}
        onClose={() => setActivePlayerCourse(null)}
        onCourseUpdated={() => setReloadKey((k) => k + 1)}
      />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  iconClass,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-3.5 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-medium text-muted-foreground">
            {label}
          </p>

          <p className="mt-0.5 text-lg font-bold leading-none text-foreground">
            {value}
          </p>
        </div>

        <div className={`rounded-lg p-1.5 ${iconClass}`}>{icon}</div>
      </div>
    </div>
  );
}
