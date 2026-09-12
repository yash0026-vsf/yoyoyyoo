import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Award,
  CheckCircle2,
  Clock3,
  Filter,
  GraduationCap,
  TrendingUp,
  X,
} from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import {
  getAdminDashboardData,
  getAdminTrainingRows,
} from "@/lib/admin-data";

export const Route = createFileRoute("/admin-training-progress")({
  head: () => ({
    meta: [
      { title: "Training Progress — StatSkill AI" },
      {
        name: "description",
        content:
          "Track workforce learning completion, participation and training outcomes.",
      },
    ],
  }),
  component: TrainingProgressPage,
});

function completionTone(value: number) {
  if (value >= 70) return "text-success";
  if (value >= 50) return "text-accent";
  return "text-destructive";
}

function TrainingProgressPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [department, setDepartment] = useState("All Departments");

  const trainingRows = getAdminTrainingRows();
  const overallCompletion =
    getAdminDashboardData().training_progress_percent;

  const departments = useMemo(
    () => [
      "All Departments",
      ...trainingRows.map((row) => row.department),
    ],
    [],
  );

  const visibleRows = useMemo(
    () =>
      department === "All Departments"
        ? trainingRows
        : trainingRows.filter((row) => row.department === department),
    [department],
  );

  const totalEnrolled = visibleRows.reduce(
    (sum, row) => sum + row.enrolled,
    0,
  );

  const totalCompleted = visibleRows.reduce(
    (sum, row) => sum + row.completed,
    0,
  );

  const totalHours = visibleRows.reduce(
    (sum, row) => sum + row.hours,
    0,
  );

  const completion =
    totalEnrolled > 0
      ? Math.round((totalCompleted / totalEnrolled) * 100)
      : 0;

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
                    Training Progress
                  </h1>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Workforce learning participation and completion.
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
                    Overall Completion
                  </p>

                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </div>

                <p className="mt-3 text-2xl font-extrabold text-foreground">
                  {overallCompletion}%
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Enrolled Learners
                  </p>

                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </div>

                <p className="mt-3 text-2xl font-extrabold text-foreground">
                  {totalEnrolled}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Completed
                  </p>

                  <Award className="h-4 w-4 text-muted-foreground" />
                </div>

                <p className="mt-3 text-2xl font-extrabold text-foreground">
                  {totalCompleted}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Learning Hours
                  </p>

                  <Clock3 className="h-4 w-4 text-muted-foreground" />
                </div>

                <p className="mt-3 text-2xl font-extrabold text-foreground">
                  {totalHours}
                </p>
              </div>
            </div>

            <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    Department Progress
                  </h2>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Completion and learning activity by department.
                  </p>
                </div>

                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[720px] text-left">
                  <thead>
                    <tr className="border-b border-border">
                      {[
                        "Department",
                        "Enrolled",
                        "Completed",
                        "Learning Hours",
                        "Completion",
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

                        <td className="px-3 py-4 text-sm text-muted-foreground">
                          {row.enrolled}
                        </td>

                        <td className="px-3 py-4 text-sm text-muted-foreground">
                          {row.completed}
                        </td>

                        <td className="px-3 py-4 text-sm text-muted-foreground">
                          {row.hours}
                        </td>

                        <td className="px-3 py-4 pr-0">
                          <div className="min-w-[190px]">
                            <div className="flex items-center justify-between gap-3">
                              <span
                                className={`text-sm font-bold ${completionTone(row.completion)}`}
                              >
                                {row.completion}%
                              </span>

                              <span className="text-xs text-muted-foreground">
                                {row.completed}/{row.enrolled}
                              </span>
                            </div>

                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-success"
                                style={{
                                  width: `${row.completion}%`,
                                }}
                              />
                            </div>
                          </div>
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
                      Workforce Completion
                    </h2>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Current organization-wide progress.
                    </p>
                  </div>

                  <span className="text-2xl font-extrabold text-foreground">
                    {overallCompletion}%
                  </span>
                </div>

                <div className="mt-6 h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-success"
                    style={{
                      width: `${overallCompletion}%`,
                    }}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-foreground">
                      {department}
                    </h2>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Completion for the current filter.
                    </p>
                  </div>

                  <span className="text-2xl font-extrabold text-foreground">
                    {completion}%
                  </span>
                </div>

                <div className="mt-6 h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{
                      width: `${completion}%`,
                    }}
                  />
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}