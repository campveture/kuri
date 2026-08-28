"use client";

import { useState, useEffect } from "react";
import { getActivityLog, clearActivityLog, type ActivityEntry } from "@/lib/admin-auth";
import { useAdminAuth } from "@/components/admin/useAdminAuth";

export default function AdminActivityPage() {
  const authed = useAdminAuth();
  const [entries, setEntries] = useState<ActivityEntry[]>([]);

  useEffect(() => { setEntries(getActivityLog()); }, []);

  const handleClear = () => {
    if (confirm("Clear all activity logs?")) { clearActivityLog(); setEntries([]); }
  };

  if (authed !== true) return <div style={{ minHeight: "100vh", background: "#fafafa" }} />;

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Activity Log</h1>
          <p>{entries.length} recorded actions</p>
        </div>
        <button className="admin-btn admin-btn-danger" onClick={handleClear}>Clear log</button>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
        {entries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#9ca3af" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px", opacity: 0.4 }}>📋</div>
            <div style={{ fontSize: "14px", fontWeight: 500, color: "#6b7280" }}>No activity yet</div>
            <div style={{ fontSize: "13px" }}>Actions will appear here as you use the admin panel.</div>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "120px" }}>Action</th>
                <th>Detail</th>
                <th style={{ width: "160px" }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id}>
                  <td>
                    <span className={`admin-badge ${
                      e.action.includes("login") ? "admin-badge-success" :
                      e.action.includes("create") ? "admin-badge-neutral" :
                      e.action.includes("delete") ? "admin-badge-error" :
                      "admin-badge-warning"
                    }`}>{e.action}</span>
                  </td>
                  <td style={{ fontSize: "13px" }}>{e.detail}</td>
                  <td style={{ fontSize: "12px", color: "#9ca3af" }}>{new Date(e.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
