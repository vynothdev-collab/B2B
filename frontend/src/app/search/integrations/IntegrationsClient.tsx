"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plug, Loader2, ExternalLink, ShieldCheck, LogOut, AlertCircle, Upload,
} from "lucide-react";
import AppHeader from "@/components/layout/AppHeader";
import {
  getSalesforceStatus,
  getSalesforceAuthorizeUrl,
  disconnectSalesforce,
  type SalesforceStatus,
} from "@/lib/salesforceApi";
import { toast } from "@/lib/toast";

const RED = "#dc2626";

const FEATURES = [
  {
    icon: Upload,
    title: "Push unlocked leads",
    text: "Send a person record straight to Salesforce as a Lead, from search results or a contact's detail panel.",
  },
  {
    icon: ShieldCheck,
    title: "Email required first",
    text: "A record's work email must be unlocked before it can be pushed — Salesforce Leads require an email.",
  },
];

export default function IntegrationsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<SalesforceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSalesforceStatus();
      setStatus(data);
    } catch {
      toast.error("Failed to load Salesforce connection status.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");
    if (connected === "salesforce") {
      toast.success("Salesforce connected successfully.");
      router.replace("/search/integrations");
    } else if (error) {
      const messages: Record<string, string> = {
        cancelled: "Salesforce connection was cancelled.",
        invalid_state: "Salesforce connection request expired. Please try again.",
        auth_failed: "Failed to connect to Salesforce. This usually means the connected app isn't configured correctly (check the redirect URI, client ID/secret, or org access policy).",
      };
      toast.error(messages[error] ?? "Failed to connect to Salesforce.");
      router.replace("/search/integrations");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function handleConnect() {
    setConnecting(true);
    try {
      const url = await getSalesforceAuthorizeUrl();
      window.location.href = url;
    } catch {
      toast.error("Failed to start Salesforce connection.");
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    setDisconnecting(true);
    try {
      await disconnectSalesforce();
      toast.success("Salesforce disconnected.");
      setShowDisconnectConfirm(false);
      await load();
    } catch {
      toast.error("Failed to disconnect Salesforce.");
    } finally {
      setDisconnecting(false);
    }
  }

  const connected = !!status?.connected;

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto bg-gray-50">
      <AppHeader title="Integrations" />

      <div className="mx-auto w-full max-w-6xl flex-1 space-y-5 p-4 sm:p-6">
        <div className="rounded-2xl border border-red-100 bg-white p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50">
                <Plug className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Integrations</h1>
                <p className="mt-1 max-w-2xl text-base leading-relaxed text-gray-500">
                  Connect LeadsBuddy to the tools your team already uses. Push
                  unlocked contacts straight into your CRM without leaving search.
                </p>
                <a
                  href="/document/api-key/salesforce"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-base font-semibold text-red-600 hover:underline"
                >
                  View Salesforce setup guide <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4">
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-gray-100" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-32 animate-pulse rounded bg-gray-100" />
              <div className="h-3 w-48 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-white p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3.5">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    connected ? "bg-emerald-50" : "bg-gray-100"
                  }`}
                >
                  <SalesforceCloudIcon className={connected ? "text-emerald-600" : "text-gray-400"} />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-bold text-gray-900">Salesforce</p>
                    {connected ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                        <ShieldCheck className="h-3 w-3" /> Connected
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500">
                        Not connected
                      </span>
                    )}
                  </div>
                  {connected ? (
                    <p className="mt-0.5 text-sm text-gray-400">
                      {status?.salesforce_user_email ?? "Connected account"}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-sm text-gray-400">
                      Push unlocked leads to your Salesforce org.
                    </p>
                  )}
                </div>
              </div>

              {connected ? (
                <button
                  onClick={() => setShowDisconnectConfirm(true)}
                  className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg px-3 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 sm:self-center"
                >
                  <LogOut className="h-3.5 w-3.5" /> Disconnect
                </button>
              ) : (
                <button
                  onClick={handleConnect}
                  disabled={connecting}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-base font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
                  style={{ background: RED }}
                >
                  {connecting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Connect to Salesforce
                </button>
              )}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 border-t border-gray-100 pt-5 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <div key={f.title} className="flex gap-2.5">
                  <f.icon className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">{f.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-gray-500">{f.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showDisconnectConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <h2 className="mt-3 text-lg font-bold text-gray-900">Disconnect Salesforce?</h2>
            <p className="mt-1 text-sm text-gray-500">
              You won&apos;t be able to push leads to Salesforce until you reconnect.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowDisconnectConfirm(false)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: RED }}
              >
                {disconnecting && <Loader2 className="h-4 w-4 animate-spin" />}
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SalesforceCloudIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M9.5 6.5a4 4 0 0 1 6.8-2.4 3 3 0 0 1 4.4 3.6A3.5 3.5 0 0 1 19 14H7a4 4 0 0 1-1-7.9 4 4 0 0 1 3.5.4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
