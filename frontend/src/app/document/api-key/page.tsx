export const metadata = {
  title: "leadsbuddy.ai: Developer API Documentation",
  robots: "noindex",
};

const RED = "#dc2626";

interface FieldDoc {
  name: string;
  type: string;
  description: string;
}

const PERSON_FIELDS: FieldDoc[] = [
  { name: "id", type: "string", description: "Unique record identifier. Used for unlock calls." },
  { name: "full_name", type: "string", description: "Person's full name." },
  { name: "first_name", type: "string", description: "First name." },
  { name: "last_name", type: "string", description: "Last name." },
  { name: "headline", type: "string", description: "Professional headline / tagline." },
  { name: "picture_url", type: "string", description: "Profile picture URL." },
  { name: "linkedin_url", type: "string", description: "LinkedIn profile URL." },
  { name: "linkedin_canonical_shorthand_name", type: "string", description: "LinkedIn vanity handle." },
  { name: "location_country", type: "string", description: "Country of residence." },
  { name: "location_city", type: "string", description: "City of residence." },
  { name: "location_state", type: "string", description: "State / region of residence." },
  { name: "mobile_phone", type: "string | null", description: "Locked by default — call the mobile unlock endpoint." },
  { name: "connections_count", type: "number", description: "LinkedIn connections count." },
  { name: "followers_count", type: "number", description: "LinkedIn followers count." },
  { name: "has_email", type: "boolean", description: "Whether a work email exists for this person (does not reveal it)." },
  { name: "work_email", type: "string | null", description: "Locked by default — call the work-email unlock endpoint." },
  { name: "personal_email", type: "string | null", description: "Locked by default — call the personal-email unlock endpoint." },
  { name: "inferred_skills", type: "string[]", description: "Skills inferred from profile data." },
  { name: "total_experience_duration_months", type: "number", description: "Total career experience in months." },
  { name: "projected_base_salary_median", type: "number", description: "Estimated median base salary." },
  { name: "projected_base_salary_currency", type: "string", description: "Currency of the salary estimate." },
  { name: "active_experience_title", type: "string", description: "Current job title." },
  { name: "active_experience_department", type: "string", description: "Current department." },
  { name: "active_experience_management_level", type: "string", description: "Current seniority / management level." },
  { name: "active_experience_start_date", type: "string", description: "Start date of current role (ISO date)." },
  { name: "active_experience_company_id", type: "string", description: "Current employer's internal company id." },
  { name: "active_experience_company_name", type: "string", description: "Current employer name." },
  { name: "active_experience_company_logo_url", type: "string", description: "Current employer logo URL." },
  { name: "active_experience_company_website", type: "string", description: "Current employer website." },
  { name: "active_experience_company_linkedin_url", type: "string", description: "Current employer LinkedIn URL." },
  { name: "active_experience_company_industry", type: "string", description: "Current employer industry." },
  { name: "active_experience_company_employees_count", type: "number", description: "Current employer headcount." },
  { name: "active_experience_company_size", type: "string", description: "Current employer size range." },
  { name: "active_experience_company_type", type: "string", description: "Current employer type (public, private, etc.)." },
  { name: "active_experience_company_status", type: "string", description: "Current employer status." },
  { name: "active_experience_company_founded", type: "number", description: "Current employer founding year." },
  { name: "active_experience_company_founded_year", type: "number", description: "Alias of active_experience_company_founded." },
  { name: "active_experience_company_hq_country", type: "string", description: "Current employer HQ country." },
  { name: "active_experience_company_hq_city", type: "string", description: "Current employer HQ city." },
  { name: "active_experience_company_hq_region", type: "string", description: "Current employer HQ state/region." },
  { name: "active_experience_company_hq_location", type: "string", description: "Current employer HQ full address." },
  { name: "active_experience_company_categories_and_keywords", type: "string", description: "Current employer category/keyword tags." },
  { name: "active_experience_company_annual_revenue", type: "number", description: "Current employer estimated annual revenue." },
  { name: "awards_certifications", type: "string[]", description: "Awards and certifications." },
];

