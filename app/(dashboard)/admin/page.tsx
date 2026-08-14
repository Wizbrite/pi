export default function AdminDashboardPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-border bg-white p-6 shadow-xs">
        <p className="text-sm font-semibold text-violet-600">Admin console</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">Platform administration</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Use this dashboard shell to manage users, review teacher approvals, and monitor platform activity.
        </p>
      </div>
    </section>
  );
}
