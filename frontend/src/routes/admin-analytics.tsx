import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  Filter,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import {
  getAdminAnalyticsRows,
  getAdminDashboardData,
  type AnalyticsRow,
} from "@/lib/admin-data";

export const Route = createFileRoute("/admin-analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — StatSkill AI" },
      {
        name: "description",
        content:
          "View predictive workforce analytics, competency trends and training impact.",
      },
    ],
  }),
  component: AdminAnalyticsPage,
});

function outlookTone(outlook: AnalyticsRow["outlook"]) {
  if (outlook === "Improving") return "bg-success/10 text-success";
  if (outlook === "Stable") return "bg-muted text-foreground";
  return "bg-destructive/10 text-destructive";
}

function AdminAnalyticsPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [department, setDepartment] = useState("All Departments");

  const analyticsRows = getAdminAnalyticsRows();
  const adminDashboardData = getAdminDashboardData();

  const departments = useMemo(
    () => [
      "All Departments",
      ...analyticsRows.map((row) => row.department),
    ],
    [],
  );

  const visibleRows = useMemo(
    () =>
      department === "All Departments"
        ? analyticsRows
        : analyticsRows.filter((row) => row.department === department),
    [department],
  );

  const avgCompetency =
    visibleRows.length > 0
      ? (
          visibleRows.reduce((sum, row) => sum + row.competency, 0) /
          visibleRows.length
        ).toFixed(1)
      : "—";

  const avgTraining =
    visibleRows.length > 0
      ? Math.round(
          visibleRows.reduce((sum, row) => sum + row.training, 0) /
            visibleRows.length,
        )
      : 0;

  const avgGap =
    visibleRows.length > 0
      ? (
          visibleRows.reduce((sum, row) => sum + row.gap, 0) /
          visibleRows.length
        ).toFixed(1)
      : "—";

  const improvingCount = analyticsRows.filter(
    (row) => row.outlook === "Improving",
  ).length;

  const overallProgress =
    adminDashboardData.training_progress_percent;

  return (
    <div className="flex min-h-screen bg-muted/40">
      <AdminSidebar className="sticky top-0 hidden h-screen lg:flex" />

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="relative h-full w-72">
            <AdminSidebar />
            <button
              type="button"
              aria-label="Close admin navigation"
              onClick={() => setMobileNavOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-2 text-muted-foreground hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopBar onMenuClick={() => setMobileNavOpen(true)} />

        <main className="flex-1 px-4 py-7 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <section>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl">
                    Analytics
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Workforce trends, training impact and capability outlook.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={department}
                    onChange={(event) => setDepartment(event.target.value)}
                    className="h-10 rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground outline-none focus:border-accent"
                  >
                    {departments.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Average Competency
                  </p>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="mt-3 text-2xl font-extrabold text-foreground">
                  {avgCompetency}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  out of 5.0
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Training Completion
                  </p>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="mt-3 text-2xl font-extrabold text-foreground">
                  {avgTraining}%
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Average Skill Gap
                  </p>
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="mt-3 text-2xl font-extrabold text-destructive">
                  {avgGap}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Improving Departments
                  </p>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="mt-3 text-2xl font-extrabold text-success">
                  {improvingCount}
                </p>
              </div>
            </div>

            <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    Workforce Outlook
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Capability and training indicators by department.
                  </p>
                </div>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                  <thead>
                    <tr className="border-b border-border">
                      {[
                        "Department",
                        "Competency",
                        "Training",
                        "Skill Gap",
                        "Outlook",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground first:pl-0"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">
                    {visibleRows.map((row) => (
                      <tr key={row.department}>
                        <td className="px-3 py-4 pl-0 text-sm font-semibold text-foreground">
                          {row.department}
                        </td>

                        <td className="px-3 py-4 text-sm font-semibold text-foreground">
                          {row.competency.toFixed(1)}
                        </td>

                        <td className="px-3 py-4 text-sm text-muted-foreground">
                          {row.training}%
                        </td>

                        <td className="px-3 py-4 text-sm font-semibold text-destructive">
                          {row.gap.toFixed(1)}
                        </td>

                        <td className="px-3 py-4 pr-0">
                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-bold ${outlookTone(row.outlook)}`}
                          >
                            {row.outlook}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-foreground">
                      Capability Trend
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Current workforce training progress.
                    </p>
                  </div>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </div>

                <div className="mt-6 flex items-end gap-3">
                  {[42, 49, 55, overallProgress].map((value, index) => (
                    <div
                      key={`${value}-${index}`}
                      className="flex flex-1 flex-col items-center gap-2"
                    >
                      <span className="text-xs font-bold text-foreground">
                        {value}%
                      </span>

                      <div className="flex h-32 w-full items-end rounded-lg bg-muted/70 p-1">
                        <div
                          className="w-full rounded-md bg-accent"
                          style={{ height: `${value}%` }}
                        />
                      </div>

                      <span className="text-[10px] text-muted-foreground">
                        {["Q1", "Q2", "Q3", "Now"][index]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-foreground">
                      Priority Signals
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Areas that need administrative attention.
                    </p>
                  </div>

                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </div>

                <div className="mt-5 space-y-3">
                  <div className="rounded-lg border border-border bg-background p-4">
                    <p className="text-sm font-semibold text-foreground">
                      Training completion below target
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Current workforce completion is {overallProgress}%.
                    </p>
                  </div>

                  <div className="rounded-lg border border-border bg-background p-4">
                    <p className="text-sm font-semibold text-foreground">
                      State Statistics needs attention
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Highest average skill gap in the current view.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}