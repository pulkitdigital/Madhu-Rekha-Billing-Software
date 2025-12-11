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

      setBill({
        ...data,
        payments: data.payments || [],
        refunds: data.refunds || [],
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
  const hasNetPaid = Number(bill.paid || 0) > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">
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

        {/* <div className="flex flex-wrap gap-2">
          
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

          <button
            type="button"
            onClick={() =>
              window.open(
                `${API_BASE}/api/bills/${bill.id}/summary-pdf`,
                "_blank"
              )
            }
            className="px-3 py-1.5 text-xs rounded border border-slate-300 hover:bg-slate-50"
          >
            Download Summary
          </button>
        </div> */}
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

          <button
            type="button"
            onClick={() =>
              window.open(
                `${API_BASE}/api/bills/${bill.id}/summary-pdf`,
                "_blank"
              )
            }
            className="px-3 py-1.5 text-xs rounded border border-slate-300 hover:bg-slate-50"
          >
            Download Summary
          </button>

          {/* 🔵 NEW BUTTON — FULL PAYMENT PDF */}
          {isPaid && (
            <button
              type="button"
              onClick={() =>
                window.open(
                  `${API_BASE}/api/bills/${bill.id}/full-payment-pdf`,
                  "_blank"
                )
              }
              className="px-3 py-1.5 text-xs rounded border border-blue-400 text-blue-700 hover:bg-blue-50"
            >
              Full Payment PDF
            </button>
          )}
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
            <span className="text-slate-600">Paid (net after refunds)</span>
            <span className="font-semibold text-emerald-700">
              ₹ {Number(bill.paid).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-slate-600">Refunded</span>
            <span className="font-semibold text-red-600">
              ₹ {Number(bill.refunded || 0).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between border-t border-dashed border-slate-300 pt-1 mt-1">
            <span className="text-slate-800 font-semibold">Balance</span>
            <span className="font-bold text-base">
              ₹ {Number(bill.balance).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 text-sm space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
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

          <div className="border-t border-slate-100 pt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold">Issue Refund</span>
              {hasNetPaid && (
                <span className="text-[11px] text-slate-500">
                  Max refundable: ₹ {Number(bill.paid).toFixed(2)}
                </span>
              )}
            </div>
            {hasNetPaid ? (
              <RefundForm
                billId={bill.id}
                maxRefund={bill.paid}
                onSuccess={loadBill}
              />
            ) : (
              <div className="text-xs text-slate-500">
                No net payment received yet. Refund is disabled.
              </div>
            )}
          </div>
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
                  <th className="px-2 py-1 text-left">Drawn on</th>
                  <th className="px-2 py-1 text-left">Drawn as</th>
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
                    <td className="px-2 py-1">
                      {p.date} {p.time ? p.time : ""}
                    </td>
                    <td className="px-2 py-1 text-right">
                      ₹ {Number(p.amount).toFixed(2)}
                    </td>
                    <td className="px-2 py-1">{p.mode}</td>
                    <td className="px-2 py-1">{p.referenceNo || "-"}</td>
                    <td className="px-2 py-1">{p.drawnOn || "-"}</td>
                    <td className="px-2 py-1">{p.drawnAs || "-"}</td>
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

      {/* Refund history */}
      <div className="bg-white rounded-lg shadow-sm p-4 text-sm">
        <h4 className="text-sm font-semibold mb-2">Refund History</h4>
        {(bill.refunds?.length ?? 0) === 0 ? (
          <div className="text-xs text-slate-500">No refunds issued yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-2 py-1 text-left">Date</th>
                  <th className="px-2 py-1 text-right">Amount</th>
                  <th className="px-2 py-1 text-left">Mode</th>
                  <th className="px-2 py-1 text-left">Ref No.</th>
                  <th className="px-2 py-1 text-left">Drawn on</th>
                  <th className="px-2 py-1 text-left">Drawn as</th>
                  <th className="px-2 py-1 text-left">Refund No.</th>
                  <th className="px-2 py-1 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(bill.refunds ?? []).map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-2 py-1">
                      {r.date} {r.time ? r.time : ""}
                    </td>
                    <td className="px-2 py-1 text-right">
                      ₹ {Number(r.amount).toFixed(2)}
                    </td>
                    <td className="px-2 py-1">{r.mode}</td>
                    <td className="px-2 py-1">{r.referenceNo || "-"}</td>
                    <td className="px-2 py-1">{r.drawnOn || "-"}</td>
                    <td className="px-2 py-1">{r.drawnAs || "-"}</td>
                    <td className="px-2 py-1">{r.refundNo || "-"}</td>
                    <td className="px-2 py-1 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          window.open(
                            `${API_BASE}/api/refunds/${r.id}/refund-html-pdf`,
                            "_blank"
                          )
                        }
                        className="px-2 py-0.5 text-[11px] rounded border border-slate-300 hover:bg-slate-50"
                      >
                        Download Refund
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

/* ---------- COMMON RENDERER FOR MODE-SPECIFIC FIELDS ---------- */

function ModeSpecificFields({ form, onChange }) {
  const mode = form.mode;

  if (mode === "Cash") return null;

  if (mode === "Cheque") {
    return (
      <div className="mt-2 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] text-slate-600 mb-1">
              Cheque Date
            </label>
            <input
              type="date"
              name="chequeDate"
              value={form.chequeDate}
              onChange={onChange}
              className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-600 mb-1">
              Cheque No.
            </label>
            <input
              type="text"
              name="chequeNumber"
              value={form.chequeNumber}
              onChange={onChange}
              className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-slate-500"
              placeholder="Cheque number"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] text-slate-600 mb-1">
              Bank Name
            </label>
            <input
              type="text"
              name="bankName"
              value={form.bankName}
              onChange={onChange}
              className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-slate-500"
              placeholder="Bank & branch"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-600 mb-1">
              Drawn on
            </label>
            <input
              type="text"
              name="drawnOn"
              value={form.drawnOn}
              onChange={onChange}
              className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-slate-500"
              placeholder="e.g. SBI Sakchi"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] text-slate-600 mb-1">
            Drawn as (remarks)
          </label>
          <input
            type="text"
            name="drawnAs"
            value={form.drawnAs}
            onChange={onChange}
            className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-slate-500"
            placeholder="Towards consultation / surgery..."
          />
        </div>
      </div>
    );
  }

  if (mode === "BankTransfer") {
    return (
      <div className="mt-2 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] text-slate-600 mb-1">
              Transfer Type
            </label>
            <select
              name="transferType"
              value={form.transferType}
              onChange={onChange}
              className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-slate-500"
            >
              <option value="">Select</option>
              <option value="IMPS">IMPS</option>
              <option value="NEFT">NEFT</option>
              <option value="RTGS">RTGS</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-slate-600 mb-1">
              Transfer Date
            </label>
            <input
              type="date"
              name="transferDate"
              value={form.transferDate}
              onChange={onChange}
              className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] text-slate-600 mb-1">
              Bank Name
            </label>
            <input
              type="text"
              name="bankName"
              value={form.bankName}
              onChange={onChange}
              className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-slate-500"
              placeholder="Bank name"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-600 mb-1">
              Drawn on
            </label>
            <input
              type="text"
              name="drawnOn"
              value={form.drawnOn}
              onChange={onChange}
              className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-slate-500"
              placeholder="e.g. Axis Sakchi"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] text-slate-600 mb-1">
            Drawn as (remarks)
          </label>
          <input
            type="text"
            name="drawnAs"
            value={form.drawnAs}
            onChange={onChange}
            className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-slate-500"
            placeholder="Towards consultation / surgery..."
          />
        </div>
      </div>
    );
  }

  if (mode === "UPI") {
    return (
      <div className="mt-2 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] text-slate-600 mb-1">
              Payer Name
            </label>
            <input
              type="text"
              name="upiName"
              value={form.upiName}
              onChange={onChange}
              className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-slate-500"
              placeholder="Name on UPI"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-600 mb-1">
              UPI ID
            </label>
            <input
              type="text"
              name="upiId"
              value={form.upiId}
              onChange={onChange}
              className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-slate-500"
              placeholder="eg. name@bank"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] text-slate-600 mb-1">
              Payment Date
            </label>
            <input
              type="date"
              name="upiDate"
              value={form.upiDate}
              onChange={onChange}
              className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] text-slate-600 mb-1">
              Drawn on
            </label>
            <input
              type="text"
              name="drawnOn"
              value={form.drawnOn}
              onChange={onChange}
              className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-slate-500"
              placeholder="e.g. GPay / PhonePe"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-600 mb-1">
              Drawn as (remarks)
            </label>
            <input
              type="text"
              name="drawnAs"
              value={form.drawnAs}
              onChange={onChange}
              className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-slate-500"
              placeholder="Towards consultation / surgery..."
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}

/* ---------- PENDING PAYMENT FORM ---------- */

function PendingPaymentForm({ billId, pending, onSuccess }) {
  const [form, setForm] = useState({
    amount: pending,
    mode: "Cash",
    referenceNo: "",
    chequeDate: "",
    chequeNumber: "",
    bankName: "",
    transferType: "",
    transferDate: "",
    upiName: "",
    upiId: "",
    upiDate: "",
    drawnOn: "",
    drawnAs: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiFetch(`/api/bills/${billId}/payments`, {
        method: "POST",
        body: JSON.stringify({
          amount: Number(form.amount),
          mode: form.mode,
          referenceNo: form.referenceNo,
          chequeDate: form.chequeDate,
          chequeNumber: form.chequeNumber,
          bankName: form.bankName,
          transferType: form.transferType,
          transferDate: form.transferDate,
          upiName: form.upiName,
          upiId: form.upiId,
          upiDate: form.upiDate,
          drawnOn: form.drawnOn,
          drawnAs: form.drawnAs,
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
          name="amount"
          value={form.amount}
          onChange={handleChange}
          className="w-28 border border-slate-300 rounded-md px-2 py-1 text-right focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>

      <div className="flex justify-between items-center gap-2">
        <label className="text-slate-600">Mode</label>
        <select
          name="mode"
          value={form.mode}
          onChange={handleChange}
          className="flex-1 border border-slate-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-slate-500"
        >
          <option value="Cash">Cash</option>
          <option value="Cheque">Cheque</option>
          <option value="BankTransfer">Bank Transfer</option>
          <option value="UPI">UPI</option>
        </select>
      </div>

      <div>
        <label className="block text-slate-600 mb-1 text-[11px]">
          Ref No. (optional)
        </label>
        <input
          type="text"
          name="referenceNo"
          value={form.referenceNo}
          onChange={handleChange}
          className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>

      <ModeSpecificFields form={form} onChange={handleChange} />

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

/* ---------- REFUND FORM ---------- */

function RefundForm({ billId, maxRefund, onSuccess }) {
  const [form, setForm] = useState({
    amount: maxRefund,
    mode: "Cash",
    referenceNo: "",
    chequeDate: "",
    chequeNumber: "",
    bankName: "",
    transferType: "",
    transferDate: "",
    upiName: "",
    upiId: "",
    upiDate: "",
    drawnOn: "",
    drawnAs: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numericAmount = Number(form.amount);
    if (numericAmount <= 0) {
      alert("Refund amount must be > 0");
      return;
    }
    if (numericAmount > Number(maxRefund)) {
      alert("Refund amount cannot exceed net paid amount");
      return;
    }

    setLoading(true);

    try {
      await apiFetch(`/api/bills/${billId}/refunds`, {
        method: "POST",
        body: JSON.stringify({
          amount: numericAmount,
          mode: form.mode,
          referenceNo: form.referenceNo,
          chequeDate: form.chequeDate,
          chequeNumber: form.chequeNumber,
          bankName: form.bankName,
          transferType: form.transferType,
          transferDate: form.transferDate,
          upiName: form.upiName,
          upiId: form.upiId,
          upiDate: form.upiDate,
          drawnOn: form.drawnOn,
          drawnAs: form.drawnAs,
        }),
      });

      alert("Refund saved & refund receipt generated");
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
        <label className="text-slate-600">Refund Amount</label>
        <input
          type="number"
          min={0}
          max={maxRefund}
          step="0.01"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          className="w-28 border border-slate-300 rounded-md px-2 py-1 text-right focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>

      <div className="flex justify-between items-center gap-2">
        <label className="text-slate-600">Mode</label>
        <select
          name="mode"
          value={form.mode}
          onChange={handleChange}
          className="flex-1 border border-slate-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-slate-500"
        >
          <option value="Cash">Cash</option>
          <option value="Cheque">Cheque</option>
          <option value="BankTransfer">Bank Transfer</option>
          <option value="UPI">UPI</option>
        </select>
      </div>

      <div>
        <label className="block text-slate-600 mb-1 text-[11px]">
          Ref No. (optional)
        </label>
        <input
          type="text"
          name="referenceNo"
          value={form.referenceNo}
          onChange={handleChange}
          className="w-full border border-slate-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>

      <ModeSpecificFields form={form} onChange={handleChange} />

      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full px-3 py-1.5 rounded-md bg-red-700 text-white text-xs font-medium hover:bg-red-600 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Confirm Refund & Generate Receipt"}
      </button>
    </form>
  );
}
