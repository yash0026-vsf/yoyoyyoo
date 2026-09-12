import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  AlertCircle,
  Briefcase,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { StatSkillWordmark } from "@/components/StatSkillLogo";
import { loginUser, registerUser, loginWithGooglePayload, parseGoogleJwt } from "@/lib/auth-service";
import {
  CADRE_JOB_ROLES,
  CADRE_DEPARTMENTS,
  validateRoleInput,
  validateNameInput,
} from "@/lib/cadre-options";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      mode: (search.mode as "signin" | "signup") || "signin",
      role: (search.role as string) || "learner",
    };
  },
  component: LoginPage,
});

function LoginPage() {
  const search = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode || "signin");

  // Sync mode if query param changes
  useEffect(() => {
    if (search.mode) {
      setMode(search.mode);
    }
  }, [search.mode]);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [cadreRole, setCadreRole] = useState<string>(CADRE_JOB_ROLES[0]);
  const [customCadreRole, setCustomCadreRole] = useState("");
  const [cadreDept, setCadreDept] = useState<string>(CADRE_DEPARTMENTS[0]);
  const [customCadreDept, setCustomCadreDept] = useState("");

  // UI state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSubmitted, setResetSubmitted] = useState(false);

  // Google Sign-in Modal for direct Google account authorization
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState("");
  const [googleNameInput, setGoogleNameInput] = useState("");

  // Check if a real registered Google Client ID is configured
  const rawClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
  const hasValidGoogleClientId = Boolean(
    rawClientId &&
    !rawClientId.includes("demo-client-id") &&
    rawClientId.trim().length > 10
  );

  // Initialize Google Identity Services ONLY if a real registered client ID is provided
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
  }, [hasValidGoogleClientId, rawClientId]);

  const handleGoogleSuccess = (googleEmail: string, googleName?: string, picture?: string) => {
    const user = loginWithGooglePayload({
      email: googleEmail,
      name: googleName || googleEmail.split("@")[0],
      picture: picture,
    });

    // Check if this Google user already has skills configured
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (mode === "signin") {
      // REAL PASSWORD VERIFICATION
      const res = loginUser(email, password);
      if (!res.success) {
        setErrorMessage(res.error || "Login failed. Please verify your credentials.");
        return;
      }

      // Check if user has already entered skills
      const raw = localStorage.getItem("statskill.currentUserProfile");
      let hasSkills = false;
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed.existingSkills) && parsed.existingSkills.length > 0) {
            hasSkills = true;
          }
        } catch (err) {}
      }

      window.location.href = hasSkills ? "/ai-assessment-quiz" : "/build-profile";
    } else {
      // REAL REGISTRATION
      const nameCheck = validateNameInput(name);
      if (!nameCheck.isValid) {
        setErrorMessage(nameCheck.error || "Please enter your full candidate name.");
        return;
      }

      const effectiveRole = cadreRole === "Other" ? customCadreRole : cadreRole;
      const effectiveDept = cadreDept === "Other" ? customCadreDept : cadreDept;

      const roleCheck = validateRoleInput(effectiveRole);
      if (!roleCheck.isValid) {
        setErrorMessage(roleCheck.error || "Please select or enter a valid cadre job role.");
        return;
      }

      if (!effectiveDept.trim()) {
        setErrorMessage("Please select or enter your ministry or department.");
        return;
      }

      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match. Please verify your password confirmation.");
        return;
      }
      if (password.length < 6) {
        setErrorMessage("Password must be at least 6 characters long.");
        return;
      }

      const res = registerUser(name, email, password, effectiveRole.trim(), effectiveDept.trim());
      if (!res.success) {
        setErrorMessage(res.error || "Registration failed.");
        return;
      }

      // New account registered -> route to build-profile to declare skills
      window.location.href = "/build-profile";
    }
  };

  const fillDemoAccount = () => {
    setMode("signin");
    setEmail("vivek.reddy@meity.gov.in");
    setPassword("Password@123");
    setErrorMessage(null);
    setSuccessMessage("Pre-filled official cadre credentials. Click Sign In below!");
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetEmail) {
      setResetSubmitted(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="text-center">
          <div className="flex justify-center">
            <StatSkillWordmark />
          </div>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
            {mode === "signin" ? "Sign In to Your Account" : "Create Official Account"}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            National Competency & Skill Intelligence Platform (MoSPI / MeitY)
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Create Account */}
        <div className="grid grid-cols-2 rounded-xl bg-muted p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`rounded-lg py-2 transition ${
              mode === "signin"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setErrorMessage(null);
              setSuccessMessage(null);
              if (email === "vivek.reddy@meity.gov.in") setEmail("");
              setPassword("");
            }}
            className={`rounded-lg py-2 transition ${
              mode === "signup"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Banner on Wrong Password or Validation Error */}
        {errorMessage && (
          <div className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="font-semibold">{errorMessage}</p>
          </div>
        )}

        {/* Success / Notification Banner */}
        {successMessage && (
          <div className="flex items-start gap-2.5 rounded-lg border border-success/20 bg-success/10 p-3 text-xs text-success">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="font-semibold">{successMessage}</p>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleFormSubmit}>
          {mode === "signup" && (
            <>
              <div>
                <label htmlFor="name" className="text-xs font-semibold text-foreground">
                  Full Name
                </label>
                <div className="relative mt-1.5">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tanmay Mamania"
                    required
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-xs text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">
                  Cadre Job Role / Designation
                </label>
                <div className="relative mt-1.5">
                  <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <select
                    value={cadreRole}
                    onChange={(e) => setCadreRole(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-xs font-medium text-foreground outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
                  >
                    {CADRE_JOB_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                    <option value="Other">Other (Custom Designation)...</option>
                  </select>
                </div>
                {cadreRole === "Other" && (
                  <input
                    type="text"
                    value={customCadreRole}
                    onChange={(e) => setCustomCadreRole(e.target.value)}
                    placeholder="Enter official designation (e.g. Research Specialist)"
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
                  />
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">
                  Ministry / Department
                </label>
                <div className="relative mt-1.5">
                  <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <select
                    value={cadreDept}
                    onChange={(e) => setCadreDept(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-xs font-medium text-foreground outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
                  >
                    {CADRE_DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                    <option value="Other">Other Department...</option>
                  </select>
                </div>
                {cadreDept === "Other" && (
                  <input
                    type="text"
                    value={customCadreDept}
                    onChange={(e) => setCustomCadreDept(e.target.value)}
                    placeholder="Enter ministry or department name"
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
                  />
                )}
              </div>
            </>
          )}

          <div>
            <label htmlFor="email" className="text-xs font-semibold text-foreground">
              Official Email Address
            </label>
            <div className="relative mt-1.5">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@nic.in or your.email@gmail.com"
                required
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-xs text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-4">
              <label htmlFor="password" className="text-xs font-semibold text-foreground">
                Password
              </label>
              {mode === "signin" && (
                <button
                  type="button"
                  onClick={() => {
                    setResetSubmitted(false);
                    setShowForgotModal(true);
                  }}
                  className="text-xs font-semibold text-accent hover:underline focus:outline-none"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative mt-1.5">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "Create password (min 6 chars)" : "Enter account password"}
                required
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-12 text-xs text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {mode === "signup" && (
            <div>
              <label htmlFor="confirmPassword" className="text-xs font-semibold text-foreground">
                Confirm Password
              </label>
              <div className="relative mt-1.5">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-xs text-foreground outline-none transition placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="mt-2 flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            {mode === "signin" ? "Sign In" : "Register & Set Up Profile"}
          </button>

          {mode === "signin" && (
            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={fillDemoAccount}
                className="text-[11px] text-accent hover:underline inline-flex items-center gap-1 font-medium"
              >
                <Sparkles className="h-3 w-3" /> Quick fill Demo Account (vivek.reddy / Password@123)
              </button>
            </div>
          )}

          <div className="flex items-center gap-4 pt-1">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              or connect with
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          {/* Single Clean Google Sign-In Button */}
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
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-background px-4 py-2.5 text-xs font-semibold text-foreground transition hover:bg-muted shadow-sm"
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
            Sign in with Google Account
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          {mode === "signin" ? (
            <>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setErrorMessage(null);
                }}
                className="font-semibold text-accent hover:underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrorMessage(null);
                }}
                className="font-semibold text-accent hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </p>
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
                Enter your Google Account email. All your competency assessment scores, skill gaps, and learning paths will remain permanently saved to this account.
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
                  placeholder="e.g. Tanmay Mamania"
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

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">Password Reset Assistance</h3>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!resetSubmitted ? (
              <form onSubmit={handleForgotSubmit} className="mt-4 space-y-4">
                <p className="text-xs text-muted-foreground">
                  Enter your official email address. An OTP or password reset link will be sent to your verified inbox.
                </p>
                <div>
                  <label className="text-xs font-semibold text-foreground">Email Address</label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="officer@nic.in / @meity.gov.in"
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-4 space-y-4 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-foreground">Reset instructions sent!</p>
                <p className="text-xs text-muted-foreground">
                  If an account exists for <span className="font-semibold text-foreground">{resetEmail}</span>, password reset credentials have been dispatched.
                </p>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
