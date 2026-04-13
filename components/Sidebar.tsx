"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { ExportModal } from "@/components/ExportModal";

// ── Icons defined FIRST so they can be used below ────────────────────────────
function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
      <path d="M9 11l3 3L22 4"/>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  );
}
function DashIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  );
}
function AddIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  );
}
function ListIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
      <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  );
}
function DownloadIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}

// ── Nav items ────────────────────────────────────────────────────────────────
const NAV = [
  { href: "/",      label: "Dashboard",     icon: <DashIcon /> },
  { href: "/add",   label: "Add Test Case", icon: <AddIcon /> },
  { href: "/cases", label: "All Test Cases", icon: <ListIcon /> },
];

// ── Component ────────────────────────────────────────────────────────────────
export default function Sidebar() {
  const pathname = usePathname();
  const { testCases, setExportModalOpen } = useStore();

  const stats = {
    total:   testCases.length,
    pass:    testCases.filter((c) => c.status === "Pass").length,
    fail:    testCases.filter((c) => c.status === "Fail").length,
    pending: testCases.filter((c) => c.status === "Pending").length,
  };

  return (
    <aside style={{
      width: 250,
      minHeight: "100vh",
      background: "var(--bg-card)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      top: 0,
      left: 0,
      bottom: 0,
      zIndex: 40,
      overflowY: "auto",
    }}>

      {/* ── Logo ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "20px 20px 18px",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{
          width: 38, height: 38,
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 0 20px rgba(99,102,241,.4)",
        }}>
          <CheckIcon />
        </div>
        <div>
          <div style={{ color: "white", fontWeight: 700, fontSize: 15, letterSpacing: "-.2px" }}>HA-TestCase</div>
          <div style={{ color: "var(--text-muted)", fontSize: 10, marginTop: 1 }}>Test Case Manager</div>
        </div>
      </div>

      {/* ── Nav links ── */}
      <nav style={{ padding: "14px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
        {NAV.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 13px",
                borderRadius: 9,
                fontSize: 13.5,
                fontWeight: isActive ? 600 : 400,
                background: isActive
                  ? "linear-gradient(135deg,rgba(99,102,241,.22),rgba(139,92,246,.16))"
                  : "transparent",
                color: isActive ? "white" : "var(--text-muted)",
                border: isActive ? "1px solid rgba(99,102,241,.3)" : "1px solid transparent",
                textDecoration: "none",
                transition: "all .18s",
              }}
            >
              <span style={{ opacity: isActive ? 1 : 0.55, display: "flex" }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}

        {/* ── Quick Stats box ── */}
        <div style={{
          marginTop: 20,
          background: "var(--bg-card2)",
          borderRadius: 10,
          border: "1px solid var(--border)",
          padding: "14px 16px",
        }}>
          <div style={{
            color: "var(--text-muted)", fontSize: 10, fontWeight: 600,
            textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 12,
          }}>
            Quick Stats
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {[
              { label: "Total",   value: stats.total,   color: "#6366f1" },
              { label: "Passed",  value: stats.pass,    color: "#10b981" },
              { label: "Failed",  value: stats.fail,    color: "#ef4444" },
              { label: "Pending", value: stats.pending, color: "#f59e0b" },
            ].map((s) => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{s.label}</span>
                <span style={{ color: s.color, fontWeight: 700, fontSize: 14 }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Export button ── */}
      <div style={{ padding: "0 12px 20px", marginTop: "auto" }}>
        <button
          onClick={() => setExportModalOpen(true)}
          disabled={testCases.length === 0}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "11px 0",
            borderRadius: 10,
            fontWeight: 600,
            fontSize: 13.5,
            transition: "all .2s",
            cursor: testCases.length === 0 ? "not-allowed" : "pointer",
            background: testCases.length === 0
              ? "rgba(99,102,241,.08)"
              : "linear-gradient(135deg,#6366f1,#8b5cf6)",
            color: testCases.length === 0 ? "#4a4f7a" : "white",
            border: "1px solid rgba(99,102,241,.3)",
            boxShadow: testCases.length > 0 ? "0 4px 20px rgba(99,102,241,.35)" : "none",
          }}
        >
          <DownloadIcon />
          Export to Excel
        </button>
        {testCases.length > 0 && (
          <p style={{ textAlign: "center", fontSize: 10, color: "var(--text-muted)", marginTop: 8 }}>
            {testCases.length} test case{testCases.length > 1 ? "s" : ""} ready
          </p>
        )}

        {/* Copyright */}
        <div style={{ textAlign: "center", marginTop: 24, fontSize: 10.5, color: "rgba(123,130,176,.5)" }}>
          © All Rights Reserved <br />
          Made by <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Hassan Ali</span>
        </div>
      </div>
      
      <ExportModal />
    </aside>
  );
}
