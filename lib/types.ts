// Exact columns matching the Excel format shown by the user
export type TestStatus = "Pass" | "Fail" | "Pending" | "Blocked" | "N/A";
export type TestPriority = "Critical" | "High" | "Medium" | "Low";
export type TestType =
  | "Functional"
  | "UI"
  | "Integration"
  | "Regression"
  | "Performance"
  | "Security"
  | "Smoke"
  | "Sanity";

export interface TestCase {
  id: string; // internal uuid
  tcId: string;           // TC_001
  module: string;         // Home Page, Login…
  pageName: string;       // Login page, Dashboard page…
  testScenario: string;   // Verify Home page loads successfully
  preConditions: string;  // User logged in …
  testSteps: string;      // 1. Open application\n2. Login
  expectedResult: string;
  actualResult: string;
  status: TestStatus;
  // extra (not exported to main sheet but handy)
  priority: TestPriority;
  testType: TestType;
  tester: string;
  testDate: string;
  notes: string;
  createdAt: string;
  updatedAt?: string;
}
