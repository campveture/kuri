"use client";

import { useState, useEffect } from "react";
import { getAllProducts, type Product } from "@/lib/commerce";
import { getProducts, addProduct, updateProduct, deleteProduct } from "@/lib/admin-data";
import { logActivity, sanitizeInput } from "@/lib/admin-auth";
import { useAdminAuth } from "@/components/admin/useAdminAuth";

export default function AdminProductsPage() {
  const authed = useAdminAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  function load() {
    const custom = getProducts();
    const defaults = getAllProducts();
    const merged = [...defaults];
    for (const cp of custom) {
      const idx = merged.findIndex((p) => p.handle === cp.handle);
      if (idx !== -1) merged[idx] = cp;
      else merged.push(cp);
    }
    setProducts(merged);
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  function handleSave(product: Product) {
    const sanitized = { ...product, name: sanitizeInput(product.name), handle: sanitizeInput(product.handle).toLowerCase().replace(/[^a-z0-9-]/g, "-"), shortDescription: sanitizeInput(product.shortDescription), description: sanitizeInput(product.description), subscribePrice: Math.round(product.price * 0.9) };
    if (editing) { updateProduct(product.handle, sanitized); logActivity("product_update", `Updated "${product.name}"`); }
    else { addProduct(sanitized); logActivity("product_create", `Created "${product.name}"`); }
    setEditing(null); setIsAdding(false); load();
  }

  function handleDelete(handle: string) {
    const p = products.find((x) => x.handle === handle);
    deleteProduct(handle);
    logActivity("product_delete", `Deleted "${p?.name ?? handle}"`);
    setConfirmDelete(null); load();
  }

  if (authed !== true) return <div style={{ minHeight: "100vh", background: "#fafafa" }} />;

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Products</h1>
          <p>{products.length} products in your catalog</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={() => { setIsAdding(true); setEditing(null); }}>
          + Add product
        </button>
      </div>

      <div style={{ marginBottom: "20px", maxWidth: "320px" }}>
        <input className="admin-input" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {(isAdding || editing) && (
        <ProductForm product={editing} onSave={handleSave} onCancel={() => { setEditing(null); setIsAdding(false); }} />
      )}

      <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Handle</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.handle}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "6px", background: p.color, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 500, fontSize: "13px" }}>{p.name}</div>
                      <div style={{ fontSize: "11px", color: "#9ca3af", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.shortDescription}</div>
                    </div>
                  </div>
                </td>
                <td style={{ color: "#6b7280", fontSize: "13px" }}>{p.category}</td>
                <td style={{ fontWeight: 500, fontSize: "13px" }}>৳{p.price}</td>
                <td style={{ fontSize: "12px", color: "#9ca3af", fontFamily: "monospace" }}>{p.handle}</td>
                <td style={{ textAlign: "right" }}>
                  <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                    <button className="admin-btn admin-btn-ghost" style={{ fontSize: "12px" }} onClick={() => { setEditing(p); setIsAdding(false); }}>Edit</button>
                    {confirmDelete === p.handle ? (
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button className="admin-btn admin-btn-danger" style={{ fontSize: "12px", padding: "4px 10px" }} onClick={() => handleDelete(p.handle)}>Delete</button>
                        <button className="admin-btn admin-btn-ghost" style={{ fontSize: "12px" }} onClick={() => setConfirmDelete(null)}>Cancel</button>
                      </div>
                    ) : (
                      <button className="admin-btn admin-btn-ghost" style={{ fontSize: "12px", color: "#dc2626" }} onClick={() => setConfirmDelete(p.handle)}>Delete</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: "center", padding: "48px", color: "#9ca3af" }}>No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductForm({ product, onSave, onCancel }: { product: Product | null; onSave: (p: Product) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Product>(product ?? {
    handle: "", name: "", category: "Black Tea", tastingNotes: [], price: 0, subscribePrice: 0,
    color: "#4f46e5", colorDark: "#4338ca", shortDescription: "", description: "",
    origin: "Kuri Valley Estate, Sreemangal", altitude: "", process: "", harvest: "",
    brew: { temp: "", dose: "", steepTime: "", bestWith: "" },
  });
  const [notes, setNotes] = useState(product?.tastingNotes.join(", ") ?? "");

  return (
    <div className="admin-card" style={{ marginBottom: "20px", borderColor: "#c7d2fe" }}>
      <div className="admin-card-header">
        <div className="admin-card-title">{product ? "Edit Product" : "New Product"}</div>
        <button className="admin-btn admin-btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); onSave({ ...form, tastingNotes: notes.split(",").map((n) => n.trim()).filter(Boolean), subscribePrice: Math.round(form.price * 0.9) }); }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          <div>
            <label className="admin-label">Name</label>
            <input className="admin-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="admin-label">Handle (URL)</label>
            <input className="admin-input" required value={form.handle} onChange={(e) => setForm({ ...form, handle: e.target.value })} disabled={!!product} style={{ opacity: product ? 0.5 : 1 }} />
          </div>
          <div>
            <label className="admin-label">Category</label>
            <select className="admin-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option>Black Tea</option><option>Green Tea</option><option>Oolong Tea</option><option>White Tea</option><option>Herbal Tea</option>
            </select>
          </div>
          <div>
            <label className="admin-label">Price (BDT)</label>
            <input className="admin-input" type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          </div>
          <div style={{ gridColumn: "span 2" }}>
            <label className="admin-label">Short Description</label>
            <textarea className="admin-input" rows={2} value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} style={{ resize: "none" }} />
          </div>
          <div style={{ gridColumn: "span 2" }}>
            <label className="admin-label">Full Description</label>
            <textarea className="admin-input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ resize: "none" }} />
          </div>
          <div>
            <label className="admin-label">Tasting Notes</label>
            <input className="admin-input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Malt, Honey, Stone Fruit" />
          </div>
          <div>
            <label className="admin-label">Color</label>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} style={{ width: "36px", height: "36px", border: "1px solid #e5e7eb", borderRadius: "6px", cursor: "pointer" }} />
              <input className="admin-input" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} style={{ flex: 1 }} />
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button type="submit" className="admin-btn admin-btn-primary">{product ? "Save changes" : "Add product"}</button>
          <button type="button" className="admin-btn admin-btn-secondary" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
