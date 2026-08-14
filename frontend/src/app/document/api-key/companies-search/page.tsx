import Link from "next/link";
import { Section, InlineCode, CodeBlock, EndpointPageNav } from "../_lib/docs-ui";

export const metadata = { title: "leadsbuddy.ai: Company Search API" };

export default function CompanySearchIntroPage() {
  return (
    <div>
      <h1 className="text-lg font-extrabold text-gray-900 sm:text-2xl">Company Search</h1>
      <p className="mt-2 max-w-2xl text-xs leading-relaxed text-gray-600 sm:text-sm">
        <InlineCode>POST /companies/search</InlineCode> searches companies using the same
        filters available in the web app&apos;s Company search — industry, location, revenue,
        funding, technologies, and more. Every result includes the same full profile data
        shown on a company&apos;s business card in the web app — description, specialties,
        tech stack, and the rest — not just the summary fields shown in a results table.
        Each call costs <span className="font-semibold text-gray-900">10 credits</span>.
      </p>

      <div className="mt-6">
        <EndpointPageNav basePath="/document/api-key/companies-search" current="introduction" />
      </div>

      <Section id="how-to-use" title="How to Use This Page">
        <p>
          This endpoint&apos;s documentation is split across three pages, linked above and in
          the left sidebar under <span className="font-semibold text-gray-900">Company Search</span>:
        </p>
        <ul className="list-inside list-disc space-y-1.5">
          <li><span className="font-semibold text-gray-900">Introduction</span> (this page) — what the endpoint does and a minimal working example.</li>
          <li><Link href="/document/api-key/companies-search/request" className="font-semibold text-red-600 hover:underline">Request Payload</Link> — every filter you can send, grouped the same way as the Company search sidebar in the web app.</li>
          <li><Link href="/document/api-key/companies-search/response" className="font-semibold text-red-600 hover:underline">Response</Link> — the shape of a successful response and what every returned field means.</li>
        </ul>
      </Section>

      <Section id="quick-example" title="Quick Example">
        <p>A minimal request — see <Link href="/document/api-key/companies-search/request" className="font-semibold text-red-600 hover:underline">Request Payload</Link> for the full filter list.</p>
        <CodeBlock label="cURL">{`curl -X POST https://api.leadsbuddy.ai/api/public/v1/companies/search \\
  -H "X-API-Key: lb_live_xxxxxxxxxxxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"industries": ["Computer Software"], "location_countries": ["United States"], "page_size": 10}'`}</CodeBlock>
        <p>See <Link href="/document/api-key/companies-search/response" className="font-semibold text-red-600 hover:underline">Response</Link> for a full sample response and field reference.</p>
      </Section>
    </div>
  );
}
