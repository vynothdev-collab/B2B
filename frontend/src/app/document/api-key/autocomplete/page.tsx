import Link from "next/link";
import { Section, InlineCode, CodeBlock } from "../_lib/docs-ui";
import {
  SAMPLE_AUTOCOMPLETE_REQUEST,
  SAMPLE_AUTOCOMPLETE_RESPONSE,
  SAMPLE_AUTOCOMPLETE_INDUSTRY_REQUEST,
  SAMPLE_AUTOCOMPLETE_INDUSTRY_RESPONSE,
  SAMPLE_AUTOCOMPLETE_SENIORITY_REQUEST,
  SAMPLE_AUTOCOMPLETE_SENIORITY_RESPONSE,
  SAMPLE_AUTOCOMPLETE_VALIDATION_ERROR,
} from "../_lib/docs-data";

export const metadata = { title: "leadsbuddy.ai: Autocomplete API" };

interface FieldRow {
  field: string;
  mapsTo: string;
  entity: string;
  matching: string;
}

const LIVE_FIELDS: FieldRow[] = [
  { field: "job_title", mapsTo: "job_title", entity: "Person Search", matching: "Prefix / fuzzy — provider-ranked" },
  { field: "technology", mapsTo: "technologies", entity: "Person & Company Search", matching: "Substring, seen in past search results" },
];

const STATIC_FIELDS: FieldRow[] = [
  { field: "seniority", mapsTo: "seniority", entity: "Person Search", matching: "Substring" },
  { field: "department", mapsTo: "departments", entity: "Person Search", matching: "Substring" },
  { field: "industry", mapsTo: "industries", entity: "Person & Company Search", matching: "Substring" },
  { field: "company_status", mapsTo: "company_status", entity: "Person & Company Search", matching: "Substring" },
  { field: "company_how_they_sell", mapsTo: "company_how_they_sell", entity: "Company Search", matching: "Substring" },
  { field: "company_more_flags", mapsTo: "company_more_flags", entity: "Company Search", matching: "Substring" },
  { field: "company_revenue_model", mapsTo: "company_revenue_model", entity: "Company Search", matching: "Substring" },
  { field: "revenue_bucket", mapsTo: "revenue_buckets", entity: "Person & Company Search", matching: "Substring" },
  { field: "funding_stage", mapsTo: "funding_stages", entity: "Company Search", matching: "Substring" },
  { field: "email_provider", mapsTo: "email_providers", entity: "Company Search", matching: "Substring" },
  { field: "certification", mapsTo: "certifications", entity: "Person & Company Search", matching: "Substring" },
];

