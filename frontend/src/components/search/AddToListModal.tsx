"use client";
import { useEffect, useRef, useState } from "react";
import { X, Search, Plus, Users, Building2, Loader2, Info } from "lucide-react";
import { getLists, addToList, type ListRecord, type ListItemPayload } from "@/lib/listsApi";
import { toast } from "@/lib/toast";

interface Props {
  open: boolean;
  onClose: () => void;
  items: ListItemPayload[];
  itemType: "person" | "company";
}

export default function AddToListModal({ open, onClose, items, itemType }: Props) {
  const [lists, setLists] = useState<ListRecord[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      fetchedRef.current = false;
      setQuery("");
      return;
    }
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    setLoading(true);
    getLists()
      .then(setLists)
      .catch(() => toast.error("Failed to load lists"))
      .finally(() => setLoading(false));
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  if (!open) return null;

  const listType = itemType === "person" ? "people" : "companies";
  const userLists = lists.filter((l) => !l.is_default && l.list_type === listType);
  const filtered = userLists.filter((l) =>
    l.name.toLowerCase().includes(query.toLowerCase())
  );
  const showCreate =
    query.trim().length > 0 &&
    !userLists.some((l) => l.name.toLowerCase() === query.trim().toLowerCase());

  async function handleAdd(listId?: string, listName?: string) {
    const key = listId ?? "__new__";
    setAdding(key);
    try {
      const res = await addToList({
        list_id: listId,
        list_name: listName,
        list_type: listType,
        items,
      });
      toast.success(`${res.added} item${res.added !== 1 ? "s" : ""} added to "${res.list_name}"`);
      onClose();
    } catch {
      toast.error("Failed to add to list");
    } finally {
      setAdding(null);
    }
  }

  const Icon = itemType === "person" ? Users : Building2;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-1.5rem)] max-w-[380px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5">
          <h2 className="text-sm font-semibold text-gray-900">
            Add to {itemType === "person" ? "People" : "Company"} List
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Info banner */}
        <div className="mx-4 mt-3 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <p className="text-[11px] leading-snug text-red-700">
            {items.length} lead{items.length !== 1 ? "s" : ""} selected. Choose an existing list or type a name to create a new one.
          </p>
        </div>

        {/* Search input */}
        <div className="px-4 pb-2 pt-3">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 transition-colors focus-within:border-red-400 focus-within:bg-white">
            <Search className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search or create a list..."
              className="min-w-0 flex-1 bg-transparent text-xs text-gray-700 placeholder-gray-400 outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && showCreate) handleAdd(undefined, query.trim());
              }}
            />
          </div>
        </div>

        {/* Section label */}
        <p className="px-4 pb-1 pt-0.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          Your Lists
        </p>

        {/* List rows */}
        <div className="max-h-56 overflow-y-auto px-4 pb-2">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-4 w-4 animate-spin text-red-500" />
            </div>
          )}

          {!loading && showCreate && (
            <div className="flex items-center justify-between rounded-xl px-2 py-2.5 transition-colors hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500">
                  <Plus className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-800">
                    &ldquo;{query.trim()}&rdquo;
                  </p>
                  <p className="text-[10px] text-gray-400">Create new list</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleAdd(undefined, query.trim())}
                disabled={adding !== null}
                className="flex items-center gap-1 rounded-full bg-red-500 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-60"
              >
                {adding === "__new__" ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-3 w-3" />
                    Create
                  </>
                )}
              </button>
            </div>
          )}

          {!loading && filtered.map((list) => (
            <div
              key={list.id}
              className="flex items-center justify-between rounded-xl px-2 py-2.5 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-gray-800">{list.name}</p>
                  <p className="text-[10px] text-gray-400">
                    {list.record_count ?? 0} record{(list.record_count ?? 0) !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleAdd(list.id)}
                disabled={adding !== null}
                className="ml-2 flex shrink-0 items-center gap-1 rounded-full bg-red-500 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-60"
              >
                {adding === list.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "Add"
                )}
              </button>
            </div>
          ))}

          {!loading && filtered.length === 0 && !showCreate && (
            <p className="py-6 text-center text-xs text-gray-400">
              {userLists.length === 0
                ? "No lists yet — type a name above to create one"
                : "No matching lists"}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 border-t border-gray-100 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
