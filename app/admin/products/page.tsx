"use client";

import { useRequireAuth } from "@/components/admin/useAdminAuth";
import { getAllProducts, type Product } from "@/lib/commerce";
import { getProducts, addProduct, updateProduct, deleteProduct } from "@/lib/admin-data";
import { useState, useEffect } from "react";

export default function ProductsPage() {
  useRequireAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", category: "", price: "" });

  useEffect(() => {
    const stored = getProducts();
    setProducts(stored.length > 0 ? stored : getAllProducts());
  }, []);

  const save = () => {
    if (!form.name || !form.price) return;
    if (editing) {
      updateProduct(editing, { name: form.name, category: form.category, price: Number(form.price) });
    } else {
      const handle = form.name.toLowerCase().replace(/\s+/g, "-");
      const base = getAllProducts()[0];
      addProduct({ ...base, handle, name: form.name, category: form.category || "Tea", price: Number(form.price), subscribePrice: Math.round(Number(form.price) * 0.9) });
    }
    setProducts(getProducts().length > 0 ? getProducts() : getAllProducts());
    setEditing(null);
    setForm({ name: "", category: "", price: "" });
  };

  const del = (handle: string) => {
    if (!confirm("Delete this product?")) return;
    deleteProduct(handle);
    const stored = getProducts();
    setProducts(stored.length > 0 ? stored : getAllProducts());
  };

  return (
    <div>
      <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#111827", marginBottom: "24px" }}>Products</h1>
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "20px", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "12px" }}>{editing ? "Edit Product" : "Add Product"}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px" }} />
          <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px" }} />
          <input placeholder="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} style={{ padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px" }} />
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={save} style={{ padding: "8px 16px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>{editing ? "Update" : "Add"}</button>
          {editing && <button onClick={() => { setEditing(null); setForm({ name: "", category: "", price: "" }); }} style={{ padding: "8px 16px", background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "13px", cursor: "pointer" }}>Cancel</button>}
        </div>
      </div>
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e5e7eb", background: "#fafafa" }}>
              <th style={{ textAlign: "left", padding: "10px 16px", fontSize: "12px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase" as const }}>Name</th>
              <th style={{ textAlign: "left", padding: "10px 16px", fontSize: "12px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase" as const }}>Category</th>
              <th style={{ textAlign: "left", padding: "10px 16px", fontSize: "12px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase" as const }}>Price</th>
              <th style={{ textAlign: "right", padding: "10px 16px", fontSize: "12px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase" as const }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.handle} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "10px 16px", fontWeight: 500 }}>{p.name}</td>
                <td style={{ padding: "10px 16px", color: "#6b7280" }}>{p.category}</td>
                <td style={{ padding: "10px 16px" }}>৳{p.price}</td>
                <td style={{ padding: "10px 16px", textAlign: "right" }}>
                  <button onClick={() => { setEditing(p.handle); setForm({ name: p.name, category: p.category, price: String(p.price) }); }} style={{ padding: "4px 10px", background: "none", border: "1px solid #e5e7eb", borderRadius: "4px", fontSize: "12px", cursor: "pointer", marginRight: "6px" }}>Edit</button>
                  <button onClick={() => del(p.handle)} style={{ padding: "4px 10px", background: "none", border: "1px solid #fecaca", borderRadius: "4px", fontSize: "12px", color: "#dc2626", cursor: "pointer" }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
