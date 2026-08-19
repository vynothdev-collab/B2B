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
            In HubSpot, create a{" "}
            <span className="font-semibold text-gray-900">private app</span> and
            copy its access token — see{" "}
            <Link href="#api-key" className="font-semibold text-orange-600 hover:underline">
              Getting Your HubSpot API Key
            </Link>{" "}
            below for the exact steps.
          </li>
          <li>
            In LeadsBuddy, go to{" "}
            <Link href="/search/integrations" className="font-semibold text-orange-600 hover:underline">
              Integrations
            </Link>{" "}
            in the sidebar and click{" "}
            <span className="font-semibold text-gray-900">Connect to HubSpot</span>.
          </li>
          <li>
            Paste the access token and click{" "}
            <span className="font-semibold text-gray-900">Connect</span>. LeadsBuddy
            verifies the token against your HubSpot account before saving it —
            there&apos;s no redirect or consent screen.
          </li>
          <li>
            Once connected, the Integrations page shows a{" "}
            <span className="font-semibold text-emerald-700">Connected</span> badge
            (and your account domain, if the private app also has account
            info access).
          </li>
        </ol>
      </Section>

      <Section id="permissions" title="What Access Is Used">
        <p>
          Your HubSpot access token is <InlineCode>encrypted at rest</InlineCode> and
          used only to create and update Contact records on your behalf. LeadsBuddy
          never reads, modifies, or deletes any other object type in your HubSpot
          account — make sure the private app you create only grants the{" "}
          <InlineCode>crm.objects.contacts.write</InlineCode> and{" "}
          <InlineCode>crm.objects.contacts.read</InlineCode> scopes.
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
          <span className="font-semibold text-gray-900">&quot;Invalid HubSpot API key&quot;</span> —
          the token was mistyped, or belongs to a private app that was deleted.
          Copy the token again from HubSpot and reconnect.
        </p>
        <p>
          <span className="font-semibold text-gray-900">&quot;HubSpot API key is no longer valid&quot;</span> —
          the private app&apos;s access token was regenerated or the app was
          uninstalled. Go to Integrations, disconnect, and reconnect with the
          new token.
        </p>
        <p>
          <span className="font-semibold text-gray-900">Push button is disabled</span> — the
          record&apos;s work email hasn&apos;t been unlocked yet, or HubSpot isn&apos;t
          connected. Unlock the work email first, or connect HubSpot from the
          Integrations page.
        </p>
      </Section>

      <Section id="api-key" title="Getting Your HubSpot API Key">
        <p>
          HubSpot no longer issues a single account-wide API key — access is
          granted through a <span className="font-semibold text-gray-900">private app</span>,
          which gives you a scoped, revocable access token that behaves the
          same way. Here&apos;s how to create one:
        </p>
        <ol className="list-decimal space-y-2 pl-4">
          <li>
            Log in to HubSpot and click the{" "}
            <span className="font-semibold text-gray-900">settings gear icon</span> in
            the top navigation bar.
          </li>
          <li>
            In the left sidebar, go to{" "}
            <span className="font-semibold text-gray-900">Integrations → Private Apps</span>.
          </li>
          <li>
            Click <span className="font-semibold text-gray-900">Create a private app</span>.
          </li>
          <li>
            Under the <span className="font-semibold text-gray-900">Basic Info</span> tab,
            give the app a name, e.g. <InlineCode>LeadsBuddy</InlineCode>, so it&apos;s
            easy to recognize later.
          </li>
          <li>
            Switch to the <span className="font-semibold text-gray-900">Scopes</span> tab
            and, under CRM, enable{" "}
            <InlineCode>crm.objects.contacts.write</InlineCode> and{" "}
            <InlineCode>crm.objects.contacts.read</InlineCode>. Leave every other
            scope unchecked — LeadsBuddy doesn&apos;t need them.
          </li>
          <li>
            Click <span className="font-semibold text-gray-900">Create app</span> in
            the top-right corner, then confirm in the dialog that appears.
          </li>
          <li>
            On the next screen, click{" "}
            <span className="font-semibold text-gray-900">Show token</span> and copy
            the access token (it starts with <InlineCode>pat-</InlineCode>).
            HubSpot only shows it once, so copy it somewhere safe.
          </li>
          <li>
            Paste that token into the{" "}
            <span className="font-semibold text-gray-900">Connect HubSpot</span> dialog
            on the LeadsBuddy{" "}
            <Link href="/search/integrations" className="font-semibold text-orange-600 hover:underline">
              Integrations
            </Link>{" "}
            page.
          </li>
        </ol>
        <p>
          If you ever need to revoke access, go back to{" "}
          <span className="font-semibold text-gray-900">Integrations → Private Apps</span> in
          HubSpot and delete the app, or simply click{" "}
          <span className="font-semibold text-gray-900">Disconnect</span> on the
          LeadsBuddy Integrations page.
        </p>
      </Section>
    </div>
  );
}
