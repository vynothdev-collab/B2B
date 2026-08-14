import { Section, InlineCode, CodeBlock } from "../_lib/docs-ui";
import { UNLOCK_ENDPOINTS, SAMPLE_ALREADY_UNLOCKED_RESPONSE } from "../_lib/docs-data";

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
        <InlineCode>/persons/search</InlineCode> responses — they always come back{" "}
        <InlineCode>null</InlineCode>. Each field has its own dedicated endpoint below that
        you call with the person record&apos;s <InlineCode>id</InlineCode> to reveal that one
        value.
      </p>
      <p className="mt-2 max-w-2xl text-xs leading-relaxed text-gray-600 sm:text-sm">
        You&apos;re only charged the first time you unlock a given field on a given record —
        repeat calls to the same unlock endpoint for the same record return the cached value
        for free (<InlineCode>already_unlocked: true</InlineCode>, <InlineCode>credits_charged: 0</InlineCode>),
        deducted from the same credit balance used for search.
      </p>

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

      <Section id="repeat-call" title="Repeat Calls Are Free">
        <p>Calling the same unlock endpoint again for a record you&apos;ve already unlocked returns the cached value at no charge.</p>
        <CodeBlock label="200 OK — already unlocked">{SAMPLE_ALREADY_UNLOCKED_RESPONSE}</CodeBlock>
      </Section>
    </div>
  );
}
