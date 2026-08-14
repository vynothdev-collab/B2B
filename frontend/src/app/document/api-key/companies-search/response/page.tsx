import Link from "next/link";
import { Section, InlineCode, CodeBlock, FieldTable, FilterGroupTable, EndpointPageNav } from "../../_lib/docs-ui";
import { COMPANY_FIELDS, COMPANY_NESTED_FIELDS, SAMPLE_COMPANY_SEARCH_RESPONSE } from "../../_lib/docs-data";

export const metadata = { title: "leadsbuddy.ai: Company Search — Response" };

export default function CompanySearchResponsePage() {
  return (
    <div>
      <h1 className="text-lg font-extrabold text-gray-900 sm:text-2xl">Company Search — Response</h1>
      <p className="mt-2 max-w-2xl text-xs leading-relaxed text-gray-600 sm:text-sm">
        This page documents the shape of a successful <InlineCode>200 OK</InlineCode> response
        from <InlineCode>POST /companies/search</InlineCode>, and what every field in it means.
        Each record includes the full profile data shown on that company&apos;s business card
        in the web app — description, specialties, and more — in addition to the summary
        fields shown in the Company search results table.
      </p>

      <div className="mt-6">
        <EndpointPageNav basePath="/document/api-key/companies-search" current="response" />
      </div>

      <Section id="sample-response" title="Sample Response">
        <CodeBlock label="200 OK">{SAMPLE_COMPANY_SEARCH_RESPONSE}</CodeBlock>
        <p>
          <InlineCode>data</InlineCode> is an array of company records. <InlineCode>meta</InlineCode> describes
          the total match count and how to fetch the next page — see{" "}
          <Link href="/document/api-key/pagination" className="font-semibold text-red-600 hover:underline">Pagination</Link>.
        </p>
        <p>
          Company records don&apos;t have a locked contact field — unlocking is only
          available for person records. See{" "}
          <Link href="/document/api-key/unlock" className="font-semibold text-red-600 hover:underline">Unlock Contacts</Link>.
        </p>
      </Section>

      <Section id="fields" title="Field Reference">
        <FieldTable fields={COMPANY_FIELDS} />
      </Section>

      <Section id="nested-fields" title="Nested Object Fields">
        <p>
          Fields marked <InlineCode>object</InlineCode> or <InlineCode>array</InlineCode> above
          (<InlineCode>employees_count_change</InlineCode>, <InlineCode>last_funding_round</InlineCode>,
          and the rest) have keys documented below.
        </p>
        <FilterGroupTable groups={COMPANY_NESTED_FIELDS} />
      </Section>
    </div>
  );
}
