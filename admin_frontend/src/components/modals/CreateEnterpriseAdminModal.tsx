"use client";

import { useState } from "react";
import axios from "axios";
import Modal, { Field, FieldInput, FieldRow } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { createEnterpriseAdmin, type EnterpriseAdmin } from "@/services/enterprises";

interface Props {
  open: boolean;
  onClose: () => void;
  enterpriseId: string | null;
  enterpriseName: string | null;
  onCreated: (admin: EnterpriseAdmin) => void;
}

const initialState = { name: "", email: "", password: "", phone: "" };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ErrorText({ show, children }: { show: boolean; children: React.ReactNode }) {
  if (!show) return null;
  return (
    <p style={{ marginTop: 4, fontSize: 11.5, color: "var(--rose, #B15169)" }}>{children}</p>
  );
}

function RequiredLabel({ label }: { label: string }) {
  return (
    <>
      {label} <span style={{ color: "var(--rose, #B15169)" }}>*</span>
    </>
  );
}

export default function CreateEnterpriseAdminModal({
  open,
  onClose,
  enterpriseId,
  enterpriseName,
  onCreated,
}: Props) {
  const toast = useToast();
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = <K extends keyof typeof form>(k: K, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const reset = () => {
    setForm(initialState);
    setSubmitted(false);
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const nameError = !form.name.trim() ? "Full name is required." : null;
  const emailError = !form.email.trim()
    ? "Email is required."
    : !EMAIL_RE.test(form.email.trim())
      ? "Enter a valid email address."
      : null;
  const passwordError = !form.password
    ? "Temporary password is required."
    : form.password.length < 8
      ? "Password must be at least 8 characters."
      : null;

  const hasErrors = Boolean(nameError || emailError || passwordError);

  const handleSubmit = async () => {
    if (!enterpriseId) return;
    setSubmitted(true);
    if (hasErrors) {
      toast.warning("Missing information", "Please fix the highlighted fields.");
      return;
    }
    setSubmitting(true);
    try {
      const admin = await createEnterpriseAdmin(enterpriseId, {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
      });
      toast.success("Admin created", `${admin.name} can now sign in.`);
      onCreated(admin);
      reset();
      onClose();
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && typeof err.response?.data?.detail === "string"
          ? err.response.data.detail
          : "Could not create admin. Please try again.";
      toast.error("Create failed", msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      eyebrow={enterpriseName ? `Enterprise · ${enterpriseName}` : "Enterprise"}
      title="Add Enterprise Admin"
      submitLabel={submitting ? "Creating..." : "Create Admin"}
      onSubmit={handleSubmit}
      footerHint="The admin can sign in via the customer login page."
    >
      <Field label={<RequiredLabel label="Full name" />}>
        <FieldInput
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Jane Doe"
          autoFocus
        />
        <ErrorText show={submitted && !!nameError}>{nameError}</ErrorText>
      </Field>
      <FieldRow>
        <Field label={<RequiredLabel label="Email" />}>
          <FieldInput
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="jane@acme.com"
          />
          <ErrorText show={submitted && !!emailError}>{emailError}</ErrorText>
        </Field>
        <Field label="Phone" hint="optional">
          <FieldInput
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="+1 555-0101"
          />
        </Field>
      </FieldRow>
      <Field label={<RequiredLabel label="Temporary password" />} hint="min 8 chars">
        <FieldInput
          type="password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          placeholder="••••••••"
        />
        <ErrorText show={submitted && !!passwordError}>{passwordError}</ErrorText>
      </Field>
    </Modal>
  );
}
