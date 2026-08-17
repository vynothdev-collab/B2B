"use client";
import { useEffect, useState } from "react";
import { X, Loader2, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import {
  getInstantlyCampaigns,
  pushToInstantly,
  type InstantlyCampaign,
  type InstantlyPushItemResult,
} from "@/lib/instantlyApi";
import { toast } from "@/lib/toast";

const BLUE = "#1a56db";

interface Props {
  open: boolean;
  onClose: () => void;
  items: { record_id: string; item_type: "person" }[];
  onPushed?: () => void;
}

export default function PushToInstantlyModal({ open, onClose, items, onPushed }: Props) {
  const [campaigns, setCampaigns] = useState<InstantlyCampaign[]>([]);
  const [campaignId, setCampaignId] = useState("");
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [result, setResult] = useState<{
    pushed: number;
    failed: number;
    results: InstantlyPushItemResult[];
  } | null>(null);

  useEffect(() => {
    if (!open) {
      setResult(null);
      setCampaignId("");
      return;
    }
    setLoadingCampaigns(true);
    getInstantlyCampaigns()
      .then((cs) => setCampaigns(cs))
      .catch(() => toast.error("Failed to load Instantly campaigns."))
      .finally(() => setLoadingCampaigns(false));
  }, [open]);

  if (!open) return null;

  async function handlePush() {
    if (!campaignId) return;
    setPushing(true);
    try {
      const res = await pushToInstantly(
        items.map((i) => ({ record_id: i.record_id, item_type: i.item_type, data: {} })),
        campaignId,
      );
      setResult(res);
      if (res.pushed > 0 && res.failed === 0) {
        toast.success(`Pushed ${res.pushed} lead${res.pushed !== 1 ? "s" : ""} to Instantly.`);
      }
      if (res.pushed > 0) onPushed?.();
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
          <h2 className="text-sm font-semibold text-gray-900">Push to Instantly</h2>
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
                {items.length} record{items.length !== 1 ? "s" : ""} selected. Only
                records with an unlocked work email will be added as Instantly
                leads.
              </p>

              <label className="mt-3 block text-xs font-medium text-gray-600">
                Campaign
              </label>
              {loadingCampaigns ? (
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading campaigns…
                </div>
              ) : (
                <select
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 py-2.5 px-3 text-sm text-gray-900 outline-none transition-colors focus:border-gray-400"
                >
                  <option value="">Select a campaign…</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}

              <button
                type="button"
                onClick={handlePush}
                disabled={pushing || !campaignId}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-60"
                style={{ background: BLUE }}
              >
                {pushing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {pushing ? "Pushing…" : "Push to Instantly"}
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
