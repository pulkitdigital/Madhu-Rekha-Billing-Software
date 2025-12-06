import { NavLink } from "react-router-dom";

const navLinkClass =
  "block px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-800/60";
const activeClass = "bg-slate-800 text-white";

export default function Sidebar() {
  return (
    <aside className="w-56 bg-slate-900 text-slate-100 flex flex-col">
      <div className="px-4 py-4 border-b border-slate-700">
        <h1 className="text-lg font-semibold leading-tight">
          Madhurekha
          <span className="block text-xs text-slate-400">
            Eye Care Billing
          </span>
        </h1>
      </div>

      <nav className="flex-1 p-3 space-y-1 text-sm">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `${navLinkClass} ${isActive ? activeClass : ""}`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/patients"
          className={({ isActive }) =>
            `${navLinkClass} ${isActive ? activeClass : ""}`
          }
        >
          Patients
        </NavLink>
        <NavLink
          to="/bills"
          className={({ isActive }) =>
            `${navLinkClass} ${isActive ? activeClass : ""}`
          }
        >
          Bills
        </NavLink>
        <NavLink
          to="/bills/new"
          className={({ isActive }) =>
            `${navLinkClass} ${isActive ? activeClass : ""}`
          }
        >
          New Bill
        </NavLink>
      </nav>

      <div className="p-3 text-xs text-slate-500 border-t border-slate-700">
        © {new Date().getFullYear()} Madhurekha Eye Care
      </div>
    </aside>
  );
}
