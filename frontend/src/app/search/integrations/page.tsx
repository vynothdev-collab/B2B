import { Suspense } from "react";
import IntegrationsClient from "./IntegrationsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "leadsbuddy.ai: Integrations" };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <IntegrationsClient />
    </Suspense>
  );
}
