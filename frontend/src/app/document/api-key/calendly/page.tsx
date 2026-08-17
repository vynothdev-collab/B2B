import Link from "next/link";
import { Section, InlineCode, CodeBlock } from "../_lib/docs-ui";
import { SAMPLE_CALENDLY_STATUS_RESPONSE } from "../_lib/docs-data";

export const metadata = { title: "leadsbuddy.ai: Calendly Integration" };

export default function CalendlyOverviewDocPage() {
  return (
    <div>
      <h1 className="text-lg font-extrabold text-gray-900 sm:text-2xl">
        Calendly Integration
      </h1>
      <p className="mt-2 max-w-2xl text-xs leading-relaxed text-gray-600 sm:text-sm">
        Connect your Calendly account so your booking link is automatically
        attached whenever you push a person to Salesforce or Instantly —
        recipients can self-schedule a meeting without any extra work on
        your end. Calendly isn&apos;t a place LeadsBuddy pushes records to,
        so there&apos;s no separate &quot;Push to Calendly&quot; action —
        connecting it simply enriches your existing pushes.
      </p>

      <Section id="connect" title="Connecting Your Account">
        <ol className="list-decimal space-y-2 pl-4">
          <li>
            In Calendly, go to{" "}
            <span className="font-semibold text-gray-900">Integrations → API &amp; Webhooks</span>{" "}
            and generate a Personal Access Token.
          </li>
          <li>
            In LeadsBuddy, go to{" "}
            <Link href="/search/integrations" className="font-semibold text-blue-700 hover:underline">
              Integrations
            </Link>{" "}
            in the sidebar and click{" "}
            <span className="font-semibold text-gray-900">Connect to Calendly</span>.
          </li>
          <li>
            Paste the token and click{" "}
            <span className="font-semibold text-gray-900">Connect</span>. LeadsBuddy
            verifies it and fetches your scheduling link — there&apos;s no
            redirect or consent screen.
          </li>
        </ol>
      </Section>

      <Section id="where" title="Where Your Link Shows Up">
        <p>
          Once connected, your Calendly scheduling link is included
          automatically on future pushes:
        </p>
        <ul className="list-disc space-y-1.5 pl-4">
          <li>
            <span className="font-semibold text-gray-900">Salesforce</span> — added
            to the Lead&apos;s <InlineCode>Description</InlineCode> field.
          </li>
          <li>
            <span className="font-semibold text-gray-900">Instantly</span> — added
            to the lead&apos;s <InlineCode>personalization</InlineCode> field, so it
            can be merged into your email templates.
          </li>
          <li>
            <span className="font-semibold text-gray-900">HubSpot</span> — not
            supported yet. HubSpot Contacts don&apos;t have a default
            free-text property that&apos;s guaranteed to exist in every
            portal the way Salesforce&apos;s <InlineCode>Description</InlineCode> does,
            so LeadsBuddy doesn&apos;t guess at a custom property name.
          </li>
        </ul>
        <p>
          If Calendly isn&apos;t connected, pushes work exactly as before —
          this field is simply omitted, nothing is required.
        </p>
      </Section>

      <Section id="credits" title="Credits">
        <p>
          Connecting Calendly, and attaching your link to a push, costs{" "}
          <span className="font-semibold text-gray-900">no additional credits</span>.
          It enriches a push you&apos;re already making — the existing
          per-record push credit is the only charge involved.
        </p>
      </Section>

      <Section id="status" title="Checking Connection Status">
        <p>
          The Integrations page reflects your current connection state and
          shows your scheduling link. You can disconnect at any time — this
          immediately stops the link from being attached to new pushes.
        </p>
        <CodeBlock label="200 OK">{SAMPLE_CALENDLY_STATUS_RESPONSE}</CodeBlock>
      </Section>

      <Section id="troubleshooting" title="Troubleshooting">
        <p>
          <span className="font-semibold text-gray-900">&quot;Invalid Calendly API key&quot;</span> —
          the token was revoked or mistyped. Generate a new one from
          Calendly → Integrations → API &amp; Webhooks and reconnect.
        </p>
        <p>
          <span className="font-semibold text-gray-900">Link missing from a HubSpot push</span> —
          expected; see &quot;Where Your Link Shows Up&quot; above.
        </p>
      </Section>
    </div>
  );
}
