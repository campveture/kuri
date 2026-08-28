"use client";

import { useRequireAuth } from "@/components/admin/useAdminAuth";
import { getJournalPosts, addJournalPost, updateJournalPost, deleteJournalPost, type JournalPost } from "@/lib/admin-data";
import { useState, useEffect } from "react";

export default function JournalPage() {
  useRequireAuth();
  const [posts, setPosts] = useState<JournalPost[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", excerpt: "", body: "", category: "Origin", author: "Kuri Team", date: new Date().toISOString().split("T")[0] });

  useEffect(() => { setPosts(getJournalPosts()); }, []);

  const save = () => {
    if (!form.title) return;
    if (editing) {
      updateJournalPost(editing, form);
    } else {
      addJournalPost({ ...form, slug: form.title.toLowerCase().replace(/\s+/g, "-"), image: "" });
    }
    setPosts(getJournalPosts());
    setEditing(null);
    setForm({ title: "", excerpt: "", body: "", category: "Origin", author: "Kuri Team", date: new Date().toISOString().split("T")[0] });
  };

  const del = (slug: string) => {
    if (!confirm("Delete this post?")) return;
    deleteJournalPost(slug);
    setPosts(getJournalPosts());
  };

  return (
    <div>
      <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#111827", marginBottom: "24px" }}>Journal</h1>
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "20px", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "12px" }}>{editing ? "Edit Post" : "New Post"}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={{ padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px" }} />
          <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px" }} />
        </div>
        <textarea placeholder="Excerpt" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} style={{ width: "100%", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", marginBottom: "12px", resize: "vertical" as const }} />
        <textarea placeholder="Body" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={6} style={{ width: "100%", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", marginBottom: "12px", resize: "vertical" as const }} />
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={save} style={{ padding: "8px 16px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>{editing ? "Update" : "Publish"}</button>
          {editing && <button onClick={() => { setEditing(null); setForm({ title: "", excerpt: "", body: "", category: "Origin", author: "Kuri Team", date: new Date().toISOString().split("T")[0] }); }} style={{ padding: "8px 16px", background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "13px", cursor: "pointer" }}>Cancel</button>}
        </div>
      </div>
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e5e7eb", background: "#fafafa" }}>
              <th style={{ textAlign: "left", padding: "10px 16px", fontSize: "12px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase" as const }}>Title</th>
              <th style={{ textAlign: "left", padding: "10px 16px", fontSize: "12px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase" as const }}>Category</th>
              <th style={{ textAlign: "left", padding: "10px 16px", fontSize: "12px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase" as const }}>Date</th>
              <th style={{ textAlign: "right", padding: "10px 16px", fontSize: "12px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase" as const }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.slug} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "10px 16px", fontWeight: 500 }}>{p.title}</td>
                <td style={{ padding: "10px 16px", color: "#6b7280" }}>{p.category}</td>
                <td style={{ padding: "10px 16px", color: "#6b7280" }}>{p.date}</td>
                <td style={{ padding: "10px 16px", textAlign: "right" }}>
                  <button onClick={() => { setEditing(p.slug); setForm({ title: p.title, excerpt: p.excerpt, body: p.body, category: p.category, author: p.author, date: p.date }); }} style={{ padding: "4px 10px", background: "none", border: "1px solid #e5e7eb", borderRadius: "4px", fontSize: "12px", cursor: "pointer", marginRight: "6px" }}>Edit</button>
                  <button onClick={() => del(p.slug)} style={{ padding: "4px 10px", background: "none", border: "1px solid #fecaca", borderRadius: "4px", fontSize: "12px", color: "#dc2626", cursor: "pointer" }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
