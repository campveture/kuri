import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MessagesView } from "@/components/admin/messages-view";

export const metadata = { title: "Messages" };

export default async function AdminMessagesPage() {
  await requireAdmin();
  const [messages, subscribers] = await Promise.all([
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.subscriber.findMany({ orderBy: { createdAt: "desc" }, take: 500 }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="h-display text-3xl">Messages &amp; signups</h1>
        <p className="mt-1 text-sm text-muted-2">
          Contact-form submissions and newsletter email captures from the storefront.
        </p>
      </div>
      <MessagesView
        messages={messages.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }))}
        subscribers={subscribers.map((s) => ({ ...s, createdAt: s.createdAt.toISOString() }))}
      />
    </div>
  );
}
