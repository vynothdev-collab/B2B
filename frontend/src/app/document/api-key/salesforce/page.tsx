import Link from "next/link";
import { Section, InlineCode, CodeBlock } from "../_lib/docs-ui";
import { SAMPLE_SALESFORCE_STATUS_RESPONSE } from "../_lib/docs-data";

export const metadata = { title: "leadsbuddy.ai: Salesforce Integration" };

export default function SalesforceOverviewDocPage() {
  return (
    <div>
      <h1 className="text-lg font-extrabold text-gray-900 sm:text-2xl">
        Salesforce Integration
      </h1>
      <p className="mt-2 max-w-2xl text-xs leading-relaxed text-gray-600 sm:text-sm">
        Connect your Salesforce org to LeadsBuddy and push unlocked people as
        Salesforce Leads — from search results or a contact&apos;s detail panel — without
        leaving the app. This is available to every LeadsBuddy account, individual
        or enterprise.
      </p>

      <Section id="connect" title="Connecting Your Account">
        <ol className="list-decimal space-y-2 pl-4">
          <li>
            Go to{" "}
            <Link href="/search/integrations" className="font-semibold text-red-600 hover:underline">
              Integrations
            </Link>{" "}
            in the LeadsBuddy sidebar.
          </li>
          <li>Click <span className="font-semibold text-gray-900">Connect to Salesforce</span>.</li>
          <li>
            Log in to your Salesforce account and approve the connection request. You&apos;ll
            be redirected back to LeadsBuddy automatically.
          </li>
          <li>
            Once connected, the Integrations page shows your Salesforce account email
            and a <span className="font-semibold text-emerald-700">Connected</span> badge.
          </li>
        </ol>
        <p>
          This first release supports <span className="font-semibold text-gray-900">production
          Salesforce orgs only</span> (accounts at <InlineCode>login.salesforce.com</InlineCode>).
          Sandbox org support may be added in a future release.
        </p>
      </Section>

      <Section id="permissions" title="What Access Is Requested">
        <p>
          LeadsBuddy requests the <InlineCode>api</InlineCode>, <InlineCode>refresh_token</InlineCode>,
          and <InlineCode>id</InlineCode> OAuth scopes from Salesforce — enough to create Lead
          records on your behalf and keep the connection alive without you having to
          reconnect every few hours. LeadsBuddy never reads, modifies, or deletes any
          other data in your org.
        </p>
      </Section>

      <Section id="pushing" title="Pushing a Lead">
        <p>
          A person record can only be pushed once its{" "}
          <span className="font-semibold text-gray-900">work email is unlocked</span> —
          Salesforce Leads require an email address. Once unlocked:
        </p>
        <ul className="list-disc space-y-1.5 pl-4">
          <li>
            Open a person&apos;s detail panel and click{" "}
            <span className="font-semibold text-gray-900">Push to Salesforce</span> for a
            single record.
          </li>
          <li>
            Or select multiple rows in People search and click{" "}
            <span className="font-semibold text-gray-900">Push to Salesforce</span> in the
            toolbar to push several at once.
          </li>
        </ul>
        <p>
          See{" "}
          <Link href="/document/api-key/salesforce/field-mapping" className="font-semibold text-red-600 hover:underline">
            Field Mapping
          </Link>{" "}
          for exactly which fields are sent. Each successfully pushed record
          costs <span className="font-semibold text-gray-900">1 credit</span>, on
          top of whatever the contact&apos;s unlock already cost — you&apos;re
          only charged for records that are actually delivered to Salesforce.
        </p>
      </Section>

      <Section id="status" title="Checking Connection Status">
        <p>
          The Integrations page reflects your current connection state at all times.
          You can also disconnect at any time from the same page — this immediately
          revokes LeadsBuddy&apos;s ability to push leads to your org.
        </p>
        <CodeBlock label="200 OK">{SAMPLE_SALESFORCE_STATUS_RESPONSE}</CodeBlock>
      </Section>

      <Section id="troubleshooting" title="Troubleshooting">
        <p>
          <span className="font-semibold text-gray-900">&quot;Salesforce connection expired&quot;</span> —
          your org&apos;s refresh token was revoked or expired (e.g. an admin revoked
          third-party app access). Go to Integrations, disconnect, and reconnect.
        </p>
        <p>
          <span className="font-semibold text-gray-900">Push button is disabled</span> — the
          record&apos;s work email hasn&apos;t been unlocked yet, or Salesforce isn&apos;t
          connected. Unlock the work email first, or connect Salesforce from the
          Integrations page.
        </p>
      </Section>
    </div>
  );
}