const COMPANY_FIELDS: FieldDoc[] = [
  { name: "id", type: "string", description: "Unique record identifier. Used for unlock calls." },
  { name: "company_name", type: "string", description: "Company name." },
  { name: "company_legal_name", type: "string", description: "Registered legal name." },
  { name: "website", type: "string", description: "Company website." },
  { name: "logo_url", type: "string", description: "Company logo URL." },
  { name: "canonical_linkedin_url", type: "string", description: "LinkedIn company page URL." },
  { name: "industry", type: "string", description: "Primary industry." },
  { name: "type", type: "string", description: "Company type (public, private, non-profit, etc.)." },
  { name: "is_public", type: "boolean", description: "Whether the company is publicly traded." },
  { name: "company_status", type: "string", description: "Operating status." },
  { name: "founded", type: "number", description: "Year founded." },
  { name: "employees_count", type: "number", description: "Employee headcount." },
  { name: "size_range", type: "string", description: "Employee size range bucket." },
  { name: "hq_country", type: "string", description: "Headquarters country." },
  { name: "hq_region", type: "string", description: "Headquarters state/region." },
  { name: "hq_city", type: "string", description: "Headquarters city." },
  { name: "hq_state", type: "string", description: "Headquarters state." },
  { name: "hq_location", type: "string", description: "Headquarters full address." },
  { name: "categories_and_keywords", type: "string", description: "Category / keyword tags." },
  { name: "awards_certifications", type: "string[]", description: "Awards and certifications." },
  { name: "employees_count_change", type: "object", description: "Headcount growth over time." },
  { name: "total_website_visits_monthly", type: "number", description: "Estimated monthly website visits." },
  { name: "total_website_visits_change", type: "object", description: "Website traffic change over time." },
  { name: "revenue_annual_range", type: "string", description: "Estimated annual revenue range." },
  { name: "last_funding_round", type: "object", description: "Most recent funding round details." },
  { name: "company_employee_reviews_aggregate_score", type: "number", description: "Aggregate employee review score." },
  { name: "active_job_postings", type: "array", description: "Currently open job postings (ids)." },
  { name: "technologies_used", type: "array", description: "Detected technology stack." },
  { name: "email", type: "string | null", description: "Locked by default — call the company email unlock endpoint." },
  { name: "phone", type: "string | null", description: "Locked by default — call the company phone unlock endpoint." },
];

const CREDIT_COSTS: { action: string; credits: number }[] = [
  { action: "Person / Company search (per request)", credits: 10 },
  { action: "Work email unlock", credits: 1 },
  { action: "Personal email unlock", credits: 1 },
  { action: "Mobile number unlock", credits: 10 },
  { action: "Company email unlock", credits: 1 },
  { action: "Company phone unlock", credits: 10 },
];

