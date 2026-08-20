"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plug,
  Loader2,
  ExternalLink,
  ShieldCheck,
  LogOut,
  AlertCircle,
  Upload,
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
import {
  getZohoStatus,
  getZohoAuthorizeUrl,
  disconnectZoho,
  type ZohoStatus,
} from "@/lib/zohoApi";
import {
  getInstantlyStatus,
  disconnectInstantly,
  type InstantlyStatus,
} from "@/lib/instantlyApi";
import ConnectInstantlyModal from "@/components/search/ConnectInstantlyModal";
import {
  getSmartreachStatus,
  disconnectSmartreach,
  type SmartreachStatus,
} from "@/lib/smartreachApi";
import ConnectSmartreachModal from "@/components/search/ConnectSmartreachModal";
import { toast } from "@/lib/toast";

const RED = "#dc2626";
const ORANGE = "#ff7a59";
const BLUE = "#1a56db";
const GREEN = "#00b67a";
const ZOHO_RED = "#e42527";

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

const ZOHO_FEATURES = [
  {
    icon: Upload,
    title: "Push leads and accounts",
    text: "Send a person record to Zoho CRM as a Lead, or a company record as an Account, from search results or a contact's detail panel.",
  },
  {
    icon: ShieldCheck,
    title: "Works with whatever's unlocked",
    text: "Leads are pushed with whichever contact fields are unlocked — no email required upfront.",
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

function ConnectionCardSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading integration"
      className="flex min-h-[300px] h-full flex-col rounded-2xl border border-gray-100 bg-white p-5 animate-pulse"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 shrink-0 rounded-xl bg-gray-200" />
          <div className="space-y-2">
            <div className="h-4 w-28 rounded bg-gray-200" />
            <div className="h-3 w-44 rounded bg-gray-100" />
          </div>
        </div>
        <div className="h-6 w-24 shrink-0 rounded-full bg-gray-100" />
      </div>

      <div className="mt-4 flex-1 space-y-4 border-t border-gray-100 pt-4">
        {[0, 1].map((item) => (
          <div key={item} className="flex gap-2.5">
            <div className="h-6 w-6 shrink-0 rounded-lg bg-gray-100" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-32 rounded bg-gray-200" />
              <div className="h-3 w-full rounded bg-gray-100" />
              <div className="h-3 w-4/5 rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
        <div className="h-4 w-20 rounded bg-gray-100" />
        <div className="h-10 w-24 rounded-xl bg-gray-200" />
      </div>
    </div>
  );
}

function ConnectionCard({
  name,
  accent,
  icon,
  connected,
  loading,
  connecting,
  subtitle,
  docsHref,
  features,
  onConnect,
  onDisconnectRequest,
}: ConnectionCardProps) {
  if (loading) {
    return <ConnectionCardSkeleton />;
  }

  return (
    <div className="group flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-gray-200 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative flex h-11 max-w-[9rem] shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-white px-2">
            {icon}
            {connected && (
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white">
                <ShieldCheck className="h-2.5 w-2.5 text-white" />
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-gray-900">{name}</p>
            <p className="mt-0.5 truncate text-sm text-gray-400">{subtitle}</p>
          </div>
        </div>

        {connected ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{" "}
            Connected
          </span>
        ) : (
          <span className="inline-flex shrink-0 items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">
            Not connected
          </span>
        )}
      </div>

      <div className="mt-4 flex-1 space-y-3 border-t border-gray-100 pt-4">
        {features.map((f) => (
          <div key={f.title} className="flex gap-2.5">
            <div
              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg"
              style={{ background: `${accent}14` }}
            >
              <f.icon className="h-3.5 w-3.5" style={{ color: accent }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900">{f.title}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-gray-500">
                {f.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
        <a
          href={docsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-semibold text-gray-400 transition hover:text-gray-600"
        >
          Setup guide <ExternalLink className="h-3 w-3" />
        </a>

        {connected ? (
          <button
            onClick={onDisconnectRequest}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-gray-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-3.5 w-3.5" /> Disconnect
          </button>
        ) : (
          <button
            onClick={onConnect}
            disabled={connecting}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
            style={{ background: accent }}
          >
            {connecting && <Loader2 className="h-4 w-4 animate-spin" />}
            Connect
          </button>
        )}
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

  const [zhStatus, setZhStatus] = useState<ZohoStatus | null>(null);
  const [zhLoading, setZhLoading] = useState(true);
  const [zhConnecting, setZhConnecting] = useState(false);
  const [zhDisconnecting, setZhDisconnecting] = useState(false);
  const [showZhDisconnectConfirm, setShowZhDisconnectConfirm] = useState(false);

  const [inStatus, setInStatus] = useState<InstantlyStatus | null>(null);
  const [inLoading, setInLoading] = useState(true);
  const [inDisconnecting, setInDisconnecting] = useState(false);
  const [showInDisconnectConfirm, setShowInDisconnectConfirm] = useState(false);
  const [showInConnectModal, setShowInConnectModal] = useState(false);

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

  const loadZoho = useCallback(async () => {
    setZhLoading(true);
    try {
      setZhStatus(await getZohoStatus());
    } catch {
      toast.error("Failed to load Zoho CRM connection status.");
    } finally {
      setZhLoading(false);
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
    loadZoho();
    loadInstantly();
    loadSmartreach();
  }, [loadSalesforce, loadHubspot, loadZoho, loadInstantly, loadSmartreach]);

  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");
    const detail = searchParams.get("detail");
    if (connected === "salesforce") {
      toast.success("Salesforce connected successfully.");
      router.replace("/search/integrations");
    } else if (connected === "zoho") {
      toast.success("Zoho CRM connected successfully.");
      router.replace("/search/integrations");
    } else if (error) {
      const defaultAuthFailed =
        "Failed to connect. Check your Connected App settings (redirect URI, client ID/secret).";
      const messages: Record<string, string> = {
        cancelled: "Connection was cancelled.",
        invalid_state: detail
          ? `Connection failed: ${detail}`
          : "Connection request expired. Please try again.",
        auth_failed: detail ? `Connection error: ${detail}` : defaultAuthFailed,
      };
      toast.error(
        messages[error] ??
          (detail ? `Connection error: ${detail}` : "Failed to connect."),
      );
      router.replace("/search/integrations");
    }
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

  async function handleConnectZoho() {
    setZhConnecting(true);
    try {
      const url = await getZohoAuthorizeUrl();
      window.location.href = url;
    } catch {
      toast.error("Failed to start Zoho CRM connection.");
      setZhConnecting(false);
    }
  }

  async function handleDisconnectZoho() {
    setZhDisconnecting(true);
    try {
      await disconnectZoho();
      toast.success("Zoho CRM disconnected.");
      setShowZhDisconnectConfirm(false);
      await loadZoho();
    } catch {
      toast.error("Failed to disconnect Zoho CRM.");
    } finally {
      setZhDisconnecting(false);
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
  const zhConnected = !!zhStatus?.connected;
  const inConnected = !!inStatus?.connected;
  const srConnected = !!srStatus?.connected;
  const connectedCount = [
    sfConnected,
    hsConnected,
    zhConnected,
    inConnected,
    srConnected,
  ].filter(Boolean).length;
  const totalCount = 5;
  const isInitialLoad =
    sfLoading &&
    hsLoading &&
    zhLoading &&
    inLoading &&
    srLoading &&
    !sfStatus &&
    !hsStatus &&
    !zhStatus &&
    !inStatus &&
    !srStatus;

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto bg-gray-50">
      <AppHeader title="Integrations" />

      <div className="mx-auto w-full max-w-[100rem] flex-1 space-y-5 p-4 sm:p-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
                <Plug className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Integrations
                </h1>
                <p className="mt-1 max-w-2xl text-base leading-relaxed text-gray-500">
                  Connect LeadsBuddy to the tools your team already uses. Push
                  unlocked contacts straight into your CRM without leaving
                  search.
                </p>
              </div>
            </div>
            {isInitialLoad ? (
              <div
                aria-busy="true"
                aria-label="Loading connection count"
                className="inline-flex h-9 w-36 shrink-0 animate-pulse self-start rounded-full border border-gray-100 bg-gray-100 sm:self-auto"
              />
            ) : (
              <div className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-gray-100 bg-gray-50 px-3.5 py-2 text-sm font-semibold text-gray-600 sm:self-auto">
                <span
                  className={`h-2 w-2 rounded-full ${connectedCount > 0 ? "bg-emerald-500" : "bg-gray-300"}`}
                />
                {connectedCount} of {totalCount} connected
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          <ConnectionCard
            name="Salesforce"
            accent={RED}
            icon={<SalesforceLogo className="h-9 w-auto" />}
            connected={sfConnected}
            loading={sfLoading}
            connecting={sfConnecting}
            subtitle={
              sfConnected
                ? (sfStatus?.salesforce_user_email ?? "Connected account")
                : "Push unlocked leads to your Salesforce org."
            }
            docsHref="/document/api-key/salesforce"
            features={SALESFORCE_FEATURES}
            onConnect={handleConnectSalesforce}
            onDisconnectRequest={() => setShowSfDisconnectConfirm(true)}
          />

          <ConnectionCard
            name="HubSpot"
            accent={ORANGE}
            icon={<HubspotLogo className="h-8 w-8" />}
            connected={hsConnected}
            loading={hsLoading}
            connecting={false}
            subtitle={
              hsConnected
                ? (hsStatus?.hubspot_hub_domain ?? "Connected account")
                : "Push unlocked leads to your HubSpot account."
            }
            docsHref="/document/api-key/hubspot"
            features={HUBSPOT_FEATURES}
            onConnect={() => setShowHsConnectModal(true)}
            onDisconnectRequest={() => setShowHsDisconnectConfirm(true)}
          />

          <ConnectionCard
            name="Zoho CRM"
            accent={ZOHO_RED}
            icon={<ZohoLogo className="h-8 w-auto" />}
            connected={zhConnected}
            loading={zhLoading}
            connecting={zhConnecting}
            subtitle={
              zhConnected
                ? (zhStatus?.zoho_user_email ?? "Connected account")
                : "Push unlocked leads and accounts to your Zoho CRM."
            }
            docsHref="/document/api-key/zoho"
            features={ZOHO_FEATURES}
            onConnect={handleConnectZoho}
            onDisconnectRequest={() => setShowZhDisconnectConfirm(true)}
          />

          <ConnectionCard
            name="Instantly"
            accent={BLUE}
            icon={<InstantlyLogo className="h-6 w-auto" />}
            connected={inConnected}
            loading={inLoading}
            connecting={false}
            subtitle={
              inConnected
                ? "Connected account"
                : "Add unlocked leads to your Instantly campaigns."
            }
            docsHref="/document/api-key/instantly"
            features={INSTANTLY_FEATURES}
            onConnect={() => setShowInConnectModal(true)}
            onDisconnectRequest={() => setShowInDisconnectConfirm(true)}
          />

          <ConnectionCard
            name="Smartreach"
            accent={GREEN}
            icon={<SmartreachLogo className="h-9 w-9" />}
            connected={srConnected}
            loading={srLoading}
            connecting={false}
            subtitle={
              srConnected
                ? "Connected account"
                : "Add unlocked leads to your Smartreach campaigns."
            }
            docsHref="/document/api-key/smartreach"
            features={SMARTREACH_FEATURES}
            onConnect={() => setShowSrConnectModal(true)}
            onDisconnectRequest={() => setShowSrDisconnectConfirm(true)}
          />
        </div>
      </div>

      {showSfDisconnectConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <h2 className="mt-3 text-lg font-bold text-gray-900">
              Disconnect Salesforce?
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              You won&apos;t be able to push leads to Salesforce until you
              reconnect.
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
                {sfDisconnecting && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {showZhDisconnectConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ background: "#fde8e8" }}
            >
              <AlertCircle className="h-5 w-5" style={{ color: ZOHO_RED }} />
            </div>
            <h2 className="mt-3 text-lg font-bold text-gray-900">
              Disconnect Zoho CRM?
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              You won&apos;t be able to push leads or accounts to Zoho CRM until
              you reconnect.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowZhDisconnectConfirm(false)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDisconnectZoho}
                disabled={zhDisconnecting}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: ZOHO_RED }}
              >
                {zhDisconnecting && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {showHsDisconnectConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ background: "#fff1ec" }}
            >
              <AlertCircle className="h-5 w-5" style={{ color: ORANGE }} />
            </div>
            <h2 className="mt-3 text-lg font-bold text-gray-900">
              Disconnect HubSpot?
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              You won&apos;t be able to push leads to HubSpot until you
              reconnect.
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
                {hsDisconnecting && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {showInDisconnectConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ background: "#eaf0fe" }}
            >
              <AlertCircle className="h-5 w-5" style={{ color: BLUE }} />
            </div>
            <h2 className="mt-3 text-lg font-bold text-gray-900">
              Disconnect Instantly?
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              You won&apos;t be able to add leads to Instantly campaigns until
              you reconnect.
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
                {inDisconnecting && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {showSrDisconnectConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ background: "#e5f9f1" }}
            >
              <AlertCircle className="h-5 w-5" style={{ color: GREEN }} />
            </div>
            <h2 className="mt-3 text-lg font-bold text-gray-900">
              Disconnect Smartreach?
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              You won&apos;t be able to add leads to Smartreach campaigns until
              you reconnect.
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
                {srDisconnecting && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
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

function SalesforceLogo({ className }: { className?: string }) {
  return (
    <svg viewBox=".5 .5 999 699.242" className={className}>
      <path
        fill="#00A1E0"
        d="M416.224 76.763c32.219-33.57 77.074-54.391 126.682-54.391 65.946 0 123.48 36.772 154.12 91.361 26.626-11.896 56.098-18.514 87.106-18.514 118.94 0 215.368 97.268 215.368 217.247 0 119.993-96.428 217.261-215.368 217.261a213.735 213.735 0 0 1-42.422-4.227c-26.981 48.128-78.397 80.646-137.412 80.646-24.705 0-48.072-5.706-68.877-15.853-27.352 64.337-91.077 109.448-165.348 109.448-77.344 0-143.261-48.939-168.563-117.574-11.057 2.348-22.513 3.572-34.268 3.572C75.155 585.74.5 510.317.5 417.262c0-62.359 33.542-116.807 83.378-145.937-10.26-23.608-15.967-49.665-15.967-77.06C67.911 87.25 154.79.5 261.948.5c62.914 0 118.827 29.913 154.276 76.263"
      />
      <path
        fill="#FFF"
        d="M145.196 363.11c-.626 1.637.228 1.979.427 2.263 1.878 1.366 3.786 2.349 5.707 3.444 10.189 5.407 19.81 6.986 29.871 6.986 20.492 0 33.214-10.9 33.214-28.447v-.341c0-16.224-14.358-22.115-27.835-26.37l-1.75-.569c-10.161-3.302-18.927-6.147-18.927-12.836v-.355c0-5.721 5.123-9.934 13.064-9.934 8.823 0 19.297 2.932 26.042 6.66 0 0 1.978 1.281 2.704-.64.398-1.025 3.814-10.218 4.17-11.214.384-1.082-.299-1.879-.996-2.306-7.699-4.682-18.344-7.884-29.358-7.884l-2.049.014c-18.756 0-31.848 11.328-31.848 27.565v.342c0 17.119 14.444 22.669 27.978 26.54l2.177.669c9.862 3.031 18.358 5.635 18.358 12.58v.342c0 6.347-5.521 11.071-14.43 11.071-3.458 0-14.487-.071-26.398-7.6-1.438-.84-2.277-1.451-3.387-2.12-.583-.37-2.049-1.011-2.689.925l-4.045 11.215zm299.998 0c-.626 1.637.228 1.979.427 2.263 1.878 1.366 3.786 2.349 5.706 3.444 10.189 5.407 19.811 6.986 29.871 6.986 20.492 0 33.215-10.9 33.215-28.447v-.341c0-16.224-14.359-22.115-27.836-26.37l-1.75-.569c-10.161-3.302-18.928-6.147-18.928-12.836v-.355c0-5.721 5.123-9.934 13.064-9.934 8.823 0 19.297 2.932 26.043 6.66 0 0 1.978 1.281 2.703-.64.398-1.025 3.814-10.218 4.17-11.214.385-1.082-.299-1.879-.996-2.306-7.699-4.682-18.344-7.884-29.358-7.884l-2.05.014c-18.756 0-31.848 11.328-31.848 27.565v.342c0 17.119 14.444 22.669 27.978 26.54l2.177.669c9.862 3.031 18.373 5.635 18.373 12.58v.342c0 6.347-5.536 11.071-14.445 11.071-3.457 0-14.486-.071-26.397-7.6-1.438-.84-2.291-1.423-3.372-2.12-.371-.242-2.107-.911-2.705.925l-4.042 11.215zm204.801-34.37c0 9.919-1.85 17.731-5.493 23.253-3.601 5.465-9.051 8.126-16.649 8.126-7.613 0-13.035-2.647-16.579-8.126-3.587-5.507-5.407-13.334-5.407-23.253 0-9.904 1.82-17.703 5.407-23.168 3.544-5.407 8.966-8.04 16.579-8.04 7.599 0 13.049 2.633 16.664 8.04 3.629 5.464 5.478 13.263 5.478 23.168m17.106-18.386c-1.68-5.679-4.298-10.688-7.784-14.857-3.487-4.184-7.898-7.542-13.136-9.99-5.223-2.433-11.398-3.671-18.328-3.671-6.945 0-13.121 1.238-18.344 3.671-5.237 2.448-9.648 5.807-13.149 9.99-3.472 4.184-6.091 9.193-7.784 14.857-1.665 5.649-2.505 11.825-2.505 18.386s.84 12.751 2.505 18.386c1.693 5.664 4.298 10.674 7.799 14.857 3.486 4.184 7.912 7.528 13.135 9.904 5.236 2.377 11.398 3.586 18.344 3.586 6.93 0 13.092-1.209 18.328-3.586 5.223-2.376 9.648-5.721 13.136-9.904 3.486-4.17 6.104-9.179 7.784-14.857 1.68-5.649 2.519-11.84 2.519-18.386s-.841-12.737-2.52-18.386m140.467 47.116c-.569-1.665-2.177-1.039-2.177-1.039-2.49.954-5.138 1.836-7.955 2.277-2.861.44-6.006.669-9.379.669-8.281 0-14.856-2.462-19.566-7.329-4.725-4.867-7.372-12.736-7.344-23.381.029-9.691 2.362-16.978 6.561-22.527 4.17-5.521 10.517-8.354 18.984-8.354 7.059 0 12.438.811 18.072 2.59 0 0 1.352.583 1.992-1.181 1.494-4.156 2.604-7.13 4.198-11.698.456-1.295-.654-1.85-1.053-2.007-2.22-.868-7.457-2.276-11.413-2.874-3.7-.569-8.026-.868-12.836-.868-7.188 0-13.591 1.224-19.069 3.672-5.465 2.433-10.104 5.791-13.775 9.976-3.672 4.184-6.461 9.192-8.325 14.856-1.85 5.649-2.789 11.854-2.789 18.415 0 14.188 3.828 25.657 11.385 34.054 7.57 8.425 18.941 12.708 33.77 12.708 8.766 0 17.76-1.778 24.221-4.326 0 0 1.238-.598.697-2.034l-4.199-11.599zm29.929-38.232c.811-5.507 2.334-10.09 4.682-13.661 3.544-5.422 8.951-8.396 16.551-8.396s12.623 2.988 16.223 8.396c2.391 3.571 3.43 8.354 3.843 13.661h-41.299zm57.592-12.111c-1.451-5.479-5.052-11.015-7.414-13.548-3.729-4.013-7.371-6.816-10.986-8.382-4.725-2.021-10.389-3.358-16.593-3.358-7.229 0-13.79 1.21-19.112 3.714-5.336 2.505-9.818 5.921-13.334 10.176-3.516 4.24-6.162 9.292-7.842 15.027-1.693 5.707-2.547 11.926-2.547 18.485 0 6.675.883 12.894 2.633 18.486 1.765 5.636 4.582 10.602 8.396 14.714 3.799 4.142 8.695 7.387 14.558 9.648 5.821 2.249 12.894 3.416 21.019 3.401 16.722-.057 25.53-3.785 29.159-5.792.641-.355 1.253-.981.483-2.774l-3.785-10.603c-.568-1.579-2.177-.996-2.177-.996-4.142 1.537-10.032 4.298-23.766 4.27-8.979-.014-15.64-2.661-19.81-6.803-4.283-4.24-6.375-10.474-6.745-19.268l57.905.057s1.522-.028 1.68-1.509c.057-.624 1.993-11.895-1.722-24.945m-521.327 12.111c.825-5.507 2.334-10.09 4.682-13.661 3.543-5.422 8.951-8.396 16.55-8.396s12.623 2.988 16.237 8.396c2.376 3.571 3.415 8.354 3.828 13.661h-41.297zm57.577-12.111c-1.451-5.479-5.037-11.015-7.399-13.548-3.729-4.013-7.372-6.816-10.986-8.382-4.725-2.021-10.388-3.358-16.593-3.358-7.215 0-13.79 1.21-19.112 3.714-5.336 2.505-9.819 5.921-13.334 10.176-3.515 4.24-6.162 9.292-7.841 15.027-1.679 5.707-2.547 11.926-2.547 18.485 0 6.675.882 12.894 2.633 18.486 1.765 5.636 4.583 10.602 8.396 14.714 3.8 4.142 8.695 7.387 14.558 9.648 5.821 2.249 12.893 3.416 21.019 3.401 16.721-.057 25.53-3.785 29.159-5.792.641-.355 1.252-.981.484-2.774l-3.771-10.603c-.584-1.579-2.191-.996-2.191-.996-4.141 1.537-10.019 4.298-23.78 4.27-8.965-.014-15.625-2.661-19.795-6.803-4.284-4.24-6.375-10.474-6.746-19.268l57.905.057s1.522-.028 1.679-1.509c.055-.624 1.99-11.895-1.738-24.945m-182.738 50.026c-2.263-1.808-2.576-2.263-3.344-3.43-1.139-1.779-1.722-4.312-1.722-7.528 0-5.095 1.679-8.752 5.166-11.214-.042.015 4.981-4.34 16.792-4.184 8.296.114 15.71 1.338 15.71 1.338v26.327h.014s-7.357 1.579-15.639 2.077c-11.783.712-17.02-3.4-16.977-3.386m23.039-40.686c-2.348-.171-5.394-.271-9.037-.271-4.966 0-9.762.626-14.259 1.836-4.525 1.209-8.595 3.103-12.096 5.606a27.927 27.927 0 0 0-8.396 9.549c-2.049 3.814-3.088 8.311-3.088 13.349 0 5.123.882 9.577 2.647 13.221 1.765 3.657 4.312 6.702 7.556 9.051 3.216 2.348 7.187 4.069 11.797 5.108 4.54 1.039 9.691 1.565 15.327 1.565 5.934 0 11.854-.483 17.589-1.466 5.678-.968 12.651-2.377 14.586-2.817a146.25 146.25 0 0 0 4.056-1.039c1.438-.355 1.324-1.893 1.324-1.893l-.029-52.952c0-11.613-3.102-20.223-9.207-25.559-6.077-5.322-15.028-8.013-26.597-8.013-4.341 0-11.328.599-15.512 1.438 0 0-12.651 2.448-17.86 6.518 0 0-1.138.712-.512 2.306l4.099 11.015c.512 1.423 1.893.939 1.893.939s.441-.171.954-.47c11.143-6.062 25.231-5.877 25.231-5.877 6.262 0 11.072 1.252 14.316 3.742 3.159 2.419 4.767 6.076 4.767 13.789v2.448c-4.981-.711-9.549-1.123-9.549-1.123m467.029-29.836c.44-1.31-.484-1.936-.869-2.078-.981-.384-5.905-1.423-9.705-1.665-7.271-.441-11.312.783-14.928 2.405-3.586 1.622-7.57 4.24-9.791 7.215v-7.044c0-.982-.697-1.765-1.665-1.765h-14.843c-.967 0-1.664.782-1.664 1.765v86.366c0 .968.797 1.765 1.764 1.765h15.213a1.76 1.76 0 0 0 1.75-1.765v-43.147c0-5.792.641-11.569 1.922-15.198 1.252-3.587 2.96-6.461 5.066-8.525 2.12-2.049 4.525-3.486 7.158-4.297 2.689-.826 5.663-1.096 7.77-1.096 3.031 0 6.361.782 6.361.782 1.109.128 1.736-.555 2.105-1.565.997-2.647 3.815-10.574 4.356-12.153"
      />
      <path
        fill="#FFF"
        d="M595.874 246.603c-1.85-.569-3.529-.954-5.721-1.366-2.221-.398-4.867-.598-7.869-.598-10.475 0-18.729 2.96-24.52 8.794-5.764 5.807-9.678 14.644-11.642 26.271l-.712 3.913h-13.148s-1.594-.057-1.936 1.68l-2.148 12.053c-.157 1.139.342 1.864 1.878 1.864h12.794l-12.979 72.463c-1.011 5.835-2.178 10.631-3.473 14.273-1.267 3.587-2.504 6.276-4.041 8.24-1.48 1.879-2.875 3.273-5.295 4.084-1.992.669-4.297.982-6.816.982-1.395 0-3.258-.229-4.639-.513-1.366-.271-2.092-.569-3.131-1.011 0 0-1.494-.568-2.092.926-.47 1.238-3.885 10.615-4.298 11.769-.398 1.152.171 2.049.896 2.319 1.708.598 2.974.996 5.294 1.551 3.217.755 5.934.797 8.481.797 5.322 0 10.189-.754 14.217-2.205 4.042-1.466 7.57-4.014 10.701-7.457 3.373-3.729 5.493-7.628 7.515-12.964 2.006-5.266 3.729-11.812 5.094-19.439l13.05-73.815h19.069s1.607.057 1.936-1.693l2.162-12.039c.143-1.152-.341-1.864-1.893-1.864h-18.514c.1-.412.939-6.931 3.06-13.063.911-2.604 2.618-4.725 4.056-6.177 1.424-1.423 3.06-2.433 4.854-3.017 1.835-.598 3.928-.882 6.219-.882 1.736 0 3.457.199 4.752.469 1.793.385 2.49.584 2.961.727 1.893.569 2.148.014 2.519-.896l4.426-12.153c.455-1.312-.669-1.867-1.067-2.023m-258.68 125.231c0 .968-.697 1.751-1.665 1.751h-15.355c-.968 0-1.651-.783-1.651-1.751v-123.58c0-.967.683-1.75 1.651-1.75h15.355c.968 0 1.665.783 1.665 1.75v123.58z"
      />
    </svg>
  );
}

function ZohoLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1024 450" className={className}>
      <path
        fill="#089949"
        d="M458.1,353c-7.7,0-15.5-1.6-23-4.9l0,0l-160-71.3c-28.6-12.7-41.5-46.4-28.8-75l71.3-160c12.7-28.6,46.4-41.5,75-28.8l160,71.3c28.6,12.7,41.5,46.4,28.8,75l-71.3,160C500.6,340.5,479.8,353,458.1,353z M448.4,318.1c12.1,5.4,26.3-0.1,31.7-12.1l71.3-160c5.4-12.1-0.1-26.3-12.1-31.7L379.2,43c-12.1-5.4-26.3,0.1-31.7,12.1l-71.3,160c-5.4,12.1,0.1,26.3,12.1,31.7L448.4,318.1z"
      />
      <path
        fill="#F9B21D"
        d="M960,353.1H784.8c-31.3,0-56.8-25.5-56.8-56.8V121.1c0-31.3,25.5-56.8,56.8-56.8H960c31.3,0,56.8,25.5,56.8,56.8v175.2C1016.8,327.6,991.3,353.1,960,353.1z M784.8,97.1c-13.2,0-24,10.8-24,24v175.2c0,13.2,10.8,24,24,24H960c13.2,0,24-10.8,24-24V121.1c0-13.2-10.8-24-24-24H784.8z"
      />
      <path
        fill="#E42527"
        d="M303.9,153.2L280.3,206c-0.3,0.6-0.6,1.1-0.9,1.6l9.2,56.8c2.1,13.1-6.8,25.4-19.8,27.5l-173,28c-6.3,1-12.7-0.5-17.9-4.2c-5.2-3.7-8.6-9.3-9.6-15.6l-28-173c-1-6.3,0.5-12.7,4.2-17.9c3.7-5.2,9.3-8.6,15.6-9.6l173-28c1.3-0.2,2.6-0.3,3.8-0.3c11.5,0,21.8,8.4,23.7,20.2l9.3,57.2L294.3,94l-1.3-7.7c-5-30.9-34.2-52-65.1-47l-173,28C40,69.6,26.8,77.7,18,90c-8.9,12.3-12.4,27.3-10,42.3l28,173c2.4,15,10.5,28.1,22.8,37C68.5,349.4,80,353,91.9,353c3,0,6.1-0.2,9.2-0.7l173-28c30.9-5,52-34.2,47-65.1L303.9,153.2z"
      />
      <path
        fill="#226DB4"
        d="M511.4,235.8l25.4-56.9l-7.2-52.9c-0.9-6.3,0.8-12.6,4.7-17.7c3.9-5.1,9.5-8.4,15.9-9.2l173.6-23.6c1.1-0.1,2.2-0.2,3.3-0.2c5.2,0,10.2,1.7,14.5,4.9c0.8,0.6,1.5,1.3,2.2,1.9c7.7-8.1,17.8-13.9,29.1-16.4c-3.2-4.4-7-8.3-11.5-11.7c-12.1-9.2-27-13.1-42-11.1L545.6,66.5c-15,2-28.4,9.8-37.5,21.9c-9.2,12.1-13.1,27-11.1,42L511.4,235.8z"
      />
      <path
        fill="#226DB4"
        d="M806.8,265.1l-22.8-168c-12.8,0.4-23.1,11-23.1,23.9v49.3l13.5,99.2c0.9,6.3-0.8,12.6-4.7,17.7s-9.5,8.4-15.9,9.2l-173.6,23.6c-6.3,0.9-12.6-0.8-17.7-4.7c-5.1-3.9-8.4-9.5-9.2-15.9l-8-58.9l-25.4,56.9l0.9,6.4c2,15,9.8,28.4,21.9,37.5c10,7.6,21.9,11.6,34.3,11.6c2.6,0,5.2-0.2,7.8-0.5L758.2,329c15-2,28.4-9.8,37.5-21.9C804.9,295,808.8,280.1,806.8,265.1z"
      />
      <path
        fill="#FFFFFF"
        d="M317,436.2l24.8-36.6h-20.4c-1.1,0-2-0.9-2-2v-4.9c0-1.1,0.9-2,2-2h33.5c1.1,0,2,0.9,2,2v1.9c0,0.4-0.1,0.8-0.3,1.1l-24.3,36.6h21.8c1.1,0,2,0.9,2,2v4.9c0,1.1-0.9,2-2,2h-35.4c-1.1,0-2-0.9-2-2v-1.8C316.6,436.9,316.8,436.5,317,436.2z"
      />
      <path
        fill="#FFFFFF"
        d="M421.4,415.6c0-15,11-25.8,26-25.8c15.5,0,26,10.6,26,25.9c0,15.5-10.7,26.2-26.2,26.2C431.6,441.9,421.4,431.2,421.4,415.6z M461.5,415.8c0-9.1-4.4-16.9-14.3-16.9c-10,0-13.8,8.1-13.8,17.3c0,8.7,4.7,16.7,14.3,16.7C457.6,432.8,461.5,424.3,461.5,415.8z"
      />
      <path
        fill="#FFFFFF"
        d="M544.5,390.6h7.4c1.1,0,2,0.9,2,2v18.6h21v-18.6c0-1.1,0.9-2,2-2h7.4c1.1,0,2,0.9,2,2v46.5c0,1.1-0.9,2-2,2H577c-1.1,0-2-0.9-2-2v-18.8h-21v18.8c0,1.1-0.9,2-2,2h-7.4c-1.1,0-2-0.9-2-2v-46.5C542.5,391.5,543.4,390.6,544.5,390.6z"
      />
      <path
        fill="#FFFFFF"
        d="M655.4,415.6c0-15,11-25.8,26-25.8c15.5,0,26,10.6,26,25.9c0,15.5-10.7,26.2-26.2,26.2C665.6,441.9,655.4,431.2,655.4,415.6z M695.4,415.8c0-9.1-4.4-16.9-14.3-16.9c-10,0-13.8,8.1-13.8,17.3c0,8.7,4.7,16.7,14.3,16.7C691.5,432.8,695.4,424.3,695.4,415.8z"
      />
    </svg>
  );
}

function HubspotLogo({ className }: { className?: string }) {
  return (
    <svg fill="#FF7A59" viewBox="0 0 24 24" className={className}>
      <path d="M18.164 7.93V5.084a2.198 2.198 0 001.267-1.978v-.067A2.2 2.2 0 0017.238.845h-.067a2.2 2.2 0 00-2.193 2.193v.067a2.196 2.196 0 001.252 1.973l.013.006v2.852a6.22 6.22 0 00-2.969 1.31l.012-.01-7.828-6.095A2.497 2.497 0 104.3 4.656l-.012.006 7.697 5.991a6.176 6.176 0 00-1.038 3.446c0 1.343.425 2.588 1.147 3.607l-.013-.02-2.342 2.343a1.968 1.968 0 00-.58-.095h-.002a2.033 2.033 0 102.033 2.033 1.978 1.978 0 00-.1-.595l.005.014 2.317-2.317a6.247 6.247 0 104.782-11.134l-.036-.005zm-.964 9.378a3.206 3.206 0 113.215-3.207v.002a3.206 3.206 0 01-3.207 3.207z" />
    </svg>
  );
}

function InstantlyLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 123 28" fill="none" className={className}>
      <defs>
        <clipPath id="instantly-clip">
          <path fill="#fff" d="M0 0h123v28H0z" />
        </clipPath>
      </defs>
      <g clipPath="url(#instantly-clip)">
        <path
          fill="#0281FF"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M27.145 14c0 7.732-6.077 14-13.573 14C6.077 28 0 21.732 0 14S6.077 0 13.572 0c7.496 0 13.573 6.268 13.573 14M6.17 16.023h3.604c.107 0 .186.104.16.211l-1.862 7.794c-.04.166.155.282.274.164l12.557-12.466c.107-.106.034-.293-.114-.293h-4.408c-.137 0-.214-.162-.13-.274l4.127-5.522c.083-.112.006-.274-.131-.274H11.8L6.028 15.769c-.063.113.016.254.143.254"
        />
        <path
          fill="#000"
          d="M38.016 5.602v15.843h-2.778V5.602zM43.612 14.481v6.963h-2.71V9.56h2.59v2.02h.135a3.37 3.37 0 0 1 1.265-1.587q.876-.588 2.163-.588 1.19 0 2.074.526.891.526 1.377 1.524.495.999.487 2.422v7.566h-2.71V14.31q0-1.191-.599-1.864-.59-.674-1.64-.673-.71 0-1.264.324a2.2 2.2 0 0 0-.861.921q-.307.604-.307 1.462M62.835 12.702l-2.47.278q-.105-.387-.367-.727-.255-.34-.689-.55-.435-.207-1.063-.208-.846 0-1.422.38-.57.379-.561.982-.008.518.366.843.382.324 1.258.534l1.961.433q1.632.364 2.425 1.153.801.789.809 2.065-.008 1.122-.636 1.98-.622.852-1.73 1.331-1.108.48-2.545.48-2.11 0-3.398-.913-1.288-.92-1.535-2.56l2.643-.264q.18.805.763 1.215.585.41 1.52.41.966 0 1.55-.41.59-.41.59-1.014 0-.51-.381-.843-.375-.333-1.168-.51l-1.961-.426q-1.654-.356-2.448-1.199-.793-.85-.786-2.15-.008-1.099.576-1.904.592-.812 1.64-1.253 1.055-.45 2.433-.449 2.021 0 3.181.89 1.168.89 1.445 2.406M71.06 9.562v2.166h-6.61V9.562zM66.08 6.715h2.71V17.87q0 .564.165.866.171.294.449.402.276.11.614.109.255 0 .464-.04.216-.037.33-.069l.456 2.19a6 6 0 0 1-.622.17 5 5 0 0 1-.973.108q-1.017.03-1.834-.317a2.88 2.88 0 0 1-1.295-1.099q-.471-.743-.464-1.856zM76.633 21.684q-1.093 0-1.969-.402a3.24 3.24 0 0 1-1.377-1.207q-.502-.798-.502-1.965 0-1.005.36-1.664.359-.657.98-1.052.62-.394 1.4-.596a11 11 0 0 1 1.624-.301q1.01-.108 1.64-.194.628-.092.913-.278.292-.195.292-.596v-.046q0-.874-.502-1.354-.501-.48-1.445-.48-.995 0-1.579.449-.576.449-.778 1.06l-2.53-.371q.298-1.084.987-1.81.69-.735 1.685-1.1.996-.37 2.2-.37.832 0 1.655.2.823.201 1.505.666.68.457 1.093 1.245.419.79.419 1.973v7.953h-2.605v-1.632h-.09a3.4 3.4 0 0 1-.696.928 3.3 3.3 0 0 1-1.116.688q-.666.256-1.564.256m.703-2.058q.816 0 1.415-.333a2.42 2.42 0 0 0 1.25-2.112v-1.4q-.128.109-.434.201-.3.093-.674.163-.374.069-.74.123l-.637.093q-.606.085-1.085.279-.48.194-.756.541-.277.34-.277.882 0 .774.546 1.168.546.395 1.392.395M88.14 14.481v6.963h-2.71V9.56h2.59v2.02h.134a3.38 3.38 0 0 1 1.265-1.587q.877-.588 2.164-.588 1.19 0 2.073.526.89.527 1.378 1.524.493.999.486 2.422v7.566h-2.71V14.31q0-1.192-.598-1.864-.592-.674-1.64-.673-.711 0-1.265.325a2.2 2.2 0 0 0-.86.92q-.308.604-.308 1.462M104.016 9.562v2.166h-6.61V9.562zm-4.978-2.847h2.71V17.87q0 .564.164.866.173.294.45.402.277.11.614.109.254 0 .464-.04.217-.037.329-.069l.457 2.19a6 6 0 0 1-.621.17 5 5 0 0 1-.973.108q-1.019.03-1.834-.317a2.87 2.87 0 0 1-1.296-1.099q-.471-.743-.464-1.856zM109.24 5.602v15.843h-2.711V5.602zM113.711 25.902q-.553 0-1.026-.093a3.7 3.7 0 0 1-.741-.201l.629-2.182q.591.178 1.055.17a1.27 1.27 0 0 0 .816-.302q.36-.285.607-.959l.232-.642-4.17-12.13h2.875l2.649 8.974h.121l2.657-8.974h2.882l-4.604 13.321a5.4 5.4 0 0 1-.853 1.617q-.532.681-1.303 1.037-.764.363-1.826.363"
        />
      </g>
    </svg>
  );
}

function SmartreachLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1000 1000" className={className}>
      <defs>
        <clipPath id="smartreach-a">
          <path
            id="smartreach-path-1"
            d="M671.428571,442.857143 C608.310314,442.857143 557.142857,391.689686 557.142857,328.571429 C557.142857,265.453171 608.310314,214.285714 671.428571,214.285714 C734.546829,214.285714 785.714286,265.453171 785.714286,328.571429 C785.714286,391.689686 734.546829,442.857143 671.428571,442.857143 Z M3.42319152,558.571429 C-3.4815197,499.055408 -20.0363569,272.77234 192.087761,106.063876 C404.211879,-60.6445871 643.845974,11.6093237 698.571429,41.2515604 C580.769825,98.0001725 403.243237,230.339208 286.327927,393.010938 C88.9874561,430.248204 3.42319152,558.571429 3.42319152,558.571429 Z M441.428571,996.576808 C441.428571,996.576808 569.751796,911.012544 606.989062,713.672073 C769.660792,596.756763 901.999828,419.230175 958.74844,301.428571 C988.390676,356.154026 1060.64459,595.788121 893.936124,807.912239 C727.22766,1020.03636 500.944592,1003.48152 441.428571,996.576808 Z M20.6619699,642.857143 C20.6619699,642.857143 159.601004,660.789621 214.285714,714.285714 L100,800 C42.0172991,723.217076 20.6619699,642.857143 20.6619699,642.857143 Z M357.142857,979.339774 C357.142857,979.339774 268.113839,955.703125 191.428571,892.857143 L285.714286,785.714286 C342.220982,860.15904 357.142857,942.140723 357.142857,979.339774 Z"
          />
        </clipPath>
        <mask id="smartreach-mask-2">
          <use xlinkHref="#smartreach-path-1" fill="#fff" />
        </mask>
      </defs>
      <circle fill="#FFFFFF" cx="500" cy="500" r="500" />
      <use xlinkHref="#smartreach-path-1" fill="#FFFFFF" />
      <g mask="url(#smartreach-mask-2)">
        <g transform="translate(503.135534, 503.535534) rotate(45.000000) translate(-503.135534, -503.535534) translate(-171.864466, 3.535534)">
          <rect fill="#FF0000" x="0" y="800" width="1340" height="200" />
          <rect fill="#FF6E00" x="0" y="600" width="1340" height="200" />
          <rect fill="#FF9100" x="0" y="400" width="1340" height="200" />
          <rect fill="#FFC300" x="0" y="200" width="1340" height="200" />
          <rect fill="#FFE100" x="0" y="0" width="1340" height="200" />
        </g>
      </g>
      <circle
        fill="#FFCD00"
        mask="url(#smartreach-mask-2)"
        cx="671.428571"
        cy="328.571429"
        r="114.285714"
      />
    </svg>
  );
}
