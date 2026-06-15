export default function PrivacyPolicyPage() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-12 text-slate-100">
      <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="mt-3 text-sm text-slate-400">Last updated: May 18, 2026</p>

      <div className="mt-8 space-y-6 text-slate-200">
        <p>
          This Privacy Policy explains what information we collect, how we use it, and your choices
          when using the Keyring tenant portal.
        </p>

        <div>
          <h2 className="text-xl font-medium">Information We Collect</h2>
          <p className="mt-2">
            We may collect account details, lease and payment records, maintenance communications,
            device/browser data, and support interactions.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium">How We Use Information</h2>
          <p className="mt-2">
            We use data to provide portal features, process payments, manage leases, send required
            notifications, improve service reliability, and comply with legal obligations.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium">Sharing</h2>
          <p className="mt-2">
            We share data with service providers only as needed to operate the platform, and with
            authorities where required by law.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium">Your Choices</h2>
          <p className="mt-2">
            You may request access, correction, or deletion where applicable, and manage notification
            preferences from your account settings.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium">Contact</h2>
          <p className="mt-2">
            For privacy questions, contact your property manager or your organization&rsquo;s support
            contact.
          </p>
        </div>
      </div>
    </section>
  );
}
