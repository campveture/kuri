"use client";

import { useState, useEffect } from "react";
import { getSettings, updateSettings, type SiteSettings } from "@/lib/admin-data";
import { logActivity, sanitizeInput } from "@/lib/admin-auth";
import { exportData, importData, resetData } from "@/lib/admin-data";
import { useAdminAuth } from "@/components/admin/useAdminAuth";

export default function AdminSettingsPage() {
  const authed = useAdminAuth();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<"general" | "social" | "data">("general");

  useEffect(() => { setSettings(getSettings()); }, []);

  const handleSave = () => {
    if (!settings) return;
    const s = { ...settings, siteName: sanitizeInput(settings.siteName), tagline: sanitizeInput(settings.tagline), email: sanitizeInput(settings.email), phone: sanitizeInput(settings.phone), address: sanitizeInput(settings.address), shippingMessage: sanitizeInput(settings.shippingMessage), heroTitle: sanitizeInput(settings.heroTitle), heroSubtitle: sanitizeInput(settings.heroSubtitle), heroCTA: sanitizeInput(settings.heroCTA) };
    updateSettings(s);
    logActivity("settings_update", "Settings updated");
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `kuri-backup-${new Date().toISOString().split("T")[0]}.json`; a.click();
    URL.revokeObjectURL(url); logActivity("data_export", "Data exported");
  };

  const handleImport = () => {
    const input = document.createElement("input"); input.type = "file"; input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => { if (importData(ev.target?.result as string)) { logActivity("data_import", "Data imported"); setSettings(getSettings()); alert("Imported!"); } else { alert("Invalid file."); } };
      reader.readAsText(file);
    }; input.click();
  };

  const handleReset = () => {
    if (confirm("Reset ALL data? This cannot be undone.")) {
      resetData(); logActivity("data_reset", "Data reset"); setSettings(getSettings()); window.location.reload();
    }
  };

  if (authed !== true) return <div style={{ minHeight: "100vh", background: "#fafafa" }} />;
  if (!settings) return null;

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Settings</h1>
          <p>Configure your website</p>
        </div>
      </div>

      <div className="admin-tabs">
        {(["general", "social", "data"] as const).map((t) => (
          <button key={t} className={`admin-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t === "general" ? "General" : t === "social" ? "Social Links" : "Data Management"}
          </button>
        ))}
      </div>

      {tab === "general" && (
        <div className="admin-card">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div><label className="admin-label">Site Name</label><input className="admin-input" value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} /></div>
            <div><label className="admin-label">Tagline</label><input className="admin-input" value={settings.tagline} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} /></div>
            <div><label className="admin-label">Email</label><input className="admin-input" value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} /></div>
            <div><label className="admin-label">Phone</label><input className="admin-input" value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} /></div>
            <div style={{ gridColumn: "span 2" }}><label className="admin-label">Address</label><input className="admin-input" value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} /></div>
            <div style={{ gridColumn: "span 2" }}><label className="admin-label">Shipping Banner</label><input className="admin-input" value={settings.shippingMessage} onChange={(e) => setSettings({ ...settings, shippingMessage: e.target.value })} /></div>
          </div>
          <div style={{ borderTop: "1px solid #e5e7eb", marginTop: "20px", paddingTop: "20px" }}>
            <h3 style={{ fontSize: "13px", fontWeight: 600, color: "#374151", margin: "0 0 12px" }}>Hero Section</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div><label className="admin-label">Title</label><input className="admin-input" value={settings.heroTitle} onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })} /></div>
              <div><label className="admin-label">CTA Text</label><input className="admin-input" value={settings.heroCTA} onChange={(e) => setSettings({ ...settings, heroCTA: e.target.value })} /></div>
              <div style={{ gridColumn: "span 2" }}><label className="admin-label">Subtitle</label><textarea className="admin-input" rows={2} value={settings.heroSubtitle} onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })} style={{ resize: "none" }} /></div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #e5e7eb" }}>
            <button className="admin-btn admin-btn-primary" onClick={handleSave}>Save settings</button>
            {saved && <span style={{ fontSize: "13px", color: "#059669", alignSelf: "center" }}>Saved!</span>}
          </div>
        </div>
      )}

      {tab === "social" && (
        <div className="admin-card">
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "480px" }}>
            <div><label className="admin-label">Instagram</label><input className="admin-input" value={settings.socialLinks.instagram} onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, instagram: e.target.value } })} placeholder="https://instagram.com/..." /></div>
            <div><label className="admin-label">Facebook</label><input className="admin-input" value={settings.socialLinks.facebook} onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, facebook: e.target.value } })} placeholder="https://facebook.com/..." /></div>
            <div><label className="admin-label">Twitter / X</label><input className="admin-input" value={settings.socialLinks.twitter} onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, twitter: e.target.value } })} placeholder="https://twitter.com/..." /></div>
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #e5e7eb" }}>
            <button className="admin-btn admin-btn-primary" onClick={handleSave}>Save settings</button>
            {saved && <span style={{ fontSize: "13px", color: "#059669", alignSelf: "center" }}>Saved!</span>}
          </div>
        </div>
      )}

      {tab === "data" && (
        <div className="admin-card">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
            <div style={{ padding: "20px", border: "1px solid #e5e7eb", borderRadius: "8px", cursor: "pointer" }} onClick={handleExport}>
              <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>Export Backup</div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>Download all data as JSON</div>
            </div>
            <div style={{ padding: "20px", border: "1px solid #e5e7eb", borderRadius: "8px", cursor: "pointer" }} onClick={handleImport}>
              <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>Import Data</div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>Restore from a backup file</div>
            </div>
            <div style={{ padding: "20px", border: "1px solid #fecaca", borderRadius: "8px", cursor: "pointer", background: "#fef2f2" }} onClick={handleReset}>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#dc2626", marginBottom: "4px" }}>Reset All Data</div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>Restore defaults. Cannot undo.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
