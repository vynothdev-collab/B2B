import { Section, InlineCode, CodeBlock } from "../../_lib/docs-ui";
import {
  SMARTREACH_FIELD_MAPPING,
  SAMPLE_SMARTREACH_CAMPAIGNS_RESPONSE,
  SAMPLE_SMARTREACH_PUSH_RESPONSE,
} from "../../_lib/docs-data";

export const metadata = { title: "leadsbuddy.ai: Smartreach Field Mapping" };

export default function SmartreachFieldMappingDocPage() {
  return (
    <div>
      <h1 className="text-lg font-extrabold text-gray-900 sm:text-2xl">Field Mapping</h1>
      <p className="mt-2 max-w-2xl text-xs leading-relaxed text-gray-600 sm:text-sm">
        When a person record is pushed to Smartreach, it&apos;s added as a
        prospect on the campaign you select, using the mapping below. Only
        person records are supported — Smartreach prospects require an email
        address, so company records can&apos;t be pushed in this release.
      </p>

      <Section id="mapping" title="LeadsBuddy → Smartreach Prospect">
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[640px] text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs">
                <th className="px-4 py-2.5">LeadsBuddy Field</th>
                <th className="px-4 py-2.5">Smartreach Prospect Field</th>
                <th className="px-4 py-2.5">Notes</th>
              </tr>
            </thead>
            <tbody>
              {SMARTREACH_FIELD_MAPPING.map((m) => (
                <tr key={m.smartreachField} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-2.5 font-mono text-[11px] text-gray-900 sm:text-xs">{m.leadsbuddyField}</td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-gray-500 sm:text-xs">{m.smartreachField}</td>
                  <td className="px-4 py-2.5 text-gray-600">{m.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="campaigns" title="Choosing a Campaign">
        <p>
          Every push fetches your current Smartreach campaigns live, so the
          picker always reflects what exists in your Smartreach account:
        </p>
        <CodeBlock label="200 OK">{SAMPLE_SMARTREACH_CAMPAIGNS_RESPONSE}</CodeBlock>
      </Section>

      <Section id="requirements" title="Required Fields">
        <p>
          A push is rejected outright — before it reaches Smartreach — if the record&apos;s
          work email hasn&apos;t been unlocked yet, since <InlineCode>email</InlineCode> is
          required by Smartreach to add a prospect to a campaign, and if no campaign was
          selected.
        </p>
      </Section>

      <Section id="push-response" title="Push Result Shape">
        <p>
          Pushing one or more records returns a per-record result, so a batch push can
          partially succeed:
        </p>
        <CodeBlock label="200 OK">{SAMPLE_SMARTREACH_PUSH_RESPONSE}</CodeBlock>
      </Section>
    </div>
  );
}
