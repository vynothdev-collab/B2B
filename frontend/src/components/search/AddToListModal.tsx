"use client";
import { useEffect, useRef, useState } from "react";
import { X, Search, Plus, Users, Building2, Loader2 } from "lucide-react";
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

  // Only show user-created lists — default lists are populated automatically
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

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-1.5rem)] max-w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2.5 sm:px-4 sm:py-3">
          <div>
            <p className="text-xs font-semibold text-gray-900 sm:text-sm">
              Add to {itemType === "person" ? "people" : "company"} list
            </p>
            <p className="text-[11px] text-gray-400 sm:text-xs">
              {items.length} lead{items.length !== 1 ? "s" : ""} selected
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-2.5 sm:p-3">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 transition-colors focus-within:border-red-400 focus-within:bg-white sm:px-3 sm:py-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Create list or search lists..."
              className="min-w-0 flex-1 bg-transparent text-[11px] text-gray-700 placeholder-gray-400 outline-none sm:text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && showCreate) handleAdd(undefined, query.trim());
              }}
            />
          </div>
        </div>

        <div className="max-h-52 overflow-y-auto px-2 pb-2.5 sm:max-h-56 sm:pb-3">
          {loading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin text-red-500" />
            </div>
          )}

          {!loading && showCreate && (
            <button
              type="button"
              onClick={() => handleAdd(undefined, query.trim())}
              disabled={adding !== null}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-60 sm:px-3 sm:py-2.5 sm:text-sm"
            >
              {adding === "__new__" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Create "{query.trim()}"
            </button>
          )}

          {!loading && filtered.map((list) => (
            <button
              key={list.id}
              type="button"
              onClick={() => handleAdd(list.id)}
              disabled={adding !== null}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60 sm:px-3 sm:py-2.5 sm:text-sm"
            >
              {adding === list.id ? (
                <Loader2 className="h-4 w-4 animate-spin text-red-500" />
              ) : itemType === "person" ? (
                <Users className="h-4 w-4 text-gray-400" />
              ) : (
                <Building2 className="h-4 w-4 text-gray-400" />
              )}
              <span className="flex-1 text-left">{list.name}</span>
              <span className="text-xs text-gray-400">{list.record_count}</span>
            </button>
          ))}

          {!loading && filtered.length === 0 && !showCreate && (
            <p className="px-3 py-4 text-center text-xs text-gray-400">
              {userLists.length === 0
                ? "No lists yet — type a name above to create one"
                : "No matching lists"}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
