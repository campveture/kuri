export function AdminComingSoon({ title, note }: { title: string; note?: string }) {
  return (
    <div className="space-y-4">
      <h1 className="h-display text-3xl">{title}</h1>
      <div className="card p-6 text-sm text-muted">
        <p className="font-medium text-charcoal">Being ported from the reference build.</p>
        <p className="mt-1">
          {note ??
            "The data model, server actions and storefront wiring for this section land in the next pass of the migration."}
        </p>
      </div>
    </div>
  );
}
