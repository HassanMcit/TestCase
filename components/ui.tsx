"use client";

import React from "react";
import { TestStatus, TestPriority } from "@/lib/types";

// ── Status Badge ──────────────────────────────────────────────────────────────
const STATUS_MAP: Record<TestStatus, { label: string; cls: string }> = {
  Pass:    { label: "✅ Pass",    cls: "badge-pass" },
  Fail:    { label: "❌ Fail",    cls: "badge-fail" },
  Pending: { label: "⏳ Pending", cls: "badge-pending" },
  Blocked: { label: "🚫 Blocked", cls: "badge-blocked" },
  "N/A":   { label: "➖ N/A",     cls: "badge-na" },
};

export function StatusBadge({ status }: { status: TestStatus }) {
  const { label, cls } = STATUS_MAP[status] ?? STATUS_MAP.Pending;
  return <span className={`badge ${cls}`}>{label}</span>;
}

// ── Priority Badge ────────────────────────────────────────────────────────────
const PRIORITY_MAP: Record<TestPriority, { label: string; cls: string }> = {
  Critical: { label: "⚡ Critical", cls: "badge-critical" },
  High:     { label: "🔴 High",    cls: "badge-high" },
  Medium:   { label: "🟡 Medium",  cls: "badge-medium" },
  Low:      { label: "🟢 Low",     cls: "badge-low" },
};

export function PriorityBadge({ priority }: { priority: TestPriority }) {
  const { label, cls } = PRIORITY_MAP[priority] ?? PRIORITY_MAP.Medium;
  return <span className={`badge ${cls}`}>{label}</span>;
}

// ── Icon Button ───────────────────────────────────────────────────────────────
interface IconBtnProps {
  onClick: () => void;
  title?: string;
  variant?: "default" | "danger";
  children: React.ReactNode;
}
export function IconBtn({ onClick, title, variant = "default", children }: IconBtnProps) {
  const base =
    "inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 cursor-pointer border-0 " +
    (variant === "danger"
      ? "bg-red-500/10 text-red-400 hover:bg-red-500/25"
      : "bg-white/5 text-[#7b82b0] hover:bg-white/10 hover:text-white");
  return (
    <button className={base} onClick={onClick} title={title} type="button">
      {children}
    </button>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-[#7b82b0]">
      <svg className="mb-4 opacity-30" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
interface ToastProps { message: string; type?: "success" | "error" | "info" }
export function Toast({ message, type = "success" }: ToastProps) {
  const colors = {
    success: "bg-[#10b981]/20 border-[#10b981]/40 text-[#10b981]",
    error:   "bg-[#ef4444]/20 border-[#ef4444]/40 text-[#ef4444]",
    info:    "bg-[#6366f1]/20 border-[#6366f1]/40 text-[#6366f1]",
  };
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl border text-sm font-medium animate-fadeUp shadow-xl ${colors[type]}`}>
      {message}
    </div>
  );
}
