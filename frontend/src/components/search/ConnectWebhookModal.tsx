"use client";
import { useState } from "react";
import { X, Loader2, Link2, Copy, Check, AlertTriangle } from "lucide-react";
import { connectWebhook } from "@/lib/webhookApi";
import { toast } from "@/lib/toast";

interface Props {
  open: boolean;
  onClose: () => void;
  onConnected: () => void;
}

const PURPLE = "#7c3aed";

export default function ConnectWebhookModal({ open, onClose, onConnected }: Props) {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleClose() {
    setWebhookUrl("");
    setError(null);
    setSecret(null);
    setCopied(false);
    onClose();
  }

  if (!open) return null;

  async function handleConnect() {
    if (!webhookUrl.trim() || connecting) return;
    setConnecting(true);
    setError(null);
    try {
      const res = await connectWebhook(webhookUrl.trim());
      setSecret(res.signing_secret);
      onConnected();
    } catch (e) {
      const res = (e as { response?: { data?: { detail?: string } } })?.response;
      setError(res?.data?.detail ?? "Failed to connect. Check the URL and try again.");
    } finally {
      setConnecting(false);
    }
  }

  async function handleCopy() {
    if (!secret) return;
    await navigator.clipboard.writeText(secret);
    setCopied(true);
    toast.success("Signing secret copied.");
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={secret ? undefined : handleClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-1.5rem)] max-w-[440px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5">
          <h2 className="text-sm font-semibold text-gray-900">
            {secret ? "Connected" : "Connect Custom CRM (Webhook)"}
          </h2>
          {!secret && (
            <button
              type="button"
              onClick={handleClose}
              className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="px-4 py-4">
          {!secret ? (
            <>
              <p className="text-xs leading-snug text-gray-500">
                Paste a webhook URL — a Zapier/Make/n8n catch hook, or a
                direct endpoint on your own CRM or middleware. We&apos;ll send
                a test ping to confirm it works before saving.
              </p>

              <div className="relative mt-3">
                <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                  className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none transition-colors focus:border-gray-400"
                  autoFocus
                />
              </div>

              {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

              <button
                type="button"
                onClick={handleConnect}
                disabled={connecting || !webhookUrl.trim()}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-60"
                style={{ background: PURPLE }}
              >
                {connecting && <Loader2 className="h-4 w-4 animate-spin" />}
                {connecting ? "Testing & connecting…" : "Connect"}
              </button>
            </>
          ) : (
            <>
              <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  Copy this signing secret now — it won&apos;t be shown again.
                  Use it to verify the <code>X-LeadsBuddy-Signature</code> header
                  on incoming requests.
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5">
                <code className="flex-1 truncate text-xs text-gray-700">{secret}</code>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="shrink-0 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="mt-4 w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90"
                style={{ background: PURPLE }}
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
