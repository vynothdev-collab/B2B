import { Section, InlineCode, CodeBlock } from "../../_lib/docs-ui";
import {
  ZOHO_LEAD_FIELD_MAPPING,
  ZOHO_ACCOUNT_FIELD_MAPPING,
  SAMPLE_ZOHO_PUSH_RESPONSE,
} from "../../_lib/docs-data";

export const metadata = { title: "leadsbuddy.ai: Zoho CRM Field Mapping" };

export default function ZohoFieldMappingDocPage() {
  return (
    <div>
      <h1 className="text-lg font-extrabold text-gray-900 sm:text-2xl">Field Mapping</h1>
      <p className="mt-2 max-w-2xl text-xs leading-relaxed text-gray-600 sm:text-sm">
        A person record is created as a <InlineCode>Lead</InlineCode>; a company
        record is created as an <InlineCode>Account</InlineCode>. Both use the
        mappings below.
      </p>

      <Section id="lead-mapping" title="LeadsBuddy Person → Zoho Lead">
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[640px] text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs">
                <th className="px-4 py-2.5">LeadsBuddy Field</th>
                <th className="px-4 py-2.5">Zoho Lead Field</th>
                <th className="px-4 py-2.5">Notes</th>
              </tr>
            </thead>
            <tbody>
              {ZOHO_LEAD_FIELD_MAPPING.map((m) => (
                <tr key={m.zohoField} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-2.5 font-mono text-[11px] text-gray-900 sm:text-xs">{m.leadsbuddyField}</td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-gray-500 sm:text-xs">{m.zohoField}</td>
                  <td className="px-4 py-2.5 text-gray-600">{m.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="account-mapping" title="LeadsBuddy Company → Zoho Account">
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[640px] text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs">
                <th className="px-4 py-2.5">LeadsBuddy Field</th>
                <th className="px-4 py-2.5">Zoho Account Field</th>
                <th className="px-4 py-2.5">Notes</th>
              </tr>
            </thead>
            <tbody>
              {ZOHO_ACCOUNT_FIELD_MAPPING.map((m) => (
                <tr key={m.zohoField} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-2.5 font-mono text-[11px] text-gray-900 sm:text-xs">{m.leadsbuddyField}</td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-gray-500 sm:text-xs">{m.zohoField}</td>
                  <td className="px-4 py-2.5 text-gray-600">{m.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="requirements" title="Required Fields">
        <p>
          Zoho requires every Lead to have <InlineCode>Last_Name</InlineCode> and{" "}
          <InlineCode>Company</InlineCode>, and every Account to have{" "}
          <InlineCode>Account_Name</InlineCode>. If any of these are missing on
          the LeadsBuddy record, LeadsBuddy fills in a fallback
          (<InlineCode>&quot;Unknown&quot;</InlineCode> / <InlineCode>&quot;Unknown Company&quot;</InlineCode>)
          rather than failing the push.
        </p>
        <p>
          Work email and mobile number are optional on a Lead push — it goes
          through even if neither has been unlocked yet, using whichever
          contact fields are unlocked at push time.
        </p>
      </Section>

      <Section id="push-response" title="Push Result Shape">
        <p>
          Pushing one or more records returns a per-record result, so a batch push can
          partially succeed:
        </p>
        <CodeBlock label="200 OK">{SAMPLE_ZOHO_PUSH_RESPONSE}</CodeBlock>
      </Section>
    </div>
  );
}
