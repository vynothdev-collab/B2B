"use client";

import { useState } from "react";
import axios from "axios";
import { Coins } from "lucide-react";
import Modal, { Field, FieldInput } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { addCreditsToUser, addCreditsToEnterprise } from "@/services/credits";

interface Props {
  open: boolean;
  target: { type: "individual" | "enterprise"; id: string; name: string } | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddCreditsModal({ open, target, onClose, onSuccess }: Props) {
  const toast = useToast();
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    if (submitting) return;
    setAmount("");
    onClose();
  };

  const handleSubmit = async () => {
    const credits = parseInt(amount, 10);
    if (!credits || credits <= 0) {
      toast.warning("Invalid amount", "Please enter a positive number of credits.");
      return;
    }
    setSubmitting(true);
    try {
      if (target!.type === "individual") {
        await addCreditsToUser(target!.id, { credits });
      } else {
        await addCreditsToEnterprise(target!.id, { credits });
      }
      toast.success(
        "Credits added",
        `${credits.toLocaleString()} credits added to ${target!.name}.`,
      );
      setAmount("");
      onSuccess();
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && typeof err.response?.data?.detail === "string"
          ? err.response.data.detail
          : "Could not add credits. Please try again.";
      toast.error("Failed to add credits", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const label = target?.type === "enterprise" ? "Enterprise" : "User";

  return (
    <Modal
      open={open}
      onClose={handleClose}
      eyebrow={`Credits & Usage · add`}
      title={`Add Credits to ${target?.name ?? label}`}
      submitLabel={submitting ? "Adding…" : "Add Credits"}
      onSubmit={handleSubmit}
      footerHint="Enter the number of credits to add to this account"
    >
      <div className="space-y-4">
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3"
          style={{ background: "rgba(23,50,41,.05)", border: "1px solid rgba(23,50,41,.10)" }}
        >
          <Coins className="h-4 w-4 shrink-0" style={{ color: "var(--forest)" }} />
          <div>
            <p className="text-xs font-semibold" style={{ color: "var(--ink-faint)" }}>
              Adding credits to
            </p>
            <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>
              {target?.name} <span style={{ color: "var(--ink-faint)", fontWeight: 400 }}>({label})</span>
            </p>
          </div>
        </div>

        <Field label="Amount *">
          <FieldInput
            type="number"
            min={1}
            value={amount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
            placeholder="e.g. 500"
            autoFocus
          />
        </Field>
      </div>
    </Modal>
  );
}
