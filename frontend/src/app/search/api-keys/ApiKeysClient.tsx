"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  Key, Loader2, PlusCircle, Copy, Check, Trash2, AlertCircle, ExternalLink,
  Search, Unlock, Wallet, ShieldCheck,
} from "lucide-react";
import AppHeader from "@/components/layout/AppHeader";
import {
  listApiKeys,
  createApiKey,
  revokeApiKey,
  type ApiKeyOut,
  type ApiKeyCreateResponse,
} from "@/lib/apiKeysApi";

const RED = "#dc2626";

const FEATURES = [
  {
    icon: Search,
    title: "Search people & companies",
    text: "The same filters and data as People / Companies search, called from your own systems.",
  },
  {
    icon: Unlock,
    title: "Unlock verified contacts",
    text: "Reveal work email, personal email, and mobile number per record, on demand.",
  },
  {
    icon: Wallet,
    title: "One shared credit balance",
    text: "API usage draws from the same credits as the web app — no separate quota to manage.",
  },
];

function formatDate(iso: string | null): string {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: "red" | "green" | "gray" }) {
  const toneClasses = {
    red: "text-red-600",
    green: "text-emerald-600",
    gray: "text-gray-500",
  }[tone];
  return (
    <div className="flex-1 rounded-2xl border border-gray-100 bg-white px-5 py-4">
      <p className="text-sm font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className={`mt-1 text-3xl font-extrabold ${toneClasses}`}>{value}</p>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div aria-busy="true" className="flex-1 animate-pulse rounded-2xl border border-gray-100 bg-white px-5 py-4">
      <div className="h-3 w-20 rounded bg-gray-100" />
      <div className="mt-2 h-8 w-12 rounded bg-gray-200" />
    </div>
  );
}

function KeyRowSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading API key"
      className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 animate-pulse sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-3.5">
        <div className="h-10 w-10 shrink-0 rounded-xl bg-gray-200" />
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-28 rounded bg-gray-200" />
            <div className="h-5 w-14 rounded-full bg-gray-100" />
          </div>
          <div className="h-3 w-32 rounded bg-gray-100" />
          <div className="h-3 w-52 max-w-full rounded bg-gray-100" />
        </div>
      </div>
      <div className="h-9 w-20 rounded-xl bg-gray-100" />
    </div>
  );
}

export default function ApiKeysClient() {
  const [keys, setKeys] = useState<ApiKeyOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createdKey, setCreatedKey] = useState<ApiKeyCreateResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const [revokingId, setRevokingId] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await listApiKeys(signal);
      setKeys(data);
    } catch (err) {
      if (axios.isCancel(err) || signal?.aborted) return;
      setError("Failed to load API keys.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  async function handleCreate() {
    if (!newKeyName.trim()) return;
    setCreating(true);
    try {
      const result = await createApiKey(newKeyName.trim());
      setCreatedKey(result);
      setNewKeyName("");
      await load();
    } catch {
      setError("Failed to create API key.");
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: string) {
    setRevokingId(id);
    try {
      await revokeApiKey(id);
      await load();
    } catch {
      setError("Failed to revoke API key.");
    } finally {
      setRevokingId(null);
    }
  }

  function handleCopy(key: string) {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function closeCreateModal() {
    setShowCreate(false);
    setCreatedKey(null);
    setNewKeyName("");
  }

  const activeCount = keys.filter((k) => k.is_active).length;
  const revokedCount = keys.length - activeCount;

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto bg-[#F5F4F9]">
      <AppHeader title="API Keys" />

      <div className="mx-auto w-full max-w-6xl flex-1 space-y-5 p-4 sm:p-6">
        <div className="rounded-2xl border border-red-100 bg-white p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50">
                <Key className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">LeadsBuddy Developer API</h1>
                <p className="mt-1 max-w-2xl text-base leading-relaxed text-gray-500">
                  Generate an API key to call the LeadsBuddy Developer API directly from your
                  own systems — search people and companies, then unlock verified contact
                  details, all using the same data as this app.
                </p>
                <a
                  href="/document/api-key"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-base font-semibold text-red-600 hover:underline"
                >
                  View API documentation <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-base font-semibold text-white shadow-sm transition hover:opacity-90"
              style={{ background: RED }}
            >
              <PlusCircle className="h-4 w-4" /> New API Key
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 border-t border-gray-100 pt-5 sm:grid-cols-3">
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

        {loading ? (
          <div className="flex gap-3" aria-label="Loading API key statistics">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        ) : keys.length > 0 ? (
          <div className="flex gap-3">
            <StatCard label="Total Keys" value={keys.length} tone="gray" />
            <StatCard label="Active" value={activeCount} tone="green" />
            <StatCard label="Revoked" value={revokedCount} tone="red" />
          </div>
        ) : null}

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            <KeyRowSkeleton />
            <KeyRowSkeleton />
          </div>
        ) : keys.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
              <Key className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">No API keys yet</p>
              <p className="mt-0.5 text-xs text-gray-400">Create one to start calling the Developer API.</p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-1 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
              style={{ background: RED }}
            >
              <PlusCircle className="h-4 w-4" /> New API Key
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {keys.map((k) => (
              <div
                key={k.id}
                className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 transition hover:border-gray-200 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      k.is_active ? "bg-red-50" : "bg-gray-100"
                    }`}
                  >
                    <Key className={`h-4 w-4 ${k.is_active ? "text-red-500" : "text-gray-400"}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-bold text-gray-900">{k.name}</p>
                      {k.is_active ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                          <ShieldCheck className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500">
                          Revoked
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 font-mono text-sm text-gray-400">{k.key_prefix}…</p>
                    <p className="mt-0.5 text-sm text-gray-400">
                      Created {formatDate(k.created_at)} · Last used {formatDate(k.last_used_at)}
                    </p>
                  </div>
                </div>
                {k.is_active && (
                  <button
                    onClick={() => handleRevoke(k.id)}
                    disabled={revokingId === k.id}
                    className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg px-3 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 sm:self-center"
                  >
                    {revokingId === k.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            {!createdKey ? (
              <>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
                  <Key className="h-5 w-5 text-red-600" />
                </div>
                <h2 className="mt-3 text-lg font-bold text-gray-900">Create API Key</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Give this key a name so you can recognize it later.
                </p>
                <input
                  autoFocus
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. Production server"
                  className="mt-4 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-red-300"
                />
                <div className="mt-5 flex justify-end gap-2">
                  <button
                    onClick={closeCreateModal}
                    className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={creating || !newKeyName.trim()}
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    style={{ background: RED }}
                  >
                    {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                    Create Key
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                </div>
                <h2 className="mt-3 text-lg font-bold text-gray-900">API Key Created</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Copy and store this key now — you won&apos;t be able to see it again.
                </p>
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5">
                  <code className="flex-1 overflow-x-auto whitespace-nowrap text-xs text-gray-800">
                    {createdKey.key}
                  </code>
                  <button
                    onClick={() => handleCopy(createdKey.key)}
                    className="shrink-0 rounded-lg p-1.5 text-gray-500 hover:bg-gray-200"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <div className="mt-5 flex justify-end">
                  <button
                    onClick={closeCreateModal}
                    className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
                    style={{ background: RED }}
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
