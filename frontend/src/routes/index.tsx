import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Landmark,
  LogIn,
  Mail,
  ShieldCheck,
  TrendingUp,
  User,
  UserPlus,
  X,
} from "lucide-react";
import { StatSkillWordmark } from "@/components/StatSkillLogo";
import { cn } from "@/lib/utils";
import { loginWithGooglePayload, parseGoogleJwt } from "@/lib/auth-service";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title:
          "StatSkill AI — Competency Intelligence for India's Statistical Workforce",
      },
      {
        name: "description",
        content:
          "AI-powered competency intelligence and personalized learning for India's statistical workforce. Build skills, close gaps, strengthen the workforce.",
      },
      {
        property: "og:title",
        content: "StatSkill AI — Competency Intelligence Platform",
      },
      {
        property: "og:description",
        content:
          "AI-powered competency intelligence and personalized learning for India's statistical workforce.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const valueProps = [
  {
    icon: ClipboardList,
    title: "Assess",
    text: "Understand current competencies and identify skill gaps.",
  },
  {
    icon: BookOpen,
    title: "Learn",
    text: "Get personalized learning recommendations based on your role.",
  },
  {
    icon: TrendingUp,
    title: "Improve",
    text: "Track progress and continuously strengthen workforce capability.",
  },
];

const roles = [
  {
    id: "learner" as const,
    icon: User,
    title: "Learner",
    text: "Build your competency profile, identify skill gaps and follow your personalized learning path.",
  },
  {
    id: "admin" as const,
    icon: ShieldCheck,
    title: "Admin",
    text: "Understand workforce capability, identify organizational gaps and plan training interventions.",
  },
];

type Role = (typeof roles)[number]["id"];

