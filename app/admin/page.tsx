"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { getSession, getActivityLog, type ActivityEntry } from "@/lib/admin-auth";
import { getDashboardStats, getJournalPosts } from "@/lib/admin-data";
import { getAllProducts, type Product } from "@/lib/commerce";
import { useAdminAuth } from "@/components/admin/useAdminAuth";

type Stats = { totalProducts: number; totalJournalPosts: number; revenue: number };

export default function AdminDashboardPage() {
  const authed = useAdminAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [session, setSession] = useState<{ username: string } | null>(null);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "all">("30d");

  useEffect(() => {
    const s = getSession();
    if (s) setSession({ username: s.username });
    const prods = getAllProducts();
    const ds = getDashboardStats();
    setProducts(prods);
    setStats({
      totalProducts: ds.totalProducts || prods.length,
      totalJournalPosts: ds.totalJournalPosts || getJournalPosts().length,
      revenue: prods.reduce((sum, p) => sum + p.price * 12, 0),
    });
    setActivity(getActivityLog().slice(0, 8));
  }, []);

  if (authed !== true) return <div style={{ minHeight: "100vh", background: "#fafafa" }} />;
  if (!stats) return null;

  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening";
  const monthlyRev = Math.round(stats.revenue / 12);

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>{greeting}, {session?.username ?? "Admin"}</h1>
          <p>Here&apos;s what&apos;s happening with your store.</p>
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          {(["7d", "30d", "all"] as const).map((r) => (
            <button key={r} onClick={() => setTimeRange(r)}
              className={`admin-btn ${timeRange === r ? "admin-btn-primary" : "admin-btn-ghost"}`}
              style={{ fontSize: "12px", padding: "5px 10px" }}>
              {r === "all" ? "All time" : r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="admin-kpi-grid">
        <Link href="/admin/products" style={{ textDecoration: "none" }}>
          <div className="admin-kpi">
            <div className="admin-kpi-label">Products</div>
            <div className="admin-kpi-value">{stats.totalProducts}</div>
            <div className="admin-kpi-change positive">In your catalog</div>
          </div>
        </Link>
        <Link href="/admin/journal" style={{ textDecoration: "none" }}>
          <div className="admin-kpi">
            <div className="admin-kpi-label">Journal Posts</div>
            <div className="admin-kpi-value">{stats.totalJournalPosts}</div>
            <div className="admin-kpi-change">Published articles</div>
          </div>
        </Link>
        <div className="admin-kpi">
          <div className="admin-kpi-label">Est. Annual Revenue</div>
          <div className="admin-kpi-value">৳{stats.revenue.toLocaleString()}</div>
          <div className="admin-kpi-change">Based on catalog prices</div>
        </div>
        <div className="admin-kpi">
          <div className="admin-kpi-label">Monthly Average</div>
          <div className="admin-kpi-value">৳{monthlyRev.toLocaleString()}</div>
          <div className="admin-kpi-change">Revenue per month</div>
        </div>
      </div>

      <div className="admin-grid-2">
        {/* Revenue Chart */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-card-title">Revenue Trend</div>
            <span style={{ fontSize: "12px", color: "#9ca3af" }}>Simulated</span>
          </div>
          <RevenueChart products={products} months={timeRange === "7d" ? 1 : timeRange === "30d" ? 3 : 12} />
        </div>

        {/* Activity */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-card-title">Recent Activity</div>
            <Link href="/admin/activity" style={{ fontSize: "13px", color: "#4f46e5", textDecoration: "none" }}>View all</Link>
          </div>
          {activity.length === 0 ? (
            <div className="admin-empty" style={{ padding: "32px 16px" }}>
              <div className="admin-empty-icon">📋</div>
              <h3>No activity yet</h3>
              <p>Start by editing products or writing posts.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {activity.map((e) => (
                <div key={e.id} style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "8px 0", borderBottom: "1px solid #f3f4f6",
                }}>
                  <div style={{
                    width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0,
                    background: e.action.includes("login") ? "#059669" :
                      e.action.includes("create") ? "#4f46e5" :
                      e.action.includes("delete") ? "#dc2626" : "#d97706",
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {e.detail}
                    </div>
                    <div style={{ fontSize: "11px", color: "#9ca3af" }}>{formatTime(e.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="admin-card" style={{ marginTop: "24px" }}>
        <div className="admin-card-header">
          <div className="admin-card-title">Products</div>
          <Link href="/admin/products" className="admin-btn admin-btn-secondary" style={{ fontSize: "12px" }}>
            Manage all
          </Link>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th style={{ display: "none" }} className="md:table-cell">Notes</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.handle}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "6px", background: p.color, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 500, fontSize: "13px" }}>{p.name}</div>
                        <div style={{ fontSize: "11px", color: "#9ca3af" }}>{p.handle}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: "#6b7280" }}>{p.category}</td>
                  <td style={{ fontWeight: 500 }}>৳{p.price}</td>
                  <td style={{ display: "none" }}>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      {p.tastingNotes.map((n) => (
                        <span key={n} style={{
                          padding: "1px 6px", borderRadius: "4px", fontSize: "11px",
                          background: "#f3f4f6", color: "#6b7280",
                        }}>{n}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className="admin-badge admin-badge-success">
                      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "currentColor" }} />
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RevenueChart({ products, months }: { products: Product[]; months: number }) {
  const data = useMemo(() => {
    const base = products.reduce((s, p) => s + p.price * 3, 0);
    return Array.from({ length: months }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (months - 1 - i));
      return {
        label: d.toLocaleString("default", { month: "short" }),
        value: Math.round(base * (0.7 + Math.random() * 0.6)),
      };
    });
  }, [products, months]);

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div>
      <div className="admin-chart-bar">
        {data.map((d, i) => (
          <div key={i} className="admin-chart-bar-item">
            <div className="admin-chart-bar-value">৳{d.value.toLocaleString()}</div>
            <div className="admin-chart-bar-fill" style={{ height: `${(d.value / max) * 100}%` }} />
            <div className="admin-chart-bar-label">{d.label}</div>
          </div>
        ))}
      </div>
      <div style={{
        display: "flex", justifyContent: "space-between", marginTop: "16px",
        paddingTop: "12px", borderTop: "1px solid #e5e7eb", fontSize: "12px",
      }}>
        <div>
          <div style={{ color: "#9ca3af", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Total</div>
          <div style={{ fontWeight: 600, color: "#111827" }}>৳{data.reduce((s, d) => s + d.value, 0).toLocaleString()}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#9ca3af", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Avg / month</div>
          <div style={{ fontWeight: 600, color: "#111827" }}>
            ৳{data.length ? Math.round(data.reduce((s, d) => s + d.value, 0) / data.length).toLocaleString() : 0}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(ts).toLocaleDateString();
}
