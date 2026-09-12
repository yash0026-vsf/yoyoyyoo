import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Users,
  GraduationCap,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

import type { AdminDashboardData } from "@/lib/admin-data";

function gapTone(gap: number) {
  if (gap >= 1.5) return "text-destructive";
  if (gap >= 1) return "text-accent";
  return "text-success";
}

function heatTone(level: number) {
  if (level >= 3.5) return "bg-success/20 text-success";
  if (level >= 2.5) return "bg-accent-soft text-accent";
  if (level >= 2) return "bg-muted text-foreground";
  return "bg-destructive/10 text-destructive";
}

export function AdminSummaryStats({ data }: { data: AdminDashboardData }) {
  const largestGap = data.overall_skill_gaps.reduce(
    (max, item) => Math.max(max, item.avg_gap),
    0,
  );

  const priorityGaps = data.overall_skill_gaps.filter(
    (item) => item.avg_gap >= 1.5,
  ).length;

  const stats = [
    {
      label: "Total Employees",
      value: data.total_employees,
      icon: Users,
    },
    {
      label: "Priority Skill Gaps",
      value: priorityGaps,
      icon: AlertTriangle,
    },
    {
      label: "Largest Avg Gap",
      value: largestGap.toFixed(1),
      icon: TrendingUp,
    },
    {
      label: "Training Progress",
      value: `${data.training_progress_percent}%`,
      icon: GraduationCap,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground">
                {stat.label}
              </p>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>

            <p className="mt-3 text-2xl font-extrabold tracking-tight text-foreground">
              {stat.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export function OverallSkillGaps({ data }: { data: AdminDashboardData }) {
  const maxGap = Math.max(
    ...data.overall_skill_gaps.map((item) => item.avg_gap),
    1,
  );

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-foreground">
            Overall Skill Gaps
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Average gap across the workforce.
          </p>
        </div>

        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="mt-5 space-y-4">
        {data.overall_skill_gaps.map((item) => (
          <div key={item.skill}>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">
                {item.skill}
              </span>

              <span className={`font-bold ${gapTone(item.avg_gap)}`}>
                {item.avg_gap.toFixed(1)}
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-accent"
                style={{
                  width: `${(item.avg_gap / maxGap) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function TrainingProgress({ data }: { data: AdminDashboardData }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-foreground">
            Training Progress
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Organization-wide learning completion.
          </p>
        </div>

        <GraduationCap className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="mt-7 flex items-end gap-4">
        <p className="text-4xl font-extrabold tracking-tight text-foreground">
          {data.training_progress_percent}%
        </p>

        <p className="pb-1 text-xs font-medium text-muted-foreground">
          completed learning progress
        </p>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-success"
          style={{
            width: `${Math.max(
              0,
              Math.min(100, data.training_progress_percent),
            )}%`,
          }}
        />
      </div>

      <Link
        to="/admin-training-progress"
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
      >
        View full training progress
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </section>
  );
}

export function CompetencyHeatmap({
  data,
}: {
  data: AdminDashboardData;
}) {
  const departments = [
    ...new Set(
      data.competency_heatmap.map((item) => item.department),
    ),
  ];

  const skills = [
    ...new Set(data.competency_heatmap.map((item) => item.skill)),
  ];

  const levelFor = (department: string, skill: string) =>
    data.competency_heatmap.find(
      (item) =>
        item.department === department && item.skill === skill,
    )?.avg_level ?? null;

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div>
        <h2 className="text-base font-bold text-foreground">
          Competency Heatmap
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          Average competency level by department and skill.
        </p>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[680px] border-separate border-spacing-1 text-left">
          <thead>
            <tr>
              <th className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                Department
              </th>

              {skills.map((skill) => (
                <th
                  key={skill}
                  className="px-3 py-2 text-xs font-semibold text-muted-foreground"
                >
                  {skill}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {departments.map((department) => (
              <tr key={department}>
                <td className="px-3 py-2 text-xs font-semibold text-foreground">
                  {department}
                </td>

                {skills.map((skill) => {
                  const level = levelFor(department, skill);

                  return (
                    <td key={skill} className="px-1 py-1">
                      <div
                        className={`rounded-lg px-3 py-2.5 text-center text-xs font-bold ${
                          level === null
                            ? "bg-muted text-muted-foreground"
                            : heatTone(level)
                        }`}
                      >
                        {level === null ? "—" : level.toFixed(1)}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Link
        to="/admin-workforce-competencies"
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
      >
        View full competency data
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </section>
  );
}

export function SkillDemandPredictions({
  data,
}: {
  data: AdminDashboardData;
}) {
  const predictions = data.skill_demand_predictions ?? [];

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div>
        <h2 className="text-base font-bold text-foreground">
          Skill Demand Predictions
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          Skills likely to need greater workforce capacity.
        </p>
      </div>

      <div className="mt-5 divide-y divide-border">
        {predictions.length === 0 ? (
          <p className="py-5 text-sm text-muted-foreground">
            No skill demand predictions available yet.
          </p>
        ) : (
          predictions.map((item) => (
            <div
              key={item.skill}
              className="flex items-center justify-between gap-4 py-3.5"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {item.skill}
                </p>

                {item.reason ? (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {item.reason}
                  </p>
                ) : null}
              </div>

              <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-foreground">
                {item.demand}
              </span>
            </div>
          ))
        )}
      </div>

      <Link
        to="/admin-skill-demand"
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
      >
        View workforce forecast
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </section>
  );
}