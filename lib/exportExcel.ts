import * as XLSX from "xlsx";
import { TestCase, TestStatus } from "./types";

// ────── helpers ──────────────────────────────────────────────────────────────
const statusCounts = (cases: TestCase[]) => ({
  total: cases.length,
  pass: cases.filter((c) => c.status === "Pass").length,
  fail: cases.filter((c) => c.status === "Fail").length,
  pending: cases.filter((c) => c.status === "Pending").length,
  blocked: cases.filter((c) => c.status === "Blocked").length,
  na: cases.filter((c) => c.status === "N/A").length,
});

// ────── colour map ────────────────────────────────────────────────────────────
const STATUS_FILL: Record<TestStatus, string> = {
  Pass:    "C6EFCE",
  Fail:    "FFC7CE",
  Pending: "FFEB9C",
  Blocked: "E2EFDA",
  "N/A":   "DDDDDD",
};

const STATUS_FONT: Record<TestStatus, string> = {
  Pass:    "006100",
  Fail:    "9C0006",
  Pending: "9C6500",
  Blocked: "375623",
  "N/A":   "666666",
};

// ────── cell style factories ──────────────────────────────────────────────────
const headerStyle = (bgHex: string = "1F2037") => ({
  font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
  fill: { patternType: "solid", fgColor: { rgb: bgHex } },
  border: allBorder("888888"),
  alignment: { horizontal: "center", vertical: "center", wrapText: true },
});

const dataStyle = (wrapText = true) => ({
  font: { sz: 10, color: { rgb: "E8EAF6" } },
  fill: { patternType: "solid", fgColor: { rgb: "1A1F38" } },
  border: allBorder("333355"),
  alignment: { vertical: "top", wrapText },
});

const statusCellStyle = (status: TestStatus) => ({
  font: { bold: true, sz: 10, color: { rgb: STATUS_FONT[status] } },
  fill: { patternType: "solid", fgColor: { rgb: STATUS_FILL[status] } },
  border: allBorder("333355"),
  alignment: { horizontal: "center", vertical: "center" },
});

function allBorder(rgb: string) {
  const side = { style: "thin", color: { rgb } };
  return { top: side, bottom: side, left: side, right: side };
}

// ────── Sheet 1 – Test Cases ──────────────────────────────────────────────────
function buildTestCasesSheet(cases: TestCase[]) {
  const headers = [
    "Test Case ID",
    "Module",
    "Page Name",
    "Test Scenario",
    "Pre-Conditions",
    "Test Steps",
    "Expected Result",
    "Actual Result",
    "Status",
    "Tester Name",
    "Last Updated",
  ];

  const ws: XLSX.WorkSheet = {};
  const range = { s: { c: 0, r: 0 }, e: { c: headers.length - 1, r: cases.length } };

  // Header row
  headers.forEach((h, c) => {
    const cell: XLSX.CellObject = { v: h, t: "s", s: headerStyle("1F2037") };
    ws[XLSX.utils.encode_cell({ r: 0, c })] = cell;
  });

  // Data rows
  cases.forEach((tc, rowIdx) => {
    const r = rowIdx + 1;
    const row = [
      tc.tcId,
      tc.module,
      tc.pageName,
      tc.testScenario,
      tc.preConditions,
      tc.testSteps,
      tc.expectedResult,
      tc.actualResult,
      tc.status,
      tc.tester,
      tc.updatedAt ? new Date(tc.updatedAt).toLocaleString() : new Date(tc.createdAt).toLocaleString(),
    ];
    row.forEach((val, c) => {
      const isStatus = c === 8;
      const cell: XLSX.CellObject = {
        v: val,
        t: "s",
        s: isStatus ? statusCellStyle(tc.status) : dataStyle(true),
      };
      ws[XLSX.utils.encode_cell({ r, c })] = cell;
    });
  });

  ws["!ref"] = XLSX.utils.encode_range(range);
  ws["!cols"] = [
    { wch: 14 }, // TC ID
    { wch: 16 }, // Module
    { wch: 20 }, // Page Name
    { wch: 36 }, // Scenario
    { wch: 30 }, // Pre-cond
    { wch: 34 }, // Steps
    { wch: 34 }, // Expected
    { wch: 34 }, // Actual
    { wch: 12 }, // Status
    { wch: 20 }, // Tester
    { wch: 24 }, // Last Updated
  ];
  ws["!rows"] = [{ hpt: 24 }, ...cases.map(() => ({ hpt: 60 }))];
  return ws;
}

