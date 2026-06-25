"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Building2, Trash2, Loader2, List, Pencil, Check, X } from "lucide-react";
import AppHeader from "@/components/layout/AppHeader";
import { getLists, deleteList, renameList, type ListRecord } from "@/lib/listsApi";
import { toast } from "@/lib/toast";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default function ListsPage() {
  const router = useRouter();
  const [lists, setLists] = useState<ListRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    getLists()
      .then(setLists)
      .catch(() => toast.error("Failed to load lists"))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(e: React.MouseEvent, id: string, name: string) {
    e.stopPropagation();
    if (!confirm(`Delete list "${name}"?`)) return;
    setDeleting(id);
    try {
      await deleteList(id);
      setLists((prev) => prev.filter((l) => l.id !== id));
      toast.success(`"${name}" deleted`);
    } catch {
      toast.error("Failed to delete list");
    } finally {
      setDeleting(null);
    }
  }

  function startEdit(e: React.MouseEvent, list: ListRecord) {
    e.stopPropagation();
    setEditingId(list.id);
    setEditName(list.name);
  }

  async function saveEdit(e: React.MouseEvent | React.KeyboardEvent) {
    e.stopPropagation();
    if (!editingId || !editName.trim()) return;
    setSaving(true);
    try {
      const updated = await renameList(editingId, editName.trim());
      setLists((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      toast.success("List renamed");
      setEditingId(null);
    } catch {
      toast.error("Failed to rename list");
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit(e: React.MouseEvent) {
    e.stopPropagation();
    setEditingId(null);
  }

  return (
    <>
      <AppHeader title="Lists" />
      <div className="flex flex-1 flex-col overflow-hidden px-3 py-2">
        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex shrink-0 items-center gap-2 border-b border-gray-100 px-4 py-3">
            <List className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-semibold text-gray-900">Your lists</span>
            {!loading && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                {lists.length}
              </span>
            )}
          </div>

          {loading && (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
            </div>
          )}

          {!loading && (
            <div className="flex-1 overflow-y-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Name</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Records count</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Created date</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Last updated</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lists.map((list) => (
                    <tr
                      key={list.id}
                      onClick={() => editingId !== list.id && router.push(`/search/lists/${list.id}`)}
                      className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-gray-400 shrink-0">
                            {list.list_type === "people" ? (
                              <Users className="h-4 w-4" />
                            ) : (
                              <Building2 className="h-4 w-4" />
                            )}
                          </span>

                          {editingId === list.id ? (
                            <input
                              autoFocus
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEdit(e);
                                if (e.key === "Escape") { e.stopPropagation(); setEditingId(null); }
                              }}
                              className="rounded border border-purple-300 px-2 py-0.5 text-sm font-medium text-gray-900 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
                            />
                          ) : (
                            <span className="font-medium text-gray-900">{list.name}</span>
                          )}

                          {list.is_default && (
                            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 shrink-0">
                              default
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-gray-600">
                        {list.record_count > 0 ? (
                          <span className="font-medium">
                            {list.record_count} {list.list_type === "people" ? "people" : "companies"}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-xs text-gray-500">{formatDate(list.created_at)}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{formatDate(list.updated_at)}</td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {editingId === list.id ? (
                            <>
                              <button
                                type="button"
                                onClick={saveEdit}
                                disabled={saving}
                                className="rounded p-1.5 text-gray-400 hover:bg-green-50 hover:text-green-600 transition-colors disabled:opacity-50"
                                title="Save"
                              >
                                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                                title="Cancel"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </>
                          ) : (
                            !list.is_default && (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => startEdit(e, list)}
                                  className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                                  title="Rename list"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleDelete(e, list.id, list.name)}
                                  disabled={deleting === list.id}
                                  className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                                  title="Delete list"
                                >
                                  {deleting === list.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              </>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {lists.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-16 text-center text-sm text-gray-400">
                        No lists yet. Add people or companies to a list from the search pages.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
