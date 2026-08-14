import Link from "next/link";
import { Section, InlineCode, CodeBlock } from "../_lib/docs-ui";
import {
  SAMPLE_AI_SEARCH_PERSON_REQUEST,
  SAMPLE_AI_SEARCH_COMPANY_REQUEST,
  SAMPLE_AI_SEARCH_RESPONSE,
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

      <Section id="example-person" title="Example — People">
        <p>Request</p>
        <CodeBlock label="POST /ai-search">{SAMPLE_AI_SEARCH_PERSON_REQUEST}</CodeBlock>
        <p>Response</p>
        <CodeBlock label="200 OK">{SAMPLE_AI_SEARCH_RESPONSE}</CodeBlock>
      </Section>

      <Section id="example-company" title="Example — Companies">
        <p>Set <InlineCode>entity</InlineCode> to <InlineCode>company</InlineCode> to search companies instead.</p>
        <CodeBlock label="POST /ai-search">{SAMPLE_AI_SEARCH_COMPANY_REQUEST}</CodeBlock>
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
                <td className="px-4 py-2 text-gray-600">Plain-English description of who or what you&apos;re looking for.</td>
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
              <tr className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-2 font-mono text-[11px] text-gray-900 sm:text-xs">scroll_token</td>
                <td className="px-4 py-2 font-mono text-[11px] text-gray-500 sm:text-xs">string | null</td>
                <td className="px-4 py-2 text-gray-600">
                  Cursor from a previous response&apos;s <InlineCode>meta.scroll_token</InlineCode> — see{" "}
                  <Link href="/document/api-key/pagination" className="font-semibold text-red-600 hover:underline">Pagination</Link>.
                  Reusing the same prompt across pages avoids re-running the natural-language
                  interpretation on every request.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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
    </div>
  );
}
