"use client";
import { useEffect, useState } from "react";
import { X, Loader2, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { pushToSalesforce, type SalesforcePushItemResult } from "@/lib/salesforceApi";
import { toast } from "@/lib/toast";

interface Props {
  open: boolean;
  onClose: () => void;
  items: { record_id: string; item_type: "person" | "company" }[];
}

export default function PushToSalesforceModal({ open, onClose, items }: Props) {
  const itemType = items[0]?.item_type ?? "person";
  const [pushing, setPushing] = useState(false);
  const [result, setResult] = useState<{
    pushed: number;
    failed: number;
    results: SalesforcePushItemResult[];
  } | null>(null);

  useEffect(() => {
    if (!open) setResult(null);
  }, [open]);

  if (!open) return null;

  async function handlePush() {
    setPushing(true);
    try {
      const res = await pushToSalesforce(
        items.map((i) => ({ record_id: i.record_id, item_type: i.item_type, data: {} })),
      );
      setResult(res);
      if (res.pushed > 0 && res.failed === 0) {
        const noun = itemType === "company" ? "account" : "lead";
        toast.success(`Pushed ${res.pushed} ${noun}${res.pushed !== 1 ? "s" : ""} to Salesforce.`);
      }
    } catch (e) {
      toast.apiError(e);
    } finally {
      setPushing(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-1.5rem)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5">
          <h2 className="text-sm font-semibold text-gray-900">Push to Salesforce</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-4 py-4">
          {!result ? (
            <>
              <p className="text-xs leading-snug text-gray-500">
                {items.length} record{items.length !== 1 ? "s" : ""} selected.{" "}
                {itemType === "company"
                  ? "Records will be pushed as Salesforce Accounts."
                  : "Only records with an unlocked work email will be pushed as Salesforce Leads."}
              </p>
              <button
                type="button"
                onClick={handlePush}
                disabled={pushing}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-60"
              >
                {pushing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {pushing ? "Pushing…" : "Push to Salesforce"}
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5 text-xs">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                <span className="text-gray-700">{result.pushed} pushed</span>
                {result.failed > 0 && (
                  <>
                    <span className="text-gray-300">·</span>
                    <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
                    <span className="text-gray-700">{result.failed} failed</span>
                  </>
                )}
              </div>
              {result.failed > 0 && (
                <div className="mt-3 max-h-40 space-y-1.5 overflow-y-auto">
                  {result.results
                    .filter((r) => r.error)
                    .map((r) => (
                      <p key={r.record_id} className="text-[11px] text-amber-700">
                        {r.error}
                      </p>
                    ))}
                </div>
              )}
              <button
                type="button"
                onClick={onClose}
                className="mt-4 w-full rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
