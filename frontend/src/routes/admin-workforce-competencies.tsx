import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Filter, Users, X } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { getAdminDashboardData } from "@/lib/admin-data";

export const Route = createFileRoute("/admin-workforce-competencies")({
  head: () => ({
    meta: [
      { title: "Workforce Competencies — StatSkill AI" },
      {
        name: "description",
        content:
          "View workforce competency levels across departments and skills.",
      },
    ],
  }),
  component: WorkforceCompetenciesPage,
});

type LevelLabel =
  | "Advanced"
  | "Proficient"
  | "Developing"
  | "Needs Focus";

function levelLabel(level: number): LevelLabel {
  if (level >= 3.5) return "Advanced";
  if (level >= 2.5) return "Proficient";
  if (level >= 2) return "Developing";
  return "Needs Focus";
}

function csvCell(value: string | number) {
  const text = String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function exportCompetencies(
  rows: Array<{
    department: string;
    skill: string;
    avg_level: number;
  }>,
) {
  const header = ["Department", "Skill", "Average Level"];

  const lines = [
    header.map(csvCell).join(","),
    ...rows.map((row) =>
      [row.department, row.skill, row.avg_level.toFixed(1)]
        .map(csvCell)
        .join(","),
    ),
  ];

  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = "statskill-workforce-competencies.csv";

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

function levelTone(level: number) {
  if (level >= 3.5) return "bg-success/15 text-success";
  if (level >= 2.5) return "bg-accent-soft text-accent";
  if (level >= 2) return "bg-muted text-foreground";
  return "bg-destructive/10 text-destructive";
}

function WorkforceCompetenciesPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [department, setDepartment] = useState("All Departments");
  const [search, setSearch] = useState("");

  const data = getAdminDashboardData();

  const departments = useMemo(
    () => [
      "All Departments",
      ...new Set(
        data.competency_heatmap.map((item) => item.department),
      ),
    ],
    [],
  );

  const filteredRows = useMemo(() => {
    const rows = data.competency_heatmap.filter((item) =>
      department === "All Departments"
        ? true
        : item.department === department,
    );

    if (!search.trim()) return rows;

    const query = search.trim().toLowerCase();

    return rows.filter(
      (item) =>
        item.department.toLowerCase().includes(query) ||
        item.skill.toLowerCase().includes(query),
    );
  }, [department, search]);

  const grouped = useMemo(() => {
    const map = new Map<
      string,
      {
        department: string;
        items: typeof filteredRows;
      }
    >();

    for (const item of filteredRows) {
      const existing = map.get(item.department);

      if (existing) {
        existing.items.push(item);
      } else {
        map.set(item.department, {
          department: item.department,
          items: [item],
        });
      }
    }

    return [...map.values()];
  }, [filteredRows]);

  const workforceAverage =
    data.competency_heatmap.length > 0
      ? (
          data.competency_heatmap.reduce(
            (sum, item) => sum + item.avg_level,
            0,
          ) / data.competency_heatmap.length
        ).toFixed(1)
      : "—";

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
                    Workforce Competencies
                  </h1>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Competency levels across the workforce.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    exportCompetencies(data.competency_heatmap)
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
              </div>
            </section>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Total Employees
                  </p>

                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>

                <p className="mt-3 text-2xl font-extrabold text-foreground">
                  {data.total_employees}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <p className="text-xs font-semibold text-muted-foreground">
                  Average Competency
                </p>

                <p className="mt-3 text-2xl font-extrabold text-foreground">
                  {workforceAverage}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  out of 5.0
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <p className="text-xs font-semibold text-muted-foreground">
                  Priority Gaps
                </p>

                <p className="mt-3 text-2xl font-extrabold text-destructive">
                  {
                    data.overall_skill_gaps.filter(
                      (item) => item.avg_gap >= 1.5,
                    ).length
                  }
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  skills needing focus
                </p>
              </div>
            </div>

            <section className="rounded-xl border border-border bg-card shadow-sm">
              <div className="flex flex-col gap-4 border-b border-border p-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    Competency Heatmap
                  </h2>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Average competency level by department and skill.
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative">
                    <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <select
                      value={department}
                      onChange={(event) =>
                        setDepartment(event.target.value)
                      }
                      className="h-10 rounded-lg border border-border bg-background pl-9 pr-8 text-sm text-foreground outline-none focus:border-accent"
                    >
                      {departments.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </div>

                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search department or skill"
                    className="h-10 min-w-[220px] rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-accent"
                  />
                </div>
              </div>

              <div className="divide-y divide-border">
                {grouped.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No competency data matches the current filters.
                  </div>
                ) : (
                  grouped.map((group) => (
                    <div
                      key={group.department}
                      className="p-5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-bold text-foreground">
                          {group.department}
                        </h3>

                        <span className="text-xs text-muted-foreground">
                          {group.items.length} competencies
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {group.items.map((item) => (
                          <div
                            key={`${item.department}-${item.skill}`}
                            className="rounded-lg border border-border bg-background p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm font-semibold text-foreground">
                                {item.skill}
                              </p>

                              <span
                                className={`rounded-full px-2 py-1 text-[10px] font-bold ${levelTone(item.avg_level)}`}
                              >
                                {levelLabel(item.avg_level)}
                              </span>
                            </div>

                            <p className="mt-4 text-2xl font-extrabold tracking-tight text-foreground">
                              {item.avg_level.toFixed(1)}
                            </p>

                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-accent"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.max(
                                      0,
                                      item.avg_level * 20,
                                    ),
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}