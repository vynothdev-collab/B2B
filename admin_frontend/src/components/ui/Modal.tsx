"use client";

import { useEffect, useRef } from "react";
import { X, Info } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Rust-colored mono eyebrow above the title, e.g. "Users · new record" */
  eyebrow?: string;
  title: string;
  /** Footer left-side hint text with an info icon */
  footerHint?: string;
  /** Label on the primary submit button */
  submitLabel?: string;
  /** Called when the primary button is clicked */
  onSubmit?: () => void;
  /** Show a danger-red primary button instead of forest-green */
  submitDanger?: boolean;
  children: React.ReactNode;
}

export default function Modal({
  open,
  onClose,
  eyebrow,
  title,
  footerHint,
  submitLabel = "Save",
  onSubmit,
  submitDanger = false,
  children,
}: ModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(23,50,41,.42)", backdropFilter: "blur(2px)" }}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div
        className="relative flex flex-col w-full overflow-hidden"
        style={{
          maxWidth: 560,
          maxHeight: "88vh",
          background: "var(--card)",
          borderRadius: 18,
          border: "1px solid var(--line)",
          boxShadow: "0 24px 60px -12px rgba(23,50,41,.28)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between gap-4 shrink-0"
          style={{ padding: "22px 24px 18px", borderBottom: "1px solid var(--line)" }}
        >
          <div>
            {eyebrow && (
              <p
                className="mb-1.5"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10.5,
                  color: "var(--rust)",
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                }}
              >
                {eyebrow}
              </p>
            )}
            <h2
              className="font-semibold"
              style={{ fontFamily: "var(--font-fraunces)", fontSize: 20 }}
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 flex items-center justify-center rounded-[9px] transition-colors"
            style={{
              width: 32,
              height: 32,
              border: "1px solid var(--line)",
              color: "var(--ink-faint)",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--paper)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--ink-faint)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--ink)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--line)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--ink-faint)";
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto" style={{ padding: "22px 24px" }}>
          {children}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between gap-3 shrink-0"
          style={{ padding: "16px 24px", borderTop: "1px solid var(--line)" }}
        >
          <div
            className="flex items-center gap-1.5"
            style={{ fontSize: 11.5, color: "var(--ink-faint)" }}
          >
            {footerHint && (
              <>
                <Info size={13} />
                <span>{footerHint}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-[10px] font-semibold transition-colors"
              style={{
                padding: "9px 16px",
                fontSize: 13,
                border: "1px solid var(--line)",
                background: "transparent",
                color: "var(--ink-dim)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--paper)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSubmit}
              className="inline-flex items-center justify-center rounded-[10px] font-semibold transition-colors"
              style={{
                padding: "9px 16px",
                fontSize: 13,
                background: submitDanger ? "var(--rose)" : "var(--forest)",
                color: submitDanger ? "#FFF7F8" : "#FFFDF6",
                border: "none",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = submitDanger
                  ? "#9A4159"
                  : "var(--forest-2)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = submitDanger
                  ? "var(--rose)"
                  : "var(--forest)";
              }}
            >
              {submitLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Field helpers ─────────────────────────────────────────────────────── */

interface FieldProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
}

export function Field({ label, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col mb-3.5" style={{ gap: 6 }}>
      <label
        className="font-semibold"
        style={{ fontSize: 12, color: "var(--ink)" }}
      >
        {label}
        {hint && (
          <span style={{ fontWeight: 400, color: "var(--ink-faint)", marginLeft: 4 }}>
            — {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

const fieldInputStyle: React.CSSProperties = {
  border: "1px solid var(--line)",
  borderRadius: 9,
  padding: "10px 12px",
  background: "var(--paper)",
  fontSize: 13,
  color: "var(--ink)",
  width: "100%",
  outline: "none",
  transition: "border-color .15s, box-shadow .15s",
};

function applyFocus(el: HTMLElement) {
  el.style.borderColor = "var(--rust)";
  el.style.background = "var(--card)";
  el.style.boxShadow = "0 0 0 3px var(--rust-dim)";
}
function removeFocus(el: HTMLElement) {
  el.style.borderColor = "var(--line)";
  el.style.background = "var(--paper)";
  el.style.boxShadow = "none";
}

export function FieldInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={fieldInputStyle}
      onFocus={(e) => { applyFocus(e.currentTarget); props.onFocus?.(e); }}
      onBlur={(e) => { removeFocus(e.currentTarget); props.onBlur?.(e); }}
    />
  );
}

export function FieldSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      style={fieldInputStyle}
      onFocus={(e) => { applyFocus(e.currentTarget); props.onFocus?.(e); }}
      onBlur={(e) => { removeFocus(e.currentTarget); props.onBlur?.(e); }}
    />
  );
}

export function FieldTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{ ...fieldInputStyle, resize: "vertical", minHeight: 70 }}
      onFocus={(e) => { applyFocus(e.currentTarget); props.onFocus?.(e); }}
      onBlur={(e) => { removeFocus(e.currentTarget); props.onBlur?.(e); }}
    />
  );
}

/** Two-column grid wrapper for side-by-side fields */
export function FieldRow({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="grid gap-3.5 mb-3.5"
      style={{ gridTemplateColumns: "1fr 1fr" }}
    >
      {children}
    </div>
  );
}
