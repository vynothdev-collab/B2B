import { Wrench } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  const backendUrl = process.env.BACKEND_URL ?? "";
  let message =
    "We're performing scheduled maintenance right now. Please check back shortly — we'll be back online soon.";

  try {
    const res = await fetch(`${backendUrl}/platform/status`, { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as { maintenance_message?: string | null };
      if (data.maintenance_message) message = data.maintenance_message;
    }
  } catch {
    // fall back to the default message
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900/5">
          <Wrench className="h-7 w-7 text-slate-700" />
        </div>
        <h1 className="text-xl font-semibold text-slate-900">We&apos;ll be right back</h1>
        <p className="mt-3 text-sm text-slate-500">{message}</p>
      </div>
    </div>
  );
}
