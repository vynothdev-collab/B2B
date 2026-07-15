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
  plan: "Business",
  credits: "0",
  monthly_limit: "20000",
  status: "active",
  notes: "",
};

export default function CreateEnterpriseModal({ open, onClose, onCreated }: Props) {
  const toast = useToast();
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof typeof form>(k: K, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const reset = () => setForm(initialState);

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.warning("Missing name", "Enterprise name is required.");
      return;
    }
    setSubmitting(true);
    try {
      const ent = await createEnterprise({
        name: form.name.trim(),
        industry: form.industry.trim() || undefined,
        website: form.website.trim() || undefined,
        country: form.country.trim() || undefined,
        size: form.size.trim() || undefined,
        phone: form.phone.trim() || undefined,
        plan: form.plan,
        credits: Number(form.credits) || 0,
        monthly_limit: Number(form.monthly_limit) || 0,
        status: form.status as "active" | "suspended" | "inactive",
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
      <Field label="Company name">
        <FieldInput
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Acme Corp"
          autoFocus
        />
      </Field>
      <FieldRow>
        <Field label="Industry">
          <FieldInput
            value={form.industry}
            onChange={(e) => update("industry", e.target.value)}
            placeholder="Manufacturing"
          />
        </Field>
        <Field label="Country">
          <FieldInput
            value={form.country}
            onChange={(e) => update("country", e.target.value)}
            placeholder="United States"
          />
        </Field>
      </FieldRow>
      <FieldRow>
        <Field label="Website">
          <FieldInput
            value={form.website}
            onChange={(e) => update("website", e.target.value)}
            placeholder="acme.com"
          />
        </Field>
        <Field label="Phone">
          <FieldInput
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="+1 555-0100"
          />
        </Field>
      </FieldRow>
      <FieldRow>
        <Field label="Company size">
          <FieldSelect value={form.size} onChange={(e) => update("size", e.target.value)}>
            <option value="">Select…</option>
            <option value="1-10">1-10</option>
            <option value="11-50">11-50</option>
            <option value="51-200">51-200</option>
            <option value="201-500">201-500</option>
            <option value="500+">500+</option>
          </FieldSelect>
        </Field>
        <Field label="Plan">
          <FieldSelect value={form.plan} onChange={(e) => update("plan", e.target.value)}>
            <option>Business</option>
            <option>Pro</option>
            <option>Enterprise</option>
          </FieldSelect>
        </Field>
      </FieldRow>
      <FieldRow>
        <Field label="Starting credits">
          <FieldInput
            type="number"
            min={0}
            value={form.credits}
            onChange={(e) => update("credits", e.target.value)}
          />
        </Field>
        <Field label="Monthly limit">
          <FieldInput
            type="number"
            min={0}
            value={form.monthly_limit}
            onChange={(e) => update("monthly_limit", e.target.value)}
          />
        </Field>
      </FieldRow>
      <Field label="Status">
        <FieldSelect value={form.status} onChange={(e) => update("status", e.target.value)}>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="inactive">Inactive</option>
        </FieldSelect>
      </Field>
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
