export default function AdminDashboardPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <p className="text-sm font-semibold text-blue-600">Admin console</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Platform administration</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-600">
          Use this dashboard shell to manage users, review teacher approvals, and monitor platform activity.
        </p>
      </div>
    </section>
  );
}
