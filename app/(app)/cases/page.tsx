"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { StatusBadge, PriorityBadge, IconBtn, EmptyState, Toast } from "@/components/ui";
import { exportToExcel } from "@/lib/exportExcel";
import { TestCase } from "@/lib/types";

export default function CasesPage() {
  const { testCases, deleteTestCase, setExportModalOpen } = useStore();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return testCases.filter((tc) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        tc.tcId.toLowerCase().includes(q) ||
        (tc.module || "").toLowerCase().includes(q) ||
        tc.testScenario.toLowerCase().includes(q) ||
        tc.tester.toLowerCase().includes(q);
      const matchStatus = !filterStatus || tc.status === filterStatus;
      const matchPriority = !filterPriority || tc.priority === filterPriority;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [testCases, search, filterStatus, filterPriority]);

  const handleDelete = () => {
    if (deleteId) {
      deleteTestCase(deleteId);
      setDeleteId(null);
      setToast("Test case deleted.");
      setTimeout(() => setToast(null), 2500);
    }
  };

  return (
    <div className="animate-fadeUp" style={{ padding: 32 }}>
      {toast && <Toast message={toast} type="error" />}
      {deleteId && <DeleteModal onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: "bold", color: "white", margin: 0 }}>All Test Cases</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>
            {testCases.length} total · {filtered.length} showing
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {testCases.length > 0 && (
            <button
              onClick={() => setExportModalOpen(true)}
              style={{
                padding: "9px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: "rgba(16,185,129,.15)", color: "#10b981",
                border: "1px solid rgba(16,185,129,.35)", cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 7,
              }}
            >
              <DownIcon /> Export Excel
            </button>
          )}
          <button
            onClick={() => router.push("/add")}
            style={{
              padding: "9px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              color: "white", border: "none", cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 7,
              boxShadow: "0 4px 16px rgba(99,102,241,.35)",
            }}
          >
            + New Test Case
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div
        className="glass"
        style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", marginBottom: 20, borderRadius: 12, flexWrap: "wrap" }}
      >
        {/* Search */}
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
            <SearchIcon />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, module, scenario, tester…"
            style={{
              width: "100%",
              background: "var(--bg-card2)",
              border: "1px solid var(--border)",
              borderRadius: 9,
              padding: "8px 10px 8px 34px",
              color: "var(--text)",
              fontSize: 13,
              outline: "none",
              fontFamily: "inherit",
            }}
          />
        </div>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={selectStyle}
        >
          <option value="">All Status</option>
          <option value="Pass">✅ Pass</option>
          <option value="Fail">❌ Fail</option>
          <option value="Pending">⏳ Pending</option>
          <option value="Blocked">🚫 Blocked</option>
          <option value="N/A">➖ N/A</option>
        </select>

        {/* Priority filter */}
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          style={selectStyle}
        >
          <option value="">All Priority</option>
          <option value="Critical">⚡ Critical</option>
          <option value="High">🔴 High</option>
          <option value="Medium">🟡 Medium</option>
          <option value="Low">🟢 Low</option>
        </select>

        {(search || filterStatus || filterPriority) && (
          <button
            onClick={() => { setSearch(""); setFilterStatus(""); setFilterPriority(""); }}
            style={{
              padding: "7px 14px", borderRadius: 8, fontSize: 12,
              background: "rgba(255,255,255,.05)", color: "var(--text-muted)",
              border: "1px solid var(--border)", cursor: "pointer",
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="glass" style={{ borderRadius: 14, overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <EmptyState message={testCases.length === 0 ? "No test cases yet. Click '+ New Test Case' to begin." : "No results match your filters."} />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--bg-card2)" }}>
                  {["TC ID", "Module", "Page Name", "Test Scenario", "Pre-Conditions", "Steps", "Expected Result", "Actual Result", "Priority", "Status", "Tester", "Date", "Actions"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 14px",
                        textAlign: "left",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: ".5px",
                        borderBottom: "1px solid var(--border)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((tc, i) => (
                  <tr
                    key={tc.id}
                    style={{
                      background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,.018)",
                    }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td style={td}><code style={{ color: "#6366f1", fontSize: 12, fontWeight: 700 }}>{tc.tcId}</code></td>
                    <td style={td}><span style={{ color: "var(--text-muted)", fontSize: 12 }}>{tc.module || "—"}</span></td>
                    <td style={td}><span style={{ color: "var(--text-muted)", fontSize: 12 }}>{tc.pageName || "—"}</span></td>
                    <td style={{ ...td, maxWidth: 220 }}><Truncate text={tc.testScenario} /></td>
                    <td style={{ ...td, maxWidth: 160 }}><Truncate text={tc.preConditions} muted /></td>
                    <td style={{ ...td, maxWidth: 180 }}><StepsPreview steps={tc.testSteps} /></td>
                    <td style={{ ...td, maxWidth: 180 }}><Truncate text={tc.expectedResult} /></td>
                    <td style={{ ...td, maxWidth: 180 }}><Truncate text={tc.actualResult} muted /></td>
                    <td style={td}><PriorityBadge priority={tc.priority} /></td>
                    <td style={td}><StatusBadge status={tc.status} /></td>
                    <td style={td}><span style={{ fontSize: 12, color: "var(--text-muted)" }}>{tc.tester || "—"}</span></td>
                    <td style={td}><span style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{tc.testDate || "—"}</span></td>
                    <td style={{ ...td, whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", gap: 5 }}>
                        <IconBtn onClick={() => router.push(`/add?edit=${tc.id}`)} title="Edit">
                          <EditIcon />
                        </IconBtn>
                        <IconBtn onClick={() => setDeleteId(tc.id)} title="Delete" variant="danger">
                          <TrashIcon />
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function Truncate({ text, muted }: { text: string; muted?: boolean }) {
  return (
    <span
      title={text}
      style={{
        display: "block",
        maxWidth: 200,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        fontSize: 12.5,
        color: muted ? "var(--text-muted)" : "var(--text)",
      }}
    >
      {text || "—"}
    </span>
  );
}

function StepsPreview({ steps }: { steps: string }) {
  const lines = steps.split("\n").filter(Boolean);
  return (
    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
      {lines.slice(0, 2).map((l, i) => (
        <div key={i} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 170 }}>{l}</div>
      ))}
      {lines.length > 2 && <span style={{ color: "#6366f1" }}>+{lines.length - 2} more</span>}
    </div>
  );
}

interface DeleteModalProps { onConfirm: () => void; onCancel: () => void; }
function DeleteModal({ onConfirm, onCancel }: DeleteModalProps) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,.7)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={onCancel}
    >
      <div
        className="glass animate-fadeUp"
        style={{ borderRadius: 16, padding: "32px 36px", textAlign: "center", maxWidth: 360, width: "90%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(239,68,68,.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </div>
        <h3 className="text-white font-bold text-lg mb-2">Delete Test Case?</h3>
        <p className="text-[var(--text-muted)] text-sm mb-6">This action cannot be undone.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            onClick={onCancel}
            style={{ padding: "9px 22px", borderRadius: 9, background: "transparent", color: "var(--text-muted)", border: "1px solid var(--border)", cursor: "pointer", fontSize: 14 }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{ padding: "9px 22px", borderRadius: 9, background: "rgba(239,68,68,.85)", color: "white", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600 }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const td: React.CSSProperties = {
  padding: "11px 14px",
  borderBottom: "1px solid var(--border)",
  verticalAlign: "middle",
};

const selectStyle: React.CSSProperties = {
  background: "var(--bg-card2)",
  border: "1px solid var(--border)",
  borderRadius: 9,
  padding: "8px 12px",
  color: "var(--text)",
  fontSize: 13,
  outline: "none",
  fontFamily: "inherit",
};

// ── Icons ──────────────────────────────────────────────────────────────────────
function SearchIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function EditIcon()   { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>; }
function TrashIcon()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>; }
function DownIcon()   { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>; }
