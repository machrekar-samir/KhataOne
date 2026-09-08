import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext.jsx";
import { auth } from "../config/firebase.js";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";

import {
  Building2,
  UserRound,
  LockKeyhole,
  SlidersHorizontal,
  Bell,
  Database,
  UsersRound,
  TriangleAlert,
  Upload,
  Eye,
  EyeOff,
  Moon,
  Monitor,
  Volume2,
  Download,
  CloudCog,
  RotateCcw,
  Trash2,
  Crown,
  ChevronDown,
  ChevronRight,
  Camera,
  Save,
} from "lucide-react";

export default function Settings() {
  const { data, update, notify } = useApp();

  const [business, setBusiness] = useState({
    name: "",
    type: "Retail Shop",
    phone: "",
    address: "",
    logo: "",
  });

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "Owner",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    newPassword: false,
    confirm: false,
  });

  const [preferences, setPreferences] = useState({
    language: "English",
    dateFormat: "DD/MM/YYYY",
    currency: "INR (₹)",
    darkMode: false,
    compactView: false,
    playSounds: true,
  });

  const [notifications, setNotifications] = useState({
    paymentReminders: true,
    collectionAlerts: true,
    newCustomer: true,
    systemUpdates: false,
  });

  const [saving, setSaving] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (data?.business) {
      setBusiness({
        name: data.business.name || "",
        type: data.business.type || "Retail Shop",
        phone: data.business.phone || "",
        address: data.business.address || "",
        logo: data.business.logo || "",
      });
    }

    if (data?.profile) {
      setProfile({
        name: data.profile.name || "",
        email: data.profile.email || auth.currentUser?.email || "",
        role: data.profile.role || "Owner",
      });
    } else if (auth.currentUser) {
      setProfile((prev) => ({
        ...prev,
        email: auth.currentUser.email || "",
      }));
    }
  }, [data]);

  /* ================= SAVE SETTINGS ================= */

  const saveSettings = async () => {
    try {
      setSaving(true);

      await update?.({
        business,
        profile,
        preferences,
        notifications,
      });

      notify?.("Settings saved successfully");
    } catch (error) {
      console.error(error);
      notify?.("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  /* ================= PASSWORD UPDATE ================= */

  const handlePasswordUpdate = async () => {
    const user = auth.currentUser;

    if (!user) {
      notify?.("Please login again");
      return;
    }

    if (!user.email) {
      notify?.("Email not found");
      return;
    }

    if (
      !passwords.current ||
      !passwords.newPassword ||
      !passwords.confirm
    ) {
      notify?.("Please fill all password fields");
      return;
    }

    if (passwords.newPassword.length < 6) {
      notify?.("New password must be at least 6 characters");
      return;
    }

    if (passwords.newPassword !== passwords.confirm) {
      notify?.("New password and confirm password do not match");
      return;
    }

    try {
      setPasswordLoading(true);

      const credential = EmailAuthProvider.credential(
        user.email,
        passwords.current,
      );

      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, passwords.newPassword);

      setPasswords({
        current: "",
        newPassword: "",
        confirm: "",
      });

      notify?.("Password updated successfully");
    } catch (error) {
      console.error("Password update error:", error);

      switch (error.code) {
        case "auth/wrong-password":
        case "auth/invalid-credential":
          notify?.("Current password is incorrect");
          break;

        case "auth/weak-password":
          notify?.("Password is too weak");
          break;

        case "auth/requires-recent-login":
          notify?.("Please logout and login again");
          break;

        default:
          notify?.(error.message || "Failed to update password");
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  /* ================= IMAGE UPLOAD ================= */

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setBusiness((prev) => ({
        ...prev,
        logo: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  };

  /* ================= EXPORT DATA ================= */

  const exportData = () => {
    try {
      const exportData = {
        business,
        profile,
        customers: data?.customers || [],
        transactions: data?.transactions || [],
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob(
        [JSON.stringify(exportData, null, 2)],
        {
          type: "application/json",
        },
      );

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "khataone-backup.json";
      link.click();

      URL.revokeObjectURL(url);

      notify?.("Data exported successfully");
    } catch (error) {
      console.error(error);
      notify?.("Failed to export data");
    }
  };

  /* ================= BACKUP ================= */

  const backupData = () => {
    try {
      localStorage.setItem(
        "khataone_backup",
        JSON.stringify({
          ...data,
          business,
          profile,
          backupDate: new Date().toISOString(),
        }),
      );

      notify?.("Backup created successfully");
    } catch {
      notify?.("Backup failed");
    }
  };

  const restoreData = () => {
    const backup = localStorage.getItem("khataone_backup");

    if (!backup) {
      notify?.("No backup found");
      return;
    }

    try {
      const parsed = JSON.parse(backup);

      setBusiness(parsed.business || business);
      setProfile(parsed.profile || profile);

      notify?.("Backup restored successfully");
    } catch {
      notify?.("Failed to restore backup");
    }
  };

  /* ================= DELETE ACCOUNT ================= */

  const deleteAccount = () => {
    const confirmed = window.confirm(
      "Are you sure? This action cannot be undone.",
    );

    if (!confirmed) return;

    notify?.("Account deletion request initiated");
  };

  return (
    <div className="mx-auto w-full max-w-[1450px] pb-10">

      {/* ================= HEADER ================= */}

      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#30292c] dark:text-white sm:text-[32px]">
            Settings
          </h1>

          <p className="mt-1 text-sm text-[#71696b] dark:text-[#b7aaae]">
            Customize your KhataOne experience. Manage your business,
            preferences and account all in one place.
          </p>
        </div>

        <div className="hidden text-right font-serif italic text-[#7b1825] lg:block">
          <p className="text-lg">Your Business</p>
          <p className="text-lg">Our Support ♡</p>
        </div>
      </div>

      <div className="space-y-3">

        {/* ================= BUSINESS SETTINGS ================= */}

        <SettingsSection
          icon={<Building2 size={23} />}
          title="Business Settings"
          description="Manage your business information and default preferences."
        >
          <div className="grid gap-3 md:grid-cols-12">

            <Field className="md:col-span-3" label="Business Name">
              <input
                value={business.name}
                onChange={(e) =>
                  setBusiness({
                    ...business,
                    name: e.target.value,
                  })
                }
                placeholder="Business name"
                className={inputClass}
              />
            </Field>

            <Field className="md:col-span-3" label="Business Type">
              <Select
                value={business.type}
                onChange={(e) =>
                  setBusiness({
                    ...business,
                    type: e.target.value,
                  })
                }
                options={[
                  "Retail Shop",
                  "Wholesale",
                  "Service Business",
                  "Restaurant",
                  "Other",
                ]}
              />
            </Field>

            <Field className="md:col-span-3" label="Phone Number">
              <input
                value={business.phone}
                onChange={(e) =>
                  setBusiness({
                    ...business,
                    phone: e.target.value,
                  })
                }
                placeholder="+91 98765 43210"
                className={inputClass}
              />
            </Field>

            <Field className="md:col-span-3" label="Business Logo">
              <label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#cfc4c0] bg-white px-3 text-xs text-[#74696b] transition hover:border-[#7b1825] hover:text-[#7b1825] dark:bg-[#2d2528]">
                <Upload size={15} />
                Upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            </Field>

            <Field className="md:col-span-12" label="Address">
              <input
                value={business.address}
                onChange={(e) =>
                  setBusiness({
                    ...business,
                    address: e.target.value,
                  })
                }
                placeholder="Business address"
                className={inputClass}
              />
            </Field>
          </div>
        </SettingsSection>

        {/* ================= PROFILE ================= */}

        <SettingsSection
          icon={<UserRound size={23} />}
          title="Profile Settings"
          description="Update your personal details and profile photo."
        >
          <div className="grid items-end gap-3 md:grid-cols-12">

            <div className="flex items-center gap-3 md:col-span-2">
              <div className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-full bg-[#7b1825] text-xl font-bold text-white">

                {business.logo ? (
                  <img
                    src={business.logo}
                    alt="Profile"
                    className="size-full object-cover"
                  />
                ) : (
                  profile.name?.slice(0, 2).toUpperCase() || "SM"
                )}

                <button
                  className="absolute bottom-0 right-0 grid size-6 place-items-center rounded-full bg-[#5d111c] text-white"
                  type="button"
                >
                  <Camera size={12} />
                </button>
              </div>
            </div>

            <Field className="md:col-span-3" label="Full Name">
              <input
                value={profile.name}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    name: e.target.value,
                  })
                }
                placeholder="Your name"
                className={inputClass}
              />
            </Field>

            <Field className="md:col-span-3" label="Email Address">
              <input
                value={profile.email}
                disabled
                className={`${inputClass} cursor-not-allowed opacity-70`}
              />
            </Field>

            <Field className="md:col-span-3" label="Role">
              <Select
                value={profile.role}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    role: e.target.value,
                  })
                }
                options={["Owner", "Manager", "Staff"]}
              />
            </Field>
          </div>
        </SettingsSection>

        {/* ================= PASSWORD ================= */}

        <SettingsSection
          icon={<LockKeyhole size={23} />}
          title="Password & Security"
          description="Keep your account secure and update your password."
        >
          <div className="grid items-end gap-3 md:grid-cols-12">

            <PasswordField
              className="md:col-span-3"
              label="Current Password"
              value={passwords.current}
              show={showPassword.current}
              placeholder="Enter current password"
              onToggle={() =>
                setShowPassword({
                  ...showPassword,
                  current: !showPassword.current,
                })
              }
              onChange={(value) =>
                setPasswords({
                  ...passwords,
                  current: value,
                })
              }
            />

            <PasswordField
              className="md:col-span-3"
              label="New Password"
              value={passwords.newPassword}
              show={showPassword.newPassword}
              placeholder="Enter new password"
              onToggle={() =>
                setShowPassword({
                  ...showPassword,
                  newPassword: !showPassword.newPassword,
                })
              }
              onChange={(value) =>
                setPasswords({
                  ...passwords,
                  newPassword: value,
                })
              }
            />

            <PasswordField
              className="md:col-span-3"
              label="Confirm Password"
              value={passwords.confirm}
              show={showPassword.confirm}
              placeholder="Confirm password"
              onToggle={() =>
                setShowPassword({
                  ...showPassword,
                  confirm: !showPassword.confirm,
                })
              }
              onChange={(value) =>
                setPasswords({
                  ...passwords,
                  confirm: value,
                })
              }
            />

            <button
              type="button"
              disabled={passwordLoading}
              onClick={handlePasswordUpdate}
              className="h-10 rounded-xl bg-[#7b1825] px-5 text-sm font-semibold text-white transition hover:bg-[#62111c] disabled:cursor-not-allowed disabled:opacity-60 md:col-span-3"
            >
              {passwordLoading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </SettingsSection>

        {/* ================= APP PREFERENCES ================= */}

        <SettingsSection
          icon={<SlidersHorizontal size={23} />}
          title="App Preferences"
          description="Set your default language, currency, date format and other preferences."
        >
          <div className="grid gap-4 md:grid-cols-3">

            <Field label="Language">
              <Select
                value={preferences.language}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    language: e.target.value,
                  })
                }
                options={["English", "Hindi", "Marathi"]}
              />
            </Field>

            <Field label="Date Format">
              <Select
                value={preferences.dateFormat}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    dateFormat: e.target.value,
                  })
                }
                options={[
                  "DD/MM/YYYY",
                  "MM/DD/YYYY",
                  "YYYY-MM-DD",
                ]}
              />
            </Field>

            <Field label="Currency">
              <Select
                value={preferences.currency}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    currency: e.target.value,
                  })
                }
                options={["INR (₹)", "USD ($)", "EUR (€)"]}
              />
            </Field>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">

            <ToggleRow
              icon={<Moon size={18} />}
              title="Dark Mode"
              checked={preferences.darkMode}
              onChange={() =>
                setPreferences({
                  ...preferences,
                  darkMode: !preferences.darkMode,
                })
              }
            />

            <ToggleRow
              icon={<Monitor size={18} />}
              title="Compact View"
              checked={preferences.compactView}
              onChange={() =>
                setPreferences({
                  ...preferences,
                  compactView: !preferences.compactView,
                })
              }
            />

            <ToggleRow
              icon={<Volume2 size={18} />}
              title="Play Sounds"
              checked={preferences.playSounds}
              onChange={() =>
                setPreferences({
                  ...preferences,
                  playSounds: !preferences.playSounds,
                })
              }
            />
          </div>
        </SettingsSection>

        {/* ================= NOTIFICATIONS ================= */}

        <SettingsSection
          icon={<Bell size={23} />}
          title="Notifications"
          description="Choose what you want to be notified about."
        >
          <div className="grid gap-3 sm:grid-cols-2">

            <NotificationItem
              title="Payment Reminders"
              description="Get notified for pending payments"
              checked={notifications.paymentReminders}
              onChange={() =>
                setNotifications({
                  ...notifications,
                  paymentReminders: !notifications.paymentReminders,
                })
              }
            />

            <NotificationItem
              title="Collection Alerts"
              description="Get notified on new collections"
              checked={notifications.collectionAlerts}
              onChange={() =>
                setNotifications({
                  ...notifications,
                  collectionAlerts: !notifications.collectionAlerts,
                })
              }
            />

            <NotificationItem
              title="New Customer"
              description="Get notified when a customer is added"
              checked={notifications.newCustomer}
              onChange={() =>
                setNotifications({
                  ...notifications,
                  newCustomer: !notifications.newCustomer,
                })
              }
            />

            <NotificationItem
              title="System Updates"
              description="Important updates and announcements"
              checked={notifications.systemUpdates}
              onChange={() =>
                setNotifications({
                  ...notifications,
                  systemUpdates: !notifications.systemUpdates,
                })
              }
            />
          </div>
        </SettingsSection>

        {/* ================= DATA BACKUP ================= */}

        <SettingsSection
          icon={<Database size={23} />}
          title="Data & Backup"
          description="Manage your data, export and backup options."
        >
          <div className="grid gap-3 md:grid-cols-3">

            <ActionButton
              icon={<Download size={20} />}
              title="Export Data"
              description="Download your data"
              onClick={exportData}
            />

            <ActionButton
              icon={<CloudCog size={20} />}
              title="Backup Now"
              description="Create manual backup"
              onClick={backupData}
            />

            <ActionButton
              icon={<RotateCcw size={20} />}
              title="Restore Data"
              description="Restore from backup"
              onClick={restoreData}
            />
          </div>
        </SettingsSection>

      
        {/* ================= DANGER ZONE ================= */}

        <SettingsSection
          danger
          icon={<TriangleAlert size={23} />}
          title="Danger Zone"
          description="These actions are permanent and cannot be undone."
        >
          <div className="flex flex-col justify-between gap-4 rounded-xl border border-red-100 bg-red-50/70 p-4 sm:flex-row sm:items-center dark:border-red-900/30 dark:bg-red-950/10">

            <div className="flex gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-red-100 text-red-700">
                <Trash2 size={19} />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">
                  Delete Account
                </h3>

                <p className="mt-1 text-xs text-red-700/70 dark:text-red-300/60">
                  This will permanently delete your account and all your data.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={deleteAccount}
              className="rounded-xl border border-red-300 bg-white px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-600 hover:text-white"
            >
              Delete Account
            </button>
          </div>
        </SettingsSection>
      </div>

      {/* ================= SAVE ================= */}

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-[#7b1825] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#7b1825]/20 transition hover:bg-[#62111c] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={17} />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

/* =====================================================
   COMPONENTS
===================================================== */

const inputClass =
  "h-10 w-full rounded-xl border border-[#d8d0ca] bg-white px-3 text-sm text-[#3d3537] outline-none transition placeholder:text-[#aaa1a2] focus:border-[#7b1825] focus:ring-2 focus:ring-[#7b1825]/10 dark:border-[#4b3d41] dark:bg-[#2c2528] dark:text-white";

function SettingsSection({
  icon,
  title,
  description,
  children,
  danger = false,
}) {
  return (
    <section className="overflow-hidden rounded-[18px] border border-[#ded8d3] bg-white shadow-sm dark:border-[#44383c] dark:bg-[#281f23]">
      <div className="grid lg:grid-cols-[265px_1fr]">

        <div className="border-b border-[#e8e1dc] bg-[#fcfbfa] p-5 dark:border-[#44383c] dark:bg-[#2b2226] lg:border-b-0 lg:border-r">

          <div className="flex items-start gap-4">
            <div
              className={`grid size-12 shrink-0 place-items-center rounded-2xl ${
                danger
                  ? "bg-red-100 text-red-700"
                  : "bg-[#f7e7e8] text-[#7b1825]"
              }`}
            >
              {icon}
            </div>

            <div>
              <h2 className="text-base font-bold text-[#342c2f] dark:text-white">
                {title}
              </h2>

              <p className="mt-1 text-sm leading-5 text-[#776e70] dark:text-[#b6a9ad]">
                {description}
              </p>
            </div>
          </div>
        </div>

        <div className="min-w-0 p-5">
          {children}
        </div>
      </div>
    </section>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="mb-1.5 block text-xs font-medium text-[#51484a] dark:text-[#ddd2d5]">
        {label}
      </span>

      {children}
    </label>
  );
}

function Select({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className={`${inputClass} appearance-none pr-9`}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>

      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#827779]"
      />
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
  placeholder,
  className = "",
}) {
  return (
    <Field label={label} className={className}>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${inputClass} pr-10`}
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#827779]"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </Field>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative h-6 w-11 rounded-full transition ${
        checked ? "bg-[#7b1825]" : "bg-[#c9c3c2]"
      }`}
    >
      <span
        className={`absolute top-1 size-4 rounded-full bg-white shadow transition-all ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

function ToggleRow({ icon, title, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#e5ded9] bg-[#fcfbfa] px-4 py-3 dark:border-[#493c40] dark:bg-[#2c2528]">
      <div className="flex items-center gap-3">
        <span className="text-[#51484a] dark:text-[#ddd2d5]">
          {icon}
        </span>

        <span className="text-sm font-medium">
          {title}
        </span>
      </div>

      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function NotificationItem({
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[#e5ded9] px-4 py-3 dark:border-[#493c40]">

      <div>
        <h3 className="text-sm font-semibold">
          {title}
        </h3>

        <p className="mt-1 text-xs text-[#7a7072]">
          {description}
        </p>
      </div>

      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function ActionButton({
  icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between gap-3 rounded-xl border border-[#e5ded9] bg-[#fcfbfa] p-4 text-left transition hover:border-[#7b1825]/40 hover:shadow-sm dark:border-[#493c40] dark:bg-[#2c2528]"
    >
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-[#edf5f1] text-[#34745d]">
          {icon}
        </span>

        <div>
          <h3 className="text-sm font-semibold">
            {title}
          </h3>

          <p className="mt-1 text-xs text-[#7a7072]">
            {description}
          </p>
        </div>
      </div>

      <ChevronRight size={17} />
    </button>
  );
}