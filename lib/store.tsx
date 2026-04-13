"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { TestCase } from "./types";

interface Store {
  testCases: TestCase[];
  addTestCase: (tc: Omit<TestCase, "id" | "createdAt" | "updatedAt">) => void;
  updateTestCase: (id: string, tc: Omit<TestCase, "id" | "createdAt" | "updatedAt">) => void;
  deleteTestCase: (id: string) => void;
  clearAllTestCases: () => void;
  getById: (id: string) => TestCase | undefined;
  isExportModalOpen: boolean;
  setExportModalOpen: (isOpen: boolean) => void;
}

const StoreCtx = createContext<Store | null>(null);
const LS_KEY = "testflow_cases";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isExportModalOpen, setExportModalOpen] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setTestCases(JSON.parse(raw));
    } catch {}
  }, []);

  // Persist whenever cases change
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(testCases));
  }, [testCases]);

  const addTestCase = useCallback((tc: Omit<TestCase, "id" | "createdAt" | "updatedAt">) => {
    const newTC: TestCase = {
      ...tc,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTestCases((prev) => [...prev, newTC]);
  }, []);

  const updateTestCase = useCallback(
    (id: string, tc: Omit<TestCase, "id" | "createdAt" | "updatedAt">) => {
      setTestCases((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...tc, updatedAt: new Date().toISOString() } : c))
      );
    },
    []
  );

  const deleteTestCase = useCallback((id: string) => {
    setTestCases((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const clearAllTestCases = useCallback(() => {
    setTestCases([]);
  }, []);

  const getById = useCallback(
    (id: string) => testCases.find((c) => c.id === id),
    [testCases]
  );

  return (
    <StoreCtx.Provider
      value={{ testCases, addTestCase, updateTestCase, deleteTestCase, clearAllTestCases, getById, isExportModalOpen, setExportModalOpen }}
    >
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
