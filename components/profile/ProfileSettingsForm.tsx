"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  RotateCcw,
  Save,
  Settings2,
  ShieldCheck,
  UserCircle,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import { ProfilePhotoCropUpload } from "@/components/profile/ProfilePhotoCropUpload";

type ToastType = "success" | "error" | "info";

type ProfileTab =
  | "profile"
  | "account"
  | "email"
  | "security"
  | "notifications"
  | "organization"
  | "preferences";

type ProfileUser = {
  name: string;
  email: string;
  phone: string;
  image: string;
  designation: string;
  location: string;
  bio: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

type OrganizationProfile = {
  name: string;
  gstNumber: string;
  city: string;
  state: string;
};

type ProfileFormState = {
  name: string;
  phone: string;
  image: string;
  designation: string;
  location: string;
  bio: string;
  organizationName: string;
  gstNumber: string;
  city: string;
  state: string;
  projectUpdates: boolean;
  budgetAlerts: boolean;
  paymentStatus: boolean;
  invoiceUpdates: boolean;
  adminMessages: boolean;
  teamInvitations: boolean;
  weeklyReports: boolean;
  marketingEmails: boolean;
  theme: "light" | "dark" | "system";
  currency: string;
  dateFormat: string;
  timeFormat: string;
  measurementUnits: string;
  dashboardView: string;
  density: "compact" | "comfortable";
};

type PasswordState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

function notify(title: string, type: ToastType = "info") {
  window.dispatchEvent(
    new CustomEvent("contractorops:toast", { detail: { title, type } }),
  );
}

const tabs: { id: ProfileTab; label: string; icon: LucideIcon }[] = [
  { id: "profile", label: "Profile", icon: UserCircle },
  { id: "account", label: "Account", icon: Settings2 },
  { id: "email", label: "Email", icon: Mail },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "organization", label: "Organization", icon: Building2 },
  { id: "preferences", label: "Preferences", icon: Settings2 },
];

const adminRoles = ["Super Admin", "Organization Owner", "Owner", "Admin"];

function getInitialState(
  user: ProfileUser,
  organization: OrganizationProfile,
): ProfileFormState {
  return {
    name: user.name,
    phone: user.phone,
    image: user.image,
    designation: user.designation,
    location: user.location,
    bio: user.bio,
    organizationName: organization.name,
    gstNumber: organization.gstNumber,
    city: organization.city,
    state: organization.state,
    projectUpdates: true,
    budgetAlerts: true,
    paymentStatus: true,
    invoiceUpdates: true,
    adminMessages: true,
    teamInvitations: true,
    weeklyReports: false,
    marketingEmails: false,
    theme: "system",
    currency: "INR",
    dateFormat: "DD MMM YYYY",
    timeFormat: "12-hour",
    measurementUnits: "metric",
    dashboardView: "overview",
    density: "comfortable",
  };
}

function getPasswordScore(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

function validatePassword(password: string) {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password))
    return "Password must contain at least one uppercase letter.";
  if (!/[a-z]/.test(password))
    return "Password must contain at least one lowercase letter.";
  if (!/\d/.test(password)) return "Password must contain at least one number.";
  if (!/[^A-Za-z0-9]/.test(password))
    return "Password must contain at least one special character.";
  return "";
}