// ────── Sheet 2 – Defect Log ──────────────────────────────────────────────────
function buildDefectSheet(cases: TestCase[]) {
  const failed = cases.filter((c) => c.status === "Fail");
  const headers = ["Test Case ID", "Module", "Test Scenario", "Expected Result", "Actual Result", "Status", "Notes"];

  const ws: XLSX.WorkSheet = {};
  const range = { s: { c: 0, r: 0 }, e: { c: headers.length - 1, r: Math.max(failed.length, 1) } };

  headers.forEach((h, c) => {
    ws[XLSX.utils.encode_cell({ r: 0, c })] = { v: h, t: "s", s: headerStyle("9C0006") };
  });

  if (failed.length === 0) {
    ws[XLSX.utils.encode_cell({ r: 1, c: 0 })] = { v: "No failed test cases 🎉", t: "s", s: dataStyle(false) };
  } else {
    failed.forEach((tc, i) => {
      const r = i + 1;
      [tc.tcId, tc.module, tc.testScenario, tc.expectedResult, tc.actualResult, tc.status, tc.notes].forEach((v, c) => {
        const cell: XLSX.CellObject = { v: v || "", t: "s", s: c === 5 ? statusCellStyle(tc.status) : dataStyle() };
        ws[XLSX.utils.encode_cell({ r, c })] = cell;
      });
    });
  }

  ws["!ref"] = XLSX.utils.encode_range(range);
  ws["!cols"] = [{ wch: 14 }, { wch: 16 }, { wch: 36 }, { wch: 34 }, { wch: 34 }, { wch: 12 }, { wch: 30 }];
  ws["!rows"] = [{ hpt: 24 }, ...failed.map(() => ({ hpt: 45 }))];
  return ws;
}

// ────── Sheet 3 – Execution Summary ──────────────────────────────────────────
function buildSummarySheet(cases: TestCase[]) {
  const s = statusCounts(cases);
  const passRate = s.total ? ((s.pass / s.total) * 100).toFixed(1) : "0.0";

  const ws: XLSX.WorkSheet = {};

  const rows: [string, string | number][] = [
    ["Metric", "Value"],
    ["Total Test Cases", s.total],
    ["Passed", s.pass],
    ["Failed", s.fail],
    ["Pending", s.pending],
    ["Blocked", s.blocked],
    ["N/A", s.na],
    ["Pass Rate", `${passRate}%`],
    ["Execution Date", new Date().toLocaleDateString()],
  ];

  rows.forEach(([label, value], r) => {
    const isHeader = r === 0;
    const lStyle = isHeader ? headerStyle("1F2037") : {
      font: { bold: true, sz: 11, color: { rgb: "AABBFF" } },
      fill: { patternType: "solid", fgColor: { rgb: "161929" } },
      border: allBorder("333355"),
      alignment: { vertical: "center" },
    };
    const vStyle = isHeader ? headerStyle("3b4068") : {
      font: { sz: 11, color: { rgb: "E8EAF6" } },
      fill: { patternType: "solid", fgColor: { rgb: "1A1F38" } },
      border: allBorder("333355"),
      alignment: { horizontal: "center", vertical: "center" },
    };
    ws[XLSX.utils.encode_cell({ r, c: 0 })] = { v: label, t: "s", s: lStyle };
    ws[XLSX.utils.encode_cell({ r, c: 1 })] = { v: value, t: typeof value === "number" ? "n" : "s", s: vStyle };
  });

  ws["!ref"] = XLSX.utils.encode_range({ s: { c: 0, r: 0 }, e: { c: 1, r: rows.length - 1 } });
  ws["!cols"] = [{ wch: 24 }, { wch: 18 }];
  ws["!rows"] = rows.map(() => ({ hpt: 28 }));
  return ws;
}

// ────── Sheet 4 – Test Environment ───────────────────────────────────────────
function buildEnvSheet() {
  const ws: XLSX.WorkSheet = {};
  const rows: string[][] = [
    ["Parameter", "Value"],
    ["OS", ""],
    ["Browser", ""],
    ["App Version", ""],
    ["Environment", ""],
    ["Test Tool", ""],
    ["Tester", ""],
    ["Start Date", ""],
    ["End Date", ""],
    ["Notes", ""],
  ];

  rows.forEach(([label, value], r) => {
    const isHeader = r === 0;
    ws[XLSX.utils.encode_cell({ r, c: 0 })] = {
      v: label, t: "s",
      s: isHeader ? headerStyle() : { font: { bold: true, sz: 11, color: { rgb: "AABBFF" } }, fill: { patternType: "solid", fgColor: { rgb: "161929" } }, border: allBorder("333355"), alignment: { vertical: "center" } },
    };
    ws[XLSX.utils.encode_cell({ r, c: 1 })] = {
      v: value, t: "s",
      s: isHeader ? headerStyle("3b4068") : { font: { sz: 11, color: { rgb: "E8EAF6" } }, fill: { patternType: "solid", fgColor: { rgb: "1A1F38" } }, border: allBorder("333355") },
    };
  });

  ws["!ref"] = XLSX.utils.encode_range({ s: { c: 0, r: 0 }, e: { c: 1, r: rows.length - 1 } });
  ws["!cols"] = [{ wch: 20 }, { wch: 30 }];
  ws["!rows"] = rows.map(() => ({ hpt: 26 }));
  return ws;
}

// ────── Main export function ──────────────────────────────────────────────────
export function exportToExcel(cases: TestCase[], projectName = "HA-TestCase") {
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, buildTestCasesSheet(cases), "Test Cases");
  XLSX.utils.book_append_sheet(wb, buildDefectSheet(cases), "Defect Log");
  XLSX.utils.book_append_sheet(wb, buildSummarySheet(cases), "Execution Summary");
  XLSX.utils.book_append_sheet(wb, buildEnvSheet(), "Test Environment");

  const date = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `${projectName}_TestReport_${date}.xlsx`);
}
