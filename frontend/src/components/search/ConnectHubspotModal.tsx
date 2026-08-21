"use client";
import { useState } from "react";
import { X, Loader2, KeyRound } from "lucide-react";
import { connectHubspot } from "@/lib/hubspotApi";
import { toast } from "@/lib/toast";

interface Props {
  open: boolean;
  onClose: () => void;
  onConnected: () => void;
}

const ORANGE = "#ff7a59";

export default function ConnectHubspotModal({ open, onClose, onConnected }: Props) {
  const [apiKey, setApiKey] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleConnect() {
    if (!apiKey.trim() || connecting) return;
    setConnecting(true);
    setError(null);
    try {
      await connectHubspot(apiKey.trim());
      toast.success("HubSpot connected successfully.");
      setApiKey("");
      onConnected();
      onClose();
    } catch (e) {
      const res = (e as { response?: { data?: { detail?: string } } })?.response;
      setError(res?.data?.detail ?? "Failed to connect. Check your API key and try again.");
    } finally {
      setConnecting(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-1.5rem)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5">
          <h2 className="text-sm font-semibold text-gray-900">Connect HubSpot</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-4 py-4">
          <p className="text-xs leading-snug text-gray-500">
            Paste the access token from a HubSpot private app. See{" "}
            <a
              href="/document/api-key/hubspot"
              className="font-semibold hover:underline"
              style={{ color: ORANGE }}
            >
              how to get your HubSpot API key
            </a>
            .
          </p>

          <div className="relative mt-3">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="HubSpot access token (pat-...)"
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none transition-colors focus:border-gray-400"
              autoFocus
            />
          </div>

          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

          <button
            type="button"
            onClick={handleConnect}
            disabled={connecting || !apiKey.trim()}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-60"
            style={{ background: ORANGE }}
          >
            {connecting && <Loader2 className="h-4 w-4 animate-spin" />}
            {connecting ? "Connecting…" : "Connect"}
          </button>
        </div>
      </div>
    </>
  );
}
