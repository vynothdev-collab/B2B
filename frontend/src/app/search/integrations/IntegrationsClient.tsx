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
import {
  getHubspotStatus,
  disconnectHubspot,
  type HubspotStatus,
} from "@/lib/hubspotApi";
import ConnectHubspotModal from "@/components/search/ConnectHubspotModal";
import { getInstantlyStatus, disconnectInstantly, type InstantlyStatus } from "@/lib/instantlyApi";
import ConnectInstantlyModal from "@/components/search/ConnectInstantlyModal";
import { getCalendlyStatus, disconnectCalendly, type CalendlyStatus } from "@/lib/calendlyApi";
import ConnectCalendlyModal from "@/components/search/ConnectCalendlyModal";
import { getSmartreachStatus, disconnectSmartreach, type SmartreachStatus } from "@/lib/smartreachApi";
import ConnectSmartreachModal from "@/components/search/ConnectSmartreachModal";
import { toast } from "@/lib/toast";

const RED = "#dc2626";
const ORANGE = "#ff7a59";
const BLUE = "#1a56db";
const CALENDLY_BLUE = "#006bff";
const GREEN = "#00b67a";

const SALESFORCE_FEATURES = [
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

const HUBSPOT_FEATURES = [
  {
    icon: Upload,
    title: "Push unlocked leads",
    text: "Send a person record straight to HubSpot as a Contact, from search results or a contact's detail panel.",
  },
  {
    icon: ShieldCheck,
    title: "Email required first",
    text: "A record's work email must be unlocked before it can be pushed — HubSpot Contacts are matched by email.",
  },
];

const INSTANTLY_FEATURES = [
  {
    icon: Upload,
    title: "Add leads to a campaign",
    text: "Send unlocked people straight into an Instantly outreach campaign of your choice, from search results or a contact's detail panel.",
  },
  {
    icon: ShieldCheck,
    title: "Email required first",
    text: "A record's work email must be unlocked before it can be added — Instantly leads are matched by email.",
  },
];

const SMARTREACH_FEATURES = [
  {
    icon: Upload,
    title: "Add prospects to a campaign",
    text: "Send unlocked people straight into a Smartreach outreach campaign of your choice, from search results or a contact's detail panel.",
  },
  {
    icon: ShieldCheck,
    title: "Email required first",
    text: "A record's work email must be unlocked before it can be added — Smartreach prospects are matched by email.",
  },
];

const CALENDLY_FEATURES = [
  {
    icon: Upload,
    title: "Auto-attached to pushes",
    text: "Your scheduling link is added to Salesforce and Instantly pushes automatically, so recipients can self-book a meeting.",
  },
  {
    icon: ShieldCheck,
    title: "No extra credits",
    text: "Connecting Calendly and attaching your link is free — it enriches a push you're already paying for.",
  },
];

interface ConnectionCardProps {
  name: string;
  accent: string;
  icon: React.ReactNode;
  connected: boolean;
  loading: boolean;
  connecting: boolean;
  subtitle: string;
  docsHref: string;
  features: typeof SALESFORCE_FEATURES;
  onConnect: () => void;
  onDisconnectRequest: () => void;
}

function ConnectionCard({
  name, accent, icon, connected, loading, connecting, subtitle, docsHref, features, onConnect, onDisconnectRequest,
}: ConnectionCardProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4">
        <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-gray-100" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-32 animate-pulse rounded bg-gray-100" />
          <div className="h-3 w-48 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              connected ? "bg-emerald-50" : "bg-gray-100"
            }`}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-bold text-gray-900">{name}</p>
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
            <p className="mt-0.5 text-sm text-gray-400">{subtitle}</p>
            <a
              href={docsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-sm font-semibold hover:underline"
              style={{ color: accent }}
            >
              View setup guide <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {connected ? (
          <button
            onClick={onDisconnectRequest}
            className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg px-3 py-1.5 text-sm font-semibold transition hover:bg-red-50 sm:self-center"
            style={{ color: RED }}
          >
            <LogOut className="h-3.5 w-3.5" /> Disconnect
          </button>
        ) : (
          <button
            onClick={onConnect}
            disabled={connecting}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-base font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
            style={{ background: accent }}
          >
            {connecting && <Loader2 className="h-4 w-4 animate-spin" />}
            Connect to {name}
          </button>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 border-t border-gray-100 pt-5 sm:grid-cols-2">
        {features.map((f) => (
          <div key={f.title} className="flex gap-2.5">
            <f.icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: accent }} />
            <div>
              <p className="text-sm font-bold text-gray-900">{f.title}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-gray-500">{f.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function IntegrationsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sfStatus, setSfStatus] = useState<SalesforceStatus | null>(null);
  const [sfLoading, setSfLoading] = useState(true);
  const [sfConnecting, setSfConnecting] = useState(false);
  const [sfDisconnecting, setSfDisconnecting] = useState(false);
  const [showSfDisconnectConfirm, setShowSfDisconnectConfirm] = useState(false);

  const [hsStatus, setHsStatus] = useState<HubspotStatus | null>(null);
  const [hsLoading, setHsLoading] = useState(true);
  const [hsDisconnecting, setHsDisconnecting] = useState(false);
  const [showHsDisconnectConfirm, setShowHsDisconnectConfirm] = useState(false);
  const [showHsConnectModal, setShowHsConnectModal] = useState(false);

  const [inStatus, setInStatus] = useState<InstantlyStatus | null>(null);
  const [inLoading, setInLoading] = useState(true);
  const [inDisconnecting, setInDisconnecting] = useState(false);
  const [showInDisconnectConfirm, setShowInDisconnectConfirm] = useState(false);
  const [showInConnectModal, setShowInConnectModal] = useState(false);

  const [clStatus, setClStatus] = useState<CalendlyStatus | null>(null);
  const [clLoading, setClLoading] = useState(true);
  const [clDisconnecting, setClDisconnecting] = useState(false);
  const [showClDisconnectConfirm, setShowClDisconnectConfirm] = useState(false);
  const [showClConnectModal, setShowClConnectModal] = useState(false);

  const [srStatus, setSrStatus] = useState<SmartreachStatus | null>(null);
  const [srLoading, setSrLoading] = useState(true);
  const [srDisconnecting, setSrDisconnecting] = useState(false);
  const [showSrDisconnectConfirm, setShowSrDisconnectConfirm] = useState(false);
  const [showSrConnectModal, setShowSrConnectModal] = useState(false);

  const loadSalesforce = useCallback(async () => {
    setSfLoading(true);
    try {
      setSfStatus(await getSalesforceStatus());
    } catch {
      toast.error("Failed to load Salesforce connection status.");
    } finally {
      setSfLoading(false);
    }
  }, []);

  const loadHubspot = useCallback(async () => {
    setHsLoading(true);
    try {
      setHsStatus(await getHubspotStatus());
    } catch {
      toast.error("Failed to load HubSpot connection status.");
    } finally {
      setHsLoading(false);
    }
  }, []);

  const loadInstantly = useCallback(async () => {
    setInLoading(true);
    try {
      setInStatus(await getInstantlyStatus());
    } catch {
      toast.error("Failed to load Instantly connection status.");
    } finally {
      setInLoading(false);
    }
  }, []);

  const loadCalendly = useCallback(async () => {
    setClLoading(true);
    try {
      setClStatus(await getCalendlyStatus());
    } catch {
      toast.error("Failed to load Calendly connection status.");
    } finally {
      setClLoading(false);
    }
  }, []);

  const loadSmartreach = useCallback(async () => {
    setSrLoading(true);
    try {
      setSrStatus(await getSmartreachStatus());
    } catch {
      toast.error("Failed to load Smartreach connection status.");
    } finally {
      setSrLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSalesforce();
    loadHubspot();
    loadInstantly();
    loadCalendly();
    loadSmartreach();
  }, [loadSalesforce, loadHubspot, loadInstantly, loadCalendly, loadSmartreach]);

  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");
    const detail = searchParams.get("detail");
    if (connected === "salesforce") {
      toast.success("Salesforce connected successfully.");
      router.replace("/search/integrations");
    } else if (error) {
      const defaultAuthFailed = "Failed to connect. Check your Salesforce Connected App settings (redirect URI, client ID/secret).";
      const messages: Record<string, string> = {
        cancelled: "Connection was cancelled.",
        invalid_state: detail ? `Connection failed: ${detail}` : "Connection request expired. Please try again.",
        auth_failed: detail ? `Salesforce connection error: ${detail}` : defaultAuthFailed,
      };
      toast.error(messages[error] ?? (detail ? `Connection error: ${detail}` : "Failed to connect."));
      router.replace("/search/integrations");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function handleConnectSalesforce() {
    setSfConnecting(true);
    try {
      const url = await getSalesforceAuthorizeUrl();
      window.location.href = url;
    } catch {
      toast.error("Failed to start Salesforce connection.");
      setSfConnecting(false);
    }
  }

  async function handleDisconnectSalesforce() {
    setSfDisconnecting(true);
    try {
      await disconnectSalesforce();
      toast.success("Salesforce disconnected.");
      setShowSfDisconnectConfirm(false);
      await loadSalesforce();
    } catch {
      toast.error("Failed to disconnect Salesforce.");
    } finally {
      setSfDisconnecting(false);
    }
  }

  async function handleDisconnectHubspot() {
    setHsDisconnecting(true);
    try {
      await disconnectHubspot();
      toast.success("HubSpot disconnected.");
      setShowHsDisconnectConfirm(false);
      await loadHubspot();
    } catch {
      toast.error("Failed to disconnect HubSpot.");
    } finally {
      setHsDisconnecting(false);
    }
  }

  async function handleDisconnectInstantly() {
    setInDisconnecting(true);
    try {
      await disconnectInstantly();
      toast.success("Instantly disconnected.");
      setShowInDisconnectConfirm(false);
      await loadInstantly();
    } catch {
      toast.error("Failed to disconnect Instantly.");
    } finally {
      setInDisconnecting(false);
    }
  }

  async function handleDisconnectCalendly() {
    setClDisconnecting(true);
    try {
      await disconnectCalendly();
      toast.success("Calendly disconnected.");
      setShowClDisconnectConfirm(false);
      await loadCalendly();
    } catch {
      toast.error("Failed to disconnect Calendly.");
    } finally {
      setClDisconnecting(false);
    }
  }

  async function handleDisconnectSmartreach() {
    setSrDisconnecting(true);
    try {
      await disconnectSmartreach();
      toast.success("Smartreach disconnected.");
      setShowSrDisconnectConfirm(false);
      await loadSmartreach();
    } catch {
      toast.error("Failed to disconnect Smartreach.");
    } finally {
      setSrDisconnecting(false);
    }
  }

  const sfConnected = !!sfStatus?.connected;
  const hsConnected = !!hsStatus?.connected;
  const inConnected = !!inStatus?.connected;
  const clConnected = !!clStatus?.connected;
  const srConnected = !!srStatus?.connected;

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
              </div>
            </div>
          </div>
        </div>

        <ConnectionCard
          name="Salesforce"
          accent={RED}
          icon={<SalesforceCloudIcon className={sfConnected ? "text-emerald-600" : "text-gray-400"} />}
          connected={sfConnected}
          loading={sfLoading}
          connecting={sfConnecting}
          subtitle={sfConnected ? (sfStatus?.salesforce_user_email ?? "Connected account") : "Push unlocked leads to your Salesforce org."}
          docsHref="/document/api-key/salesforce"
          features={SALESFORCE_FEATURES}
          onConnect={handleConnectSalesforce}
          onDisconnectRequest={() => setShowSfDisconnectConfirm(true)}
        />

        <ConnectionCard
          name="HubSpot"
          accent={ORANGE}
          icon={<HubspotIcon className={hsConnected ? "text-emerald-600" : "text-gray-400"} />}
          connected={hsConnected}
          loading={hsLoading}
          connecting={false}
          subtitle={hsConnected ? (hsStatus?.hubspot_hub_domain ?? "Connected account") : "Push unlocked leads to your HubSpot account."}
          docsHref="/document/api-key/hubspot"
          features={HUBSPOT_FEATURES}
          onConnect={() => setShowHsConnectModal(true)}
          onDisconnectRequest={() => setShowHsDisconnectConfirm(true)}
        />

        <ConnectionCard
          name="Instantly"
          accent={BLUE}
          icon={<InstantlyIcon className={inConnected ? "text-emerald-600" : "text-gray-400"} />}
          connected={inConnected}
          loading={inLoading}
          connecting={false}
          subtitle={inConnected ? "Connected account" : "Add unlocked leads to your Instantly campaigns."}
          docsHref="/document/api-key/instantly"
          features={INSTANTLY_FEATURES}
          onConnect={() => setShowInConnectModal(true)}
          onDisconnectRequest={() => setShowInDisconnectConfirm(true)}
        />

        <ConnectionCard
          name="Calendly"
          accent={CALENDLY_BLUE}
          icon={<CalendlyIcon className={clConnected ? "text-emerald-600" : "text-gray-400"} />}
          connected={clConnected}
          loading={clLoading}
          connecting={false}
          subtitle={clConnected ? (clStatus?.scheduling_url ?? "Connected account") : "Attach your booking link to Salesforce and Instantly pushes."}
          docsHref="/document/api-key/calendly"
          features={CALENDLY_FEATURES}
          onConnect={() => setShowClConnectModal(true)}
          onDisconnectRequest={() => setShowClDisconnectConfirm(true)}
        />

        <ConnectionCard
          name="Smartreach"
          accent={GREEN}
          icon={<SmartreachIcon className={srConnected ? "text-emerald-600" : "text-gray-400"} />}
          connected={srConnected}
          loading={srLoading}
          connecting={false}
          subtitle={srConnected ? "Connected account" : "Add unlocked leads to your Smartreach campaigns."}
          docsHref="/document/api-key/smartreach"
          features={SMARTREACH_FEATURES}
          onConnect={() => setShowSrConnectModal(true)}
          onDisconnectRequest={() => setShowSrDisconnectConfirm(true)}
        />

      </div>

      {showSfDisconnectConfirm && (
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
                onClick={() => setShowSfDisconnectConfirm(false)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDisconnectSalesforce}
                disabled={sfDisconnecting}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: RED }}
              >
                {sfDisconnecting && <Loader2 className="h-4 w-4 animate-spin" />}
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {showHsDisconnectConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: "#fff1ec" }}>
              <AlertCircle className="h-5 w-5" style={{ color: ORANGE }} />
            </div>
            <h2 className="mt-3 text-lg font-bold text-gray-900">Disconnect HubSpot?</h2>
            <p className="mt-1 text-sm text-gray-500">
              You won&apos;t be able to push leads to HubSpot until you reconnect.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowHsDisconnectConfirm(false)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDisconnectHubspot}
                disabled={hsDisconnecting}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: ORANGE }}
              >
                {hsDisconnecting && <Loader2 className="h-4 w-4 animate-spin" />}
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {showInDisconnectConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: "#eaf0fe" }}>
              <AlertCircle className="h-5 w-5" style={{ color: BLUE }} />
            </div>
            <h2 className="mt-3 text-lg font-bold text-gray-900">Disconnect Instantly?</h2>
            <p className="mt-1 text-sm text-gray-500">
              You won&apos;t be able to add leads to Instantly campaigns until you reconnect.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowInDisconnectConfirm(false)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDisconnectInstantly}
                disabled={inDisconnecting}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: BLUE }}
              >
                {inDisconnecting && <Loader2 className="h-4 w-4 animate-spin" />}
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {showClDisconnectConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: "#e6f0ff" }}>
              <AlertCircle className="h-5 w-5" style={{ color: CALENDLY_BLUE }} />
            </div>
            <h2 className="mt-3 text-lg font-bold text-gray-900">Disconnect Calendly?</h2>
            <p className="mt-1 text-sm text-gray-500">
              Your booking link will no longer be attached to Salesforce or Instantly pushes.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowClDisconnectConfirm(false)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDisconnectCalendly}
                disabled={clDisconnecting}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: CALENDLY_BLUE }}
              >
                {clDisconnecting && <Loader2 className="h-4 w-4 animate-spin" />}
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {showSrDisconnectConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: "#e5f9f1" }}>
              <AlertCircle className="h-5 w-5" style={{ color: GREEN }} />
            </div>
            <h2 className="mt-3 text-lg font-bold text-gray-900">Disconnect Smartreach?</h2>
            <p className="mt-1 text-sm text-gray-500">
              You won&apos;t be able to add leads to Smartreach campaigns until you reconnect.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowSrDisconnectConfirm(false)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDisconnectSmartreach}
                disabled={srDisconnecting}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: GREEN }}
              >
                {srDisconnecting && <Loader2 className="h-4 w-4 animate-spin" />}
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      <ConnectInstantlyModal
        open={showInConnectModal}
        onClose={() => setShowInConnectModal(false)}
        onConnected={loadInstantly}
      />

      <ConnectCalendlyModal
        open={showClConnectModal}
        onClose={() => setShowClConnectModal(false)}
        onConnected={loadCalendly}
      />

      <ConnectSmartreachModal
        open={showSrConnectModal}
        onClose={() => setShowSrConnectModal(false)}
        onConnected={loadSmartreach}
      />

      <ConnectHubspotModal
        open={showHsConnectModal}
        onClose={() => setShowHsConnectModal(false)}
        onConnected={loadHubspot}
      />

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

function HubspotIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 9.6V5.5M17 8l-3 3M8 16l-3 3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="17.5" cy="6.5" r="1.6" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="5.5" cy="18.5" r="1.6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function InstantlyIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M13 3 4 13.5h6.5L11 21l9-10.5h-6.5L13 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendlyIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="4" y="5.5" width="16" height="14.5" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 3.5v4M16 3.5v4M4 10h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="15" r="1.6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function SmartreachIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 18 10 8l4 6 3-4.5L20 14"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

