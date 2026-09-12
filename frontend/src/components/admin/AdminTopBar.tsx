import { useEffect, useState, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  Bell,
  BookOpen,
  ChevronDown,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Search,
  TrendingUp,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
} from "lucide-react";
import { getAdminProfile } from "@/lib/admin-data";

/* ─── Admin searchable pages ─── */
const ADMIN_SEARCH_ITEMS = [
  {
    label: "Admin Dashboard",
    description: "Workforce overview, competency summary & key metrics",
    to: "/admin-dashboard",
    icon: LayoutDashboard,
    keywords: ["home", "overview", "dashboard", "summary", "workforce"],
  },
  {
    label: "Workforce Competencies",
    description: "Department-wise competency heatmap & skill analysis",
    to: "/admin-workforce-competencies",
    icon: Users,
    keywords: ["workforce", "competency", "department", "heatmap", "skill"],
  },
  {
    label: "Training Progress",
    description: "Track officer training completion & learning engagement",
    to: "/admin-training-progress",
    icon: GraduationCap,
    keywords: ["training", "progress", "completion", "course", "learning"],
  },
  {
    label: "Skill Demand",
    description: "Priority skill demands across departments",
    to: "/admin-skill-demand",
    icon: TrendingUp,
    keywords: ["skill", "demand", "priority", "gap", "requirement"],
  },
  {
    label: "Analytics",
    description: "Detailed workforce analytics & trend reports",
    to: "/admin-analytics",
    icon: BarChart3,
    keywords: ["analytics", "report", "trend", "data", "chart", "statistics"],
  },
];

/* ─── Admin notification items ─── */
const ADMIN_NOTIFICATIONS = [
  {
    id: 1,
    icon: AlertTriangle,
    iconClass: "text-destructive bg-destructive/10",
    title: "Critical Skill Gap: Python Across DES",
    description:
      "67% of Statistical Officers score below cadre benchmark for Python. Training intervention recommended.",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: 2,
    icon: CheckCircle2,
    iconClass: "text-success bg-success/10",
    title: "Training Milestone: Survey Sampling",
    description:
      '12 officers completed the "Survey Sampling Design" NPTEL course this week.',
    time: "4 hours ago",
    unread: true,
  },
  {
    id: 3,
    icon: Clock,
    iconClass: "text-muted-foreground bg-muted",
    title: "Quarterly Competency Report Due",
    description:
      "The Q3 MoSPI Cadre Competency Evaluation report deadline is approaching (Sept 30).",
    time: "1 day ago",
    unread: false,
  },
];

export function AdminTopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const navigate = useNavigate();
  const admin = getAdminProfile();

  /* ─── Search state ─── */
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredItems = searchQuery.trim()
    ? ADMIN_SEARCH_ITEMS.filter((item) => {
        const q = searchQuery.toLowerCase();
        return (
          item.label.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.keywords.some((kw) => kw.includes(q))
        );
      })
    : ADMIN_SEARCH_ITEMS;

  useEffect(() => setSelectedIdx(0), [searchQuery]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50);
    else setSearchQuery("");
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setSearchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [searchOpen]);

  const handleSearchSelect = (to: string) => {
    setSearchOpen(false);
    setSearchQuery("");
    navigate({ to });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((prev) => Math.min(prev + 1, filteredItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && filteredItems[selectedIdx]) {
      e.preventDefault();
      handleSearchSelect(filteredItems[selectedIdx].to);
    }
  };

  /* ─── Notifications state ─── */
  const [notifOpen, setNotifOpen] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<number[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  const visibleNotifs = ADMIN_NOTIFICATIONS.filter(
    (n) => !dismissedIds.includes(n.id),
  );
  const unreadCount = visibleNotifs.filter((n) => n.unread).length;

  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen]);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-card/95 px-4 backdrop-blur lg:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open admin navigation"
        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* ─── Search ─── */}
      <div className="relative hidden max-w-md flex-1 sm:block" ref={searchRef}>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="search"
          value={searchQuery}
          placeholder="Search workforce data..."
          onFocus={() => setSearchOpen(true)}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (!searchOpen) setSearchOpen(true);
          }}
          onKeyDown={handleSearchKeyDown}
          className="h-10 w-full rounded-lg border border-border bg-muted/60 pl-9 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-accent focus:bg-card"
        />

        {searchOpen && (
          <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-border bg-card shadow-xl">
            {filteredItems.length > 0 ? (
              <ul className="max-h-72 overflow-y-auto p-1">
                {filteredItems.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.to}>
                      <button
                        type="button"
                        onClick={() => handleSearchSelect(item.to)}
                        onMouseEnter={() => setSelectedIdx(idx)}
                        className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition ${
                          idx === selectedIdx
                            ? "bg-accent/10 text-foreground"
                            : "text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground">
                            {item.label}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                No results for &ldquo;{searchQuery}&rdquo;
              </div>
            )}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* ─── Notifications ─── */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => setNotifOpen((prev) => !prev)}
            className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-80 rounded-xl border border-border bg-card shadow-xl sm:w-96">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h3 className="text-sm font-bold text-foreground">
                  Notifications
                </h3>
                {visibleNotifs.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      setDismissedIds(ADMIN_NOTIFICATIONS.map((n) => n.id))
                    }
                    className="text-xs font-semibold text-accent hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {visibleNotifs.length > 0 ? (
                <ul className="max-h-80 overflow-y-auto divide-y divide-border">
                  {visibleNotifs.map((notif) => {
                    const Icon = notif.icon;
                    return (
                      <li
                        key={notif.id}
                        className="flex items-start gap-3 px-4 py-3 transition hover:bg-muted/50"
                      >
                        <span
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${notif.iconClass}`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-xs font-semibold leading-snug ${
                              notif.unread
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {notif.title}
                          </p>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                            {notif.description}
                          </p>
                          <p className="mt-1 text-[10px] font-medium text-muted-foreground/70">
                            {notif.time}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setDismissedIds((prev) => [...prev, notif.id])
                          }
                          className="shrink-0 rounded p-1 text-muted-foreground/50 hover:bg-muted hover:text-foreground"
                          aria-label="Dismiss notification"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm font-semibold text-muted-foreground">
                    All caught up!
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    No new notifications at this time.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-border" />

        <button
          type="button"
          className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent">
            {admin.initials}
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-semibold leading-tight text-foreground">
              {admin.name}
            </span>
            <span className="block text-xs leading-tight text-muted-foreground">
              {admin.subtitle}
            </span>
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
