"use client";

import React from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { StatusBadge, PriorityBadge, EmptyState } from "@/components/ui";
import { exportToExcel } from "@/lib/exportExcel";

export default function DashboardPage() {
  const { testCases, setExportModalOpen } = useStore();

  const stats = {
    total:   testCases.length,
    pass:    testCases.filter((c) => c.status === "Pass").length,
    fail:    testCases.filter((c) => c.status === "Fail").length,
    pending: testCases.filter((c) => c.status === "Pending").length,
    blocked: testCases.filter((c) => c.status === "Blocked").length,
  };

  const passRate = stats.total ? Math.round((stats.pass / stats.total) * 100) : 0;
  const recent = [...testCases].reverse().slice(0, 6);

  return (
    <div className="animate-fadeUp" style={{ padding: 32 }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: "bold", color: "white", margin: 0 }}>Dashboard</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>Overview of your test suite</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link
            href="/add"
            style={{
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              color: "white",
              padding: "9px 20px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              boxShadow: "0 4px 16px rgba(99,102,241,.35)",
              transition: "transform .15s",
            }}
          >
            <span>+</span> New Test Case
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        {[
          { label: "Total Tests", value: stats.total, color: "#6366f1", bg: "rgba(99,102,241,.15)", icon: <TotalIcon /> },
          { label: "Passed",      value: stats.pass,  color: "#10b981", bg: "rgba(16,185,129,.12)", icon: <PassIcon /> },
          { label: "Failed",      value: stats.fail,  color: "#ef4444", bg: "rgba(239,68,68,.12)",  icon: <FailIcon /> },
          { label: "Pending",     value: stats.pending, color:"#f59e0b",bg: "rgba(245,158,11,.12)", icon: <PendingIcon /> },
          { label: "Blocked",     value: stats.blocked, color:"#8b5cf6",bg: "rgba(139,92,246,.12)", icon: <BlockedIcon /> },
          { label: "Pass Rate",   value: `${passRate}%`, color: passRate >= 80 ? "#10b981" : passRate >= 50 ? "#f59e0b" : "#ef4444", bg: "rgba(99,102,241,.1)", icon: <RateIcon /> },
        ].map((s) => (
          <div
            key={s.label}
            className="glass"
            style={{ borderRadius: 14, padding: 20, display: "flex", alignItems: "center", gap: 16, transition: "transform .2s, box-shadow .2s" }}
          >
            <div
              style={{
                width: 46, height: 46, borderRadius: 12,
                background: s.bg, display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ color: s.color }}>{s.icon}</span>
            </div>
            <div>
              <div style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 500, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1.2 }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent test cases */}
      <div className="glass" style={{ borderRadius: 14, overflow: "hidden" }}>
        <div
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid var(--border)" }}
        >
          <h2 style={{ fontWeight: 600, color: "white", fontSize: 16, margin: 0 }}>Recent Test Cases</h2>
          <Link href="/cases" style={{ color: "#6366f1", fontSize: 14, textDecoration: "none" }}>
            View all →
          </Link>
        </div>

        {recent.length === 0 ? (
          <EmptyState message="No test cases yet. Add your first one!" />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--bg-card2)" }}>
                  {["TC ID", "Module", "Page Name", "Test Scenario", "Priority", "Status"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "11px 16px",
                        textAlign: "left",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: ".5px",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((tc, i) => (
                  <tr
                    key={tc.id}
                    style={{
                      background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,.018)",
                      transition: "background .15s",
                    }}
                    className="hover:bg-white/5"
                  >
                    <td style={td}><code style={{ color: "#6366f1", fontSize: 12 }}>{tc.tcId}</code></td>
                    <td style={td}><span style={{ color: "var(--text-muted)", fontSize: 13 }}>{tc.module || "—"}</span></td>
                    <td style={td}><span style={{ color: "var(--text-muted)", fontSize: 13 }}>{tc.pageName || "—"}</span></td>
                    <td style={{ ...td, maxWidth: 280 }}>
                      <span style={{ fontSize: 13, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {tc.testScenario}
                      </span>
                    </td>
                    <td style={td}><PriorityBadge priority={tc.priority} /></td>
                    <td style={td}><StatusBadge status={tc.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {testCases.length > 0 && (
        <div
          className="glass"
          style={{ marginTop: 24, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 14, borderColor: "rgba(99,102,241,.35)" }}
        >
          <div>
            <p style={{ color: "white", fontWeight: 600, fontSize: 14, margin: 0 }}>Ready to export?</p>
            <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>
              {testCases.length} test case{testCases.length > 1 ? "s" : ""} • {stats.pass} passed • {stats.fail} failed
            </p>
          </div>
          <button
            onClick={() => setExportModalOpen(true)}
            style={{
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              color: "white",
              padding: "9px 22px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(99,102,241,.35)",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <DownloadIcon /> Export to Excel
          </button>
        </div>
      )}
    </div>
  );
}

const td: React.CSSProperties = {
  padding: "12px 16px",
  borderBottom: "1px solid var(--border)",
  fontSize: 13,
  color: "var(--text)",
};

// ── Mini icons ────────────────────────────────────────────────────────────────
function TotalIcon()   { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>; }
function PassIcon()    { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>; }
function FailIcon()    { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>; }
function PendingIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function BlockedIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>; }
function RateIcon()    { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>; }
function DownloadIcon(){ return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>; }
