import { Section, InlineCode, CodeBlock } from "../../_lib/docs-ui";
import { SALESFORCE_FIELD_MAPPING, SAMPLE_SALESFORCE_PUSH_RESPONSE } from "../../_lib/docs-data";

export const metadata = { title: "leadsbuddy.ai: Salesforce Field Mapping" };

export default function SalesforceFieldMappingDocPage() {
  return (
    <div>
      <h1 className="text-lg font-extrabold text-gray-900 sm:text-2xl">Field Mapping</h1>
      <p className="mt-2 max-w-2xl text-xs leading-relaxed text-gray-600 sm:text-sm">
        When a person record is pushed to Salesforce, it&apos;s created as a{" "}
        <InlineCode>Lead</InlineCode> object using the mapping below. Only person records
        are supported — Salesforce&apos;s standard Lead object requires a person name, so
        company records can&apos;t be pushed in this release.
      </p>

      <Section id="mapping" title="LeadsBuddy → Salesforce Lead">
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[640px] text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs">
                <th className="px-4 py-2.5">LeadsBuddy Field</th>
                <th className="px-4 py-2.5">Salesforce Lead Field</th>
                <th className="px-4 py-2.5">Notes</th>
              </tr>
            </thead>
            <tbody>
              {SALESFORCE_FIELD_MAPPING.map((m) => (
                <tr key={m.salesforceField} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-2.5 font-mono text-[11px] text-gray-900 sm:text-xs">{m.leadsbuddyField}</td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-gray-500 sm:text-xs">{m.salesforceField}</td>
                  <td className="px-4 py-2.5 text-gray-600">{m.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="requirements" title="Required Fields">
        <p>
          Salesforce requires every Lead to have <InlineCode>LastName</InlineCode> and{" "}
          <InlineCode>Company</InlineCode>. If either is missing on the LeadsBuddy record,
          LeadsBuddy fills in a fallback (<InlineCode>&quot;Unknown&quot;</InlineCode> and{" "}
          <InlineCode>&quot;Unknown Company&quot;</InlineCode> respectively) rather than
          failing the push.
        </p>
        <p>
          Work email and mobile number are optional — a push goes through even if
          neither has been unlocked yet, using whichever contact fields are
          unlocked at push time. <InlineCode>Email</InlineCode>/<InlineCode>Phone</InlineCode>{" "}
          are simply omitted from the Lead when locked.
        </p>
      </Section>

      <Section id="push-response" title="Push Result Shape">
        <p>
          Pushing one or more records returns a per-record result, so a batch push can
          partially succeed:
        </p>
        <CodeBlock label="200 OK">{SAMPLE_SALESFORCE_PUSH_RESPONSE}</CodeBlock>
      </Section>
    </div>
  );
}
