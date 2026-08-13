import Link from "next/link";
import { Section, InlineCode, CodeBlock, FieldTable, FilterGroupTable, EndpointPageNav } from "../../_lib/docs-ui";
import { PERSON_FIELDS, PERSON_NESTED_FIELDS, SAMPLE_PERSON_SEARCH_RESPONSE } from "../../_lib/docs-data";

export const metadata = { title: "leadsbuddy.ai: Person Search — Response" };

export default function PersonSearchResponsePage() {
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900">Person Search — Response</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
        This page documents the shape of a successful <InlineCode>200 OK</InlineCode> response
        from <InlineCode>POST /persons/search</InlineCode>, and what every field in it means.
        Each record includes the full profile data shown on that person&apos;s business card in
        the web app — work history, education, certifications, and more — in addition to the
        summary fields shown in the People search results table.
      </p>

      <div className="mt-6">
        <EndpointPageNav basePath="/document/api-key/persons-search" current="response" />
      </div>

      <Section id="sample-response" title="Sample Response">
        <CodeBlock label="200 OK">{SAMPLE_PERSON_SEARCH_RESPONSE}</CodeBlock>
        <p>
          <InlineCode>data</InlineCode> is an array of person records. <InlineCode>meta</InlineCode> describes
          the total match count and how to fetch the next page — see{" "}
          <Link href="/document/api-key/pagination" className="font-semibold text-red-600 hover:underline">Pagination</Link>.
        </p>
        <p>
          <InlineCode>work_email</InlineCode>, <InlineCode>personal_email</InlineCode>, and{" "}
          <InlineCode>mobile_phone</InlineCode> always come back <InlineCode>null</InlineCode> here
          — see <Link href="/document/api-key/unlock" className="font-semibold text-red-600 hover:underline">Unlock Contacts</Link> to reveal them.
        </p>
      </Section>

      <Section id="fields" title="Field Reference">
        <FieldTable fields={PERSON_FIELDS} />
      </Section>

      <Section id="nested-fields" title="Nested Object Fields">
        <p>
          Fields marked <InlineCode>array</InlineCode> above (<InlineCode>work_history</InlineCode>, <InlineCode>education</InlineCode>,{" "}
          <InlineCode>patents</InlineCode>, and the rest) are arrays of objects — every key
          inside each object is documented below.
        </p>
        <FilterGroupTable groups={PERSON_NESTED_FIELDS} />
      </Section>
    </div>
  );
}
