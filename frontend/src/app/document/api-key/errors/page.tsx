import { Section, InlineCode, CodeBlock } from "../_lib/docs-ui";
import { SAMPLE_INSUFFICIENT_CREDITS_RESPONSE } from "../_lib/docs-data";

export const metadata = { title: "leadsbuddy.ai: API Errors" };

const ERRORS: { status: string; meaning: string }[] = [
  ["401", "Missing, invalid, or revoked API key."],
  ["402", "Insufficient credits for this action."],
  ["404", "Record not found — run a new search to refresh it."],
  ["502 / 504", "Upstream data provider unavailable or timed out."],
].map(([status, meaning]) => ({ status, meaning }));

export default function ErrorsDocPage() {
  return (
    <div>
      <h1 className="text-lg font-extrabold text-gray-900 sm:text-2xl">Errors</h1>
      <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
        Errors are returned as a standard HTTP status code with a JSON body describing what
        went wrong.
      </p>

      <Section id="status-codes" title="Status Codes">
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Meaning</th>
              </tr>
            </thead>
            <tbody>
              {ERRORS.map((e) => (
                <tr key={e.status} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-2.5 font-mono text-xs text-gray-900">{e.status}</td>
                  <td className="px-4 py-2.5 text-gray-600">{e.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="insufficient-credits" title="402 — Insufficient Credits">
        <p>
          Returned when a search or unlock call would exceed your available credit balance.
          The call is rejected before any credits are deducted.
        </p>
        <CodeBlock label="402 Payment Required">{SAMPLE_INSUFFICIENT_CREDITS_RESPONSE}</CodeBlock>
      </Section>

      <Section id="auth-errors" title="401 — Authentication">
        <p>
          Returned when the <InlineCode>X-API-Key</InlineCode> header is missing, the key is
          invalid, or the key has been revoked from Search → API Keys.
        </p>
        <CodeBlock label="401 Unauthorized">{`{
  "detail": "Invalid or revoked API key."
}`}</CodeBlock>
      </Section>
    </div>
  );
}
