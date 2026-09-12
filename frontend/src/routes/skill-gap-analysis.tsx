import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { AlertTriangle, Check, Sparkles, Target, ArrowRight } from "lucide-react";

import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import { getSkillGapRows, type SkillGapRow } from "@/lib/learner-data";

export const Route = createFileRoute("/skill-gap-analysis")({
  component: SkillGapAnalysisPage,
});

type Filter = "all" | "priority" | "Technical" | "Statistical" | "Governance";

export function getActionForSkill(skillName: string) {
  const lower = skillName.toLowerCase();
  if (lower.includes("python")) {
    return {
      course: "Python for Official Statistics",
      duration: "8 hrs",
      action: "Launch Course",
    };
  }
  if (lower.includes("gis") || lower.includes("spatial")) {
    return {
      course: "QGIS Geospatial Mapping & Buffers",
      duration: "6 hrs",
      action: "Launch Course",
    };
  }
  if (lower.includes("account") || lower.includes("gsdp") || lower.includes("cpi")) {
    return {
      course: "National Accounts & GSDP Estimation",
      duration: "10 hrs",
      action: "Launch Course",
    };
  }
  if (lower.includes("survey") || lower.includes("sampling") || lower.includes("plfs")) {
    return {
      course: "Survey Sampling & Multi-Stage NSS",
      duration: "12 hrs",
      action: "Launch Course",
    };
  }
  if (lower.includes("quality") || lower.includes("validation")) {
    return {
      course: "UN NQAF Data Quality & Imputation",
      duration: "6 hrs",
      action: "Launch Course",
    };
  }
  if (lower.includes("governance") || lower.includes("privacy") || lower.includes("dpdp")) {
    return {
      course: "DPDP Act 2023 & Data Governance",
      duration: "4 hrs",
      action: "Launch Course",
    };
  }
  return {
    course: "Official Cadre Competency Course",
    duration: "6 hrs",
    action: "Launch Course",
  };
}

function SkillGapAnalysisPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const [gapRows, setGapRows] = useState<SkillGapRow[]>([]);

  useEffect(() => {
    setGapRows(getSkillGapRows());
  }, []);

  const filteredRows = useMemo(() => {
    if (activeFilter === "all") return gapRows;
    if (activeFilter === "priority") {
      return gapRows.filter(
        (r) =>
          r.requiredLevel > r.currentLevel ||
          r.priority === "High" ||
          r.priority === "Moderate"
      );
    }
    return gapRows.filter((r) => r.category === activeFilter);
  }, [activeFilter, gapRows]);

  const priorityGapCount = gapRows.filter(
    (r) =>
      r.requiredLevel > r.currentLevel ||
      r.priority === "High" ||
      r.priority === "Moderate"
  ).length;

  return (
    <div className="flex min-h-screen bg-muted/40">
      <DashboardSidebar className="sticky top-0 hidden h-screen lg:flex" />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopBar onMenuClick={() => undefined} />

        <main className="flex-1 px-4 py-6 lg:px-7 lg:py-7">
          <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Competency Skill Gap Analysis</h1>
                <p className="text-xs text-muted-foreground">
                  Empirical Benchmark: Statistical Officer Cadre Requirements vs Verified Assessment
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-accent/15 px-3 py-1.5 text-xs font-bold text-accent">
                <Target className="h-4 w-4" />
                {priorityGapCount} Active Competency Gaps
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-border pb-2">
              {(["all", "priority", "Statistical", "Technical", "Governance"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                    activeFilter === tab
                      ? "bg-accent text-accent-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {tab === "priority" ? "Actions Needed" : tab}
                </button>
              ))}
            </div>

            {/* Skill Gap Table / Empty State */}
            {filteredRows.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
                <Target className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <h3 className="mt-3 text-base font-bold text-foreground">
                  {gapRows.length === 0
                    ? "No Skill Gaps Identified Yet"
                    : "No skill gaps in this category"}
                </h3>
                <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
                  {gapRows.length === 0
                    ? "Your competency levels and skill gaps are established through the AI Diagnostic Assessment Quiz. Take the quiz to compare your skills against cadre benchmarks."
                    : "Try selecting another filter above to view other competencies."}
                </p>
                {gapRows.length === 0 && (
                  <Link
                    to="/ai-assessment-quiz"
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-xs font-semibold text-accent-foreground transition hover:bg-accent/90"
                  >
                    <Sparkles className="h-4 w-4" />
                    Start Assessment Quiz
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/50 font-semibold text-muted-foreground">
                    <tr>
                      <th className="p-3.5">Competency Skill</th>
                      <th className="p-3.5">Domain</th>
                      <th className="p-3.5 text-center">Verified Level</th>
                      <th className="p-3.5 text-center">Target Level</th>
                      <th className="p-3.5 text-center">Current Gap</th>
                      <th className="p-3.5 text-center">Action Priority</th>
                      <th className="p-3.5 text-center">Actions Needed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-foreground">
                    {filteredRows.map((row) => {
                      const deficit = row.requiredLevel - row.currentLevel;
                      const hasDeficit = deficit > 0;

                      // Exact Action Priority based on deficit magnitude
                      let priorityLabel = "Meets Requirement";
                      let priorityClass = "bg-success/15 text-success border-success/30";

                      if (deficit >= 2 || row.priority === "High") {
                        priorityLabel = "High Priority";
                        priorityClass = "bg-destructive/15 text-destructive border-destructive/30";
                      } else if (deficit === 1 || row.priority === "Moderate") {
                        priorityLabel = "Moderate Priority";
                        priorityClass = "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
                      } else if (deficit < 0) {
                        priorityLabel = "Exceeds Benchmark";
                        priorityClass = "bg-primary/15 text-primary border-primary/30";
                      }

                      const action = getActionForSkill(row.skill);

                      return (
                        <tr key={row.skill} className="hover:bg-muted/20 transition">
                          <td className="p-3.5">
                            <p className="font-bold text-foreground">{row.skill}</p>
                            <p className="text-[11px] text-muted-foreground">{row.description}</p>
                          </td>
                          <td className="p-3.5">
                            <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-semibold">
                              {row.category}
                            </span>
                          </td>
                          <td className="p-3.5 text-center font-bold">
                            <span className="rounded bg-muted/60 px-2 py-1 text-xs">
                              Level {row.currentLevel}
                            </span>
                          </td>
                          <td className="p-3.5 text-center font-bold">
                            <span className="rounded bg-muted/60 px-2 py-1 text-xs">
                              Level {row.requiredLevel}
                            </span>
                          </td>

                          {/* 1. ACTUAL CURRENT GAP */}
                          <td className="p-3.5 text-center">
                            {hasDeficit ? (
                              <span className="inline-flex items-center gap-1 rounded bg-destructive/10 px-2 py-1 text-xs font-bold text-destructive">
                                -{deficit} {deficit === 1 ? "Level Deficit" : "Levels Deficit"}
                              </span>
                            ) : deficit < 0 ? (
                              <span className="rounded bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                                +{Math.abs(deficit)} Levels (Exceeds)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded bg-success/10 px-2 py-1 text-xs font-bold text-success">
                                <Check className="h-3 w-3" /> Benchmark Met
                              </span>
                            )}
                          </td>

                          {/* 2. REAL ACTION PRIORITY LEVEL */}
                          <td className="p-3.5 text-center">
                            <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold border ${priorityClass}`}>
                              {priorityLabel}
                            </span>
                          </td>

                          {/* 3. ACTIONS NEEDED */}
                          <td className="p-3.5 text-center">
                            {hasDeficit ? (
                              <div className="flex flex-col items-center gap-1.5">
                                <span className="text-[11px] font-semibold text-foreground">
                                  {action.course}
                                </span>
                                <Link
                                  to="/learning-paths"
                                  className="inline-flex items-center gap-1 rounded-md bg-accent px-2.5 py-1 text-[10px] font-bold text-accent-foreground shadow-sm hover:bg-accent/90 transition"
                                >
                                  <span>{action.action}</span>
                                  <span className="text-[9px] opacity-80">({action.duration})</span>
                                  <ArrowRight className="h-3 w-3" />
                                </Link>
                              </div>
                            ) : (
                              <span className="text-[11px] text-muted-foreground font-medium flex items-center justify-center gap-1">
                                <Check className="h-3 w-3 text-success" /> None Required (Qualified)
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
