"use client";

import { useState, useEffect } from "react";
import { getJournalPosts, addJournalPost, updateJournalPost, deleteJournalPost, type JournalPost } from "@/lib/admin-data";
import { logActivity, sanitizeInput } from "@/lib/admin-auth";
import { useAdminAuth } from "@/components/admin/useAdminAuth";

export default function AdminJournalPage() {
  const authed = useAdminAuth();
  const [posts, setPosts] = useState<JournalPost[]>([]);
  const [editing, setEditing] = useState<JournalPost | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => { setPosts(getJournalPosts()); }, []);

  function handleSave(post: JournalPost) {
    const s = { ...post, title: sanitizeInput(post.title), excerpt: sanitizeInput(post.excerpt), body: sanitizeInput(post.body), author: sanitizeInput(post.author), category: sanitizeInput(post.category), slug: sanitizeInput(post.slug).toLowerCase().replace(/[^a-z0-9-]/g, "-") };
    if (editing) { updateJournalPost(post.slug, s); logActivity("journal_update", `Updated "${post.title}"`); }
    else { addJournalPost(s); logActivity("journal_create", `Created "${post.title}"`); }
    setEditing(null); setIsAdding(false); setPosts(getJournalPosts());
  }

  function handleDelete(slug: string) {
    const p = posts.find((x) => x.slug === slug);
    deleteJournalPost(slug);
    logActivity("journal_delete", `Deleted "${p?.title ?? slug}"`);
    setConfirmDelete(null); setPosts(getJournalPosts());
  }

  if (authed !== true) return <div style={{ minHeight: "100vh", background: "#fafafa" }} />;

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Journal</h1>
          <p>{posts.length} posts published</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={() => { setIsAdding(true); setEditing(null); }}>+ New post</button>
      </div>

      {(isAdding || editing) && (
        <div className="admin-card" style={{ marginBottom: "20px", borderColor: "#c7d2fe" }}>
          <div className="admin-card-header">
            <div className="admin-card-title">{editing ? "Edit Post" : "New Post"}</div>
            <button className="admin-btn admin-btn-ghost" onClick={() => { setEditing(null); setIsAdding(false); }}>Cancel</button>
          </div>
          <PostForm post={editing} onSave={handleSave} onCancel={() => { setEditing(null); setIsAdding(false); }} />
        </div>
      )}

      <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Date</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.slug}>
                <td>
                  <div style={{ fontWeight: 500, fontSize: "13px" }}>{p.title}</div>
                  <div style={{ fontSize: "11px", color: "#9ca3af", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.excerpt}</div>
                </td>
                <td style={{ color: "#6b7280", fontSize: "13px" }}>{p.category}</td>
                <td style={{ color: "#9ca3af", fontSize: "13px" }}>{p.date}</td>
                <td style={{ textAlign: "right" }}>
                  <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                    <button className="admin-btn admin-btn-ghost" style={{ fontSize: "12px" }} onClick={() => { setEditing(p); setIsAdding(false); }}>Edit</button>
                    {confirmDelete === p.slug ? (
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button className="admin-btn admin-btn-danger" style={{ fontSize: "12px", padding: "4px 10px" }} onClick={() => handleDelete(p.slug)}>Delete</button>
                        <button className="admin-btn admin-btn-ghost" style={{ fontSize: "12px" }} onClick={() => setConfirmDelete(null)}>Cancel</button>
                      </div>
                    ) : (
                      <button className="admin-btn admin-btn-ghost" style={{ fontSize: "12px", color: "#dc2626" }} onClick={() => setConfirmDelete(p.slug)}>Delete</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: "center", padding: "48px", color: "#9ca3af" }}>No posts yet. Write your first one!</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PostForm({ post, onSave, onCancel }: { post: JournalPost | null; onSave: (p: JournalPost) => void; onCancel: () => void }) {
  const [form, setForm] = useState<JournalPost>(post ?? {
    slug: "", title: "", excerpt: "", body: "", date: new Date().toISOString().split("T")[0],
    author: "Kuri Team", category: "General", image: "/images/hero-1.jpg",
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <div>
          <label className="admin-label">Title</label>
          <input className="admin-input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="admin-label">Slug</label>
          <input className="admin-input" required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} disabled={!!post} style={{ opacity: post ? 0.5 : 1 }} />
        </div>
        <div>
          <label className="admin-label">Category</label>
          <input className="admin-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        </div>
        <div>
          <label className="admin-label">Date</label>
          <input className="admin-input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>
        <div style={{ gridColumn: "span 2" }}>
          <label className="admin-label">Excerpt</label>
          <textarea className="admin-input" rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} style={{ resize: "none" }} />
        </div>
        <div style={{ gridColumn: "span 2" }}>
          <label className="admin-label">Body</label>
          <textarea className="admin-input" rows={8} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} style={{ resize: "vertical", fontFamily: "monospace", fontSize: "13px" }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button type="submit" className="admin-btn admin-btn-primary">{post ? "Save changes" : "Publish"}</button>
        <button type="button" className="admin-btn admin-btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
