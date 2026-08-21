"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Save, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/contexts/AuthContext";
import { updateOwnProfile } from "@/services/adminUsers";

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]!.toUpperCase()).join("") || "SA";
}

export default function ProfilePage() {
  const toast = useToast();
  const { user, updateUser } = useAuth();
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user?.name ?? "");
  }, [user]);

  const submit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.warning("Missing name", "Enter your full name.");
      return;
    }
    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword) {
        toast.warning("Current password required", "Enter your current password to set a new one.");
        return;
      }
      if (newPassword.length < 8) {
        toast.warning("Weak password", "New password must be at least 8 characters.");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.warning("Passwords don't match", "New password and confirmation must match.");
        return;
      }
    }

    setSaving(true);
    try {
      const updated = await updateOwnProfile({
        name: trimmedName,
        current_password: currentPassword || undefined,
        new_password: newPassword || undefined,
      });
      updateUser(updated);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Profile updated", "Your changes have been saved.");
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && typeof err.response?.data?.detail === "string"
          ? err.response.data.detail
          : "Please try again.";
      toast.error("Couldn't update profile", message);
    } finally {
      setSaving(false);
    }
  };

  const displayName = user?.name ?? "Super Admin";
  const displayRole = (user?.role ?? "SUPER_ADMIN").toUpperCase();

  return (
    <div className="max-w-2xl space-y-5">
      {/* Profile summary card */}
      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-6 py-5">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[10px] text-base font-bold"
          style={{
            background: "linear-gradient(135deg, #BC5A34, #8F4426)",
            color: "#FFF7EC",
            fontFamily: "var(--font-fraunces)",
          }}
        >
          {initials(displayName)}
        </div>
        <div className="min-w-0">
          <p className="text-base font-semibold text-slate-800 truncate">{displayName}</p>
          <p className="text-sm text-slate-500 truncate">{user?.email ?? ""}</p>
          <span
            className="mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
            style={{ background: "rgba(23,50,41,.08)", color: "#173229" }}
          >
            {displayRole}
          </span>
        </div>
      </div>

      {/* Edit form */}
      <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
        <div className="px-6 py-4 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-800">Account Details</p>
          <p className="text-xs text-slate-500 mt-0.5">Update your name and password.</p>
        </div>

        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex-1 max-w-sm">
            <p className="text-sm font-semibold text-slate-800">Full Name</p>
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            className="w-64 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#173229] focus:outline-none focus:ring-2 focus:ring-[rgba(23,50,41,.06)]"
          />
        </div>

        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex-1 max-w-sm">
            <p className="text-sm font-semibold text-slate-800">Email</p>
          </div>
          <input
            value={user?.email ?? ""}
            disabled
            className="w-64 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
          />
        </div>

        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex-1 max-w-sm">
            <p className="text-sm font-semibold text-slate-800">Current Password</p>
            <p className="text-xs text-slate-500 mt-0.5">Required only when changing password.</p>
          </div>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
            className="w-64 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#173229] focus:outline-none focus:ring-2 focus:ring-[rgba(23,50,41,.06)]"
          />
        </div>

        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex-1 max-w-sm">
            <p className="text-sm font-semibold text-slate-800">New Password</p>
            <p className="text-xs text-slate-500 mt-0.5">At least 8 characters.</p>
          </div>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            className="w-64 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#173229] focus:outline-none focus:ring-2 focus:ring-[rgba(23,50,41,.06)]"
          />
        </div>

        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex-1 max-w-sm">
            <p className="text-sm font-semibold text-slate-800">Confirm New Password</p>
          </div>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-64 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#173229] focus:outline-none focus:ring-2 focus:ring-[rgba(23,50,41,.06)]"
          />
        </div>

        <div className="flex items-center justify-between px-6 py-4">
          <p className="text-xs text-slate-400">Leave password fields blank to keep your current password.</p>
          <button
            type="button"
            disabled={saving}
            onClick={submit}
            className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-60"
            style={{ background: "#173229", color: "#EFEAD9" }}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