function FieldRowsTable({ rows }: { rows: FieldRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full min-w-[640px] text-xs sm:text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs">
            <th className="px-4 py-2">field value</th>
            <th className="px-4 py-2">Maps to</th>
            <th className="px-4 py-2">Used on</th>
            <th className="px-4 py-2">Matching</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.field} className="border-b border-gray-100 last:border-0">
              <td className="px-4 py-2 font-mono text-[11px] text-gray-900 sm:text-xs">{r.field}</td>
              <td className="px-4 py-2 font-mono text-[11px] text-gray-500 sm:text-xs">{r.mapsTo}</td>
              <td className="px-4 py-2 text-gray-600">{r.entity}</td>
              <td className="px-4 py-2 text-gray-600">{r.matching}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AutocompleteDocPage() {
  return (
    <div>
      <h1 className="text-lg font-extrabold text-gray-900 sm:text-2xl">Autocomplete</h1>
      <p className="mt-2 max-w-2xl text-xs leading-relaxed text-gray-600 sm:text-sm">
        <InlineCode>GET /autocomplete</InlineCode> is the same type-ahead search used by
        searchable dropdowns in the web app&apos;s filter sidebar (job title, industry,
        seniority, and the rest) — one endpoint covers every field it supports. Pass a{" "}
        <InlineCode>field</InlineCode> and partial <InlineCode>text</InlineCode> and get back
        matching values you can drop straight into the corresponding{" "}
        <Link href="/document/api-key/persons-search/request" className="font-semibold text-red-600 hover:underline">Person Search</Link> or{" "}
        <Link href="/document/api-key/companies-search/request" className="font-semibold text-red-600 hover:underline">Company Search</Link> filter.
        This endpoint is <span className="font-semibold text-gray-900">free</span> — it does
        not deduct credits and doesn&apos;t require you to run a search first.
      </p>

      <Section id="how-it-works" title="How It Works">
        <p>
          Every supported field falls into one of two categories, and the endpoint behaves
          the same way from the outside either way — send <InlineCode>field</InlineCode> +{" "}
          <InlineCode>text</InlineCode>, get back a flat array of matching strings:
        </p>
        <ul className="list-inside list-disc space-y-1.5">
          <li>
            <span className="font-semibold text-gray-900">Live lookup</span> —{" "}
            <InlineCode>job_title</InlineCode> and <InlineCode>technology</InlineCode> are
            resolved against a live data source each call, so results reflect real profiles
            and companies rather than a fixed list.
          </li>
          <li>
            <span className="font-semibold text-gray-900">Fixed vocabulary</span> — everything
            else (seniority, department, industry, and so on) is a closed set of values.{" "}
            <InlineCode>text</InlineCode> matches anywhere in the value, not just the start,
            so <InlineCode>text=software</InlineCode> matches &quot;Data Security Software
            Products&quot; just as well as &quot;Software Development&quot;.
          </li>
        </ul>
        <p>
          Results aren&apos;t paginated — set <InlineCode>size</InlineCode> to however many
          you want back (1–25, default 10) and that&apos;s the full response.
        </p>
      </Section>

      <Section id="query-params" title="Query Parameters">
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[560px] text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs">
                <th className="px-4 py-2">Param</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="px-4 py-2 font-mono text-[11px] text-gray-900 sm:text-xs">field</td>
                <td className="px-4 py-2 font-mono text-[11px] text-gray-500 sm:text-xs">
                  string — one of the values listed below
                </td>
                <td className="px-4 py-2 text-gray-600">Which filter field to get suggestions for. Required.</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="px-4 py-2 font-mono text-[11px] text-gray-900 sm:text-xs">text</td>
                <td className="px-4 py-2 font-mono text-[11px] text-gray-500 sm:text-xs">string</td>
                <td className="px-4 py-2 text-gray-600">Partial text to match, e.g. what the user has typed so far. Required, 1–100 characters.</td>
              </tr>
              <tr className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-2 font-mono text-[11px] text-gray-900 sm:text-xs">size</td>
                <td className="px-4 py-2 font-mono text-[11px] text-gray-500 sm:text-xs">number</td>
                <td className="px-4 py-2 text-gray-600">Max suggestions to return, 1–25. Default 10.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="example-job-title" title="Example — Job Title (live lookup)">
        <p>Request</p>
        <CodeBlock label="cURL">{`curl -G https://api.leadsbuddy.ai/api/public/v1/autocomplete \\
  -H "X-API-Key: lb_live_xxxxxxxxxxxxxxxxxxxxxxxx" \\
  --data-urlencode "field=job_title" \\
  --data-urlencode "text=vp sa" \\
  --data-urlencode "size=10"`}</CodeBlock>
        <p className="mt-1 font-mono text-[11px] text-gray-500 sm:text-xs">{SAMPLE_AUTOCOMPLETE_REQUEST}</p>
        <p>Response</p>
        <CodeBlock label="200 OK">{SAMPLE_AUTOCOMPLETE_RESPONSE}</CodeBlock>
      </Section>

      <Section id="example-industry" title="Example — Industry (fixed vocabulary)">
        <p>
          <InlineCode>text</InlineCode> matches anywhere in the value — searching{" "}
          <InlineCode>software</InlineCode> surfaces every industry containing that word.
        </p>
        <p className="mt-1 font-mono text-[11px] text-gray-500 sm:text-xs">{SAMPLE_AUTOCOMPLETE_INDUSTRY_REQUEST}</p>
        <CodeBlock label="200 OK">{SAMPLE_AUTOCOMPLETE_INDUSTRY_RESPONSE}</CodeBlock>
      </Section>

      <Section id="example-seniority" title="Example — Seniority (small fixed list)">
        <p>
          For small option sets like seniority, <InlineCode>text</InlineCode> works the same
          way — this is mainly useful for confirming the exact value string to send, since
          these lists are short enough to also hardcode client-side if you prefer.
        </p>
        <p className="mt-1 font-mono text-[11px] text-gray-500 sm:text-xs">{SAMPLE_AUTOCOMPLETE_SENIORITY_REQUEST}</p>
        <CodeBlock label="200 OK">{SAMPLE_AUTOCOMPLETE_SENIORITY_RESPONSE}</CodeBlock>
      </Section>

      <Section id="which-fields" title="Supported Fields">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Live lookup</p>
        <FieldRowsTable rows={LIVE_FIELDS} />

        <p className="mt-2 text-xs font-bold uppercase tracking-wide text-gray-400">Fixed vocabulary</p>
        <FieldRowsTable rows={STATIC_FIELDS} />

        <p>
          Any other filter not listed here (locations, employee headcount ranges, dates, and
          similar) takes plain values directly with no lookup needed — see the Request Payload
          pages linked above for each field&apos;s exact type.
        </p>
      </Section>

      <Section id="errors" title="Errors">
        <p>
          An unrecognized <InlineCode>field</InlineCode> value returns{" "}
          <InlineCode>422 Unprocessable Entity</InlineCode> listing every valid option:
        </p>
        <CodeBlock label="422 Unprocessable Entity">{SAMPLE_AUTOCOMPLETE_VALIDATION_ERROR}</CodeBlock>
        <p>
          See <Link href="/document/api-key/errors" className="font-semibold text-red-600 hover:underline">Errors</Link> for
          the rest of the API&apos;s error responses (auth, credits, etc.) — those still apply
          since this endpoint requires a valid <InlineCode>X-API-Key</InlineCode> even though
          it&apos;s free to call.
        </p>
      </Section>
    </div>
  );
}
