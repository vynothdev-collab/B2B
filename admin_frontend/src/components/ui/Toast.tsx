"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";

/* ── Types ─────────────────────────────────────────────────────────────── */

export type ToastVariant = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
  /** Optional inline action link */
  action?: { label: string; onClick: () => void };
  /** Duration in ms — default 6000; set 0 to persist until dismissed */
  duration?: number;
}

interface ToastContextValue {
  show: (opts: Omit<ToastItem, "id">) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

/* ── Variant config ─────────────────────────────────────────────────────── */

const VARIANTS: Record<
  ToastVariant,
  { borderColor: string; iconBg: string; iconColor: string; progressBg: string; Icon: React.ElementType }
> = {
  success: {
    borderColor: "var(--sage)",
    iconBg: "var(--sage-dim)",
    iconColor: "var(--sage)",
    progressBg: "var(--sage)",
    Icon: CheckCircle2,
  },
  error: {
    borderColor: "var(--rose)",
    iconBg: "var(--rose-dim)",
    iconColor: "var(--rose)",
    progressBg: "var(--rose)",
    Icon: AlertCircle,
  },
  warning: {
    borderColor: "var(--gold)",
    iconBg: "var(--gold-dim)",
    iconColor: "#8A6222",
    progressBg: "var(--gold)",
    Icon: AlertTriangle,
  },
  info: {
    borderColor: "var(--forest)",
    iconBg: "rgba(23,50,41,.08)",
    iconColor: "var(--forest)",
    progressBg: "var(--forest)",
    Icon: Info,
  },
};

/* ── Context ────────────────────────────────────────────────────────────── */

const ToastContext = createContext<ToastContextValue | null>(null);

/* ── Single Toast ───────────────────────────────────────────────────────── */

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  const v = VARIANTS[item.variant];
  const duration = item.duration ?? 6000;

  return (
    <div
      className="relative flex items-start gap-3 overflow-hidden"
      style={{
        background: "var(--card)",
        border: "1px solid var(--line)",
        borderLeft: `3px solid ${v.borderColor}`,
        borderRadius: 12,
        padding: 14,
        boxShadow: "0 10px 30px -8px rgba(23,50,41,.16)",
        animation: "toast-in .35s cubic-bezier(.2,.8,.3,1) both",
      }}
    >
      {/* Icon */}
      <div
        className="flex items-center justify-center shrink-0"
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          background: v.iconBg,
          color: v.iconColor,
        }}
      >
        <v.Icon size={16} />
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0 pt-px">
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{item.title}</p>
        {item.message && (
          <p style={{ fontSize: 12.5, color: "var(--ink-dim)", marginTop: 2, lineHeight: 1.5 }}>
            {item.message}
          </p>
        )}
        {item.action && (
          <button
            type="button"
            onClick={item.action.onClick}
            className="mt-2 font-semibold"
            style={{ fontSize: 12, color: v.iconColor, background: "none", border: "none", padding: 0 }}
          >
            {item.action.label}
          </button>
        )}
      </div>

      {/* Close */}
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => onDismiss(item.id)}
        className="flex items-center justify-center shrink-0 rounded-[6px] transition-colors"
        style={{ width: 22, height: 22, color: "var(--ink-faint)", background: "none", border: "none", marginTop: 1 }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "var(--paper)";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--ink)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "none";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--ink-faint)";
        }}
      >
        <X size={12} />
      </button>

      {/* Progress bar */}
      {duration > 0 && (
        <div
          className="absolute left-0 bottom-0 h-[2.5px]"
          style={{
            width: "100%",
            background: v.progressBg,
            transformOrigin: "left",
            animation: `toast-shrink ${duration}ms linear forwards`,
          }}
        />
      )}
    </div>
  );
}

/* ── Provider ───────────────────────────────────────────────────────────── */

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (opts: Omit<ToastItem, "id">) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const duration = opts.duration ?? 3000;
      setToasts((prev) => [...prev, { ...opts, id, duration }]);
      if (duration > 0) {
        timers.current[id] = setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss]
  );

  const success = useCallback((title: string, message?: string) => show({ variant: "success", title, message }), [show]);
  const error   = useCallback((title: string, message?: string) => show({ variant: "error",   title, message }), [show]);
  const warning = useCallback((title: string, message?: string) => show({ variant: "warning", title, message }), [show]);
  const info    = useCallback((title: string, message?: string) => show({ variant: "info",    title, message }), [show]);

  return (
    <ToastContext.Provider value={{ show, success, error, warning, info }}>
      {children}

      {/* Stack — fixed top-right */}
      {toasts.length > 0 && (
        <div
          className="fixed z-[200] flex flex-col gap-2.5"
          style={{ top: 20, right: 20, width: "100%", maxWidth: 360 }}
        >
          {toasts.map((t) => (
            <ToastCard key={t.id} item={t} onDismiss={dismiss} />
          ))}
        </div>
      )}

      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(24px) scale(.97); }
          to   { opacity: 1; transform: translateX(0)    scale(1);   }
        }
        @keyframes toast-shrink {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
        @media (max-width: 480px) {
          .toast-stack { left: 12px; right: 12px; top: 12px; max-width: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: .001ms !important; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

/* ── Hook ───────────────────────────────────────────────────────────────── */

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
