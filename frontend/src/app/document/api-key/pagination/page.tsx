import Link from "next/link";
import { Section, InlineCode, CodeBlock } from "../_lib/docs-ui";

export const metadata = { title: "leadsbuddy.ai: Pagination" };

export default function PaginationDocPage() {
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900">Pagination</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
        This page documents how to page through results from{" "}
        <Link href="/document/api-key/persons-search" className="font-semibold text-red-600 hover:underline">Person Search</Link>{" "}
        and <Link href="/document/api-key/companies-search" className="font-semibold text-red-600 hover:underline">Company Search</Link>.
        Both endpoints share the exact same pagination contract, described once here.
      </p>

      <Section id="how-it-works" title="How It Works">
        <p>
          Search endpoints use cursor-based pagination — a normal REST pattern, not
          Elasticsearch. Set <InlineCode>page_size</InlineCode> (1–1000, default 10) on your
          request to control how many records come back per call.
        </p>
        <p>
          Every response includes a <InlineCode>meta</InlineCode> object with the total match
          count and a <InlineCode>scroll_token</InlineCode> — an opaque cursor. Pass that token
          back as <InlineCode>scroll_token</InlineCode> on your next request to fetch the
          following page. Omit <InlineCode>scroll_token</InlineCode> to start from the first
          page.
        </p>
      </Section>

      <Section id="response-shape" title="Response Shape">
        <CodeBlock label="Response meta">{`{
  "data": [ /* array of person or company records */ ],
  "meta": {
    "total": 4231,
    "total_pages": 424,
    "scroll_token": "eyJvZmZzZXQiOj..."
  }
}`}</CodeBlock>
        <ul className="list-inside list-disc space-y-1.5">
          <li><InlineCode>total</InlineCode> — total number of matching records across all pages.</li>
          <li><InlineCode>total_pages</InlineCode> — total number of pages at the current <InlineCode>page_size</InlineCode>.</li>
          <li><InlineCode>scroll_token</InlineCode> — pass this back as <InlineCode>scroll_token</InlineCode> in the request body to get the next page; <InlineCode>null</InlineCode> once you've reached the last page.</li>
        </ul>
      </Section>

      <Section id="example" title="Fetching the Next Page">
        <p>First request — no <InlineCode>scroll_token</InlineCode>:</p>
        <CodeBlock label="POST /persons/search">{`{
  "job_title": ["VP Sales"],
  "page_size": 10
}`}</CodeBlock>
        <p>Next request — pass back the <InlineCode>scroll_token</InlineCode> from the previous response's <InlineCode>meta</InlineCode>:</p>
        <CodeBlock label="POST /persons/search">{`{
  "job_title": ["VP Sales"],
  "page_size": 10,
  "scroll_token": "eyJvZmZzZXQiOjEwfQ=="
}`}</CodeBlock>
      </Section>
    </div>
  );
}
