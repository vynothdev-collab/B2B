"use client";

import { useState } from "react";
import axios from "axios";
import Modal, { Field, FieldInput, FieldRow, FieldSelect, FieldTextarea } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { createEnterprise, type Enterprise } from "@/services/enterprises";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (ent: Enterprise) => void;
}

const initialState = {
  name: "",
  industry: "",
  website: "",
  country: "",
  size: "",
  phone: "",
  credits: "0",
  notes: "",
};

const REQUIRED_FIELDS = ["name", "industry", "country", "website", "phone", "size"] as const;
type RequiredField = typeof REQUIRED_FIELDS[number];

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

export default function CreateEnterpriseModal({ open, onClose, onCreated }: Props) {
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

  const missing = (f: RequiredField) => !form[f].trim();
  const hasErrors = REQUIRED_FIELDS.some(missing);

  const handleSubmit = async () => {
    setSubmitted(true);
    if (hasErrors) {
      toast.warning("Missing information", "Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const ent = await createEnterprise({
        name: form.name.trim(),
        industry: form.industry.trim(),
        website: form.website.trim(),
        country: form.country.trim(),
        size: form.size.trim(),
        phone: form.phone.trim(),
        credits: Number(form.credits) || 0,
        notes: form.notes.trim() || undefined,
      });
      toast.success("Enterprise created", `${ent.name} is ready.`);
      onCreated(ent);
      reset();
      onClose();
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && typeof err.response?.data?.detail === "string"
          ? err.response.data.detail
          : "Could not create enterprise. Please try again.";
      toast.error("Create failed", msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      eyebrow="Enterprises · new"
      title="Add Enterprise"
      submitLabel={submitting ? "Creating..." : "Create Enterprise"}
      onSubmit={handleSubmit}
    >
      <Field label={<RequiredLabel label="Company name" />}>
        <FieldInput
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Acme Corp"
          autoFocus
        />
        <ErrorText show={submitted && missing("name")}>Company name is required.</ErrorText>
      </Field>
      <FieldRow>
        <Field label={<RequiredLabel label="Industry" />}>
          <FieldInput
            value={form.industry}
            onChange={(e) => update("industry", e.target.value)}
            placeholder="Manufacturing"
          />
          <ErrorText show={submitted && missing("industry")}>Industry is required.</ErrorText>
        </Field>
        <Field label={<RequiredLabel label="Country" />}>
          <FieldInput
            value={form.country}
            onChange={(e) => update("country", e.target.value)}
            placeholder="United States"
          />
          <ErrorText show={submitted && missing("country")}>Country is required.</ErrorText>
        </Field>
      </FieldRow>
      <FieldRow>
        <Field label={<RequiredLabel label="Website" />}>
          <FieldInput
            value={form.website}
            onChange={(e) => update("website", e.target.value)}
            placeholder="acme.com"
          />
          <ErrorText show={submitted && missing("website")}>Website is required.</ErrorText>
        </Field>
        <Field label={<RequiredLabel label="Phone" />}>
          <FieldInput
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="+1 555-0100"
          />
          <ErrorText show={submitted && missing("phone")}>Phone is required.</ErrorText>
        </Field>
      </FieldRow>
      <FieldRow>
        <Field label={<RequiredLabel label="Company size" />}>
          <FieldSelect value={form.size} onChange={(e) => update("size", e.target.value)}>
            <option value="">Select…</option>
            <option value="1-10">1-10</option>
            <option value="11-50">11-50</option>
            <option value="51-200">51-200</option>
            <option value="201-500">201-500</option>
            <option value="500+">500+</option>
          </FieldSelect>
          <ErrorText show={submitted && missing("size")}>Company size is required.</ErrorText>
        </Field>
        <Field label="Starting credits">
          <FieldInput
            type="number"
            min={0}
            value={form.credits}
            onChange={(e) => update("credits", e.target.value)}
          />
        </Field>
      </FieldRow>
      <Field label="Notes" hint="optional">
        <FieldTextarea
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="Internal notes about this enterprise…"
        />
      </Field>
    </Modal>
  );
}
