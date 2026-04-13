"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { exportToExcel } from "@/lib/exportExcel";
import { Toast } from "./ui";

export function ExportModal() {
  const { testCases, isExportModalOpen, setExportModalOpen, clearAllTestCases } = useStore();
  const [deleteSys, setDeleteSys] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);

  if (!isExportModalOpen) return null;

  const showToast = (msg: string, type: "success" | "error" | "info" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (testCases.length === 0) return;

    // Export local excel directly
    exportToExcel(testCases);
    showToast("Test cases exported successfully!", "success");

    // Handle delete option
    if (deleteSys) {
      setTimeout(() => clearAllTestCases(), 1000); // delete after 1s
    }

    setTimeout(() => {
      setExportModalOpen(false);
      setDeleteSys(false);
    }, 1500);
  };

  const close = () => {
    setExportModalOpen(false);
    setDeleteSys(false);
  };

  return (
    <>
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(0,0,0,.7)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
        onClick={close}
      >
        <div
          className="glass animate-fadeUp"
          style={{ borderRadius: 16, padding: "32px 36px", maxWidth: 400, width: "90%" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(99,102,241,.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </div>
          <h3 className="text-white font-bold text-xl mb-2">Export Tests to Excel</h3>
          <p className="text-[var(--text-muted)] text-sm mb-6">
            Download your {testCases.length} test case{testCases.length > 1 ? "s" : ""} to your device.
          </p>

          <form onSubmit={handleExport}>
            <div style={{ marginBottom: 24, padding: "12px 14px", borderRadius: 10, border: "1px solid rgba(239,68,68,.3)", background: "rgba(239,68,68,.05)", display: "flex", alignItems: "flex-start", gap: 10 }}>
              <input
                type="checkbox"
                id="delete-sys"
                checked={deleteSys}
                onChange={(e) => setDeleteSys(e.target.checked)}
                style={{ marginTop: 2, accentColor: "#ef4444", cursor: "pointer", width: 16, height: 16 }}
              />
              <label htmlFor="delete-sys" style={{ fontSize: 13, color: "var(--text)", cursor: "pointer" }}>
                <span className="font-semibold text-[#ef4444] block mb-1">Clear system data?</span>
                Yes, delete all test cases from the system after exporting.
              </label>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={close}
                style={{ flex: 1, padding: "10px 0", borderRadius: 9, background: "transparent", color: "var(--text-muted)", border: "1px solid var(--border)", cursor: "pointer", fontSize: 14 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ flex: 1, padding: "10px 0", borderRadius: 9, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, boxShadow: "0 4px 16px rgba(99,102,241,.35)" }}
              >
                Export
              </button>
            </div>
          </form>
        </div>
      </div>
      {toast && <Toast message={toast.msg} type={toast.type} />}
    </>
  );
}
