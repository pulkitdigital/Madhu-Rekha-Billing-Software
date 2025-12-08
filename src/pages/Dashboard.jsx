// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        setLoading(true);
        const data = await apiFetch("/api/dashboard/summary");
        setStats(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="text-sm">Loading dashboard...</div>;
  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (!stats) return null;

  const { today, month, year } = stats;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Dashboard</h2>

      {/* Today */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Today</h3>
          <span className="text-xs text-slate-500">
            {today.label}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <StatCard
            label="Payments (Today)"
            value={today.paymentsTotal}
            count={today.paymentsCount}
            type="pay"
          />
          <StatCard
            label="Refunds (Today)"
            value={today.refundsTotal}
            count={today.refundsCount}
            type="refund"
          />
          <StatCard
            label="Net Collection (Today)"
            value={today.netTotal}
            type="net"
          />
          <div className="bg-white rounded-lg shadow-sm p-3 text-xs text-slate-500 flex items-center justify-center">
            <div className="text-center">
              <div>Net = Payments - Refunds</div>
            </div>
          </div>
        </div>
      </section>

      {/* This Month */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">This Month</h3>
          <span className="text-xs text-slate-500">
            {month.label}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard
            label="Payments (This Month)"
            value={month.paymentsTotal}
            count={month.paymentsCount}
            type="pay"
          />
          <StatCard
            label="Refunds (This Month)"
            value={month.refundsTotal}
            count={month.refundsCount}
            type="refund"
          />
          <StatCard
            label="Net Collection (This Month)"
            value={month.netTotal}
            type="net"
          />
        </div>
      </section>

      {/* This Year */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">This Year</h3>
          <span className="text-xs text-slate-500">
            {year.label}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard
            label="Payments (This Year)"
            value={year.paymentsTotal}
            count={year.paymentsCount}
            type="pay"
          />
          <StatCard
            label="Refunds (This Year)"
            value={year.refundsTotal}
            count={year.refundsCount}
            type="refund"
          />
          <StatCard
            label="Net Collection (This Year)"
            value={year.netTotal}
            type="net"
          />
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, count, type }) {
  const n = Number(value || 0);
  const formatted = `₹ ${n.toFixed(2)}`;
  const countText =
    typeof count === "number" ? `${count} ${count === 1 ? "entry" : "entries"}` : null;

  let badgeClass = "";
  if (type === "pay") badgeClass = "bg-emerald-50 text-emerald-700";
  if (type === "refund") badgeClass = "bg-red-50 text-red-700";
  if (type === "net") badgeClass = "bg-slate-50 text-slate-700";

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-slate-500">{label}</div>
        {type && (
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${badgeClass}`}
          >
            {type === "pay"
              ? "Payments"
              : type === "refund"
              ? "Refunds"
              : "Net"}
          </span>
        )}
      </div>
      <div className="text-lg font-semibold">{formatted}</div>
      {countText && (
        <div className="mt-1 text-[11px] text-slate-500">{countText}</div>
      )}
    </div>
  );
}
