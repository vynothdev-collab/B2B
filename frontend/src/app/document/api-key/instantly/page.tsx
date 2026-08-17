import Link from "next/link";
import { Section, InlineCode, CodeBlock } from "../_lib/docs-ui";
import { SAMPLE_INSTANTLY_STATUS_RESPONSE } from "../_lib/docs-data";

export const metadata = { title: "leadsbuddy.ai: Instantly Integration" };

export default function InstantlyOverviewDocPage() {
  return (
    <div>
      <h1 className="text-lg font-extrabold text-gray-900 sm:text-2xl">
        Instantly Integration
      </h1>
      <p className="mt-2 max-w-2xl text-xs leading-relaxed text-gray-600 sm:text-sm">
        Connect your Instantly account to LeadsBuddy and add unlocked people
        straight into an Instantly outreach campaign — from search results or
        a contact&apos;s detail panel — without leaving the app. This is
        available to every LeadsBuddy account, individual or enterprise.
      </p>

      <Section id="connect" title="Connecting Your Account">
        <ol className="list-decimal space-y-2 pl-4">
          <li>
            In Instantly, go to{" "}
            <span className="font-semibold text-gray-900">Settings → Integrations → API</span>{" "}
            and generate an API key.
          </li>
          <li>
            In LeadsBuddy, go to{" "}
            <Link href="/search/integrations" className="font-semibold text-blue-700 hover:underline">
              Integrations
            </Link>{" "}
            in the sidebar and click{" "}
            <span className="font-semibold text-gray-900">Connect to Instantly</span>.
          </li>
          <li>
            Paste the API key and click{" "}
            <span className="font-semibold text-gray-900">Connect</span>. LeadsBuddy
            verifies the key by listing your campaigns before saving it — there&apos;s
            no redirect or consent screen.
          </li>
          <li>
            Once connected, the Integrations page shows a{" "}
            <span className="font-semibold text-emerald-700">Connected</span> badge.
          </li>
        </ol>
      </Section>

      <Section id="permissions" title="What Access Is Used">
        <p>
          Your Instantly API key is <InlineCode>encrypted at rest</InlineCode> and
          used only to authenticate LeadsBuddy&apos;s requests to add leads to a
          campaign of your choosing, and to list your campaigns for the picker
          shown when pushing. LeadsBuddy never modifies or deletes anything
          else in your Instantly workspace.
        </p>
      </Section>

      <Section id="pushing" title="Pushing a Lead">
        <p>
          A person record can only be pushed once its{" "}
          <span className="font-semibold text-gray-900">work email is unlocked</span> —
          Instantly leads are matched by email address. Once unlocked:
        </p>
        <ul className="list-disc space-y-1.5 pl-4">
          <li>
            Open a person&apos;s detail panel and click{" "}
            <span className="font-semibold text-gray-900">Push to Instantly</span> for a
            single record.
          </li>
          <li>
            Or select multiple rows in People search and click{" "}
            <span className="font-semibold text-gray-900">Push to Instantly</span> in the
            toolbar to push several at once.
          </li>
          <li>
            Either way, you&apos;ll pick which{" "}
            <span className="font-semibold text-gray-900">campaign</span> the lead(s)
            should be added to — Instantly requires a target campaign for every lead.
          </li>
        </ul>
        <p>
          See{" "}
          <Link href="/document/api-key/instantly/field-mapping" className="font-semibold text-blue-700 hover:underline">
            Field Mapping
          </Link>{" "}
          for exactly which fields are sent. Each successfully pushed record
          costs <span className="font-semibold text-gray-900">1 credit</span>, on
          top of whatever the contact&apos;s unlock already cost — you&apos;re
          only charged for records that are actually delivered to Instantly.
        </p>
      </Section>

      <Section id="status" title="Checking Connection Status">
        <p>
          The Integrations page reflects your current connection state at all times.
          You can also disconnect at any time from the same page — this immediately
          revokes LeadsBuddy&apos;s ability to push leads to your Instantly account.
        </p>
        <CodeBlock label="200 OK">{SAMPLE_INSTANTLY_STATUS_RESPONSE}</CodeBlock>
      </Section>

      <Section id="troubleshooting" title="Troubleshooting">
        <p>
          <span className="font-semibold text-gray-900">&quot;Invalid Instantly API key&quot;</span> —
          the key was revoked or mistyped. Generate a new key from Instantly →
          Settings → Integrations → API and reconnect.
        </p>
        <p>
          <span className="font-semibold text-gray-900">Push button is disabled</span> — the
          record&apos;s work email hasn&apos;t been unlocked yet, or Instantly isn&apos;t
          connected. Unlock the work email first, or connect Instantly from the
          Integrations page.
        </p>
      </Section>
    </div>
  );
}
