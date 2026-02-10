// src/pages/Payments.jsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, API_BASE } from "../lib/api";

export default function Payments() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, payment, refund
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

  // ✅ Filter transactions based on type
  const filteredTransactions = useMemo(() => {
    if (filter === "payment") {
      return transactions.filter((t) => t.type === "Payment");
    }
    if (filter === "refund") {
      return transactions.filter((t) => t.type === "Refund");
    }
    return transactions; // all
  }, [transactions, filter]);

  // ✅ Calculate totals
  const totals = useMemo(() => {
    const payments = transactions.filter((t) => t.type === "Payment");
    const refunds = transactions.filter((t) => t.type === "Refund");
    
    const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalRefunds = refunds.reduce((sum, r) => sum + r.amount, 0);
    const netAmount = totalPayments - totalRefunds;

    return {
      totalPayments,
      totalRefunds,
      netAmount,
      paymentsCount: payments.length,
      refundsCount: refunds.length,
    };
  }, [transactions]);

  // ✅ Download PDF handler
  const handleDownloadPDF = () => {
    const url = `${API_BASE}/api/transactions/download-pdf?type=${filter}`;
    window.open(url, "_blank");
  };

  if (loading) return <div className="text-sm">Loading transactions...</div>;
  if (error) return <div className="text-sm text-red-600">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">All Payments & Refunds</h3>
        
        {/* Filter Buttons + Download PDF */}
        <div className="flex gap-2 items-center">
          {/* ✅ Download PDF Button */}
          <button
            onClick={handleDownloadPDF}
            className="px-3 py-1.5 text-xs rounded-md font-medium bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </button>

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
                <td className="px-3 py-2 font-mono text-xs">
                  {txn.receiptNo}
                </td>
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
                  <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">
                    {txn.mode}
                  </span>
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  <span
                    className={
                      txn.type === "Payment"
                        ? "text-emerald-600"
                        : "text-red-600"
                    }
                  >
                    {txn.type === "Payment" ? "+" : "-"} ₹{" "}
                    {txn.amount.toFixed(2)}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-1 justify-center">
                    {txn.type === "Payment" ? (
                      <>
                        <button
                          onClick={() =>
                            window.open(
                              `${API_BASE}/api/payments/${txn.id}/receipt-html-pdf`,
                              "_blank"
                            )
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
                            window.open(
                              `${API_BASE}/api/refunds/${txn.id}/refund-html-pdf`,
                              "_blank"
                            )
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
                <td
                  colSpan={8}
                  className="px-3 py-6 text-center text-xs text-slate-500"
                >
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