function TextInput({
  label,
  name,
  value,
  onChange,
  disabled,
  placeholder,
  type = "text",
}: {
  label: string;
  name: keyof ProfileFormState;
  value: string;
  onChange: (name: keyof ProfileFormState, value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-200">
      {label}
      <input
        className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-blueprint focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:border-white/10 dark:bg-slate-950 dark:text-white dark:disabled:bg-slate-900"
        disabled={disabled}
        name={String(name)}
        onChange={(event) => onChange(name, event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-950">
      <div>
        <p className="text-sm font-black text-slate-900 dark:text-white">
          {title}
        </p>
        <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
      <button
        aria-pressed={checked}
        className={[
          "relative h-7 w-12 rounded-full transition disabled:cursor-not-allowed disabled:opacity-70",
          checked ? "bg-blueprint" : "bg-slate-300 dark:bg-slate-700",
        ].join(" ")}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        type="button"
      >
        <span
          className={[
            "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition",
            checked ? "left-6" : "left-1",
          ].join(" ")}
        />
      </button>
    </div>
  );
}

export function ProfileSettingsForm({
  user,
  organization,
  role,
}: {
  user: ProfileUser;
  organization: OrganizationProfile;
  role: string;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  const initialState = useMemo(
    () => getInitialState(user, organization),
    [user, organization],
  );
  const [form, setForm] = useState<ProfileFormState>(initialState);
  const [passwords, setPasswords] = useState<PasswordState>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const canManageOrganization = adminRoles.includes(role);
  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initialState),
    [form, initialState],
  );
  const passwordScore = getPasswordScore(passwords.newPassword);

  useEffect(() => {
    function beforeUnload(event: BeforeUnloadEvent) {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [isDirty]);

  function updateField(name: keyof ProfileFormState, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function updateToggle(name: keyof ProfileFormState, value: boolean) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function resetForm() {
    setForm(initialState);
    notify("Unsaved changes reset.", "info");
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim()) {
      notify("Name is required.", "error");
      return;
    }

    if (form.phone && !/^[0-9+\-\s()]{7,20}$/.test(form.phone)) {
      notify("Enter a valid phone number.", "error");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.set("name", form.name.trim());
    formData.set("phone", form.phone.trim());
    formData.set("designation", form.designation.trim());
    formData.set("location", form.location.trim());
    formData.set("bio", form.bio.trim());
    if (profileImageFile) {
      formData.set("imageFile", profileImageFile);
    } else {
      formData.set("image", form.image);
    }

    formData.set(
      "notificationPreferences",
      JSON.stringify({
        projectUpdates: form.projectUpdates,
        budgetAlerts: form.budgetAlerts,
        paymentStatus: form.paymentStatus,
        invoiceUpdates: form.invoiceUpdates,
        adminMessages: form.adminMessages,
        teamInvitations: form.teamInvitations,
        weeklyReports: form.weeklyReports,
        marketingEmails: form.marketingEmails,
        securityAlerts: true,
      }),
    );

    formData.set(
      "userPreferences",
      JSON.stringify({
        theme: form.theme,
        currency: form.currency,
        dateFormat: form.dateFormat,
        timeFormat: form.timeFormat,
        measurementUnits: form.measurementUnits,
        dashboardView: form.dashboardView,
        density: form.density,
      }),
    );

    if (canManageOrganization) {
      formData.set("organizationName", form.organizationName.trim());
      formData.set("gstNumber", form.gstNumber.trim());
      formData.set("city", form.city.trim());
      formData.set("state", form.state.trim());
    }

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        body: formData,
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "Unable to update profile.");
      }

      notify("Settings saved successfully.", "success");
      router.refresh();
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Unable to update settings.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  async function onPasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!passwords.currentPassword) {
      notify("Current password is required.", "error");
      return;
    }

    const passwordError = validatePassword(passwords.newPassword);
    if (passwordError) {
      notify(passwordError, "error");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      notify("New password and confirm password do not match.", "error");
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await fetch("/api/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwords),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "Unable to update password.");
      }

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      notify("Password updated successfully.", "success");
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Unable to update password.",
        "error",
      );
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <form className="grid gap-5" onSubmit={onSubmit}>
      <section className="rounded-[2rem] border border-white/80 bg-white/86 p-3 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
        <div className="flex gap-2 overflow-x-auto p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            return (
              <button
                className={[
                  "inline-flex min-w-fit items-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition",
                  active
                    ? "bg-slate-950 text-white shadow-glow dark:bg-safety-yellow dark:text-slate-950"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white",
                ].join(" ")}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                <Icon className="h-4 w-4 animate-pulse" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {activeTab === "profile" && (
        <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[2rem] border border-white/80 bg-white/86 p-6 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
            <h2 className="text-xl font-black text-slate-950 dark:text-white">
              Profile photo
            </h2>
            <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
              Upload JPG, JPEG, PNG, or WEBP. Keep it below 5 MB.
            </p>

            <div className="mt-5">
              <ProfilePhotoCropUpload
                label="Upload profile image"
                onCropped={(file, previewUrl) => {
                  setProfileImageFile(file);
                  setForm((current) => ({ ...current, image: previewUrl }));
                }}
                onRemove={() => {
                  setProfileImageFile(null);
                  setForm((current) => ({ ...current, image: "" }));
                }}
                value={form.image}
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/80 bg-white/86 p-6 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
            <h2 className="text-xl font-black text-slate-950 dark:text-white">
              User profile
            </h2>
            <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
              Basic identity shown across ContractorOps.
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <TextInput
                label="Full name"
                name="name"
                onChange={updateField}
                value={form.name}
              />
              <TextInput
                label="Phone number"
                name="phone"
                onChange={updateField}
                value={form.phone}
              />
              <TextInput
                label="Designation"
                name="designation"
                onChange={updateField}
                value={form.designation}
              />
              <TextInput
                label="Location"
                name="location"
                onChange={updateField}
                value={form.location}
              />
            </div>

            <label className="mt-4 grid gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-200">
              Bio
              <textarea
                className="min-h-28 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blueprint focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                maxLength={240}
                onChange={(event) => updateField("bio", event.target.value)}
                placeholder="Short profile description"
                value={form.bio}
              />
            </label>
          </div>
        </section>
      )}

      {activeTab === "account" && (
        <section className="rounded-[2rem] border border-white/80 bg-white/86 p-6 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
          <h2 className="text-xl font-black text-slate-950 dark:text-white">
            Account information
          </h2>
          <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
            Email is readonly unless verified email-change flow is implemented.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-200">
              Email address
              <input
                className="h-12 cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-4 text-slate-500 outline-none dark:border-white/10 dark:bg-slate-900 dark:text-slate-400"
                readOnly
                value={user.email}
              />
            </label>

            <label className="grid gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-200">
              Current role
              <input
                className="h-12 cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-4 text-slate-500 outline-none dark:border-white/10 dark:bg-slate-900 dark:text-slate-400"
                readOnly
                value={role}
              />
            </label>

            <label className="grid gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-200">
              Account created
              <input
                className="h-12 cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-4 text-slate-500 outline-none dark:border-white/10 dark:bg-slate-900 dark:text-slate-400"
                readOnly
                value={user.createdAt || "Not available"}
              />
            </label>

            <label className="grid gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-200">
              Last updated
              <input
                className="h-12 cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-4 text-slate-500 outline-none dark:border-white/10 dark:bg-slate-900 dark:text-slate-400"
                readOnly
                value={user.updatedAt || "Not available"}
              />
            </label>
          </div>
        </section>
      )}

      {activeTab === "email" && (
        <section className="rounded-[2rem] border border-white/80 bg-white/86 p-6 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
          <h2 className="text-xl font-black text-slate-950 dark:text-white">
            Email settings
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-5 dark:bg-white/5">
              <Mail className="h-5 w-5 text-blueprint" />
              <p className="mt-3 text-sm font-black text-slate-950 dark:text-white">
                Primary email
              </p>
              <p className="mt-1 break-all text-sm font-semibold text-slate-500 dark:text-slate-400">
                {user.email}
              </p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-5 dark:bg-white/5">
              {user.emailVerified ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <p className="mt-3 text-sm font-black text-slate-950 dark:text-white">
                Verification status
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                {user.emailVerified ? "Verified" : "Not verified"}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            <ToggleRow
              checked={form.projectUpdates}
              description="Receive updates when project details change."
              onChange={(value) => updateToggle("projectUpdates", value)}
              title="Project updates"
            />
            <ToggleRow
              checked={form.budgetAlerts}
              description="Receive alerts when budgets are close to or above limits."
              onChange={(value) => updateToggle("budgetAlerts", value)}
              title="Budget alerts"
            />
            <ToggleRow
              checked={form.paymentStatus}
              description="Receive payment success and failure updates."
              onChange={(value) => updateToggle("paymentStatus", value)}
              title="Payment status"
            />
            <ToggleRow
              checked
              description="Security alerts are mandatory and cannot be disabled."
              disabled
              onChange={() => undefined}
              title="Security alerts"
            />
          </div>
        </section>
      )}

      {activeTab === "security" && (
        <section className="rounded-[2rem] border border-white/80 bg-white/86 p-6 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
          <h2 className="text-xl font-black text-slate-950 dark:text-white">
            Security settings
          </h2>
          <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
            Password updates are handled separately from profile updates.
          </p>

          <form
            className="mt-5 grid gap-4 md:grid-cols-2"
            onSubmit={onPasswordSubmit}
          >
            {(
              ["currentPassword", "newPassword", "confirmPassword"] as const
            ).map((field) => (
              <label
                className="grid gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-200"
                key={field}
              >
                {field === "currentPassword"
                  ? "Current password"
                  : field === "newPassword"
                    ? "New password"
                    : "Confirm password"}
                <div className="relative">
                  <input
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-12 text-slate-900 outline-none transition focus:border-blueprint focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                    onChange={(event) =>
                      setPasswords((current) => ({
                        ...current,
                        [field]: event.target.value,
                      }))
                    }
                    type={showPassword ? "text" : "password"}
                    value={passwords[field]}
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
                    onClick={() => setShowPassword((current) => !current)}
                    type="button"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </label>
            ))}

            <div className="md:col-span-2">
              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-blueprint transition-all"
                  style={{ width: `${(passwordScore / 5) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Use 8+ characters with uppercase, lowercase, number, and special
                character.
              </p>
            </div>

            <button
              className="inline-flex h-12 w-fit items-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white shadow-glow disabled:opacity-60 dark:bg-safety-yellow dark:text-slate-950"
              disabled={passwordLoading}
              type="submit"
            >
              {passwordLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              Update password
            </button>
          </form>
        </section>
      )}

      {activeTab === "notifications" && (
        <section className="rounded-[2rem] border border-white/80 bg-white/86 p-6 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
          <h2 className="text-xl font-black text-slate-950 dark:text-white">
            Notification preferences
          </h2>

          <div className="mt-5 grid gap-3">
            <ToggleRow
              checked={form.invoiceUpdates}
              description="Notify when invoices are generated or updated."
              onChange={(value) => updateToggle("invoiceUpdates", value)}
              title="Invoice updates"
            />
            <ToggleRow
              checked={form.adminMessages}
              description="Notify when admins send important messages."
              onChange={(value) => updateToggle("adminMessages", value)}
              title="Admin messages"
            />
            <ToggleRow
              checked={form.teamInvitations}
              description="Notify when someone invites you to a team or organization."
              onChange={(value) => updateToggle("teamInvitations", value)}
              title="Team invitations"
            />
            <ToggleRow
              checked={form.weeklyReports}
              description="Receive weekly summary reports."
              onChange={(value) => updateToggle("weeklyReports", value)}
              title="Weekly reports"
            />
            <ToggleRow
              checked={form.marketingEmails}
              description="Optional promotional emails. Disabled by default."
              onChange={(value) => updateToggle("marketingEmails", value)}
              title="Marketing emails"
            />
          </div>
        </section>
      )}

      {activeTab === "organization" && (
        <section className="rounded-[2rem] border border-white/80 bg-white/86 p-6 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
          <h2 className="text-xl font-black text-slate-950 dark:text-white">
            Organization settings
          </h2>
          <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
            {canManageOrganization
              ? "You can update organization profile details."
              : "You can view organization details, but your role cannot update them."}
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <TextInput
              disabled={!canManageOrganization}
              label="Organization name"
              name="organizationName"
              onChange={updateField}
              value={form.organizationName}
            />
            <TextInput
              disabled={!canManageOrganization}
              label="GST number"
              name="gstNumber"
              onChange={updateField}
              value={form.gstNumber}
            />
            <TextInput
              disabled={!canManageOrganization}
              label="City"
              name="city"
              onChange={updateField}
              value={form.city}
            />
            <TextInput
              disabled={!canManageOrganization}
              label="State"
              name="state"
              onChange={updateField}
              value={form.state}
            />
          </div>
        </section>
      )}

      {activeTab === "preferences" && (
        <section className="rounded-[2rem] border border-white/80 bg-white/86 p-6 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
          <h2 className="text-xl font-black text-slate-950 dark:text-white">
            User preferences
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              ["theme", "Theme", ["system", "light", "dark"]],
              ["currency", "Currency", ["INR", "USD", "EUR"]],
              [
                "dateFormat",
                "Date format",
                ["DD MMM YYYY", "DD/MM/YYYY", "YYYY-MM-DD"],
              ],
              ["timeFormat", "Time format", ["12-hour", "24-hour"]],
              ["measurementUnits", "Measurement units", ["metric", "imperial"]],
              [
                "dashboardView",
                "Dashboard view",
                ["overview", "projects", "finance"],
              ],
              ["density", "Display density", ["comfortable", "compact"]],
            ].map(([name, label, options]) => (
              <label
                className="grid gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-200"
                key={String(name)}
              >
                {String(label)}
                <select
                  className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-blueprint focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                  onChange={(event) =>
                    updateField(
                      name as keyof ProfileFormState,
                      event.target.value,
                    )
                  }
                  value={String(form[name as keyof ProfileFormState])}
                >
                  {(options as string[]).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </section>
      )}

      <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-[2rem] border border-white/80 bg-white/90 p-4 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
          {isDirty ? "You have unsaved changes." : "All changes are saved."}
        </p>

        <div className="flex gap-3">
          <button
            className="inline-flex h-12 items-center gap-2 rounded-2xl border border-slate-200 px-5 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
            disabled={!isDirty || loading}
            onClick={resetForm}
            type="button"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>

          <button
            className="inline-flex h-12 items-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white shadow-glow disabled:cursor-not-allowed disabled:opacity-60 dark:bg-safety-yellow dark:text-slate-950"
            disabled={!isDirty || loading}
            type="submit"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save settings
          </button>
        </div>
      </div>
    </form>
  );
}
