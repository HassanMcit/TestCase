"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { TestCase, TestStatus, TestPriority, TestType } from "@/lib/types";
import { Toast } from "@/components/ui";

const EMPTY: Omit<TestCase, "id" | "createdAt" | "updatedAt"> = {
  tcId: "",
  module: "",
  pageName: "",
  testScenario: "",
  preConditions: "",
  testSteps: "",
  expectedResult: "",
  actualResult: "",
  status: "Pending",
  priority: "Medium",
  testType: "Functional",
  tester: "",
  testDate: "",
  notes: "",
};

export default function AddPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const { addTestCase, updateTestCase, getById, testCases } = useStore();

  const [form, setForm] = useState(EMPTY);
  const [steps, setSteps] = useState<string[]>([""]);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // ── Auto-generate TC ID ──────────────────────────────────────────────────
  useEffect(() => {
    if (!editId && !form.tcId) {
      let maxId = 0;
      testCases.forEach((tc) => {
        const match = tc.tcId.match(/TC_(\d+)/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxId) maxId = num;
        }
      });
      const next = maxId + 1;
      setForm((f) => ({ ...f, tcId: `TC_${String(next).padStart(3, "0")}` }));
    }
  }, [testCases, editId, form.tcId]);

  // ── Load edit data ───────────────────────────────────────────────────────
  useEffect(() => {
    if (editId) {
      const tc = getById(editId);
      if (tc) {
        setIsEditing(true);
        const stepsArr = tc.testSteps
          .split(/\n|\d+\.\s+/)
          .map((s) => s.trim())
          .filter(Boolean);
        setSteps(stepsArr.length ? stepsArr : [""]);
        setForm({
          tcId: tc.tcId,
          module: tc.module,
          pageName: tc.pageName || "",
          testScenario: tc.testScenario,
          preConditions: tc.preConditions,
          testSteps: tc.testSteps,
          expectedResult: tc.expectedResult,
          actualResult: tc.actualResult,
          status: tc.status,
          priority: tc.priority,
          testType: tc.testType,
          tester: tc.tester,
          testDate: tc.testDate,
          notes: tc.notes,
        });
      }
    }
  }, [editId, getById]);

  const set = (field: keyof typeof EMPTY, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const addStep = () => setSteps((s) => [...s, ""]);
  const removeStep = (i: number) =>
    setSteps((s) => s.filter((_, idx) => idx !== i));
  const setStep = (i: number, val: string) =>
    setSteps((s) => s.map((v, idx) => (idx === i ? val : v)));

  const stepsText = () =>
    steps
      .map((s, i) => `${i + 1}. ${s}`)
      .join("\n");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, testSteps: stepsText() };

    if (!data.tcId || !data.testScenario || !data.expectedResult || steps.every((s) => !s.trim())) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    if (isEditing && editId) {
      updateTestCase(editId, data);
      showToast("Test case updated!");
    } else {
      addTestCase(data);
      showToast("Test case saved!");
      
      // Calculate maxId including the newly added one
      let maxId = 0;
      testCases.forEach((tc) => {
        const match = tc.tcId.match(/TC_(\d+)/i);
        if (match && parseInt(match[1], 10) > maxId) maxId = parseInt(match[1], 10);
      });
      // The current one was data.tcId, let's also check it
      const currentMatch = data.tcId.match(/TC_(\d+)/i);
      if (currentMatch && parseInt(currentMatch[1], 10) > maxId) {
        maxId = parseInt(currentMatch[1], 10);
      }
      const next = maxId + 1;

      setSteps([""]);
      setForm({ ...EMPTY, tcId: `TC_${String(next).padStart(3, "0")}` });
    }

    if (isEditing) setTimeout(() => router.push("/cases"), 800);
  };

  const clearForm = () => { setForm(EMPTY); setSteps([""]); };

  return (
    <div className="animate-fadeUp" style={{ padding: 32, maxWidth: 896, margin: "0 auto" }}>
      {toast && <Toast message={toast.msg} type={toast.type} />}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
        <button
          onClick={() => router.back()}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "var(--text-muted)", transition: "color .2s" }}
        >
          ← Back
        </button>
        <div style={{ width: 1, height: 20, background: "var(--border)" }} />
        <h1 style={{ fontSize: 24, fontWeight: "bold", color: "white", margin: 0 }}>
          {isEditing ? "Edit Test Case" : "New Test Case"}
        </h1>
        <span
          style={{
            background: isEditing ? "rgba(245,158,11,.15)" : "rgba(99,102,241,.15)",
            color: isEditing ? "#f59e0b" : "#6366f1",
            border: `1px solid ${isEditing ? "rgba(245,158,11,.3)" : "rgba(99,102,241,.3)"}`,
            padding: "3px 10px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {isEditing ? "Editing" : "Create"}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="glass" style={{ borderRadius: 16, padding: 28, marginTop: 8 }}>
        {/* Row 1: TC ID + Module + Page */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
          <Field label="Test Case ID" required>
            <input
              value={form.tcId}
              onChange={(e) => set("tcId", e.target.value)}
              placeholder="e.g. TC_001"
              required
              style={input}
            />
          </Field>
          <Field label="Module">
            <input
              value={form.module}
              onChange={(e) => set("module", e.target.value)}
              placeholder="e.g. Authentication"
              style={input}
            />
          </Field>
          <Field label="Page Name">
            <input
              value={form.pageName}
              onChange={(e) => set("pageName", e.target.value)}
              placeholder="e.g. Login Page"
              style={input}
            />
          </Field>
        </div>

        {/* Test Scenario */}
        <Field label="Test Scenario" required fullWidth mb>
          <input
            value={form.testScenario}
            onChange={(e) => set("testScenario", e.target.value)}
            placeholder="e.g. Verify Home page loads successfully"
            required
            style={input}
          />
        </Field>

        {/* Pre-Conditions */}
        <Field label="Pre-Conditions" fullWidth mb>
          <textarea
            value={form.preConditions}
            onChange={(e) => set("preConditions", e.target.value)}
            placeholder="e.g. User logged in or stay logged out"
            rows={2}
            style={{ ...input, resize: "vertical" }}
          />
        </Field>

        {/* Test Steps */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>
            Test Steps <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            {steps.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div
                  style={{
                    width: 28, height: 28, borderRadius: 7,
                    background: "rgba(99,102,241,.2)",
                    color: "#6366f1",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, flexShrink: 0,
                  }}
                >
                  {i + 1}
                </div>
                <input
                  value={step}
                  onChange={(e) => setStep(i, e.target.value)}
                  placeholder={`Step ${i + 1}…`}
                  style={{ ...input, flex: 1 }}
                />
                {steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStep(i)}
                    style={{
                      width: 28, height: 28, borderRadius: 7,
                      background: "rgba(239,68,68,.15)", color: "#ef4444",
                      border: "1px solid rgba(239,68,68,.3)",
                      cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addStep}
            style={{
              marginTop: 10,
              background: "rgba(99,102,241,.1)",
              color: "#6366f1",
              border: "1px dashed rgba(99,102,241,.4)",
              padding: "7px 16px",
              borderRadius: 8,
              fontSize: 13,
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            + Add Step
          </button>
        </div>

        {/* Expected + Actual */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <Field label="Expected Result" required>
            <textarea
              value={form.expectedResult}
              onChange={(e) => set("expectedResult", e.target.value)}
              placeholder="What should happen when the test runs correctly"
              rows={3}
              required
              style={{ ...input, resize: "vertical" }}
            />
          </Field>
          <Field label="Actual Result">
            <textarea
              value={form.actualResult}
              onChange={(e) => set("actualResult", e.target.value)}
              placeholder="What actually happened (fill after execution)"
              rows={3}
              style={{ ...input, resize: "vertical" }}
            />
          </Field>
        </div>

        {/* Status + Priority + Type */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 20 }}>
          <Field label="Status">
            <select value={form.status} onChange={(e) => set("status", e.target.value as TestStatus)} style={input}>
              <option value="Pending">⏳ Pending</option>
              <option value="Pass">✅ Pass</option>
              <option value="Fail">❌ Fail</option>
              <option value="Blocked">🚫 Blocked</option>
              <option value="N/A">➖ N/A</option>
            </select>
          </Field>
          <Field label="Priority">
            <select value={form.priority} onChange={(e) => set("priority", e.target.value as TestPriority)} style={input}>
              <option value="Critical">⚡ Critical</option>
              <option value="High">🔴 High</option>
              <option value="Medium">🟡 Medium</option>
              <option value="Low">🟢 Low</option>
            </select>
          </Field>
          <Field label="Test Type">
            <select value={form.testType} onChange={(e) => set("testType", e.target.value as TestType)} style={input}>
              {["Functional","UI","Integration","Regression","Performance","Security","Smoke","Sanity"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>
        </div>

        {/* Tester + Date */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <Field label="Tester Name">
            <input
              value={form.tester}
              onChange={(e) => set("tester", e.target.value)}
              placeholder="Assigned tester"
              style={input}
            />
          </Field>
          <Field label="Test Date">
            <input
              type="date"
              value={form.testDate}
              onChange={(e) => set("testDate", e.target.value)}
              style={input}
            />
          </Field>
        </div>

        {/* Notes */}
        <Field label="Notes / Comments" fullWidth mb>
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Any additional remarks or observations"
            rows={2}
            style={{ ...input, resize: "vertical" }}
          />
        </Field>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
          <button
            type="button"
            onClick={clearForm}
            style={{
              padding: "10px 22px",
              borderRadius: 10,
              background: "transparent",
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Clear
          </button>
          <button
            type="submit"
            style={{
              padding: "10px 28px",
              borderRadius: 10,
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              boxShadow: "0 4px 16px rgba(99,102,241,.35)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {isEditing ? "Update Test Case" : "Save Test Case"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: ".4px",
  display: "block",
  marginBottom: 6,
};

const input: React.CSSProperties = {
  width: "100%",
  background: "var(--bg-card2)",
  border: "1px solid var(--border)",
  borderRadius: 9,
  padding: "10px 13px",
  color: "var(--text)",
  fontSize: 13.5,
  outline: "none",
  fontFamily: "inherit",
};

function Field({
  label,
  required,
  fullWidth,
  mb,
  children,
}: {
  label: string;
  required?: boolean;
  fullWidth?: boolean;
  mb?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        gridColumn: fullWidth ? "1 / -1" : undefined,
        marginBottom: mb ? 20 : 0,
      }}
    >
      <label style={labelStyle}>
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      {children}
    </div>
  );
}
