const MAP: Record<string, { bg: string; fg: string; bd: string }> = {
  PENDING: { bg: "#faf1dd", fg: "#8a6516", bd: "#e7d3a3" },
  CONFIRMED: { bg: "#e8eef2", fg: "#3a5a72", bd: "#c4d5e0" },
  PACKED: { bg: "#efe9f2", fg: "#5a4372", bd: "#d5c4e0" },
  SHIPPED: { bg: "#e4f0f0", fg: "#2f6b6b", bd: "#bfe0e0" },
  DELIVERED: { bg: "#e6efe7", fg: "#2c4030", bd: "#c2d8c6" },
  CANCELLED: { bg: "#f6e5e5", fg: "#8a2f2f", bd: "#e0bfbf" },
  UNPAID: { bg: "#f1e9d8", fg: "#5b5140", bd: "#e4d9c2" },
  PENDING_VERIFICATION: { bg: "#faf1dd", fg: "#8a6516", bd: "#e7d3a3" },
  PAID: { bg: "#e6efe7", fg: "#2c4030", bd: "#c2d8c6" },
  REFUNDED: { bg: "#f6e5e5", fg: "#8a2f2f", bd: "#e0bfbf" },
  ACTIVE: { bg: "#e6efe7", fg: "#2c4030", bd: "#c2d8c6" },
  PAUSED: { bg: "#f1e9d8", fg: "#5b5140", bd: "#e4d9c2" },
  DRAFT: { bg: "#f1e9d8", fg: "#5b5140", bd: "#e4d9c2" },
  PUBLISHED: { bg: "#e6efe7", fg: "#2c4030", bd: "#c2d8c6" },
};

export function StatusBadge({ status }: { status: string }) {
  const label = status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
  const c = MAP[status] ?? { bg: "#f1e9d8", fg: "#5b5140", bd: "#e4d9c2" };
  return (
    <span
      className="badge"
      style={{ background: c.bg, color: c.fg, borderColor: c.bd }}
    >
      {label}
    </span>
  );
}
