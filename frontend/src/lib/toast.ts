import { toast as sonner } from "sonner";

function extractDetail(e: unknown): { msg: string; status?: number } {
  const res = (e as { response?: { data?: { detail?: string }; status?: number } })?.response;
  const msg = res?.data?.detail ?? (e instanceof Error ? e.message : "Something went wrong");
  return { msg, status: res?.status };
}

function show(msg: string, status?: number) {
  if (status === 402 || status === 429) {
    sonner.warning(msg, { duration: 6000 });
  } else {
    sonner.error(msg, { duration: 5000 });
  }
}

export const toast = {
  apiError(e: unknown) {
    const { msg, status } = extractDetail(e);
    show(msg, status);
  },

  error(msg: string) {
    sonner.error(msg, { duration: 5000 });
  },

  warning(msg: string) {
    sonner.warning(msg, { duration: 6000 });
  },

  success(msg: string) {
    sonner.success(msg, { duration: 3000 });
  },

  sessionExpired() {
    sonner.error("Your session has expired. Please sign in again.", {
      id: "session-expired",
      duration: 5000,
    });
  },
};
