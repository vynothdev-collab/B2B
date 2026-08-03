"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Coins, Search, X, User, Building2 } from "lucide-react";
import Modal, { Field, FieldInput } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import {
  addCreditsToUser,
  addCreditsToEnterprise,
  listIndividualCredits,
  listEnterpriseCredits,
} from "@/services/credits";
import { useDebounce } from "@/hooks/useDebounce";

interface Target {
  type: "individual" | "enterprise";
  id: string;
  name: string;
  sub?: string;
}

interface Props {
  open: boolean;
  target: Target | null;
  defaultType?: "individual" | "enterprise";
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddCreditsModal({
  open,
  target: fixedTarget,
  defaultType = "individual",
  onClose,
  onSuccess,
}: Props) {
  const toast = useToast();
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const type = fixedTarget?.type ?? defaultType;
  const isStandalone = fixedTarget === null;

  const [searchQ, setSearchQ] = useState("");
  const [results, setResults] = useState<{ id: string; name: string; sub: string }[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<Target | null>(null);
  const [searching, setSearching] = useState(false);
  const dSearchQ = useDebounce(searchQ, 300);

  const effectiveTarget = isStandalone ? selectedTarget : fixedTarget;
  const typeLabel = type === "individual" ? "Individual User" : "Enterprise";
  const TypeIcon = type === "individual" ? User : Building2;

  useEffect(() => {
    if (open) {
      setAmount("");
      setSearchQ("");
      setResults([]);
      setSelectedTarget(null);
    }
  }, [open]);

  const doSearch = useCallback(async () => {
    if (!isStandalone) return;
    setSearching(true);
    try {
      if (type === "individual") {
        const data = await listIndividualCredits({ q: dSearchQ || undefined, page_size: 8 });
        setResults(data.items.map((u) => ({ id: u.id, name: u.name, sub: u.email })));
      } else {
        const data = await listEnterpriseCredits({ q: dSearchQ || undefined, page_size: 8 });
        setResults(data.items.map((e) => ({ id: e.id, name: e.name, sub: e.plan })));
      }
    } catch {
      // ignore
    } finally {
      setSearching(false);
    }
  }, [isStandalone, type, dSearchQ]);

  useEffect(() => {
    if (open && isStandalone && !selectedTarget) {
      void doSearch();
    }
  }, [open, isStandalone, selectedTarget, doSearch]);

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const handleSubmit = async () => {
    if (!effectiveTarget) {
      toast.warning("No account selected", `Please select a ${typeLabel} first.`);
      return;
    }
    const credits = parseInt(amount, 10);
    if (!credits || credits <= 0) {
      toast.warning("Invalid amount", "Please enter a positive number of credits.");
      return;
    }
    setSubmitting(true);
    try {
      if (effectiveTarget.type === "individual") {
        await addCreditsToUser(effectiveTarget.id, { credits });
      } else {
        await addCreditsToEnterprise(effectiveTarget.id, { credits });
      }
      toast.success(
        "Credits added",
        `${credits.toLocaleString()} credits added to ${effectiveTarget.name}.`,
      );
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

  return (
    <Modal
      open={open}
      onClose={handleClose}
      eyebrow={`Credits & Usage · ${typeLabel}`}
      title={`Add Credits to ${typeLabel}`}
      submitLabel={submitting ? "Adding…" : "Add Credits"}
      onSubmit={handleSubmit}
      footerHint="Enter the number of credits to add to this account"
    >
      <div className="space-y-4">

        {/* ── Standalone: search + select ───────────────────────────── */}
        {isStandalone && (
          <div>
            <p
              className="mb-2 text-[10px] font-semibold uppercase tracking-wider"
              style={{ fontFamily: "var(--font-mono)", color: "var(--ink-faint)" }}
            >
              {type === "individual" ? "Select Individual User *" : "Select Enterprise *"}
            </p>

            {selectedTarget ? (
              /* Selected account card */
              <div
                className="flex items-center justify-between rounded-xl px-4 py-3"
                style={{ background: "rgba(23,50,41,.05)", border: "1.5px solid rgba(23,50,41,.20)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{ background: "rgba(23,50,41,.10)" }}
                  >
                    <TypeIcon className="h-4 w-4" style={{ color: "var(--forest)" }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                      {selectedTarget.name}
                    </p>
                    {selectedTarget.sub && (
                      <p className="text-xs mt-0.5" style={{ color: "var(--ink-faint)" }}>
                        {selectedTarget.sub}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setSelectedTarget(null); setSearchQ(""); }}
                  className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-slate-100"
                  style={{ color: "var(--ink-faint)" }}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              /* Search box + inline results */
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                {/* Search input */}
                <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2.5">
                  <Search className="h-4 w-4 shrink-0 text-slate-400" />
                  <input
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                    placeholder={
                      type === "individual" ? "Search by name or email…" : "Search enterprise name…"
                    }
                    className="flex-1 bg-transparent text-sm placeholder-slate-400 focus:outline-none"
                    style={{ color: "var(--ink)" }}
                    autoFocus
                  />
                  {searchQ && (
                    <button
                      type="button"
                      onClick={() => setSearchQ("")}
                      className="text-slate-300 hover:text-slate-500 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Results list — inline, no absolute positioning */}
                <div className="overflow-y-auto" style={{ maxHeight: 180 }}>
                  {searching && (
                    <div className="px-4 py-3 text-xs text-slate-400">Searching…</div>
                  )}
                  {!searching && results.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <TypeIcon className="h-6 w-6 text-slate-200 mb-2" />
                      <p className="text-xs text-slate-400">No {typeLabel.toLowerCase()}s found</p>
                    </div>
                  )}
                  {!searching &&
                    results.map((r, i) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSelectedTarget({ type, id: r.id, name: r.name, sub: r.sub })}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
                        style={{ borderTop: i === 0 ? "none" : "1px solid #f1f5f9" }}
                      >
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                          style={{
                            background: type === "individual" ? "rgba(23,50,41,.08)" : "var(--gold-dim)",
                            color: type === "individual" ? "var(--forest)" : "#8A6222",
                            fontFamily: "var(--font-fraunces)",
                          }}
                        >
                          {r.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-800">{r.name}</p>
                          <p className="truncate text-xs text-slate-400">{r.sub}</p>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Fixed target (called from a row action) ───────────────── */}
        {!isStandalone && (
          <div
            className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: "rgba(23,50,41,.05)", border: "1px solid rgba(23,50,41,.10)" }}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              style={{ background: "rgba(23,50,41,.10)" }}
            >
              <Coins className="h-4 w-4" style={{ color: "var(--forest)" }} />
            </div>
            <div>
              <p className="text-xs font-semibold" style={{ color: "var(--ink-faint)" }}>
                Adding credits to
              </p>
              <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                {fixedTarget?.name}{" "}
                <span style={{ color: "var(--ink-faint)", fontWeight: 400 }}>({typeLabel})</span>
              </p>
            </div>
          </div>
        )}

        {/* ── Amount ───────────────────────────────────────────────── */}
        <Field label="Amount *">
          <FieldInput
            type="number"
            min={1}
            value={amount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
            placeholder="e.g. 500"
            autoFocus={!isStandalone}
          />
        </Field>

      </div>
    </Modal>
  );
}
