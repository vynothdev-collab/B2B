import Link from "next/link";
import { Section, InlineCode, CodeBlock } from "../_lib/docs-ui";
import {
  WEBHOOK_FIELD_MAPPING,
  SAMPLE_WEBHOOK_CONNECT_RESPONSE,
  SAMPLE_WEBHOOK_PAYLOAD,
  SAMPLE_WEBHOOK_PUSH_RESPONSE,
} from "../_lib/docs-data";

export const metadata = { title: "leadsbuddy.ai: Custom CRM (Webhook) Integration" };

const VERIFY_SNIPPET = `const crypto = require("crypto");

function isValidSignature(rawBody, signatureHeader, secret) {
  const expected = "sha256=" + crypto
    .createHmac("sha256", secret)
    .update(rawBody) // the raw, unparsed request body
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signatureHeader),
  );
}`;

export default function WebhookOverviewDocPage() {
  return (
    <div>
      <h1 className="text-lg font-extrabold text-gray-900 sm:text-2xl">
        Custom CRM (Webhook) Integration
      </h1>
      <p className="mt-2 max-w-2xl text-xs leading-relaxed text-gray-600 sm:text-sm">
        Not on Salesforce, HubSpot, Instantly, or Smartreach? Connect any CRM
        or automation tool by giving LeadsBuddy a webhook URL — a Zapier or
        Make catch hook, an n8n webhook trigger, or a direct endpoint on your
        own system. LeadsBuddy signs every request so you can verify it
        actually came from us.
      </p>

      <Section id="connect" title="Connecting a Webhook">
        <ol className="list-decimal space-y-2 pl-4">
          <li>
            Set up a webhook receiver — a Zapier &quot;Catch Hook&quot;
            trigger, a Make/n8n webhook node, or an endpoint on your own CRM
            or middleware that accepts a JSON <InlineCode>POST</InlineCode>.
          </li>
          <li>
            Go to{" "}
            <Link href="/search/integrations" className="font-semibold text-violet-700 hover:underline">
              Integrations
            </Link>{" "}
            in the LeadsBuddy sidebar and click{" "}
            <span className="font-semibold text-gray-900">Connect to Custom CRM (Webhook)</span>.
          </li>
          <li>
            Paste the webhook URL and click{" "}
            <span className="font-semibold text-gray-900">Connect</span>.
            LeadsBuddy sends a test <InlineCode>ping</InlineCode> request and
            only saves the connection if it gets back a 2xx response.
          </li>
          <li>
            You&apos;ll see a <span className="font-semibold text-gray-900">signing secret</span> exactly
            once — copy it now. You&apos;ll need it to verify requests on
            your end (see below). If you lose it, use{" "}
            <span className="font-semibold text-gray-900">Regenerate secret</span> on
            the Integrations page to get a new one.
          </li>
        </ol>
        <CodeBlock label="200 OK — connect response (secret shown once)">
          {SAMPLE_WEBHOOK_CONNECT_RESPONSE}
        </CodeBlock>
      </Section>

      <Section id="verify" title="Verifying the Signature">
        <p>
          Every request LeadsBuddy sends includes an{" "}
          <InlineCode>X-LeadsBuddy-Signature</InlineCode> header:{" "}
          <InlineCode>sha256=&lt;hex-encoded HMAC-SHA256 of the raw
          request body, using your signing secret&gt;</InlineCode>. Recompute
          it on your end and compare — using a constant-time comparison, not
          <InlineCode>===</InlineCode>, to avoid timing attacks:
        </p>
        <CodeBlock label="verify.js">{VERIFY_SNIPPET}</CodeBlock>
        <p>
          If you&apos;re receiving via Zapier/Make/n8n rather than your own
          code, you can skip verification (the catch-hook URL itself is
          already a secret), but it&apos;s recommended for any endpoint you
          control directly.
        </p>
      </Section>

      <Section id="pushing" title="Pushing a Record">
        <p>
          A person record can only be pushed once its{" "}
          <span className="font-semibold text-gray-900">work email is unlocked</span>.
          Once unlocked:
        </p>
        <ul className="list-disc space-y-1.5 pl-4">
          <li>
            Open a person&apos;s detail panel and click{" "}
            <span className="font-semibold text-gray-900">Push to CRM</span> for
            a single record.
          </li>
          <li>
            Or select multiple rows in People search and click{" "}
            <span className="font-semibold text-gray-900">Push to CRM</span> in
            the toolbar to push several at once.
          </li>
        </ul>
        <p>
          Each successfully delivered record (your endpoint returned 2xx)
          costs <span className="font-semibold text-gray-900">1 credit</span>, on
          top of whatever the contact&apos;s unlock already cost. If your
          webhook returns a non-2xx status or doesn&apos;t respond, the push
          is reported as failed and no credit is charged.
        </p>
      </Section>

      <Section id="payload" title="Payload Shape">
        <p>Every push (and the initial connect-time ping) is a JSON POST:</p>
        <CodeBlock label="POST to your webhook_url">{SAMPLE_WEBHOOK_PAYLOAD}</CodeBlock>
      </Section>

      <Section id="mapping" title="Field Mapping">
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[640px] text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs">
                <th className="px-4 py-2.5">LeadsBuddy Field</th>
                <th className="px-4 py-2.5">Payload Field</th>
                <th className="px-4 py-2.5">Notes</th>
              </tr>
            </thead>
            <tbody>
              {WEBHOOK_FIELD_MAPPING.map((m) => (
                <tr key={m.payloadField} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-2.5 font-mono text-[11px] text-gray-900 sm:text-xs">{m.leadsbuddyField}</td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-gray-500 sm:text-xs">{m.payloadField}</td>
                  <td className="px-4 py-2.5 text-gray-600">{m.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="push-response" title="Push Result Shape">
        <p>
          Pushing one or more records returns a per-record result, so a batch push can
          partially succeed:
        </p>
        <CodeBlock label="200 OK">{SAMPLE_WEBHOOK_PUSH_RESPONSE}</CodeBlock>
      </Section>

      <Section id="troubleshooting" title="Troubleshooting">
        <p>
          <span className="font-semibold text-gray-900">Connect fails with &quot;did not respond&quot;</span> —
          your webhook URL didn&apos;t return a 2xx status to the test ping.
          Check the receiver is live and not behind auth LeadsBuddy can&apos;t pass.
        </p>
        <p>
          <span className="font-semibold text-gray-900">Pushes fail after connecting fine</span> —
          check the Integrations page&apos;s last-delivery status; a
          receiver that goes down or starts rejecting requests after you
          connected will show as <InlineCode>failed</InlineCode> there.
        </p>
        <p>
          <span className="font-semibold text-gray-900">Signature never matches</span> —
          make sure you&apos;re hashing the raw, unparsed request body (not
          a re-serialized version of it), and using the most recent secret if
          you&apos;ve regenerated it.
        </p>
      </Section>
    </div>
  );
}
