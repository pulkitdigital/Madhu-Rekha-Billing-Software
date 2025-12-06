import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import CreateBill from "./pages/CreateBill.jsx";
import BillsList from "./pages/BillsList.jsx";
import BillDetail from "./pages/BillDetail.jsx";
import InvoicePrintPage from "./pages/InvoicePrintPage.jsx";
import ReceiptPrintPage from "./pages/ReceiptPrintPage.jsx";

export default function App() {
  const location = useLocation();

  // /print/... routes ke liye alag layout (no sidebar)
  const isPrintRoute = location.pathname.startsWith("/print/");

  if (isPrintRoute) {
    return (
      <Routes>
        <Route path="/print/invoice/:id" element={<InvoicePrintPage />} />
        <Route
          path="/print/receipt/:paymentId"
          element={<ReceiptPrintPage />}
        />
      </Routes>
    );
  }

  // Normal app layout with sidebar
  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-slate-200 flex flex-col">
        <div className="px-4 py-3 border-b border-slate-200">
          <div className="text-sm font-semibold">Madhurekha Billing</div>
          <div className="text-[11px] text-slate-500">Eye Care Centre</div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          <NavLink
            to="/new-bill"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`
            }
          >
            + New Bill / Receipt
          </NavLink>

          <NavLink
            to="/bills"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`
            }
          >
            All Bills
          </NavLink>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<CreateBill />} />
          <Route path="/new-bill" element={<CreateBill />} />
          <Route path="/bills" element={<BillsList />} />
          <Route path="/bills/:id" element={<BillDetail />} />
        </Routes>
      </main>
    </div>
  );
}
