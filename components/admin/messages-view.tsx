"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toaster";
import { formatDateTime } from "@/lib/utils";
import {
  setContactHandled,
  deleteContactMessage,
  toggleSubscriber,
  deleteSubscriber,
} from "@/app/admin/messages/actions";

type Msg = {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  handled: boolean;
  createdAt: string;
};
type Sub = { id: string; email: string; source: string; active: boolean; createdAt: string };

export function MessagesView({ messages, subscribers }: { messages: Msg[]; subscribers: Sub[] }) {
  const [tab, setTab] = useState<"messages" | "subscribers">("messages");
  const router = useRouter();
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<{ ok?: boolean; error?: string }>, ok: string) =>
    start(async () => {
      const r = await fn();
      if (r?.error) toast(r.error, "error");
      else {
        toast(ok, "success");
        router.refresh();
      }
    });

  const csv = () => {
    const rows = [["email", "source", "active", "signed up"], ...subscribers.map((s) => [s.email, s.source, String(s.active), s.createdAt])];
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "kuri-subscribers.csv";
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {(["messages", "subscribers"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`btn btn-sm ${tab === t ? "btn-primary" : "btn-ghost"}`}
          >
            {t === "messages" ? `Contact messages (${messages.length})` : `Newsletter (${subscribers.length})`}
          </button>
        ))}
      </div>

      {tab === "messages" ? (
        <div className="space-y-3">
          {messages.length === 0 && <p className="card p-5 text-sm text-muted-2">No messages yet.</p>}
          {messages.map((m) => (
            <div key={m.id} className={`card p-4 ${m.handled ? "opacity-60" : ""}`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <span className="font-medium">{m.name}</span>{" "}
                  <a href={`mailto:${m.email}`} className="text-gold-deep hover:underline">{m.email}</a>{" "}
                  <span className="badge ml-1">{m.topic}</span>
                </div>
                <span className="text-xs text-muted-2">{formatDateTime(m.createdAt)}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-charcoal-2">{m.message}</p>
              <div className="mt-3 flex gap-3 text-xs">
                <button
                  disabled={pending}
                  onClick={() => run(() => setContactHandled(m.id, !m.handled), m.handled ? "Reopened" : "Marked handled")}
                  className="text-muted-2 hover:text-charcoal disabled:opacity-40"
                >
                  {m.handled ? "Reopen" : "Mark handled"}
                </button>
                <button
                  disabled={pending}
                  onClick={() => {
                    if (confirm("Delete this message?")) run(() => deleteContactMessage(m.id), "Deleted");
                  }}
                  className="text-negative hover:underline disabled:opacity-40"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={csv} disabled={subscribers.length === 0} className="btn btn-outline btn-sm">
              Export CSV
            </button>
          </div>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream-2 text-xs uppercase tracking-[0.1em] text-muted-2">
                <tr>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Source</th>
                  <th className="p-3 text-left">Signed up</th>
                  <th className="p-3 text-left">State</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.length === 0 && (
                  <tr><td colSpan={5} className="p-4 text-muted-2">No signups yet.</td></tr>
                )}
                {subscribers.map((s) => (
                  <tr key={s.id} className="border-t border-line">
                    <td className="p-3">{s.email}</td>
                    <td className="p-3 text-muted-2">{s.source}</td>
                    <td className="p-3 text-muted-2">{formatDateTime(s.createdAt)}</td>
                    <td className="p-3">
                      <span className="badge" style={s.active ? { background: "#e6efe7", color: "#2c4030", borderColor: "#c2d8c6" } : undefined}>
                        {s.active ? "Active" : "Unsubscribed"}
                      </span>
                    </td>
                    <td className="p-3 text-right text-xs">
                      <button
                        disabled={pending}
                        onClick={() => run(() => toggleSubscriber(s.id, !s.active), "Updated")}
                        className="mr-3 text-muted-2 hover:text-charcoal disabled:opacity-40"
                      >
                        {s.active ? "Unsubscribe" : "Reactivate"}
                      </button>
                      <button
                        disabled={pending}
                        onClick={() => {
                          if (confirm("Delete this subscriber?")) run(() => deleteSubscriber(s.id), "Deleted");
                        }}
                        className="text-negative hover:underline disabled:opacity-40"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