function Index() {
  const [role, setRole] = useState<Role>("learner");
  const [status, setStatus] = useState<string | null>(null);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState("");
  const [googleNameInput, setGoogleNameInput] = useState("");

  const rawClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
  const hasValidGoogleClientId = Boolean(
    rawClientId &&
    !rawClientId.includes("demo-client-id") &&
    rawClientId.trim().length > 10
  );

  useEffect(() => {
    if (
      hasValidGoogleClientId &&
      typeof window !== "undefined" &&
      (window as any).google?.accounts?.id
    ) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: rawClientId,
          callback: (response: any) => {
            if (response?.credential) {
              const decoded = parseGoogleJwt(response.credential);
              if (decoded?.email) {
                handleGoogleSuccess(decoded.email, decoded.name, decoded.picture);
              }
            }
          },
        });
      } catch (e) {
        console.warn("Google gsi init notice:", e);
      }
    }
  }, [role, hasValidGoogleClientId, rawClientId]);

  const handleGoogleSuccess = (
    googleEmail: string,
    googleName?: string,
    picture?: string
  ) => {
    const user = loginWithGooglePayload({
      email: googleEmail,
      name: googleName || googleEmail.split("@")[0],
      picture: picture,
    });

    if (role === "admin") {
      window.location.href = "/admin-dashboard";
      return;
    }

    const userProfileKey = "statskill_profile_" + user.email.toLowerCase();
    const saved = localStorage.getItem(userProfileKey);
    let hasSkills = false;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.existingSkills?.length > 0) hasSkills = true;
      } catch {}
    }

    window.location.href = hasSkills ? "/ai-assessment-quiz" : "/build-profile";
  };

  const mockAuth = (label: string) => {
    setStatus(null);
    setTimeout(
      () =>
        setStatus(
          `${label} is a prototype demo — no real authentication happens yet.`,
        ),
      600,
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col lg:flex-row">
        {/* Left: brand + value proposition */}
        <section className="flex flex-1 flex-col justify-start px-6 pt-12 pb-16 lg:px-16 lg:pt-16 lg:pb-20">
          <StatSkillWordmark />

          <h1 className="mt-20 text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:mt-24">
            Build Skills.
            <br />
            Close Gaps.
            <br />
            <span className="text-accent">
              Strengthen the Workforce.
            </span>
          </h1>

          <p className="mt-8 max-w-md text-base leading-relaxed text-muted-foreground">
            AI-powered competency intelligence and personalized learning for
            India's statistical workforce.
          </p>

          <div className="mt-14 grid max-w-lg gap-4 sm:grid-cols-3">
            {valueProps.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground">
                  <item.icon className="h-4 w-4" />
                </div>

                <h2 className="mt-3 text-sm font-semibold text-foreground">
                  {item.title}
                </h2>

                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Right: sign in */}
        <section className="flex flex-1 flex-col justify-start border-t border-border bg-card px-6 pt-12 pb-16 lg:border-l lg:border-t-0 lg:px-16 lg:pt-16 lg:pb-20">
          <div className="mx-auto mt-12 w-full max-w-md lg:mt-32">
            <h2 className="text-center text-2xl font-bold tracking-tight text-foreground">
              Sign in as{" "}
              {role === "learner" ? "Learner" : "Admin"}
            </h2>

            <p className="mt-2 text-center text-sm text-muted-foreground">
              You'll be taken to your personalized competency and learning
              dashboard.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-4">
              {roles.map((r) => {
                const selected = role === r.id;

                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    aria-pressed={selected}
                    className={cn(
                      "relative rounded-xl border-2 p-4 text-left transition-colors",
                      selected
                        ? "border-accent bg-accent-soft"
                        : "border-border bg-card hover:border-muted-foreground/30",
                    )}
                  >
                    {selected && (
                      <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </span>
                    )}

                    <r.icon
                      className={cn(
                        "h-5 w-5",
                        selected
                          ? "text-accent"
                          : "text-muted-foreground",
                      )}
                    />

                    <div className="mt-3 text-sm font-semibold text-foreground">
                      {r.title}
                    </div>

                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {r.text}
                    </p>
                  </button>
                );
              })}
            </div>

            {role === "learner" ? (
              <button
                type="button"
                onClick={() => mockAuth("Government SSO")}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Landmark className="h-4 w-4" />
                Sign in with Government SSO / Parichay
              </button>
            ) : (
              <button
                type="button"
                onClick={() => mockAuth("Government SSO")}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Landmark className="h-4 w-4" />
                Sign in with Government SSO / Parichay
              </button>
            )}

            {/* Single Clean Google Sign In Button */}
            <button
              type="button"
              onClick={() => {
                if (
                  hasValidGoogleClientId &&
                  typeof window !== "undefined" &&
                  (window as any).google?.accounts?.id
                ) {
                  try {
                    (window as any).google.accounts.id.prompt();
                    return;
                  } catch {}
                }
                setShowGoogleModal(true);
              }}
              className="mt-3 flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted shadow-sm"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </button>

            <div className="my-6 flex items-center gap-4">
              <span className="h-px flex-1 bg-border" />

              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                or with official account
              </span>

              <span className="h-px flex-1 bg-border" />
            </div>

            {/* Clear Sign In & Sign Up Options */}
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/login"
                search={{ mode: "signin", role }}
                className="flex items-center justify-center gap-2 rounded-lg border border-input bg-card px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted shadow-sm text-center"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
              <Link
                to="/login"
                search={{ mode: "signup", role }}
                className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 shadow-sm text-center"
              >
                <UserPlus className="h-4 w-4" />
                Sign Up
              </Link>
            </div>

            {status && (
              <p
                role="status"
                className="mt-6 rounded-lg bg-muted px-4 py-3 text-center text-xs font-medium text-foreground"
              >
                {status}
              </p>
            )}

            <p className="mt-8 text-center text-xs text-muted-foreground">
              By continuing, you agree to our{" "}
              <span className="underline underline-offset-2">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="underline underline-offset-2">
                Privacy Policy
              </span>
              .
            </p>
          </div>
        </section>
      </div>

      {/* Google Account Authentication Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <h3 className="text-sm font-bold text-foreground">Sign In with Google</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!googleEmailInput.trim() || !googleEmailInput.includes("@")) {
                  alert("Please enter a valid Google Account email.");
                  return;
                }
                setShowGoogleModal(false);
                handleGoogleSuccess(googleEmailInput.trim(), googleNameInput.trim());
              }}
              className="mt-4 space-y-3"
            >
              <p className="text-xs text-muted-foreground">
                Enter your Google Account email. Your assessment history, competency gaps, and recommended courses will remain permanently saved to this account.
              </p>

              <div>
                <label className="text-xs font-semibold text-foreground">Google Account Email</label>
                <input
                  type="email"
                  required
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  placeholder="your.name@gmail.com"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Account Name (Optional)</label>
                <input
                  type="text"
                  value={googleNameInput}
                  onChange={(e) => setGoogleNameInput(e.target.value)}
                  placeholder="e.g. Yash"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Continue with Google
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}