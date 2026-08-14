import { Section, InlineCode, CodeBlock, FilterGroupTable, EndpointPageNav } from "../../_lib/docs-ui";
import { COMPANY_FILTER_GROUPS, SAMPLE_COMPANY_SEARCH_REQUEST } from "../../_lib/docs-data";

export const metadata = { title: "leadsbuddy.ai: Company Search — Request Payload" };

export default function CompanySearchRequestPage() {
  return (
    <div>
      <h1 className="text-lg font-extrabold text-gray-900 sm:text-2xl">Company Search — Request Payload</h1>
      <p className="mt-2 max-w-2xl text-xs leading-relaxed text-gray-600 sm:text-sm">
        This page documents everything you can send in the JSON body of{" "}
        <InlineCode>POST /companies/search</InlineCode>. Every filter is optional — send only
        the ones you need. Filters are grouped exactly as they appear under Company search in
        the leadsbuddy.ai web app, using the same field names.
      </p>

      <div className="mt-6">
        <EndpointPageNav basePath="/document/api-key/companies-search" current="request" />
      </div>

      <Section id="sample-request" title="Sample Request">
        <CodeBlock label="POST /companies/search">{SAMPLE_COMPANY_SEARCH_REQUEST}</CodeBlock>
      </Section>

      <Section id="filters" title="Filter Reference">
        <FilterGroupTable groups={COMPANY_FILTER_GROUPS} />
      </Section>
    </div>
  );
}
