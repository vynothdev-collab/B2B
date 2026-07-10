"use client";
import { Loader2, X } from "lucide-react";
import type { ReactNode } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  loading?: boolean;
  icon?: ReactNode;
  variant?: "danger" | "info";
}

export default function ConfirmDialog({
  open,
  title,
  message,
  onClose,
  onConfirm,
  confirmLabel = "OK",
  cancelLabel,
  onCancel,
  loading = false,
  icon,
  variant = "info",
}: ConfirmDialogProps) {
  if (!open) return null;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    else onClose();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    else onClose();
  };

  const confirmClass =
    variant === "danger"
      ? "flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
      : "flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4">
          <div className="text-sm text-gray-600">{message}</div>

          <div className="mt-4 flex justify-end gap-2">
            {cancelLabel && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              >
                {cancelLabel}
              </button>
            )}
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className={confirmClass}
            >
              {loading && <Loader2 className="h-3 w-3 animate-spin" />}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
