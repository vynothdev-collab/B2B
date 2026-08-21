import Link from "next/link";
import { Section, InlineCode, CodeBlock } from "../_lib/docs-ui";
import { SAMPLE_SMARTREACH_STATUS_RESPONSE } from "../_lib/docs-data";

export const metadata = { title: "leadsbuddy.ai: Smartreach Integration" };

export default function SmartreachOverviewDocPage() {
  return (
    <div>
      <h1 className="text-lg font-extrabold text-gray-900 sm:text-2xl">
        Smartreach Integration
      </h1>
      <p className="mt-2 max-w-2xl text-xs leading-relaxed text-gray-600 sm:text-sm">
        Connect your Smartreach account to LeadsBuddy and add unlocked people
        straight into a Smartreach outreach campaign — from search results or
        a contact&apos;s detail panel — without leaving the app. This is
        available to every LeadsBuddy account, individual or enterprise.
      </p>

      <Section id="connect" title="Connecting Your Account">
        <ol className="list-decimal space-y-2 pl-4">
          <li>
            In Smartreach, go to{" "}
            <span className="font-semibold text-gray-900">Settings → API</span>{" "}
            and generate an API key.
          </li>
          <li>
            In LeadsBuddy, go to{" "}
            <Link href="/search/integrations" className="font-semibold text-emerald-700 hover:underline">
              Integrations
            </Link>{" "}
            in the sidebar and click{" "}
            <span className="font-semibold text-gray-900">Connect to Smartreach</span>.
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
          Your Smartreach API key is <InlineCode>encrypted at rest</InlineCode> and
          used only to authenticate LeadsBuddy&apos;s requests to add prospects to a
          campaign of your choosing, and to list your campaigns for the picker
          shown when pushing. LeadsBuddy never modifies or deletes anything
          else in your Smartreach account.
        </p>
      </Section>

      <Section id="pushing" title="Pushing a Prospect">
        <p>
          A person record can only be pushed once its{" "}
          <span className="font-semibold text-gray-900">work email is unlocked</span> —
          Smartreach prospects are matched by email address. Once unlocked:
        </p>
        <ul className="list-disc space-y-1.5 pl-4">
          <li>
            Open a person&apos;s detail panel and click{" "}
            <span className="font-semibold text-gray-900">Push to Smartreach</span> for a
            single record.
          </li>
          <li>
            Or select multiple rows in People search and click{" "}
            <span className="font-semibold text-gray-900">Push to Smartreach</span> in the
            toolbar to push several at once.
          </li>
          <li>
            Either way, you&apos;ll pick which{" "}
            <span className="font-semibold text-gray-900">campaign</span> the
            prospect(s) should be added to — Smartreach requires a target
            campaign for every prospect.
          </li>
        </ul>
        <p>
          See{" "}
          <Link href="/document/api-key/smartreach/field-mapping" className="font-semibold text-emerald-700 hover:underline">
            Field Mapping
          </Link>{" "}
          for exactly which fields are sent. Each successfully pushed record
          costs <span className="font-semibold text-gray-900">1 credit</span>, on
          top of whatever the contact&apos;s unlock already cost — you&apos;re
          only charged for records that are actually delivered to Smartreach.
        </p>
      </Section>

      <Section id="status" title="Checking Connection Status">
        <p>
          The Integrations page reflects your current connection state at all times.
          You can also disconnect at any time from the same page — this immediately
          revokes LeadsBuddy&apos;s ability to push prospects to your Smartreach account.
        </p>
        <CodeBlock label="200 OK">{SAMPLE_SMARTREACH_STATUS_RESPONSE}</CodeBlock>
      </Section>

      <Section id="troubleshooting" title="Troubleshooting">
        <p>
          <span className="font-semibold text-gray-900">&quot;Invalid Smartreach API key&quot;</span> —
          the key was revoked or mistyped. Generate a new key from Smartreach →
          Settings → API and reconnect.
        </p>
        <p>
          <span className="font-semibold text-gray-900">Push button is disabled</span> — the
          record&apos;s work email hasn&apos;t been unlocked yet, or Smartreach isn&apos;t
          connected. Unlock the work email first, or connect Smartreach from the
          Integrations page.
        </p>
      </Section>
    </div>
  );
}
