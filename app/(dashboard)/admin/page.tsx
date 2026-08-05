export default function AdminDashboardPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30">
        <p className="text-sm font-medium text-emerald-400">Admin console</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Platform administration</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-300">
          Use this dashboard shell to manage users, review teacher approvals, and monitor platform activity.
        </p>
      </div>
    </section>
  );
}
