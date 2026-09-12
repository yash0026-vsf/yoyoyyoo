import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { X } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import {
  CompetencyOverview,
  CompetencyRadar,
  DashboardFooter,
  LearningPathSummary,
  SkillGapSummary,
  SummaryStats,
  WelcomeHeader,
} from "@/components/dashboard/DashboardSections";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Learner Dashboard — StatSkill AI Competency Intelligence" },
      {
        name: "description",
        content:
          "Track competency scores, priority skill gaps and AI-recommended learning paths for statistical cadre officers.",
      },
      { property: "og:title", content: "Learner Dashboard — StatSkill AI" },
      {
        property: "og:description",
        content:
          "Competency scores, skill gap analysis and personalized learning paths for statistical cadre officers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-muted/40">
      <DashboardSidebar className="sticky top-0 hidden h-screen lg:flex" />

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setMobileNavOpen(false)}
          />

          <div className="relative h-full w-72">
            <DashboardSidebar />

            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setMobileNavOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-2 text-muted-foreground hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopBar onMenuClick={() => setMobileNavOpen(true)} />

        <main className="flex-1 space-y-8 px-4 py-7 lg:px-8 lg:py-8">
          <WelcomeHeader />

          <SummaryStats />

          <CompetencyOverview />

          <div className="max-w-6xl">
            <CompetencyRadar />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <SkillGapSummary />
            <LearningPathSummary />
          </div>

          <DashboardFooter />
        </main>
      </div>
    </div>
  );
}