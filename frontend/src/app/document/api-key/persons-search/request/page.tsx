import { Section, InlineCode, CodeBlock, FilterGroupTable, EndpointPageNav } from "../../_lib/docs-ui";
import { PERSON_FILTER_GROUPS, SAMPLE_PERSON_SEARCH_REQUEST } from "../../_lib/docs-data";

export const metadata = { title: "leadsbuddy.ai: Person Search — Request Payload" };

export default function PersonSearchRequestPage() {
  return (
    <div>
      <h1 className="text-lg font-extrabold text-gray-900 sm:text-2xl">Person Search — Request Payload</h1>
      <p className="mt-2 max-w-2xl text-xs leading-relaxed text-gray-600 sm:text-sm">
        This page documents everything you can send in the JSON body of{" "}
        <InlineCode>POST /persons/search</InlineCode>. Every filter is optional — send only
        the ones you need. Filters are grouped exactly as they appear under People search in
        the leadsbuddy.ai web app, using the same field names.
      </p>

      <div className="mt-6">
        <EndpointPageNav basePath="/document/api-key/persons-search" current="request" />
      </div>

      <Section id="sample-request" title="Sample Request">
        <CodeBlock label="POST /persons/search">{SAMPLE_PERSON_SEARCH_REQUEST}</CodeBlock>
      </Section>

      <Section id="filters" title="Filter Reference">
        <FilterGroupTable groups={PERSON_FILTER_GROUPS} />
      </Section>
    </div>
  );
}
