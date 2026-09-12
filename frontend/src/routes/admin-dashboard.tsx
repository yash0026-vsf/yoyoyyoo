import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { X } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import {
  AdminSummaryStats,
  CompetencyHeatmap,
  OverallSkillGaps,
  SkillDemandPredictions,
  TrainingProgress,
} from "@/components/admin/AdminDashboardSections";
import { getAdminDashboardData } from "@/lib/admin-data";

export const Route = createFileRoute("/admin-dashboard")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — StatSkill AI" },
      {
        name: "description",
        content:
          "Organization-level competency intelligence, skill gaps, training progress and skill demand predictions.",
      },
    ],
  }),
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const data = getAdminDashboardData();

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
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl">
                Admin Dashboard
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Organization-level workforce competency intelligence.
              </p>
            </section>

            <AdminSummaryStats data={data} />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <OverallSkillGaps data={data} />
              <TrainingProgress data={data} />
            </div>

            <CompetencyHeatmap data={data} />
            <SkillDemandPredictions data={data} />
          </div>
        </main>
      </div>
    </div>
  );
}
