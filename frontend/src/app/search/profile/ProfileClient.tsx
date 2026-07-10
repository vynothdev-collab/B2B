"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Shield, LogOut, KeyRound, Check, Loader2, Eye, EyeOff } from "lucide-react";
import AppHeader from "@/components/layout/AppHeader";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { toast } from "@/lib/toast";

function avatarInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const AVATAR_COLORS = [
  "from-red-500 to-rose-600",
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-violet-500 to-purple-600",
];

function avatarGradient(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

const ROLE_BADGE: Record<string, string> = {
  admin: "bg-red-50 text-red-700 border border-red-200",
  user: "bg-blue-50 text-blue-700 border border-blue-200",
  viewer: "bg-gray-50 text-gray-600 border border-gray-200",
};

export default function ProfileClient() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [savingPw, setSavingPw] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);

  const toggleShow = (field: keyof typeof showPw) =>
    setShowPw((p) => ({ ...p, [field]: !p[field] }));

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    if (pwForm.next.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setSavingPw(true);
    try {
      await apiClient.post("/users/me/change-password", {
        current_password: pwForm.current,
        new_password: pwForm.next,
      });
      toast.success("Password changed successfully");
      setPwForm({ current: "", next: "", confirm: "" });
      setPwSaved(true);
      setTimeout(() => setPwSaved(false), 2000);
    } catch {
      toast.error("Failed to change password. Check your current password.");
    } finally {
      setSavingPw(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const name = user?.name ?? "—";
  const email = user?.email ?? "—";
  const role = user?.role ?? "user";
  const gradient = avatarGradient(name);
  const initials = avatarInitials(name);
  const roleBadge = ROLE_BADGE[role.toLowerCase()] ?? ROLE_BADGE.user;

  return (
    <>
      <AppHeader title="Profile" />
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto px-2 py-4 sm:px-4">
        <div className="mx-auto w-full max-w-2xl space-y-4">

          {/* Profile card */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {/* Banner */}
            <div className="h-24 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900" />

            <div className="px-6 pb-6">
              {/* Avatar */}
              <div className="-mt-10 mb-4 flex items-end justify-between">
                <div className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-2xl font-bold text-white shadow-lg ring-4 ring-white`}>
                  {initials}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </div>

              {/* Name + role */}
              <div className="mb-5">
                <h1 className="text-xl font-bold text-gray-900">{name}</h1>
                <span className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${roleBadge}`}>
                  {role}
                </span>
              </div>

              {/* Info fields */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                  <User className="h-4 w-4 shrink-0 text-gray-400" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Full name</p>
                    <p className="truncate text-sm font-medium text-gray-800">{name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                  <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Email address</p>
                    <p className="truncate text-sm font-medium text-gray-800">{email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                  <Shield className="h-4 w-4 shrink-0 text-gray-400" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Role</p>
                    <p className="text-sm font-medium capitalize text-gray-800">{role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Change password card */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
              <KeyRound className="h-4 w-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-900">Change password</h2>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3 px-5 py-4">
              {(["current", "next", "confirm"] as const).map((field) => {
                const labels = { current: "Current password", next: "New password", confirm: "Confirm new password" };
                return (
                  <div key={field}>
                    <label className="mb-1 block text-xs font-medium text-gray-600">{labels[field]}</label>
                    <div className="relative">
                      <input
                        type={showPw[field] ? "text" : "password"}
                        value={pwForm[field]}
                        onChange={(e) => setPwForm((p) => ({ ...p, [field]: e.target.value }))}
                        placeholder="••••••••"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 pr-10 text-sm text-gray-900 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => toggleShow(field)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPw[field] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={savingPw || !pwForm.current || !pwForm.next || !pwForm.confirm}
                  className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingPw ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : pwSaved ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : null}
                  {pwSaved ? "Saved!" : "Update password"}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </>
  );
}
