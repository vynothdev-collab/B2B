import Link from "next/link";
import { Section, InlineCode, CodeBlock } from "../_lib/docs-ui";
import {
  UNLOCK_ENDPOINTS,
  SAMPLE_ALREADY_UNLOCKED_RESPONSE,
  SAMPLE_RECORD_NOT_FOUND_RESPONSE,
  SAMPLE_INSUFFICIENT_CREDITS_RESPONSE,
} from "../_lib/docs-data";

export const metadata = { title: "leadsbuddy.ai: Unlock Contacts API" };

export default function UnlockDocPage() {
  return (
    <div>
      <h1 className="text-lg font-extrabold text-gray-900 sm:text-2xl">Unlock Contacts</h1>
      <p className="mt-2 max-w-2xl text-xs leading-relaxed text-gray-600 sm:text-sm">
        Unlocking is available for <span className="font-semibold text-gray-900">person
        records only</span> — company records don&apos;t have a locked contact field. Work
        email, personal email, and mobile number are{" "}
        <span className="font-semibold text-gray-900">never</span> included in{" "}
        <InlineCode>/persons/search</InlineCode> or <InlineCode>/ai-search</InlineCode> responses
        — they always come back <InlineCode>null</InlineCode>. Each field has its own
        dedicated endpoint below that you call with the person record&apos;s{" "}
        <InlineCode>id</InlineCode> to reveal that one value.
      </p>

      <Section id="how-it-works" title="How It Works">
        <p>
          A record&apos;s <InlineCode>id</InlineCode> comes from a prior{" "}
          <Link href="/document/api-key/persons-search" className="font-semibold text-red-600 hover:underline">Person Search</Link> or{" "}
          <Link href="/document/api-key/ai-search" className="font-semibold text-red-600 hover:underline">AI Search</Link> call
          — records are cached server-side after a search, so the unlock endpoints can look
          them up without re-querying the underlying data provider. If a record hasn&apos;t
          been searched recently, unlocking it returns a{" "}
          <InlineCode>404</InlineCode> — run a fresh search first (see{" "}
          <Link href="#errors" className="font-semibold text-red-600 hover:underline">Errors</Link> below).
        </p>
        <p>
          Unlocking is billed <span className="font-semibold text-gray-900">per field, per
          record</span> — unlocking a person&apos;s work email and mobile number are two
          separate charges, and unlocking the same field again for the same record is always
          free after the first time (see{" "}
          <Link href="#repeat-call" className="font-semibold text-red-600 hover:underline">Repeat Calls Are Free</Link> below).
          There&apos;s no bulk-unlock endpoint — call each field you need individually.
        </p>
      </Section>

      {UNLOCK_ENDPOINTS.map((ep) => (
        <Section key={ep.path} id={ep.path} title={ep.title}>
          <p>
            <InlineCode>{ep.method} {ep.path}</InlineCode> — {ep.description} Costs{" "}
            <span className="font-semibold text-gray-900">{ep.credits} credit{ep.credits > 1 ? "s" : ""}</span> the
            first time it's unlocked for a record.
          </p>
          <CodeBlock label="200 OK — first unlock">{ep.sampleResponse}</CodeBlock>
        </Section>
      ))}

      <Section id="response-fields" title="Response Fields">
        <p>All five endpoints above share the same response shape:</p>
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
                <td className="px-4 py-2 font-mono text-[11px] text-gray-900 sm:text-xs">record_id</td>
                <td className="px-4 py-2 font-mono text-[11px] text-gray-500 sm:text-xs">string</td>
                <td className="px-4 py-2 text-gray-600">Echoes the person record <InlineCode>id</InlineCode> you called with.</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="px-4 py-2 font-mono text-[11px] text-gray-900 sm:text-xs">email</td>
                <td className="px-4 py-2 font-mono text-[11px] text-gray-500 sm:text-xs">string | null</td>
                <td className="px-4 py-2 text-gray-600">The revealed email — present on the two email endpoints. <InlineCode>null</InlineCode> if the person has no email of that type on file.</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="px-4 py-2 font-mono text-[11px] text-gray-900 sm:text-xs">phone</td>
                <td className="px-4 py-2 font-mono text-[11px] text-gray-500 sm:text-xs">string | null</td>
                <td className="px-4 py-2 text-gray-600">The revealed phone number — present on the mobile endpoint. <InlineCode>null</InlineCode> if none on file.</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="px-4 py-2 font-mono text-[11px] text-gray-900 sm:text-xs">has_email / has_phone</td>
                <td className="px-4 py-2 font-mono text-[11px] text-gray-500 sm:text-xs">boolean</td>
                <td className="px-4 py-2 text-gray-600">Whether a value exists at all — <InlineCode>false</InlineCode> means the field is empty rather than locked; you were still charged for the lookup.</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="px-4 py-2 font-mono text-[11px] text-gray-900 sm:text-xs">already_unlocked</td>
                <td className="px-4 py-2 font-mono text-[11px] text-gray-500 sm:text-xs">boolean</td>
                <td className="px-4 py-2 text-gray-600"><InlineCode>true</InlineCode> if you&apos;d already unlocked this field for this record before — the value came from cache, not a new lookup.</td>
              </tr>
              <tr className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-2 font-mono text-[11px] text-gray-900 sm:text-xs">credits_charged</td>
                <td className="px-4 py-2 font-mono text-[11px] text-gray-500 sm:text-xs">number</td>
                <td className="px-4 py-2 text-gray-600">Credits actually deducted for this call — <InlineCode>0</InlineCode> when <InlineCode>already_unlocked</InlineCode> is <InlineCode>true</InlineCode>.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="repeat-call" title="Repeat Calls Are Free">
        <p>Calling the same unlock endpoint again for a record you&apos;ve already unlocked returns the cached value at no charge.</p>
        <CodeBlock label="200 OK — already unlocked">{SAMPLE_ALREADY_UNLOCKED_RESPONSE}</CodeBlock>
      </Section>

      <Section id="errors" title="Errors">
        <p>
          <InlineCode>404 Not Found</InlineCode> — the record <InlineCode>id</InlineCode> isn&apos;t
          in the search cache, usually because it&apos;s from an old search. Run{" "}
          <Link href="/document/api-key/persons-search" className="font-semibold text-red-600 hover:underline">Person Search</Link> or{" "}
          <Link href="/document/api-key/ai-search" className="font-semibold text-red-600 hover:underline">AI Search</Link> again
          to refresh it, then retry the unlock call with the new response&apos;s <InlineCode>id</InlineCode>.
        </p>
        <CodeBlock label="404 Not Found">{SAMPLE_RECORD_NOT_FOUND_RESPONSE}</CodeBlock>
        <p>
          <InlineCode>402 Payment Required</InlineCode> — insufficient credits for this
          field&apos;s cost. See <Link href="/document/api-key/errors" className="font-semibold text-red-600 hover:underline">Errors</Link> for
          the full error reference.
        </p>
        <CodeBlock label="402 Payment Required">{SAMPLE_INSUFFICIENT_CREDITS_RESPONSE}</CodeBlock>
      </Section>
    </div>
  );
}
