"use client";

import { useState } from "react";
import axios from "axios";
import Modal, { Field, FieldInput, FieldRow } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { createPlan, type Plan } from "@/services/plans";

interface Props {
  open: boolean;
  target: "individual" | "enterprise";
  onClose: () => void;
  onCreated: (plan: Plan) => void;
}

type PlanType = "validity" | "payg";

const initialState = {
  name: "",
  description: "",
  plan_type: "validity" as PlanType,
  credits: "",
  validity_days: "",
  price_dollars: "",
};

function ErrorText({ show, children }: { show: boolean; children: React.ReactNode }) {
  if (!show) return null;
  return <p style={{ marginTop: 4, fontSize: 11.5, color: "var(--rose, #B15169)" }}>{children}</p>;
}

function RequiredLabel({ label }: { label: string }) {
  return (
    <>
      {label} <span style={{ color: "var(--rose, #B15169)" }}>*</span>
    </>
  );
}

const PLAN_TYPE_OPTIONS: { value: PlanType; label: string; sub: string }[] = [
  { value: "validity", label: "Validity", sub: "Credits expire after N days" },
  { value: "payg", label: "Pay-as-you-go", sub: "Credits never expire" },
];

export default function CreatePlanModal({ open, target, onClose, onCreated }: Props) {
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

  const nameError = !form.name.trim() ? "Plan name is required." : null;
  const creditsError =
    !form.credits.trim() || isNaN(Number(form.credits)) || Number(form.credits) < 1
      ? "Credits must be a positive number."
      : null;
  const validityDaysError =
    form.plan_type === "validity" &&
    (!form.validity_days.trim() || isNaN(Number(form.validity_days)) || Number(form.validity_days) < 1)
      ? "Validity days must be a positive number."
      : null;
  const priceError =
    form.price_dollars.trim() !== "" &&
    (isNaN(Number(form.price_dollars)) || Number(form.price_dollars) < 0)
      ? "Price must be 0 or a positive number."
      : null;

  const hasErrors = !!(nameError || creditsError || validityDaysError || priceError);

  const handleSubmit = async () => {
    setSubmitted(true);
    if (hasErrors) return;

    setSubmitting(true);
    try {
      const price_cents = form.price_dollars.trim()
        ? Math.round(Number(form.price_dollars) * 100)
        : 0;
      const plan = await createPlan({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        plan_type: form.plan_type,
        target,
        credits: Number(form.credits),
        validity_days: form.plan_type === "validity" ? Number(form.validity_days) : undefined,
        price_cents,
      });
      toast.success(`Plan "${plan.name}" created successfully.`);
      onCreated(plan);
      reset();
      onClose();
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.detail ?? "Failed to create plan.")
        : "Failed to create plan.";
      toast.error(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const accentColor = target === "individual" ? "var(--forest)" : "var(--gold)";
  const accentDim   = target === "individual" ? "rgba(23,50,41,.08)" : "var(--gold-dim)";

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`Create ${target === "individual" ? "Individual" : "Enterprise"} Plan`}
      submitLabel={submitting ? "Creating…" : "Create Plan"}
      onSubmit={handleSubmit}
    >
      {/* Plan Name */}
      <Field label={<RequiredLabel label="Plan Name" />}>
        <FieldInput
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="e.g. Starter Pack"
          disabled={submitting}
        />
        <ErrorText show={submitted && !!nameError}>{nameError}</ErrorText>
      </Field>

      {/* Plan Type — card toggle */}
      <Field label="Plan Type">
        <div className="grid grid-cols-2 gap-2 mt-1">
          {PLAN_TYPE_OPTIONS.map((opt) => {
            const active = form.plan_type === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => !submitting && update("plan_type", opt.value)}
                className="flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2.5 text-left transition-all"
                style={{
                  borderColor: active ? accentColor : "var(--line)",
                  background: active ? accentDim : "white",
                  opacity: submitting ? 0.6 : 1,
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
              >
                <span
                  className="text-sm font-medium"
                  style={{ color: active ? accentColor : "var(--ink)" }}
                >
                  {opt.label}
                </span>
                <span className="text-xs" style={{ color: "var(--ink-faint)" }}>
                  {opt.sub}
                </span>
              </button>
            );
          })}
        </div>
      </Field>

      {/* Credits + Validity Days */}
      <FieldRow>
        <Field label={<RequiredLabel label="Credits" />}>
          <FieldInput
            type="number"
            min={1}
            value={form.credits}
            onChange={(e) => update("credits", e.target.value)}
            placeholder="e.g. 500"
            disabled={submitting}
          />
          <ErrorText show={submitted && !!creditsError}>{creditsError}</ErrorText>
        </Field>

        {form.plan_type === "validity" ? (
          <Field label={<RequiredLabel label="Validity Days" />}>
            <FieldInput
              type="number"
              min={1}
              value={form.validity_days}
              onChange={(e) => update("validity_days", e.target.value)}
              placeholder="e.g. 30"
              disabled={submitting}
            />
            <ErrorText show={submitted && !!validityDaysError}>{validityDaysError}</ErrorText>
          </Field>
        ) : (
          <Field label="Validity">
            <FieldInput value="Lifetime — no expiry" disabled />
          </Field>
        )}
      </FieldRow>

      {/* Price */}
      <Field label="Price (USD)">
        <FieldInput
          type="number"
          min={0}
          step="0.01"
          value={form.price_dollars}
          onChange={(e) => update("price_dollars", e.target.value)}
          placeholder="0.00 for free"
          disabled={submitting}
        />
        <ErrorText show={submitted && !!priceError}>{priceError}</ErrorText>
      </Field>

      {/* Description */}
      <Field label="Description">
        <textarea
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Optional short description shown to users"
          disabled={submitting}
          rows={2}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder-slate-400 focus:outline-none resize-none"
          style={{ fontSize: 13 }}
        />
      </Field>
    </Modal>
  );
}
