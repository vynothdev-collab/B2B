"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";

export interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface Props {
  items: ActionMenuItem[];
}

export default function ActionMenu({ items }: Props) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleOpen = () => {
    if (btnRef.current) {
      setRect(btnRef.current.getBoundingClientRect());
    }
    setOpen((o) => !o);
  };

  const menuStyle: React.CSSProperties = rect
    ? {
        position: "fixed",
        right: window.innerWidth - rect.right,
        bottom: window.innerHeight - rect.top + 4,
        zIndex: 9999,
      }
    : { display: "none" };

  return (
    <div className="inline-block">
      <button
        ref={btnRef}
        type="button"
        onClick={handleOpen}
        className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors"
        style={{
          borderColor: open ? "var(--line)" : "transparent",
          background: open ? "var(--paper)" : "transparent",
          color: "var(--ink-dim)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--line)";
          (e.currentTarget as HTMLButtonElement).style.background = "var(--paper)";
        }}
        onMouseLeave={(e) => {
          if (!open) {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent";
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          }
        }}
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            className="min-w-[160px] overflow-hidden rounded-xl border py-1 shadow-xl"
            style={{
              ...menuStyle,
              background: "var(--card)",
              borderColor: "var(--line)",
              boxShadow: "0 8px 24px -4px rgba(23,50,41,.18)",
            }}
          >
            {items.map((item, i) => (
              <button
                key={i}
                type="button"
                disabled={item.disabled}
                onClick={() => {
                  setOpen(false);
                  item.onClick();
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  color: item.danger ? "var(--rose)" : "var(--ink)",
                  background: "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!item.disabled)
                    (e.currentTarget as HTMLButtonElement).style.background = item.danger
                      ? "var(--rose-dim)"
                      : "var(--paper)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
              >
                {item.icon && (
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                    {item.icon}
                  </span>
                )}
                {item.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}
