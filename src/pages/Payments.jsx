// src/pages/Payments.jsx
import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, API_BASE } from "../lib/api";

// Helper: format date to YYYY-MM-DD
function toYMD(date) {
  return date.toISOString().split("T")[0];
}

// Helper: get preset date ranges
function getPresetRange(preset) {
  const today = new Date();
  const from = new Date();
  if (preset === "1m") from.setMonth(today.getMonth() - 1);
  else if (preset === "6m") from.setMonth(today.getMonth() - 6);
  else if (preset === "1y") from.setFullYear(today.getFullYear() - 1);
  return { from: toYMD(from), to: toYMD(today) };
}

export default function Payments() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const [showDateMenu, setShowDateMenu] = useState(false);
  const [datePreset, setDatePreset] = useState("");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const dateMenuRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch("/api/transactions");
        setTransactions(data);
      } catch (e) {
        setError(e.message || "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dateMenuRef.current && !dateMenuRef.current.contains(e.target)) {
        setShowDateMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredTransactions = useMemo(() => {
    if (filter === "payment") return transactions.filter((t) => t.type === "Payment");
    if (filter === "refund") return transactions.filter((t) => t.type === "Refund");
    return transactions;
  }, [transactions, filter]);

  const totals = useMemo(() => {
    const payments = transactions.filter((t) => t.type === "Payment");
    const refunds = transactions.filter((t) => t.type === "Refund");
    const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalRefunds = refunds.reduce((sum, r) => sum + r.amount, 0);
    return {
      totalPayments,
      totalRefunds,
      netAmount: totalPayments - totalRefunds,
      paymentsCount: payments.length,
      refundsCount: refunds.length,
    };
  }, [transactions]);

  const buildPdfUrl = (from, to) => {
    const params = new URLSearchParams({ type: filter });
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    return `${API_BASE}/api/transactions/download-pdf?${params.toString()}`;
  };

  const handlePresetDownload = (preset) => {
    const { from, to } = getPresetRange(preset);
    setDatePreset(preset);
    setCustomFrom("");
    setCustomTo("");
    setShowDateMenu(false);
    window.open(buildPdfUrl(from, to), "_blank");
  };

  const handleCustomDownload = () => {
    if (!customFrom || !customTo) return;
    setShowDateMenu(false);
    window.open(buildPdfUrl(customFrom, customTo), "_blank");
  };

  const handleDownloadAll = () => {
    setDatePreset("");
    setCustomFrom("");
    setCustomTo("");
    setShowDateMenu(false);
    window.open(buildPdfUrl("", ""), "_blank");
  };

  const getDateLabel = () => {
    if (datePreset === "1m") return "Last 1 Month";
    if (datePreset === "6m") return "Last 6 Months";
    if (datePreset === "1y") return "Last 1 Year";
    if (datePreset === "custom" && customFrom && customTo)
      return `${customFrom} → ${customTo}`;
    return "Download PDF";
  };

  if (loading) return <div className="text-sm">Loading transactions...</div>;
  if (error) return <div className="text-sm text-red-600">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">All Payments & Refunds</h3>

        <div className="flex gap-2 items-center">

          <div className="relative" ref={dateMenuRef}>
            <button
              onClick={() => setShowDateMenu((v) => !v)}
              className="px-3 py-1.5 text-xs rounded-md font-medium bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {getDateLabel()}
              <svg className="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showDateMenu && (
              <div className="absolute right-0 mt-1.5 w-72 bg-white border border-slate-200 rounded-lg shadow-lg z-50 p-2 space-y-1">

                <button
                  onClick={handleDownloadAll}
                  className="w-full text-left px-3 py-2 text-xs rounded-md hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2"
                >
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  All Transactions
                </button>

                <div className="h-px bg-slate-100 my-1"></div>

                {[
                  { key: "1m", label: "Last 1 Month" },
                  { key: "6m", label: "Last 6 Months" },
                  { key: "1y", label: "Last 1 Year" },
                ].map((p) => (
                  <button
                    key={p.key}
                    onClick={() => handlePresetDownload(p.key)}
                    className={`w-full text-left px-3 py-2 text-xs rounded-md hover:bg-blue-50 font-medium flex items-center gap-2 ${
                      datePreset === p.key ? "bg-blue-50 text-blue-700" : "text-slate-700"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {p.label}
                  </button>
                ))}

                <div className="h-px bg-slate-100 my-1"></div>

                <div className="px-3 py-2 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    Custom Range
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-400 block mb-0.5">From</label>
                      <input
                        type="date"
                        value={customFrom}
                        onChange={(e) => {
                          setCustomFrom(e.target.value);
                          setDatePreset("custom");
                        }}
                        className="w-full border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-700 focus:outline-none focus:border-blue-400"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-400 block mb-0.5">To</label>
                      <input
                        type="date"
                        value={customTo}
                        onChange={(e) => {
                          setCustomTo(e.target.value);
                          setDatePreset("custom");
                        }}
                        className="w-full border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-700 focus:outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleCustomDownload}
                    disabled={!customFrom || !customTo}
                    className="w-full py-1.5 text-[11px] font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-slate-300"></div>

          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 text-xs rounded-md font-medium ${
              filter === "all"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
            }`}
          >
            All ({transactions.length})
          </button>
          <button
            onClick={() => setFilter("payment")}
            className={`px-3 py-1.5 text-xs rounded-md font-medium ${
              filter === "payment"
                ? "bg-emerald-600 text-white"
                : "bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50"
            }`}
          >
            Payments ({totals.paymentsCount})
          </button>
          <button
            onClick={() => setFilter("refund")}
            className={`px-3 py-1.5 text-xs rounded-md font-medium ${
              filter === "refund"
                ? "bg-red-600 text-white"
                : "bg-white text-red-700 border border-red-300 hover:bg-red-50"
            }`}
          >
            Refunds ({totals.refundsCount})
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
          <div className="text-xs text-slate-500 mb-1">Total Payments</div>
          <div className="text-xl font-semibold text-emerald-600">
            ₹ {totals.totalPayments.toFixed(2)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
          <div className="text-xs text-slate-500 mb-1">Total Refunds</div>
          <div className="text-xl font-semibold text-red-600">
            ₹ {totals.totalRefunds.toFixed(2)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
          <div className="text-xs text-slate-500 mb-1">Net Amount</div>
          <div className="text-xl font-semibold text-slate-900">
            ₹ {totals.netAmount.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Receipt/Refund No.</th>
              <th className="px-3 py-2 text-left">Bill #</th>
              <th className="px-3 py-2 text-left">Patient</th>
              <th className="px-3 py-2 text-left">Mode</th>
              <th className="px-3 py-2 text-right">Amount</th>
              <th className="px-3 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((txn) => (
              <tr
                key={txn.id}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
              >
                <td className="px-3 py-2">{txn.date}</td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      txn.type === "Payment"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {txn.type}
                  </span>
                </td>
                <td className="px-3 py-2 font-mono text-xs">{txn.receiptNo}</td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => navigate(`/bills/${txn.billId}`)}
                    className="text-blue-600 hover:underline"
                  >
                    #{txn.invoiceNo}
                  </button>
                </td>
                <td className="px-3 py-2">{txn.patientName}</td>
                <td className="px-3 py-2">
                  <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">{txn.mode}</span>
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  <span className={txn.type === "Payment" ? "text-emerald-600" : "text-red-600"}>
                    {txn.type === "Payment" ? "+" : "-"} ₹ {txn.amount.toFixed(2)}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-1 justify-center">
                    {txn.type === "Payment" ? (
                      <>
                        <button
                          onClick={() =>
                            window.open(`${API_BASE}/api/payments/${txn.id}/receipt-html-pdf`, "_blank")
                          }
                          className="px-2 py-0.5 text-[11px] rounded border border-blue-400 text-blue-700 hover:bg-blue-50"
                        >
                          PDF
                        </button>
                        <button
                          onClick={() => navigate(`/payments/${txn.id}/edit`)}
                          className="px-2 py-0.5 text-[11px] rounded border border-slate-300 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() =>
                            window.open(`${API_BASE}/api/refunds/${txn.id}/refund-html-pdf`, "_blank")
                          }
                          className="px-2 py-0.5 text-[11px] rounded border border-blue-400 text-blue-700 hover:bg-blue-50"
                        >
                          PDF
                        </button>
                        <button
                          onClick={() => navigate(`/refunds/${txn.id}/edit`)}
                          className="px-2 py-0.5 text-[11px] rounded border border-slate-300 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-xs text-slate-500">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}