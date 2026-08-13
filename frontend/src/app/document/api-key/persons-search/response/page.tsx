import Link from "next/link";
import { Section, InlineCode, CodeBlock, FieldTable, EndpointPageNav } from "../../_lib/docs-ui";
import { PERSON_FIELDS, SAMPLE_PERSON_SEARCH_RESPONSE } from "../../_lib/docs-data";

export const metadata = { title: "leadsbuddy.ai: Person Search — Response" };

export default function PersonSearchResponsePage() {
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900">Person Search — Response</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
        This page documents the shape of a successful <InlineCode>200 OK</InlineCode> response
        from <InlineCode>POST /persons/search</InlineCode>, and what every field in it means.
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
    </div>
  );
}
