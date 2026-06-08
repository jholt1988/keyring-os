export default function EndUserAgreementPage() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-12 text-slate-100">
      <h1 className="text-3xl font-semibold tracking-tight">End User Agreement</h1>
      <p className="mt-3 text-sm text-slate-400">Last updated: May 18, 2026</p>

      <div className="mt-8 space-y-6 text-slate-200">
        <p>
          This End User Agreement governs your use of the Keyring tenant portal. By using the
          portal, you agree to these terms.
        </p>

        <div>
          <h2 className="text-xl font-medium">Use of Service</h2>
          <p className="mt-2">
            You agree to use the portal only for lawful lease, payment, maintenance, and communication
            activities related to your tenancy.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium">Account Security</h2>
          <p className="mt-2">
            You are responsible for maintaining the confidentiality of your credentials and for
            activity under your account.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium">Payments and Transactions</h2>
          <p className="mt-2">
            Payment processing is handled by third-party providers. You authorize charges you submit
            through the portal.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium">Prohibited Conduct</h2>
          <p className="mt-2">
            You may not interfere with service operation, access unauthorized data, or misuse the
            platform in a way that harms others.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium">Changes and Termination</h2>
          <p className="mt-2">
            Terms may be updated from time to time. Access may be suspended or terminated for policy
            violations or tenancy changes.
          </p>
        </div>
      </div>
    </section>
  );
}
