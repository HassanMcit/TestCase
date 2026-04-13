import { StoreProvider } from "@/lib/store";
import Sidebar from "@/components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        {/* minWidth:0 prevents flex child from overflowing viewport */}
        <div style={{
          marginLeft: 250,
          flex: 1,
          minWidth: 0,
          minHeight: "100vh",
          overflowX: "hidden",
        }}>
          {children}
        </div>
      </div>
    </StoreProvider>
  );
}
