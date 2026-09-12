import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  BrainCircuit,
  Filter,
  Search,
  TrendingUp,
  X,
} from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import {
  getAdminSkillDemandData,
  type DemandLevel,
} from "@/lib/admin-data";

export const Route = createFileRoute("/admin-skill-demand")({
  head: () => ({
    meta: [
      { title: "Skill Demand — StatSkill AI" },
      {
        name: "description",
        content:
          "View current and predicted workforce skill demand across priority competencies.",
      },
    ],
  }),
  component: SkillDemandPage,
});

function priorityTone(priority: DemandLevel) {
  if (priority === "High") {
    return "bg-destructive/10 text-destructive";
  }

  if (priority === "Emerging") {
    return "bg-accent-soft text-accent";
  }

  return "bg-muted text-foreground";
}

function barTone(priority: DemandLevel) {
  if (priority === "High") return "bg-destructive";
  if (priority === "Emerging") return "bg-accent";
  return "bg-foreground/50";
}

function SkillDemandPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [priority, setPriority] = useState("All Priorities");
  const [search, setSearch] = useState("");

  const skillDemandData = getAdminSkillDemandData();

  const priorities = [
    "All Priorities",
    "High",
    "Medium",
    "Emerging",
  ];

  const filteredSkills = useMemo(() => {
    const query = search.trim().toLowerCase();

    return skillDemandData.filter((item) => {
      const matchesPriority =
        priority === "All Priorities" || item.priority === priority;

      const matchesSearch =
        !query || item.skill.toLowerCase().includes(query);

      return matchesPriority && matchesSearch;
    });
  }, [priority, search]);

  const topEmergingSkills = useMemo(
    () =>
      [...skillDemandData]
        .filter((item) => item.priority === "Emerging")
        .sort((a, b) => b.growth - a.growth),
    [],
  );

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
                    Skill Demand
                  </h1>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Current and predicted demand across priority skills.
                  </p>
                </div>

                <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2.5 text-xs font-semibold text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  Forecast view
                </span>
              </div>
            </section>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <p className="text-xs font-semibold text-muted-foreground">
                  High Priority
                </p>

                <p className="mt-3 text-2xl font-extrabold text-destructive">
                  {
                    skillDemandData.filter(
                      (item) => item.priority === "High",
                    ).length
                  }
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  skills requiring attention
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <p className="text-xs font-semibold text-muted-foreground">
                  Emerging Skills
                </p>

                <p className="mt-3 text-2xl font-extrabold text-accent">
                  {
                    skillDemandData.filter(
                      (item) => item.priority === "Emerging",
                    ).length
                  }
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  future-facing capability areas
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <p className="text-xs font-semibold text-muted-foreground">
                  Fastest Growth
                </p>

                <p className="mt-3 text-2xl font-extrabold text-foreground">
                  {Math.max(
                    ...skillDemandData.map((item) => item.growth),
                  )}
                  %
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  predicted demand increase
                </p>
              </div>
            </div>

            <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    Demand Forecast
                  </h2>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Compare current demand with predicted workforce need.
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative">
                    <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <select
                      value={priority}
                      onChange={(event) =>
                        setPriority(event.target.value)
                      }
                      className="h-10 rounded-lg border border-border bg-background pl-9 pr-8 text-sm text-foreground outline-none focus:border-accent"
                    >
                      {priorities.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search skills"
                      className="h-10 min-w-[210px] rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-accent"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                {filteredSkills.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                    No skills match the current filters.
                  </div>
                ) : (
                  filteredSkills.map((item) => (
                    <div
                      key={item.skill}
                      className="rounded-lg border border-border bg-background p-4"
                    >
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                        <div className="min-w-0 xl:w-56">
                          <div className="flex items-center gap-2">
                            <BrainCircuit className="h-4 w-4 shrink-0 text-muted-foreground" />

                            <p className="truncate text-sm font-bold text-foreground">
                              {item.skill}
                            </p>
                          </div>

                          <div className="mt-2 flex items-center gap-2">
                            <span
                              className={`rounded-full px-2 py-1 text-[10px] font-bold ${priorityTone(item.priority)}`}
                            >
                              {item.priority}
                            </span>

                            <span className="text-[11px] text-muted-foreground">
                              {item.horizon}
                            </span>
                          </div>
                        </div>

                        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-xs font-semibold text-muted-foreground">
                                Current demand
                              </span>

                              <span className="text-sm font-bold text-foreground">
                                {item.currentDemand}%
                              </span>
                            </div>

                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-foreground/40"
                                style={{
                                  width: `${item.currentDemand}%`,
                                }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-xs font-semibold text-muted-foreground">
                                Predicted demand
                              </span>

                              <span className="text-sm font-bold text-foreground">
                                {item.predictedDemand}%
                              </span>
                            </div>

                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                              <div
                                className={`h-full rounded-full ${barTone(item.priority)}`}
                                style={{
                                  width: `${item.predictedDemand}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 border-t border-border pt-3 xl:w-32 xl:flex-col xl:items-end xl:border-t-0 xl:pt-0">
                          <span className="text-xs text-muted-foreground">
                            Growth
                          </span>

                          <span className="inline-flex items-center gap-1 text-sm font-extrabold text-success">
                            <ArrowUpRight className="h-4 w-4" />
                            {item.growth}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    Emerging Skills
                  </h2>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Skills with the strongest projected growth.
                  </p>
                </div>

                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                {topEmergingSkills.map((item) => (
                  <div
                    key={item.skill}
                    className="rounded-lg border border-border bg-background p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-foreground">
                        {item.skill}
                      </p>

                      <span className="text-sm font-extrabold text-success">
                        +{item.growth}%
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Predicted demand: {item.predictedDemand}%
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}