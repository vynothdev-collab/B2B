"use client";

import { useEffect, useRef } from "react";
import { AlertCircle, Info, Trash2, Ban, X } from "lucide-react";

type IconVariant = "danger" | "warning" | "info";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  /** Icon style: danger (rose), warning (gold), info (forest) — default: "danger" */
  variant?: IconVariant;
  title: string;
  description: React.ReactNode;
  /** Optional gold-tinted advisory note below the description */
  note?: string;
  /** Label on the destructive/confirm button — default: "Confirm" */
  confirmLabel?: string;
  /** Label on the cancel button — default: "Cancel" */
  cancelLabel?: string;
}

const VARIANT_STYLES: Record<
  IconVariant,
  { iconBg: string; iconColor: string; btnBg: string; btnHover: string; btnColor: string }
> = {
  danger: {
    iconBg: "var(--rose-dim)",
    iconColor: "var(--rose)",
    btnBg: "var(--rose)",
    btnHover: "#9A4159",
    btnColor: "#FFF7F8",
  },
  warning: {
    iconBg: "var(--gold-dim)",
    iconColor: "var(--gold-dark, #93691F)",
    btnBg: "var(--gold)",
    btnHover: "#B8832A",
    btnColor: "#FFFDF6",
  },
  info: {
    iconBg: "var(--sage-dim)",
    iconColor: "var(--sage)",
    btnBg: "var(--forest)",
    btnHover: "var(--forest-2)",
    btnColor: "#FFFDF6",
  },
};

function VariantIcon({ variant }: { variant: IconVariant }) {
  if (variant === "warning") return <AlertCircle size={24} />;
  if (variant === "info") return <Info size={24} />;
  return <AlertCircle size={24} />;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  variant = "danger",
  title,
  description,
  note,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
}: ConfirmDialogProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const v = VARIANT_STYLES[variant];

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
        className="w-full"
        style={{
          maxWidth: 400,
          background: "var(--card)",
          borderRadius: 18,
          border: "1px solid var(--line)",
          boxShadow: "0 24px 60px -12px rgba(23,50,41,.28)",
        }}
      >
        {/* Body */}
        <div className="text-center" style={{ padding: "28px 26px 22px" }}>
          {/* Icon */}
          <div
            className="flex items-center justify-center mx-auto mb-4"
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: v.iconBg,
              color: v.iconColor,
            }}
          >
            <VariantIcon variant={variant} />
          </div>

          {/* Title */}
          <h2
            className="font-semibold mb-2"
            style={{ fontFamily: "var(--font-fraunces)", fontSize: 19 }}
          >
            {title}
          </h2>

          {/* Description */}
          <p style={{ color: "var(--ink-dim)", fontSize: 13, lineHeight: 1.6 }}>
            {description}
          </p>

          {/* Advisory note */}
          {note && (
            <div
              className="flex items-start gap-2 mt-3.5 text-left"
              style={{
                padding: "10px 12px",
                borderRadius: 9,
                background: "var(--gold-dim)",
                color: "#8A6222",
                fontSize: 12,
              }}
            >
              <Info size={14} style={{ marginTop: 1, flexShrink: 0 }} />
              <span>{note}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2.5" style={{ padding: "0 26px 24px" }}>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 inline-flex items-center justify-center rounded-[10px] font-semibold transition-colors"
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
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 inline-flex items-center justify-center rounded-[10px] font-semibold transition-colors"
            style={{
              padding: "9px 16px",
              fontSize: 13,
              background: v.btnBg,
              color: v.btnColor,
              border: "none",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = v.btnHover;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = v.btnBg;
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
