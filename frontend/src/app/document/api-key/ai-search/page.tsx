import Link from "next/link";
import { Section, InlineCode, CodeBlock } from "../_lib/docs-ui";
import {
  SAMPLE_AI_SEARCH_PERSON_REQUEST,
  SAMPLE_AI_SEARCH_COMPANY_REQUEST,
  SAMPLE_AI_SEARCH_RESPONSE,
  SAMPLE_AI_SEARCH_PAGE2_REQUEST,
  SAMPLE_AI_SEARCH_EMPTY_RESPONSE,
  SAMPLE_INSUFFICIENT_CREDITS_RESPONSE,
} from "../_lib/docs-data";

export const metadata = { title: "leadsbuddy.ai: AI Search API" };

export default function AiSearchDocPage() {
  return (
    <div>
      <h1 className="text-lg font-extrabold text-gray-900 sm:text-2xl">AI Search</h1>
      <p className="mt-2 max-w-2xl text-xs leading-relaxed text-gray-600 sm:text-sm">
        <InlineCode>POST /ai-search</InlineCode> searches with a plain-English prompt instead
        of structured filters — the same &quot;Describe your ideal prospect&quot; box shown in
        the web app. Send a <InlineCode>prompt</InlineCode> and an{" "}
        <InlineCode>entity</InlineCode> (<InlineCode>employee</InlineCode> or{" "}
        <InlineCode>company</InlineCode>) and it&apos;s translated into a search and run for
        you. Results include the same full profile data as{" "}
        <Link href="/document/api-key/persons-search" className="font-semibold text-red-600 hover:underline">Person Search</Link> and{" "}
        <Link href="/document/api-key/companies-search" className="font-semibold text-red-600 hover:underline">Company Search</Link>.
        Costs <span className="font-semibold text-gray-900">10 credits</span> per request.
      </p>

      <Section id="how-it-works" title="How It Works">
        <p>
          Your <InlineCode>prompt</InlineCode> is interpreted into a structured query, which
          is then executed exactly like a filter-based search — so results are just as precise
          as building the equivalent filters by hand on{" "}
          <Link href="/document/api-key/persons-search/request" className="font-semibold text-red-600 hover:underline">Person Search</Link> or{" "}
          <Link href="/document/api-key/companies-search/request" className="font-semibold text-red-600 hover:underline">Company Search</Link>{" "}
          — this endpoint just saves you the step of building the filter payload yourself.
        </p>
        <p>
          Use it when you don&apos;t already know the exact filter values you need, or when
          it&apos;s easier for your integration to pass through a user&apos;s free-text
          request as-is. If you already know the structured filters you want, calling Person
          Search / Company Search directly is faster and gives you finer control.
        </p>
        <p>
          <span className="font-semibold text-gray-900">Every call costs 10 credits</span>,
          including repeat pages of the same prompt — unlike search-result caching, there is
          no free re-fetch here.
        </p>
      </Section>

      <Section id="example-person" title="Example — People">
        <p>Request</p>
        <CodeBlock label="POST /ai-search">{SAMPLE_AI_SEARCH_PERSON_REQUEST}</CodeBlock>
        <p>Response</p>
        <CodeBlock label="200 OK">{SAMPLE_AI_SEARCH_RESPONSE}</CodeBlock>
        <p>
          <InlineCode>data</InlineCode> entries use the same fields documented on{" "}
          <Link href="/document/api-key/persons-search/response" className="font-semibold text-red-600 hover:underline">Person Search → Response</Link>.{" "}
          <InlineCode>meta.es_query</InlineCode> is the structured query your prompt was
          translated into — see <Link href="#pagination" className="font-semibold text-red-600 hover:underline">Paging Through Results</Link> below
          for what to do with it.
        </p>
      </Section>

      <Section id="example-company" title="Example — Companies">
        <p>Set <InlineCode>entity</InlineCode> to <InlineCode>company</InlineCode> to search companies instead — the response then matches{" "}
        <Link href="/document/api-key/companies-search/response" className="font-semibold text-red-600 hover:underline">Company Search → Response</Link>.</p>
        <CodeBlock label="POST /ai-search">{SAMPLE_AI_SEARCH_COMPANY_REQUEST}</CodeBlock>
      </Section>

      <Section id="example-empty" title="Example — No Matches">
        <p>
          If nothing matches your prompt, you still get a <InlineCode>200 OK</InlineCode> with
          an empty <InlineCode>data</InlineCode> array rather than an error — check{" "}
          <InlineCode>meta.total</InlineCode> before assuming a request failed.
        </p>
        <CodeBlock label="200 OK — no matches">{SAMPLE_AI_SEARCH_EMPTY_RESPONSE}</CodeBlock>
      </Section>

      <Section id="pagination" title="Paging Through Results">
        <p>
          To fetch the next page, send back both <InlineCode>scroll_token</InlineCode> and{" "}
          <InlineCode>es_query</InlineCode> from the previous response, alongside the same{" "}
          <InlineCode>prompt</InlineCode> and <InlineCode>entity</InlineCode>. Reusing{" "}
          <InlineCode>es_query</InlineCode> this way skips re-running the natural-language
          interpretation — the request goes straight to search execution — but it&apos;s{" "}
          <span className="font-semibold text-gray-900">not free</span>; the usual{" "}
          <span className="font-semibold text-gray-900">10 credits</span> still apply per
          page, same as <Link href="/document/api-key/pagination" className="font-semibold text-red-600 hover:underline">Pagination</Link> on
          the other search endpoints.
        </p>
        <CodeBlock label="POST /ai-search — page 2">{SAMPLE_AI_SEARCH_PAGE2_REQUEST}</CodeBlock>
        <p>
          If you omit <InlineCode>es_query</InlineCode> on a later call, the prompt is
          re-interpreted from scratch — usually fine, but for a stable result set across
          pages, always carry both fields forward together.
        </p>
      </Section>

      <Section id="request-fields" title="Request Fields">
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[560px] text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs">
                <th className="px-4 py-2">Field</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="px-4 py-2 font-mono text-[11px] text-gray-900 sm:text-xs">prompt</td>
                <td className="px-4 py-2 font-mono text-[11px] text-gray-500 sm:text-xs">string</td>
                <td className="px-4 py-2 text-gray-600">Plain-English description of who or what you&apos;re looking for. Required.</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="px-4 py-2 font-mono text-[11px] text-gray-900 sm:text-xs">entity</td>
                <td className="px-4 py-2 font-mono text-[11px] text-gray-500 sm:text-xs">&quot;employee&quot; | &quot;company&quot;</td>
                <td className="px-4 py-2 text-gray-600">Whether the prompt is describing people or companies. Default &quot;employee&quot;.</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="px-4 py-2 font-mono text-[11px] text-gray-900 sm:text-xs">page_size</td>
                <td className="px-4 py-2 font-mono text-[11px] text-gray-500 sm:text-xs">number</td>
                <td className="px-4 py-2 text-gray-600">Results per page, 1–1000. Default 10.</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="px-4 py-2 font-mono text-[11px] text-gray-900 sm:text-xs">scroll_token</td>
                <td className="px-4 py-2 font-mono text-[11px] text-gray-500 sm:text-xs">string | null</td>
                <td className="px-4 py-2 text-gray-600">
                  Cursor from a previous response&apos;s <InlineCode>meta.scroll_token</InlineCode>. Omit for the first page.
                </td>
              </tr>
              <tr className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-2 font-mono text-[11px] text-gray-900 sm:text-xs">es_query</td>
                <td className="px-4 py-2 font-mono text-[11px] text-gray-500 sm:text-xs">object | null</td>
                <td className="px-4 py-2 text-gray-600">
                  The structured query from a previous response&apos;s <InlineCode>meta.es_query</InlineCode>. Send it back on later pages to skip re-interpreting the prompt.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="writing-prompts" title="Writing Good Prompts">
        <p>
          The interpreter works best with the same kind of detail you&apos;d put in
          structured filters — role, seniority, location, company size, industry — written as
          a sentence instead of separate fields:
        </p>
        <ul className="list-inside list-disc space-y-1.5">
          <li>&quot;VP of Sales at SaaS companies with 200+ employees in the US&quot;</li>
          <li>&quot;Marketing directors in fintech companies that raised a Series B in the last year&quot;</li>
          <li>&quot;Fast-growing companies in Europe with 50-500 employees using Salesforce&quot;</li>
        </ul>
        <p>
          If you already know you need an exact filter — a specific revenue bucket, a list of
          named companies, an exact employee-count range — send that directly to{" "}
          <Link href="/document/api-key/persons-search/request" className="font-semibold text-red-600 hover:underline">Person Search</Link> or{" "}
          <Link href="/document/api-key/companies-search/request" className="font-semibold text-red-600 hover:underline">Company Search</Link>{" "}
          instead; the prompt interpreter is for open-ended requests, not a substitute for
          precise filters.
        </p>
      </Section>

      <Section id="locked-fields" title="Locked Contact Fields">
        <p>
          Just like <InlineCode>/persons/search</InlineCode>, when <InlineCode>entity</InlineCode> is{" "}
          <InlineCode>employee</InlineCode> the work email, personal email, and mobile number
          always come back <InlineCode>null</InlineCode> — call the{" "}
          <Link href="/document/api-key/unlock" className="font-semibold text-red-600 hover:underline">Unlock Contacts</Link> endpoints
          to reveal them. Company records don&apos;t have a locked contact field.
        </p>
      </Section>

      <Section id="errors" title="Errors">
        <p>
          Same error contract as the other search endpoints — see{" "}
          <Link href="/document/api-key/errors" className="font-semibold text-red-600 hover:underline">Errors</Link> for
          the full list. The one you&apos;re most likely to hit here:
        </p>
        <CodeBlock label="402 Payment Required">{SAMPLE_INSUFFICIENT_CREDITS_RESPONSE}</CodeBlock>
      </Section>
    </div>
  );
}
