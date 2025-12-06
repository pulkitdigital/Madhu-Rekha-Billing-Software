// src/pages/BillDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch, API_BASE } from "../lib/api";

export default function BillDetail() {
  const { id } = useParams();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBill = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await apiFetch(`/api/bills/${id}`);

      // IMPORTANT: always force payments to be an array
      setBill({
        ...data,
        payments: data.payments || [],
      });
    } catch (e) {
      console.error("loadBill error:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBill();
  }, [id]);

  if (loading) return <div className="text-sm">Loading bill...</div>;
  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (!bill) return <div className="text-sm">Bill not found</div>;

  const isPaid = bill.balance <= 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">
          {/* Prefer human invoice number if backend sends it */}
          Bill {bill.invoiceNo || `#${bill.id}`}{" "}
          <span
            className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
              isPaid
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {isPaid ? "Paid in Full" : "Payment Pending"}
          </span>
        </h3>

        <div className="flex flex-wrap gap-2">
          {/* Main invoice PDF */}
          <button
            type="button"
            onClick={() =>
              window.open(
                `${API_BASE}/api/bills/${bill.id}/invoice-html-pdf`,
                "_blank"
              )
            }
            className="px-3 py-1.5 text-xs rounded border border-slate-300 hover:bg-slate-50"
          >
            Download Invoice
          </button>

          {/* “Summary” uses same invoice PDF endpoint */}
          <button
            type="button"
            onClick={() =>
              window.open(
                `${API_BASE}/api/bills/${bill.id}/invoice-html-pdf`,
                "_blank"
              )
            }
            className="px-3 py-1.5 text-xs rounded border border-slate-300 hover:bg-slate-50"
          >
            Download Summary
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 text-sm">
          <div className="text-xs text-slate-500 mb-1">Patient</div>
          <div className="font-semibold">{bill.patientName}</div>
          <div className="text-xs text-slate-500 mt-2">Date: {bill.date}</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 text-sm">
          <div className="flex justify-between mb-1">
            <span className="text-slate-600">Total</span>
            <span className="font-semibold">
              ₹ {Number(bill.total).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-slate-600">Paid</span>
            <span className="font-semibold text-emerald-700">
              ₹ {Number(bill.paid).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between border-t border-dashed border-slate-300 pt-1 mt-1">
            <span className="text-slate-800 font-semibold">Balance</span>
            <span className="font-bold text-base">
              ₹ {Number(bill.balance).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 text-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Pay Pending Amount</span>
            {!isPaid && (
              <span className="text-[11px] text-slate-500">
                Pending: ₹ {Number(bill.balance).toFixed(2)}
              </span>
            )}
          </div>

          {isPaid ? (
            <div className="text-xs text-emerald-700">
              Bill is fully paid. Further payment is disabled.
            </div>
          ) : (
            <PendingPaymentForm
              billId={bill.id}
              pending={bill.balance}
              onSuccess={loadBill}
            />
          )}
        </div>
      </div>

      {/* Payment history */}
      <div className="bg-white rounded-lg shadow-sm p-4 text-sm">
        <h4 className="text-sm font-semibold mb-2">Payment History</h4>
        {(bill.payments?.length ?? 0) === 0 ? (
          <div className="text-xs text-slate-500">
            No payments recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-2 py-1 text-left">Date</th>
                  <th className="px-2 py-1 text-right">Amount</th>
                  <th className="px-2 py-1 text-left">Mode</th>
                  <th className="px-2 py-1 text-left">Ref No.</th>
                  <th className="px-2 py-1 text-left">Receipt No.</th>
                  <th className="px-2 py-1 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(bill.payments ?? []).map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-2 py-1">{p.date} {p.time ? p.time : ""}</td>
                    <td className="px-2 py-1 text-right">
                      ₹ {Number(p.amount).toFixed(2)}
                    </td>
                    <td className="px-2 py-1">{p.mode}</td>
                    <td className="px-2 py-1">{p.referenceNo || "-"}</td>
                    <td className="px-2 py-1">{p.receiptNo || "-"}</td>
                    <td className="px-2 py-1 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          window.open(
                            `${API_BASE}/api/payments/${p.id}/receipt-html-pdf`,
                            "_blank"
                          )
                        }
                        className="px-2 py-0.5 text-[11px] rounded border border-slate-300 hover:bg-slate-50"
                      >
                        Download Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function PendingPaymentForm({ billId, pending, onSuccess }) {
  const [amount, setAmount] = useState(pending);
  const [mode, setMode] = useState("Cash");
  const [referenceNo, setReferenceNo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiFetch(`/api/bills/${billId}/payments`, {
        method: "POST",
        body: JSON.stringify({
          amount: Number(amount),
          mode,
          referenceNo,
        }),
      });

      alert("Payment saved & receipt generated");
      onSuccess();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 text-xs">
      <div className="flex justify-between items-center">
        <label className="text-slate-600">Amount</label>
        <input
          type="number"
          min={0}
          max={pending}
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-28 border border-slate-300 rounded-md px-2 py-1 text-right focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>
      <div className="flex justify-between items-center gap-2">
        <label className="text-slate-600">Mode</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="flex-1 border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-slate-500"
        >
          <option value="Cash">Cash</option>
          <option value="Bank">Bank</option>
          <option value="Transfer">Transfer</option>
          <option value="Cheque">Cheque</option>
          <option value="UPI">UPI</option>
        </select>
      </div>
      <div>
        <label className="block text-slate-600 mb-1">
          Ref No. (optional)
        </label>
        <input
          type="text"
          value={referenceNo}
          onChange={(e) => setReferenceNo(e.target.value)}
          className="w-full border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full px-3 py-1.5 rounded-md bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Confirm Payment & Generate Receipt"}
      </button>
    </form>
  );
}
