// // src/App.jsx
// import { Routes, Route, NavLink, useLocation } from "react-router-dom";
// import CreateBill from "./pages/CreateBill.jsx";
// import BillsList from "./pages/BillsList.jsx";
// import BillDetail from "./pages/BillDetail.jsx";
// import Dashboard from "./pages/Dashboard";
// import EditBill from "./pages/EditBill.jsx";
// import EditPayment from "./pages/EditPayment.jsx";
// import EditRefund from "./pages/EditRefund.jsx";
// import Profile from "./pages/Profile.jsx";
// import Payments from "./pages/Payments.jsx"; // ✅ NEW

// export default function App() {
//   const location = useLocation();

//   const isPrintRoute = location.pathname.startsWith("/print/");

//   if (isPrintRoute) {
//     return (
//       <Routes>
//         <Route path="/print/invoice/:id" element={<InvoicePrintPage />} />
//         <Route path="/print/receipt/:paymentId" element={<ReceiptPrintPage />} />
//       </Routes>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-100 flex">
//       {/* Sidebar */}
//       <aside className="w-60 bg-white border-r border-slate-200 flex flex-col">
//         <div className="px-4 py-3 border-b border-slate-200">
//           <div className="text-sm font-semibold">Madhurekha Billing</div>
//           <div className="text-[11px] text-slate-500">Eye Care Centre</div>
//         </div>

//         <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
//           <NavLink
//             to="/dashboard"
//             className={({ isActive }) =>
//               `block px-3 py-2 rounded-md ${
//                 isActive
//                   ? "bg-slate-900 text-white"
//                   : "text-slate-700 hover:bg-slate-100"
//               }`
//             }
//           >
//             Dashboard
//           </NavLink>

//           <NavLink
//             to="/new-bill"
//             className={({ isActive }) =>
//               `block px-3 py-2 rounded-md ${
//                 isActive
//                   ? "bg-slate-900 text-white"
//                   : "text-slate-700 hover:bg-slate-100"
//               }`
//             }
//           >
//             + New Bill / Receipt
//           </NavLink>

//           <NavLink
//             to="/bills"
//             className={({ isActive }) =>
//               `block px-3 py-2 rounded-md ${
//                 isActive
//                   ? "bg-slate-900 text-white"
//                   : "text-slate-700 hover:bg-slate-100"
//               }`
//             }
//           >
//             All Bills
//           </NavLink>

//           {/* ✅ NEW: Payments & Refunds */}
//           <NavLink
//             to="/payments"
//             className={({ isActive }) =>
//               `block px-3 py-2 rounded-md ${
//                 isActive
//                   ? "bg-slate-900 text-white"
//                   : "text-slate-700 hover:bg-slate-100"
//               }`
//             }
//           >
//             Payments & Refunds
//           </NavLink>

//           <NavLink
//             to="/profile"
//             className={({ isActive }) =>
//               `block px-3 py-2 rounded-md ${
//                 isActive
//                   ? "bg-slate-900 text-white"
//                   : "text-slate-700 hover:bg-slate-100"
//               }`
//             }
//           >
//             Clinic Profile
//           </NavLink>
//         </nav>
//       </aside>

//       {/* Main content */}
//       <main className="flex-1 p-6">
//         <Routes>
//           <Route path="/" element={<Dashboard />} />
//           <Route path="/dashboard" element={<Dashboard />} />
//           <Route path="/new-bill" element={<CreateBill />} />
//           <Route path="/bills" element={<BillsList />} />
//           <Route path="/bills/:id" element={<BillDetail />} />
//           <Route path="/bills/:id/edit" element={<EditBill />} />
//           <Route path="/payments/:id/edit" element={<EditPayment />} />
//           <Route path="/refunds/:id/edit" element={<EditRefund />} />
//           <Route path="/profile" element={<Profile />} />
          
//           {/* ✅ NEW: Payments & Refunds Page */}
//           <Route path="/payments" element={<Payments />} />
//         </Routes>
//       </main>
//     </div>
//   );
// }






import { Routes, Route, NavLink, useLocation, Navigate } from "react-router-dom";
import CreateBill from "./pages/CreateBill.jsx";
import BillsList from "./pages/BillsList.jsx";
import BillDetail from "./pages/BillDetail.jsx";
import Dashboard from "./pages/Dashboard";
import EditBill from "./pages/EditBill.jsx";
import EditPayment from "./pages/EditPayment.jsx";
import EditRefund from "./pages/EditRefund.jsx";
import Profile from "./pages/Profile.jsx";
import Payments from "./pages/Payments.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import { useAuth } from "./AuthContext.jsx";

export default function App() {
  const location = useLocation();
  const { isLoggedIn, logout } = useAuth();

  const isPrintRoute = location.pathname.startsWith("/print/");

  if (isPrintRoute) {
    return (
      <Routes>
        <Route path="/print/invoice/:id" element={<InvoicePrintPage />} />
        <Route path="/print/receipt/:paymentId" element={<ReceiptPrintPage />} />
      </Routes>
    );
  }

  // ✅ Agar login nahi hai toh LoginPage dikhao
  if (!isLoggedIn) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-slate-200 flex flex-col">
        <div className="px-4 py-3 border-b border-slate-200">
          <div className="text-sm font-semibold">Madhurekha Billing</div>
          <div className="text-[11px] text-slate-500">Eye Care Centre</div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          <NavLink to="/dashboard" className={({ isActive }) =>
            `block px-3 py-2 rounded-md ${isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}`
          }>Dashboard</NavLink>

          <NavLink to="/new-bill" className={({ isActive }) =>
            `block px-3 py-2 rounded-md ${isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}`
          }>+ New Bill / Receipt</NavLink>

          <NavLink to="/bills" className={({ isActive }) =>
            `block px-3 py-2 rounded-md ${isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}`
          }>All Bills</NavLink>

          <NavLink to="/payments" className={({ isActive }) =>
            `block px-3 py-2 rounded-md ${isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}`
          }>Payments & Refunds</NavLink>

          <NavLink to="/profile" className={({ isActive }) =>
            `block px-3 py-2 rounded-md ${isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}`
          }>Clinic Profile</NavLink>
        </nav>

        {/* ✅ Logout Button */}
        <div className="px-3 py-4 border-t border-slate-200">
          <button
            onClick={logout}
            className="w-full text-left px-3 py-2 rounded-md text-sm text-red-500 hover:bg-red-50 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/new-bill" element={<CreateBill />} />
          <Route path="/bills" element={<BillsList />} />
          <Route path="/bills/:id" element={<BillDetail />} />
          <Route path="/bills/:id/edit" element={<EditBill />} />
          <Route path="/payments/:id/edit" element={<EditPayment />} />
          <Route path="/refunds/:id/edit" element={<EditRefund />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/payments" element={<Payments />} />
        </Routes>
      </main>
    </div>
  );
}