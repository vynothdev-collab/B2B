"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { KeyRound } from "lucide-react";
import Modal, { Field, FieldInput } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { updateCustomerPassword } from "@/services/customers";

interface Target {
  id: string;
  name: string;
}

interface Props {
  open: boolean;
  target: Target | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ChangePasswordModal({ open, target, onClose, onSuccess }: Props) {
  const toast = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setPassword("");
      setConfirmPassword("");
    }
  }, [open]);

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const handleSubmit = async () => {
    if (!target) return;
    if (password.length < 8) {
      toast.warning("Password too short", "Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.warning("Passwords don't match", "Re-enter the password to confirm.");
      return;
    }
    setSubmitting(true);
    try {
      await updateCustomerPassword(target.id, password);
      toast.success("Password changed", `${target.name}'s password has been updated.`);
      onSuccess();
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && typeof err.response?.data?.detail === "string"
          ? err.response.data.detail
          : "Could not change password. Please try again.";
      toast.error("Failed to change password", msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      eyebrow="Account Security"
      title="Change Password"
      submitLabel={submitting ? "Saving…" : "Change Password"}
      onSubmit={handleSubmit}
      footerHint="The user will need to sign in with this new password"
    >
      <div className="space-y-4">
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3"
          style={{ background: "rgba(23,50,41,.05)", border: "1px solid rgba(23,50,41,.10)" }}
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            style={{ background: "rgba(23,50,41,.10)" }}
          >
            <KeyRound className="h-4 w-4" style={{ color: "var(--forest)" }} />
          </div>
          <div>
            <p className="text-xs font-semibold" style={{ color: "var(--ink-faint)" }}>
              Changing password for
            </p>
            <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
              {target?.name}
            </p>
          </div>
        </div>

        <Field label="New password *" hint="min. 8 characters">
          <FieldInput
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            placeholder="Enter new password"
            autoFocus
          />
        </Field>

        <Field label="Confirm password *">
          <FieldInput
            type="password"
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
          />
        </Field>
      </div>
    </Modal>
  );
}
