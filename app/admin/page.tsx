"use client";

import { useRequireAuth } from "@/components/admin/useAdminAuth";
import { getAllProducts } from "@/lib/commerce";
import { getJournalPosts } from "@/lib/admin-data";
import Link from "next/link";

export default function AdminDashboard() {
  useRequireAuth();
  const products = getAllProducts();
  const posts = getJournalPosts();

  return (
    <div>
      <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#111827", marginBottom: "24px" }}>Dashboard</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <Link href="/admin/products" style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "20px", textDecoration: "none" }}>
          <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>Products</div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#111827" }}>{products.length}</div>
        </Link>
        <Link href="/admin/journal" style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "20px", textDecoration: "none" }}>
          <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>Journal Posts</div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#111827" }}>{posts.length}</div>
        </Link>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "20px" }}>
          <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>Est. Revenue</div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#111827" }}>৳{products.reduce((s, p) => s + p.price * 12, 0).toLocaleString()}</div>
        </div>
      </div>
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "20px" }}>
        <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#111827", marginBottom: "16px" }}>Products</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
              <th style={{ textAlign: "left", padding: "8px 12px", fontSize: "12px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase" as const }}>Name</th>
              <th style={{ textAlign: "left", padding: "8px 12px", fontSize: "12px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase" as const }}>Category</th>
              <th style={{ textAlign: "left", padding: "8px 12px", fontSize: "12px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase" as const }}>Price</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.handle} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "10px 12px", fontWeight: 500 }}>{p.name}</td>
                <td style={{ padding: "10px 12px", color: "#6b7280" }}>{p.category}</td>
                <td style={{ padding: "10px 12px" }}>৳{p.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
