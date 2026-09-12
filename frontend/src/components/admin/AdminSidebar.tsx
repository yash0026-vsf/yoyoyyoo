import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  BrainCircuit,
  LayoutDashboard,
  Settings,
  Users,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import { StatSkillWordmark } from "@/components/StatSkillLogo";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  icon: LucideIcon;
  to?: "/admin-dashboard" | "/admin-workforce-competencies" | "/admin-training-progress" | "/admin-skill-demand" | "/admin-analytics";
};

const items: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/admin-dashboard" },
  { label: "Workforce Competencies", icon: Users, to: "/admin-workforce-competencies" },
  { label: "Training Progress", icon: GraduationCap, to: "/admin-training-progress" },
  { label: "Skill Demand", icon: BrainCircuit, to: "/admin-skill-demand" },
  { label: "Analytics", icon: BarChart3, to: "/admin-analytics" },
  { label: "Settings", icon: Settings },
];

const itemClass =
  "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

export function AdminSidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "flex h-full w-72 shrink-0 flex-col border-r border-border bg-card",
        className,
      )}
    >
      <div className="border-b border-border px-6 py-5">
        <Link to="/admin-dashboard" className="block hover:opacity-90">
          <StatSkillWordmark />
        </Link>
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Administration
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
          Workforce Intelligence
        </p>

        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const content = (
              <>
                <Icon className="h-[18px] w-[18px]" />
                <span className="flex-1 text-left">{item.label}</span>
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
                  <button type="button" className={itemClass}>
                    {content}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
