import Link from "next/link";

export const metadata = { title: "Privacy Notice – AdaptiveMinds" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 text-gray-800">
      <Link href="/" className="text-sm font-semibold text-brand-700 hover:underline">
        ← Back to home
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold text-gray-900">Privacy Notice</h1>
      <p className="mt-2 text-gray-600">
        We built AdaptiveMinds for children, so we keep the data we hold to the minimum needed to teach and to
        show progress.
      </p>

      <h2 className="mt-8 text-xl font-bold">For kids</h2>
      <ul className="mt-2 list-disc space-y-1 pl-6">
        <li>Use a nickname or your first name. Never share your last name, address or phone number.</li>
        <li>There is no chat and no way for other kids to message you.</li>
        <li>Your buddy is a cartoon animal, not a photo.</li>
        <li>Ask a grown-up if you are unsure about anything.</li>
      </ul>

      <h2 className="mt-8 text-xl font-bold">For parents, guardians and teachers</h2>
      <h3 className="mt-4 font-semibold">What we collect</h3>
      <ul className="mt-2 list-disc space-y-1 pl-6">
        <li>Display name, email address, grade, and a hashed password (we cannot read it).</li>
        <li>Learning activity: answers, accuracy, time taken, XP, stars, streaks and badges.</li>
      </ul>
      <p className="mt-2">
        We do <strong>not</strong> collect photos, precise location, or contact lists, and we do not show
        advertising or sell data.
      </p>

      <h3 className="mt-4 font-semibold">How it is used</h3>
      <ul className="mt-2 list-disc space-y-1 pl-6">
        <li>To choose questions at the right difficulty and to show progress to the child.</li>
        <li>To show progress to linked parents and to teachers whose class the child has joined.</li>
        <li>To send weekly progress emails to linked parents and teachers.</li>
      </ul>

      <h3 className="mt-4 font-semibold">Your choices</h3>
      <ul className="mt-2 list-disc space-y-1 pl-6">
        <li>
          A parent can link or unlink a child at any time under <em>My Children</em>.
        </li>
        <li>
          To see, correct or delete a child&apos;s data, contact the school or the person who runs this
          deployment of AdaptiveMinds and ask them to remove the account. Deleting an account removes the
          child&apos;s progress, badges and notifications.
        </li>
      </ul>

      <p className="mt-8 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
        This notice describes how the app behaves. The organisation that operates this site is responsible for
        adding its own contact details and for meeting local child-privacy laws such as COPPA (US) or the
        UK/EU GDPR.
      </p>
    </main>
  );
}
