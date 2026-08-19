import Link from "next/link";
import { Section, InlineCode, CodeBlock } from "../_lib/docs-ui";
import { SAMPLE_ZOHO_STATUS_RESPONSE } from "../_lib/docs-data";

export const metadata = { title: "leadsbuddy.ai: Zoho CRM Integration" };

export default function ZohoOverviewDocPage() {
  return (
    <div>
      <h1 className="text-lg font-extrabold text-gray-900 sm:text-2xl">
        Zoho CRM Integration
      </h1>
      <p className="mt-2 max-w-2xl text-xs leading-relaxed text-gray-600 sm:text-sm">
        Connect your Zoho CRM account to LeadsBuddy and push unlocked people as
        Leads, or companies as Accounts — from search results or a contact&apos;s
        detail panel — without leaving the app. This is available to every
        LeadsBuddy account, individual or enterprise.
      </p>

      <Section id="connect" title="Connecting Your Account">
        <ol className="list-decimal space-y-2 pl-4">
          <li>
            Go to{" "}
            <Link href="/search/integrations" className="font-semibold hover:underline" style={{ color: "#e42527" }}>
              Integrations
            </Link>{" "}
            in the LeadsBuddy sidebar.
          </li>
          <li>Click <span className="font-semibold text-gray-900">Connect to Zoho CRM</span>.</li>
          <li>
            Log in to your Zoho account and approve the connection request. You&apos;ll
            be redirected back to LeadsBuddy automatically.
          </li>
          <li>
            Once connected, the Integrations page shows your Zoho account email
            and a <span className="font-semibold text-emerald-700">Connected</span> badge.
          </li>
        </ol>
        <p>
          LeadsBuddy authenticates against <InlineCode>accounts.zoho.com</InlineCode> by
          default. If your Zoho account is registered in a different data center
          (India, Europe, China, Japan, or Australia), contact support — the
          server needs to be configured for your region&apos;s accounts domain.
        </p>
      </Section>

      <Section id="permissions" title="What Access Is Requested">
        <p>
          LeadsBuddy requests <InlineCode>ZohoCRM.modules.leads.CREATE</InlineCode>,{" "}
          <InlineCode>ZohoCRM.modules.accounts.CREATE</InlineCode>, and{" "}
          <InlineCode>ZohoCRM.users.READ</InlineCode> — enough to create Lead and
          Account records on your behalf and identify your connected account.
          LeadsBuddy never reads, modifies, or deletes any other data in your
          Zoho CRM.
        </p>
      </Section>

      <Section id="pushing" title="Pushing a Lead or Account">
        <ul className="list-disc space-y-1.5 pl-4">
          <li>
            Open a person&apos;s detail panel and click{" "}
            <span className="font-semibold text-gray-900">Push to...</span> →{" "}
            <span className="font-semibold text-gray-900">Zoho CRM</span> for a
            single record.
          </li>
          <li>
            Or select multiple rows in People or Company search and use the same{" "}
            <span className="font-semibold text-gray-900">Push to...</span> menu
            in the toolbar to push several at once.
          </li>
        </ul>
        <p>
          People are pushed as Leads using whichever contact fields are
          unlocked — no email is required upfront. Companies are pushed as
          Accounts. See{" "}
          <Link href="/document/api-key/zoho/field-mapping" className="font-semibold hover:underline" style={{ color: "#e42527" }}>
            Field Mapping
          </Link>{" "}
          for exactly which fields are sent. Each successfully pushed record
          costs <span className="font-semibold text-gray-900">1 credit</span>, on
          top of whatever the contact&apos;s unlock already cost — you&apos;re
          only charged for records that are actually delivered to Zoho.
        </p>
      </Section>

      <Section id="status" title="Checking Connection Status">
        <p>
          The Integrations page reflects your current connection state at all times.
          You can also disconnect at any time from the same page — this immediately
          revokes LeadsBuddy&apos;s ability to push records to your Zoho CRM.
        </p>
        <CodeBlock label="200 OK">{SAMPLE_ZOHO_STATUS_RESPONSE}</CodeBlock>
      </Section>

      <Section id="troubleshooting" title="Troubleshooting">
        <p>
          <span className="font-semibold text-gray-900">&quot;Zoho connection expired&quot;</span> —
          your refresh token was revoked (e.g. an admin revoked the connected
          app in Zoho, or it was unused long enough to expire). Go to
          Integrations, disconnect, and reconnect.
        </p>
        <p>
          <span className="font-semibold text-gray-900">Push button is disabled</span> — Zoho
          isn&apos;t connected. Connect Zoho CRM from the Integrations page.
        </p>
      </Section>
    </div>
  );
}
