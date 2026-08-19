"use client";
import { useCallback, useEffect, useState } from "react";
import { getSalesforceStatus } from "@/lib/salesforceApi";
import { getHubspotStatus } from "@/lib/hubspotApi";
import { getInstantlyStatus } from "@/lib/instantlyApi";
import { getSmartreachStatus } from "@/lib/smartreachApi";

export interface CrmConnections {
  salesforce: boolean;
  hubspot: boolean;
  instantly: boolean;
  smartreach: boolean;
}

const EMPTY: CrmConnections = {
  salesforce: false,
  hubspot: false,
  instantly: false,
  smartreach: false,
};

export function useCrmConnections() {
  const [connections, setConnections] = useState<CrmConnections>(EMPTY);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [sf, hs, inst, sr] = await Promise.allSettled([
      getSalesforceStatus(),
      getHubspotStatus(),
      getInstantlyStatus(),
      getSmartreachStatus(),
    ]);
    setConnections({
      salesforce: sf.status === "fulfilled" && sf.value.connected,
      hubspot: hs.status === "fulfilled" && hs.value.connected,
      instantly: inst.status === "fulfilled" && inst.value.connected,
      smartreach: sr.status === "fulfilled" && sr.value.connected,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { connections, loading, refresh };
}
