"use client";

import { useRequireAuth } from "@/components/admin/useAdminAuth";
import { getSettings, updateSettings, type SiteSettings } from "@/lib/admin-data";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  useRequireAuth();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setSettings(getSettings()); }, []);

  const save = () => {
    if (!settings) return;
    updateSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!settings) return <div style={{ padding: "20px", color: "#6b7280" }}>Loading...</div>;

  return (
    <div>
      <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#111827", marginBottom: "24px" }}>Site Settings</h1>
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "4px" }}>Site Name</label>
            <input value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} style={{ width: "100%", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" as const }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "4px" }}>Tagline</label>
            <input value={settings.tagline} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} style={{ width: "100%", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" as const }} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "20px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "4px" }}>Email</label>
            <input value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} style={{ width: "100%", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" as const }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "4px" }}>Phone</label>
            <input value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} style={{ width: "100%", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" as const }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "4px" }}>Address</label>
            <input value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} style={{ width: "100%", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" as const }} />
          </div>
        </div>
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "4px" }}>Shipping Message</label>
          <input value={settings.shippingMessage} onChange={(e) => setSettings({ ...settings, shippingMessage: e.target.value })} style={{ width: "100%", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" as const }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "20px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "4px" }}>Instagram</label>
            <input value={settings.socialLinks.instagram} onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, instagram: e.target.value } })} style={{ width: "100%", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" as const }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "4px" }}>Facebook</label>
            <input value={settings.socialLinks.facebook} onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, facebook: e.target.value } })} style={{ width: "100%", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" as const }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "4px" }}>Twitter</label>
            <input value={settings.socialLinks.twitter} onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, twitter: e.target.value } })} style={{ width: "100%", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" as const }} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "20px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "4px" }}>Hero Title</label>
            <input value={settings.heroTitle} onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })} style={{ width: "100%", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" as const }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "4px" }}>Hero Subtitle</label>
            <input value={settings.heroSubtitle} onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })} style={{ width: "100%", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" as const }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "4px" }}>Hero CTA Text</label>
            <input value={settings.heroCTA} onChange={(e) => setSettings({ ...settings, heroCTA: e.target.value })} style={{ width: "100%", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" as const }} />
          </div>
        </div>
        <button onClick={save} style={{ padding: "8px 20px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: "6px", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}>{saved ? "Saved!" : "Save Settings"}</button>
      </div>
    </div>
  );
}
