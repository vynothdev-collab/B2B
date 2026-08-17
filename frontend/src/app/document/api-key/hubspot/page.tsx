import Link from "next/link";
import { Section, InlineCode, CodeBlock } from "../_lib/docs-ui";
import { SAMPLE_HUBSPOT_STATUS_RESPONSE } from "../_lib/docs-data";

export const metadata = { title: "leadsbuddy.ai: HubSpot Integration" };

export default function HubspotOverviewDocPage() {
  return (
    <div>
      <h1 className="text-lg font-extrabold text-gray-900 sm:text-2xl">
        HubSpot Integration
      </h1>
      <p className="mt-2 max-w-2xl text-xs leading-relaxed text-gray-600 sm:text-sm">
        Connect your HubSpot account to LeadsBuddy and push unlocked people as
        HubSpot Contacts — from search results or a contact&apos;s detail panel —
        without leaving the app. This is available to every LeadsBuddy account,
        individual or enterprise.
      </p>

      <Section id="connect" title="Connecting Your Account">
        <ol className="list-decimal space-y-2 pl-4">
          <li>
            Go to{" "}
            <Link href="/search/integrations" className="font-semibold text-orange-600 hover:underline">
              Integrations
            </Link>{" "}
            in the LeadsBuddy sidebar.
          </li>
          <li>Click <span className="font-semibold text-gray-900">Connect to HubSpot</span>.</li>
          <li>
            Log in to your HubSpot account and approve the connection request. You&apos;ll
            be redirected back to LeadsBuddy automatically.
          </li>
          <li>
            Once connected, the Integrations page shows your HubSpot account domain
            and a <span className="font-semibold text-emerald-700">Connected</span> badge.
          </li>
        </ol>
      </Section>

      <Section id="permissions" title="What Access Is Requested">
        <p>
          LeadsBuddy requests the <InlineCode>crm.objects.contacts.write</InlineCode>,{" "}
          <InlineCode>crm.objects.contacts.read</InlineCode>, and{" "}
          <InlineCode>oauth</InlineCode> scopes from HubSpot — enough to create and
          update Contact records on your behalf and keep the connection alive.
          LeadsBuddy never reads, modifies, or deletes any other object type in
          your HubSpot account.
        </p>
      </Section>

      <Section id="pushing" title="Pushing a Contact">
        <p>
          A person record can only be pushed once its{" "}
          <span className="font-semibold text-gray-900">work email is unlocked</span> —
          HubSpot Contacts are matched by email address. Once unlocked:
        </p>
        <ul className="list-disc space-y-1.5 pl-4">
          <li>
            Open a person&apos;s detail panel and click{" "}
            <span className="font-semibold text-gray-900">Push to HubSpot</span> for a
            single record.
          </li>
          <li>
            Or select multiple rows in People search and click{" "}
            <span className="font-semibold text-gray-900">Push to HubSpot</span> in the
            toolbar to push several at once.
          </li>
        </ul>
        <p>
          Pushing the same person again updates their existing HubSpot Contact
          rather than creating a duplicate. See{" "}
          <Link href="/document/api-key/hubspot/field-mapping" className="font-semibold text-orange-600 hover:underline">
            Field Mapping
          </Link>{" "}
          for exactly which fields are sent. Each successfully pushed record
          costs <span className="font-semibold text-gray-900">1 credit</span>, on
          top of whatever the contact&apos;s unlock already cost — you&apos;re
          only charged for records that are actually delivered to HubSpot.
        </p>
      </Section>

      <Section id="status" title="Checking Connection Status">
        <p>
          The Integrations page reflects your current connection state at all times.
          You can also disconnect at any time from the same page — this immediately
          revokes LeadsBuddy&apos;s ability to push contacts to your account.
        </p>
        <CodeBlock label="200 OK">{SAMPLE_HUBSPOT_STATUS_RESPONSE}</CodeBlock>
      </Section>

      <Section id="troubleshooting" title="Troubleshooting">
        <p>
          <span className="font-semibold text-gray-900">&quot;HubSpot connection expired&quot;</span> —
          your account&apos;s refresh token was revoked or expired (e.g. an admin
          revoked third-party app access). Go to Integrations, disconnect, and
          reconnect.
        </p>
        <p>
          <span className="font-semibold text-gray-900">Push button is disabled</span> — the
          record&apos;s work email hasn&apos;t been unlocked yet, or HubSpot isn&apos;t
          connected. Unlock the work email first, or connect HubSpot from the
          Integrations page.
        </p>
      </Section>
    </div>
  );
}
