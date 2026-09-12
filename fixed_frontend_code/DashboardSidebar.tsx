import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  BadgeCheck,
  Compass,
  LayoutDashboard,
  Medal,
  Settings,
  Sparkles,
  TrendingDown,
  X,
  Award,
  Clock,
  ShieldCheck,
} from "lucide-react";

import { StatSkillWordmark } from "@/components/StatSkillLogo";
import { getPriorityGapCount } from "@/lib/learner-data";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  icon: typeof LayoutDashboard;
  to?: string;
  badge?: string;
  action?: "badges" | "certificates" | "settings";
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const groups: NavGroup[] = [
  {
    title: "Competency Management",
    items: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        to: "/",
      },
      {
        label: "Competency Assessment",
        icon: Award,
        to: "/competency-assessment",
      },
      {
        label: "Skill Gap Analysis",
        icon: TrendingDown,
        to: "/skill-gap-analysis",
        get badge() {
          return String(getPriorityGapCount());
        },
      },
      {
        label: "Learning Paths",
        icon: Compass,
        to: "/learning-paths",
      },
      {
        label: "AI Assessment Quiz",
        icon: Sparkles,
        to: "/ai-assessment-quiz",
      },
    ],
  },
  {
    title: "Cadre & Governance",
    items: [
      // [FIXED]: Added functional actions for previously broken buttons
      { label: "Cadre Badges", icon: Medal, action: "badges" },
      { label: "Certificates & CPE", icon: BadgeCheck, action: "certificates" },
      { label: "Settings", icon: Settings, action: "settings" },
    ],
  },
];

const itemClass =
  "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground text-left cursor-pointer";

export function DashboardSidebar({ className }: { className?: string }) {
  const [activeModal, setActiveModal] = useState<"badges" | "certificates" | "settings" | null>(null);

  return (
    <>
      <aside
        className={cn(
          "flex h-full w-72 shrink-0 flex-col border-r border-border bg-card",
          className,
        )}
      >
        <div className="border-b border-border px-6 py-5">
          <StatSkillWordmark />
        </div>

        <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-6">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                {group.title}
              </p>

              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  const content = (
                    <>
                      <Icon className="h-[18px] w-[18px]" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge ? (
                        <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-bold text-destructive">
                          {item.badge}
                        </span>
                      ) : null}
                    </>
                  );

                  return (
                    <li key={item.label}>
                      {item.to ? (
                        <Link
                          to={item.to}
                          className={itemClass}
                          activeProps={{
                            className:
                              "bg-accent-soft text-accent hover:bg-accent-soft hover:text-accent",
                          }}
                        >
                          {content}
                        </Link>
                      ) : (
                        /* [FIXED]: Clicking opens the respective governance feature */
                        <button
                          type="button"
                          onClick={() => setActiveModal(item.action || null)}
                          className={itemClass}
                        >
                          {content}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* [FIXED]: Cadre Badges Modal */}
      {activeModal === "badges" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-foreground">
                <Award className="h-5 w-5 text-accent" />
                <h3 className="text-base font-bold">Government Cadre Competency Badges</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent font-bold">L3</span>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Statistical Officer Cadre (Level 3 Verified)</h4>
                  <p className="text-[11px] text-muted-foreground">Certified in Survey Sampling & Tabulation (MoSPI Standards)</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3">
                <ShieldCheck className="h-8 w-8 text-success" />
                <div>
                  <h4 className="text-xs font-bold text-foreground">DPDP Digital Privacy Compliance</h4>
                  <p className="text-[11px] text-muted-foreground">National Informatics Centre (NIC) Security Clearance</p>
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button onClick={() => setActiveModal(null)} className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* [FIXED]: Certificates & CPE Credits Modal */}
      {activeModal === "certificates" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-foreground">
                <Clock className="h-5 w-5 text-accent" />
                <h3 className="text-base font-bold">Certificates & CPE Hours (iGOT Karmayogi)</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-lg bg-accent-soft/40 p-3 border border-accent/20">
                <div className="flex justify-between text-xs font-semibold text-foreground">
                  <span>Annual Capacity Building Target</span>
                  <span>42.5 / 50.0 Hours (85%)</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: "85%" }} />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-foreground">Verified Certificates Issued:</p>
                <div className="rounded-lg border border-border p-2.5 text-xs flex justify-between items-center">
                  <span>Foundational AI for Governance (DoPT)</span>
                  <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded">Verified</span>
                </div>
                <div className="rounded-lg border border-border p-2.5 text-xs flex justify-between items-center">
                  <span>e-Office Systems Workflow (DARPG / NIC)</span>
                  <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded">Verified</span>
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button onClick={() => setActiveModal(null)} className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* [FIXED]: Settings Modal */}
      {activeModal === "settings" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Platform Settings</h3>
              <button onClick={() => setActiveModal(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-4 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground">Ministry Department Sync</span>
                <span className="text-muted-foreground">MeitY (Active)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground">iGOT Karmayogi API Sync</span>
                <span className="text-success font-bold">Connected</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground">Anti-Cheat Fingerprinting</span>
                <span className="text-success font-bold">Enabled (SHA-256)</span>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setActiveModal(null)} className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
