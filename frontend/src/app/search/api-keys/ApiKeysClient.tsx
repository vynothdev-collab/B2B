"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Key, Loader2, PlusCircle, Copy, Check, Trash2, AlertCircle, ExternalLink,
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

function formatDate(iso: string | null): string {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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
    } catch {
      setError("Failed to load API keys.");
    } finally {
      setLoading(false);
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

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto bg-gray-50">
      <AppHeader title="API Keys" />

      <div className="mx-auto w-full max-w-4xl flex-1 p-4 sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-500">
              Use an API key to call the LeadsBuddy Developer API directly from your own
              systems. Usage draws from the same credit balance as the web app.
            </p>
            <a
              href="/document/api-key"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:underline"
            >
              View API documentation <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            style={{ background: RED }}
          >
            <PlusCircle className="h-4 w-4" /> New API Key
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-10 text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading…
            </div>
          ) : keys.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-10 text-center text-gray-400">
              <Key className="h-8 w-8" />
              <p className="text-sm font-medium text-gray-500">No API keys yet</p>
              <p className="text-xs">Create one to start calling the Developer API.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Key</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3">Last Used</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-5 py-3 font-medium text-gray-900">{k.name}</td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-500">{k.key_prefix}…</td>
                    <td className="px-5 py-3 text-gray-500">{formatDate(k.created_at)}</td>
                    <td className="px-5 py-3 text-gray-500">{formatDate(k.last_used_at)}</td>
                    <td className="px-5 py-3">
                      {k.is_active ? (
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500">
                          Revoked
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {k.is_active && (
                        <button
                          onClick={() => handleRevoke(k.id)}
                          disabled={revokingId === k.id}
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          {revokingId === k.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            {!createdKey ? (
              <>
                <h2 className="text-lg font-bold text-gray-900">Create API Key</h2>
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
                <h2 className="text-lg font-bold text-gray-900">API Key Created</h2>
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
