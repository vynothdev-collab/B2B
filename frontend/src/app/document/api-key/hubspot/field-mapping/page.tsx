import { Section, InlineCode, CodeBlock } from "../../_lib/docs-ui";
import { HUBSPOT_FIELD_MAPPING, SAMPLE_HUBSPOT_PUSH_RESPONSE } from "../../_lib/docs-data";

export const metadata = { title: "leadsbuddy.ai: HubSpot Field Mapping" };

export default function HubspotFieldMappingDocPage() {
  return (
    <div>
      <h1 className="text-lg font-extrabold text-gray-900 sm:text-2xl">Field Mapping</h1>
      <p className="mt-2 max-w-2xl text-xs leading-relaxed text-gray-600 sm:text-sm">
        When a person record is pushed to HubSpot, it&apos;s created or updated as a{" "}
        <InlineCode>Contact</InlineCode> object using the mapping below. Only person
        records are supported — company records can&apos;t be pushed in this release.
      </p>

      <Section id="mapping" title="LeadsBuddy → HubSpot Contact">
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[640px] text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs">
                <th className="px-4 py-2.5">LeadsBuddy Field</th>
                <th className="px-4 py-2.5">HubSpot Contact Property</th>
                <th className="px-4 py-2.5">Notes</th>
              </tr>
            </thead>
            <tbody>
              {HUBSPOT_FIELD_MAPPING.map((m) => (
                <tr key={m.hubspotField} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-2.5 font-mono text-[11px] text-gray-900 sm:text-xs">{m.leadsbuddyField}</td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-gray-500 sm:text-xs">{m.hubspotField}</td>
                  <td className="px-4 py-2.5 text-gray-600">{m.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="requirements" title="Required Fields">
        <p>
          Unlike Salesforce, HubSpot doesn&apos;t require a name on a Contact —
          fields are only sent if LeadsBuddy actually knows them, with no
          forced fallback values.
        </p>
        <p>
          A push is rejected outright — before it reaches HubSpot — if the record&apos;s
          work email hasn&apos;t been unlocked yet, since <InlineCode>email</InlineCode> is
          both the whole point of sending a contact to your CRM and the field
          HubSpot uses to match against an existing Contact.
        </p>
      </Section>

      <Section id="push-response" title="Push Result Shape">
        <p>
          Pushing one or more records returns a per-record result, so a batch push can
          partially succeed:
        </p>
        <CodeBlock label="200 OK">{SAMPLE_HUBSPOT_PUSH_RESPONSE}</CodeBlock>
      </Section>
    </div>
  );
}
