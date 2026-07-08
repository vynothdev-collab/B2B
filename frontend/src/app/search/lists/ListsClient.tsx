"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Building2, Trash2, Loader2, List, Pencil, Check, X, Plus, MoreHorizontal } from "lucide-react";
import AppHeader from "@/components/layout/AppHeader";
import { getLists, createList, deleteList, renameList, type ListRecord } from "@/lib/listsApi";
import { toast } from "@/lib/toast";

function DeleteConfirmModal({
  listName,
  onConfirm,
  onClose,
  loading,
}: {
  listName: string;
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-red-500" />
            <h2 className="text-sm font-semibold text-gray-900">Delete list</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-900">&ldquo;{listName}&rdquo;</span>?
            This action cannot be undone.
          </p>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              {loading && <Loader2 className="h-3 w-3 animate-spin" />}
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewListModal({
  type,
  onConfirm,
  onClose,
  loading,
}: {
  type: "people" | "companies";
  onConfirm: (name: string) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (name.trim()) onConfirm(name.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            {type === "people"
              ? <Users className="h-4 w-4 text-red-600" />
              : <Building2 className="h-4 w-4 text-red-600" />}
            <h2 className="text-sm font-semibold text-gray-900">
              New {type === "people" ? "people" : "company"} list
            </h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4">
          <label className="mb-1.5 block text-xs font-medium text-gray-600">List name</label>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={type === "people" ? "e.g. Q3 Prospects" : "e.g. Target Accounts"}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
            onKeyDown={(e) => e.key === "Escape" && onClose()}
          />

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              {loading && <Loader2 className="h-3 w-3 animate-spin" />}
              Create list
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RowMenu({
  onEdit,
  onDelete,
}: {
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        title="Actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-36 rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={(e) => { setOpen(false); onEdit(e); }}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5 text-gray-400" />
            Rename
          </button>
          <button
            type="button"
            onClick={(e) => { setOpen(false); onDelete(e); }}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

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
  const [creatingList, setCreatingList] = useState(false);
  const [newListModal, setNewListModal] = useState<"people" | "companies" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    getLists()
      .then(setLists)
      .catch(() => toast.error("Failed to load lists"))
      .finally(() => setLoading(false));
  }, []);

  function handleDelete(e: React.MouseEvent, id: string, name: string) {
    e.stopPropagation();
    setDeleteTarget({ id, name });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const { id, name } = deleteTarget;
    setDeleting(id);
    try {
      await deleteList(id);
      setLists((prev) => prev.filter((l) => l.id !== id));
      toast.success(`"${name}" deleted`);
      setDeleteTarget(null);
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

  async function handleCreateList(name: string) {
    if (!newListModal) return;
    const type = newListModal;
    setCreatingList(true);
    try {
      const created = await createList(name, type);
      setLists((prev) => [...prev, created]);
      toast.success(`"${created.name}" created`);
      setNewListModal(null);
    } catch {
      toast.error("Failed to create list");
    } finally {
      setCreatingList(false);
    }
  }

  return (
    <>
      <AppHeader title="Lists" />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden px-2 py-2 sm:px-3">
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm sm:rounded-xl">
          <div className="flex shrink-0 items-center gap-2 border-b border-gray-100 px-3 py-2.5 sm:px-4">
            <List className="h-4 w-4 text-red-600 shrink-0" />
            <span className="text-sm font-semibold text-gray-900">Your lists</span>
            {!loading && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                {lists.length}
              </span>
            )}
            <div className="ml-auto flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setNewListModal("people")}
                disabled={creatingList}
                className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50 sm:text-xs"
              >
                {creatingList ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                <Users className="h-3 w-3" />
                People list
              </button>
              <button
                type="button"
                onClick={() => setNewListModal("companies")}
                disabled={creatingList}
                className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50 sm:text-xs"
              >
                {creatingList ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                <Building2 className="h-3 w-3" />
                Company list
              </button>
            </div>
          </div>

          {loading && (
            <div className="flex-1 overflow-auto">
              <table className="w-full min-w-[560px] text-xs sm:min-w-[600px] [&_td]:px-4 [&_td]:py-3 [&_th]:px-4 [&_th]:py-2.5 animate-pulse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left"><div className="h-3 w-20 rounded bg-gray-200" /></th>
                    <th className="text-left"><div className="h-3 w-24 rounded bg-gray-200" /></th>
                    <th className="text-left"><div className="h-3 w-20 rounded bg-gray-200" /></th>
                    <th className="text-left"><div className="h-3 w-20 rounded bg-gray-200" /></th>
                    <th className="text-left"><div className="h-3 w-12 rounded bg-gray-200" /></th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td><div className="flex items-center gap-2.5"><div className="h-4 w-4 rounded bg-gray-200" /><div className="h-3 w-32 rounded bg-gray-200" /></div></td>
                      <td><div className="h-3 w-16 rounded bg-gray-200" /></td>
                      <td><div className="h-3 w-24 rounded bg-gray-200" /></td>
                      <td><div className="h-3 w-24 rounded bg-gray-200" /></td>
                      <td><div className="h-5 w-12 rounded bg-gray-200" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && (
            <div className="flex-1 overflow-auto">
              <table className="w-full min-w-[560px] text-xs sm:min-w-[600px] sm:text-sm [&_td]:px-3 [&_td]:py-2 [&_th]:px-3 [&_th]:py-2 [&_th]:text-[11px] sm:[&_td]:px-4 sm:[&_td]:py-3 sm:[&_th]:px-4 sm:[&_th]:py-2.5 sm:[&_th]:text-xs">
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
                              className="rounded border border-red-300 px-2 py-0.5 text-sm font-medium text-gray-900 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200"
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
                        {editingId === list.id ? (
                          <div className="flex items-center gap-1">
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
                          </div>
                        ) : (
                          !list.is_default && (
                            <RowMenu
                              onEdit={(e) => startEdit(e, list)}
                              onDelete={(e) => handleDelete(e, list.id, list.name)}
                            />
                          )
                        )}
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

      {deleteTarget && (
        <DeleteConfirmModal
          listName={deleteTarget.name}
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleting === deleteTarget.id}
        />
      )}

      {newListModal && (
        <NewListModal
          type={newListModal}
          onConfirm={handleCreateList}
          onClose={() => setNewListModal(null)}
          loading={creatingList}
        />
      )}
    </>
  );
}