function FieldTable({ fields }: { fields: FieldDoc[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <th className="px-4 py-2.5">Field</th>
            <th className="px-4 py-2.5">Type</th>
            <th className="px-4 py-2.5">Description</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((f) => (
            <tr key={f.name} className="border-b border-gray-100 last:border-0">
              <td className="px-4 py-2.5 font-mono text-xs text-gray-900">{f.name}</td>
              <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{f.type}</td>
              <td className="px-4 py-2.5 text-gray-600">{f.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl bg-gray-900 p-4 text-xs leading-relaxed text-gray-100">
      <code>{children}</code>
    </pre>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-gray-100 py-8 first:border-0 first:pt-0">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-gray-600">{children}</div>
    </section>
  );
}

export default function ApiKeyDocumentationPage() {
  return (
    <div className="min-h-dvh bg-white">
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
              style={{ background: RED }}
            >
              LB
            </div>
            <span className="text-sm font-bold text-gray-900">leadsbuddy.ai Developer API</span>
          </div>
          <a href="/login" className="text-sm font-semibold text-red-600 hover:underline">
            Sign in to get an API key
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-extrabold text-gray-900">Developer API Documentation</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600">
          The leadsbuddy.ai Developer API lets you search people and companies and unlock
          verified contact details directly from your own systems, using the same data and
          field names shown in the leadsbuddy.ai web app. No authentication is required to
          read this page.
        </p>

        <Section id="authentication" title="Authentication">
          <p>
            Every request must include your API key in the <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">X-API-Key</code> header.
            Generate a key from <span className="font-semibold text-gray-900">Search → API Keys</span> once
            signed in to your leadsbuddy.ai account.
          </p>
          <CodeBlock>{`curl https://api.leadsbuddy.ai/public/v1/persons/search \\
  -H "X-API-Key: lb_live_xxxxxxxxxxxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"job_title": ["VP Sales"], "page_size": 10}'`}</CodeBlock>
          <p>Base URL: <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">https://api.leadsbuddy.ai/public/v1</code></p>
        </Section>

        <Section id="pagination" title="Pagination">
          <p>
            Search endpoints use cursor-based pagination — a normal REST pattern, not
            Elasticsearch. Set <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">page_size</code> (1–1000,
            default 10) on your request. Every response includes a <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">meta</code> object
            with the total match count and a <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">scroll_token</code>.
            Pass that token back as <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">scroll_token</code> on
            your next request to fetch the following page; omit it to start from the first page.
          </p>
          <CodeBlock>{`{
  "data": [ /* array of person or company records */ ],
  "meta": {
    "total": 4231,
    "total_pages": 424,
    "scroll_token": "eyJvZmZzZXQiOj..."
  }
}`}</CodeBlock>
        </Section>

        <Section id="search-endpoints" title="Search Endpoints">
          <p><code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-semibold">POST /persons/search</code> — search people. Request body accepts filters such as <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">job_title</code>, <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">departments</code>, <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">seniority</code>, <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">person_location_countries</code>, <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">industries</code>, <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">employee_count_min/max</code>, and more — the same filters available in the web app's People search.</p>
          <p><code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-semibold">POST /companies/search</code> — search companies, with filters such as <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">industries</code>, <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">location_countries</code>, <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">revenue_min/max</code>, <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">technologies</code>, and more — the same filters available in the web app's Companies search.</p>
          <p>Each search request costs <span className="font-semibold text-gray-900">10 credits</span>, deducted from your account's shared credit balance.</p>
        </Section>

        <Section id="unlock-endpoints" title="Unlock Endpoints">
          <p>
            Contact fields are returned locked (<code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">null</code>) from
            search results. Call the matching unlock endpoint with the record's <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">id</code> to
            reveal a value — you're only charged the first time you unlock a given field on a given record; repeat calls are free.
          </p>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-2.5">Endpoint</th>
                  <th className="px-4 py-2.5">Unlocks</th>
                  <th className="px-4 py-2.5">Credits</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["GET /persons/{id}/unlock/work-email", "work_email", 1],
                  ["GET /persons/{id}/unlock/personal-email", "personal_email", 1],
                  ["GET /persons/{id}/unlock/mobile", "mobile_phone", 10],
                  ["GET /companies/{id}/unlock/email", "email", 1],
                  ["GET /companies/{id}/unlock/phone", "phone", 10],
                ].map(([endpoint, field, credits]) => (
                  <tr key={endpoint as string} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-900">{endpoint}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{field}</td>
                    <td className="px-4 py-2.5 text-gray-600">{credits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="credits" title="Credit Costs">
          <p>API usage draws from the same credit balance shown under Usage / Plans in the web app.</p>
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
            A request that would exceed your available balance returns <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">402 Payment Required</code> with
            an <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">INSUFFICIENT_CREDITS</code> error body.
          </p>
        </Section>

        <Section id="person-fields" title="Person Fields">
          <p>Every field returned by <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">/persons/search</code>, using the same names shown in the leadsbuddy.ai web app.</p>
          <FieldTable fields={PERSON_FIELDS} />
        </Section>

        <Section id="company-fields" title="Company Fields">
          <p>Every field returned by <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">/companies/search</code>, using the same names shown in the leadsbuddy.ai web app.</p>
          <FieldTable fields={COMPANY_FIELDS} />
        </Section>

        <Section id="errors" title="Errors">
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Meaning</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["401", "Missing, invalid, or revoked API key."],
                  ["402", "Insufficient credits for this action."],
                  ["404", "Record not found — run a new search to refresh it."],
                  ["502 / 504", "Upstream data provider unavailable or timed out."],
                ].map(([status, meaning]) => (
                  <tr key={status} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-900">{status}</td>
                    <td className="px-4 py-2.5 text-gray-600">{meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </main>
    </div>
  );
}
