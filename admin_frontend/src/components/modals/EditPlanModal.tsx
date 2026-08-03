"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Modal, { Field, FieldInput, FieldRow } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { editPlan, type Plan } from "@/services/plans";

interface Props {
  open: boolean;
  plan: Plan | null;
  onClose: () => void;
  onUpdated: (plan: Plan) => void;
}

export default function EditPlanModal({ open, plan, onClose, onUpdated }: Props) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceDollars, setPriceDollars] = useState("");
  const [credits, setCredits] = useState("");
  const [validityDays, setValidityDays] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (plan) {
      setName(plan.name);
      setDescription(plan.description ?? "");
      setPriceDollars(plan.price_cents > 0 ? (plan.price_cents / 100).toFixed(2) : "");
      setCredits(String(plan.credits));
      setValidityDays(plan.validity_days ? String(plan.validity_days) : "");
      setSubmitted(false);
    }
  }, [plan]);

  const nameError = !name.trim() ? "Plan name is required." : null;
  const creditsError =
    !credits.trim() || isNaN(Number(credits)) || Number(credits) < 1
      ? "Credits must be a positive number."
      : null;
  const validityDaysError =
    plan?.plan_type === "validity" &&
    (!validityDays.trim() || isNaN(Number(validityDays)) || Number(validityDays) < 1)
      ? "Validity days must be a positive number."
      : null;

  const hasErrors = !!(nameError || creditsError || validityDaysError);

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const handleSubmit = async () => {
    if (!plan) return;
    setSubmitted(true);
    if (hasErrors) return;

    setSubmitting(true);
    try {
      const price_cents = priceDollars.trim()
        ? Math.round(Number(priceDollars) * 100)
        : 0;
      const updated = await editPlan(plan.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        price_cents,
        credits: Number(credits),
        validity_days: plan.plan_type === "validity" ? Number(validityDays) : undefined,
      });
      toast.success(`Plan "${updated.name}" updated.`);
      onUpdated(updated);
      onClose();
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.detail ?? "Failed to update plan.")
        : "Failed to update plan.";
      toast.error(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  function ErrorText({ show, children }: { show: boolean; children: React.ReactNode }) {
    if (!show) return null;
    return <p style={{ marginTop: 4, fontSize: 11.5, color: "var(--rose, #B15169)" }}>{children}</p>;
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`Edit Plan — ${plan?.name ?? ""}`}
      submitLabel={submitting ? "Saving…" : "Save Changes"}
      onSubmit={handleSubmit}
    >
      <Field label="Plan Name">
        <FieldInput
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={submitting}
        />
        <ErrorText show={submitted && !!nameError}>{nameError}</ErrorText>
      </Field>

      <FieldRow>
        <Field label="Credits">
          <FieldInput
            type="number"
            min={1}
            value={credits}
            onChange={(e) => setCredits(e.target.value)}
            disabled={submitting}
          />
          <ErrorText show={submitted && !!creditsError}>{creditsError}</ErrorText>
        </Field>

        {plan?.plan_type === "validity" ? (
          <Field label="Validity Days">
            <FieldInput
              type="number"
              min={1}
              value={validityDays}
              onChange={(e) => setValidityDays(e.target.value)}
              disabled={submitting}
            />
            <ErrorText show={submitted && !!validityDaysError}>{validityDaysError}</ErrorText>
          </Field>
        ) : (
          <Field label="Validity">
            <FieldInput value="Lifetime (no expiry)" disabled />
          </Field>
        )}
      </FieldRow>

      <Field label="Price (USD)">
        <FieldInput
          type="number"
          min={0}
          step="0.01"
          value={priceDollars}
          onChange={(e) => setPriceDollars(e.target.value)}
          placeholder="0.00 for free"
          disabled={submitting}
        />
      </Field>

      <Field label="Description">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={submitting}
          rows={2}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder-slate-400 focus:outline-none resize-none"
          style={{ fontSize: 13 }}
        />
      </Field>
    </Modal>
  );
}
