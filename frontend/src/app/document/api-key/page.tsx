import Link from "next/link";
import { Section, InlineCode, CodeBlock } from "./_lib/docs-ui";
import { CREDIT_COSTS } from "./_lib/docs-data";

export default function ApiOverviewPage() {
  return (
    <div>
      <h1 className="text-xl font-extrabold text-gray-900 sm:text-3xl">Developer API Documentation</h1>
      <p className="mt-3 max-w-2xl text-xs leading-relaxed text-gray-600 sm:text-sm">
        The leadsbuddy.ai Developer API lets you search people and companies and unlock
        verified contact details directly from your own systems, using the same data and
        field names shown in the leadsbuddy.ai web app. No authentication is required to
        read this documentation.
      </p>

      <Section id="how-to-navigate" title="How to Navigate These Docs">
        <p>
          Use the sidebar on the left to move around. It&apos;s organized into a few groups:
        </p>
        <ul className="list-inside list-disc space-y-1.5">
          <li>
            <span className="font-semibold text-gray-900">Getting Started</span> — this page,
            plus <Link href="/document/api-key/pagination" className="font-semibold text-red-600 hover:underline">Pagination</Link> on
            its own page. Both apply to every endpoint.
          </li>
          <li>
            <span className="font-semibold text-gray-900">Person Search</span> and{" "}
            <span className="font-semibold text-gray-900">Company Search</span> — each has
            three pages: <span className="font-medium text-gray-800">Introduction</span> (what
            it does, a minimal example), <span className="font-medium text-gray-800">Request
            Payload</span> (every filter you can send), and{" "}
            <span className="font-medium text-gray-800">Response</span> (a full sample response
            and what each field means). A row of tabs at the top of every one of these pages
            jumps between the three.
          </li>
          <li>
            <span className="font-semibold text-gray-900">Unlock Contacts</span> — the 3
            endpoints used to reveal work email, personal email, and mobile, one field at a
            time. Person records only — company records don&apos;t have a locked contact field.
          </li>
          <li>
            <span className="font-semibold text-gray-900">Reference</span> — error codes you
            may encounter.
          </li>
        </ul>
        <p>
          If you&apos;re new here, read Authentication below and{" "}
          <Link href="/document/api-key/pagination" className="font-semibold text-red-600 hover:underline">Pagination</Link>,
          then jump to{" "}
          <Link href="/document/api-key/persons-search" className="font-semibold text-red-600 hover:underline">Person Search → Introduction</Link>{" "}
          or <Link href="/document/api-key/companies-search" className="font-semibold text-red-600 hover:underline">Company Search → Introduction</Link>.
        </p>
      </Section>

      <Section id="authentication" title="Authentication">
        <p>
          Every request must include your API key in the <InlineCode>X-API-Key</InlineCode> header.
          Generate a key from <span className="font-semibold text-gray-900">Search → API Keys</span> once
          signed in to your leadsbuddy.ai account.
        </p>
        <CodeBlock label="cURL">{`curl https://api.leadsbuddy.ai/api/public/v1/persons/search \\
  -H "X-API-Key: lb_live_xxxxxxxxxxxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"job_title": ["VP Sales"], "page_size": 10}'`}</CodeBlock>
        <p>
          Base URL: <InlineCode>https://api.leadsbuddy.ai/api/public/v1</InlineCode>
        </p>
      </Section>

      <Section id="pagination-pointer" title="Pagination">
        <p>
          Search endpoints use cursor-based pagination — a normal REST pattern, not
          Elasticsearch. See the dedicated{" "}
          <Link href="/document/api-key/pagination" className="font-semibold text-red-600 hover:underline">Pagination</Link> page
          for the full request/response contract.
        </p>
      </Section>

      <Section id="credits" title="Credits">
        <p>
          API usage draws from the <span className="font-semibold text-gray-900">same
          credit balance</span> shown under Usage / Plans in the web app — there is no
          separate API quota to manage.
        </p>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[400px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-2.5">Action</th>
                <th className="px-4 py-2.5">Credits</th>
              </tr>
            </thead>
            <tbody>
              {CREDIT_COSTS.map((c) => (
                <tr key={c.action} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-2.5 text-gray-700">{c.action}</td>
                  <td className="px-4 py-2.5 font-semibold text-gray-900">{c.credits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          A request that would exceed your available balance returns <InlineCode>402 Payment
          Required</InlineCode> with an <InlineCode>INSUFFICIENT_CREDITS</InlineCode> error
          body — see <Link href="/document/api-key/errors" className="font-semibold text-red-600 hover:underline">Errors</Link>.
        </p>
      </Section>

      <Section id="endpoints" title="Endpoints">
        <ul className="list-inside list-disc space-y-2">
          <li>
            <Link href="/document/api-key/persons-search" className="font-semibold text-red-600 hover:underline">
              Person Search
            </Link> — <InlineCode>POST /persons/search</InlineCode>
          </li>
          <li>
            <Link href="/document/api-key/companies-search" className="font-semibold text-red-600 hover:underline">
              Company Search
            </Link> — <InlineCode>POST /companies/search</InlineCode>
          </li>
          <li>
            <Link href="/document/api-key/unlock" className="font-semibold text-red-600 hover:underline">
              Unlock Contacts
            </Link> — 3 endpoints to reveal work email, personal email, and mobile for person records
          </li>
        </ul>
      </Section>
    </div>
  );
}
