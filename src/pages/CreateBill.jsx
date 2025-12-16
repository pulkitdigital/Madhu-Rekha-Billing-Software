import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";

let rowId = 1;

export default function CreateBill() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    procedureDone: "",
    patientName: "",
    sex: "",
    address: "",
    age: "",
    date: "", // Let user select manually

    // amounts
    pay: "0",

    // payment
    paymentMode: "Cash", // Cash | Cheque | BankTransfer | UPI
    paymentDate: "",
    referenceNo: "",

    // cheque fields
    chequeDate: "",
    chequeNumber: "",
    bankName: "",

    // bank transfer fields
    transferType: "", // IMPS / NEFT / RTGS
    transferDate: "",

    // UPI fields
    upiName: "",
    upiId: "",
    upiDate: "",

    // generic for ALL modes (used in PDFs)
    drawnOn: "",
    drawnAs: "",

    // generic remarks
    remarks: "",
  });

  const [services, setServices] = useState([
    { id: rowId++, description: "", qty: "1", rate: "500" },
  ]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceChange = (id, field, value) => {
    setServices((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const addServiceRow = () => {
    setServices((prev) => [
      ...prev,
      { id: rowId++, description: "", qty: "1", rate: "0" },
    ]);
  };

  const removeServiceRow = (id) => {
    setServices((prev) =>
      prev.length === 1 ? prev : prev.filter((row) => row.id !== id)
    );
  };

  // ---------- NUMERIC DERIVED VALUES ----------

  const servicesWithAmount = services.map((s) => {
    const qty = Number(s.qty) || 0;
    const rate = Number(s.rate) || 0;
    const lineAmount = qty * rate;
    return { ...s, qty, rate, lineAmount };
  });

  const subtotal = servicesWithAmount.reduce((sum, s) => sum + s.lineAmount, 0);
  const total = subtotal; // no adjustments here

  // clamp pay: 0 <= pay <= total
  const rawPay = Number(form.pay) || 0;
  const cappedPay = Math.min(rawPay, total);
  const pay = cappedPay < 0 ? 0 : cappedPay;

  const balance = total - pay;

  const formattedTotal = total.toFixed(2);
  const formattedPay = pay.toFixed(2);
  const formattedBalance = balance.toFixed(2);

  const dateText = form.date || "__________";

  const handleSave = async () => {
    // remove internal-only fields (id, lineAmount) before sending
    if (!form.patientName.trim()) {
      alert("Patient name is required");
      return;
    }

    if (!form.address.trim()) {
      alert("Address is required");
      return;
    }

    if (!form.date) {
      alert("Date is required");
      return;
    }

    const hasEmptyDescription = servicesWithAmount.some(
      (s) => !s.description.trim()
    );

    if (hasEmptyDescription) {
      alert("All service descriptions are required");
      return;
    }
    const cleanedServices = servicesWithAmount.map(
      ({ id, lineAmount, ...rest }) => rest
    );

    const payload = {
      ...form,
      pay: formattedPay,
      services: cleanedServices,
      total: formattedTotal,
      balance: formattedBalance,
    };

    try {
      const result = await apiFetch("/api/bills", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const billId = result.bill.id;
      alert(`Bill created. ID: ${billId}`);
      navigate(`/bills/${billId}`);
    } catch (err) {
      alert(err.message);
    }
  };

  const renderPaymentDetailsFields = () => {
    const mode = form.paymentMode;

    if (mode === "Cash") return null;

    if (mode === "Cheque") {
      return (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Cheque Date
              </label>
              <input
                type="date"
                name="chequeDate"
                value={form.chequeDate}
                onChange={handleFormChange}
                className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Cheque No.
              </label>
              <input
                type="text"
                name="chequeNumber"
                value={form.chequeNumber}
                onChange={handleFormChange}
                className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                placeholder="Cheque number"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                name="bankName"
                value={form.bankName}
                onChange={handleFormChange}
                className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                placeholder="Bank & branch"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Ref No. (optional)
              </label>
              <input
                type="text"
                name="referenceNo"
                value={form.referenceNo}
                onChange={handleFormChange}
                className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                placeholder="Bank reference / slip"
              />
            </div>
          </div>
        </div>
      );
    }

    if (mode === "BankTransfer") {
      return (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Transfer Type
              </label>
              <select
                name="transferType"
                value={form.transferType}
                onChange={handleFormChange}
                className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              >
                <option value="">Select</option>
                <option value="IMPS">IMPS</option>
                <option value="NEFT">NEFT</option>
                <option value="RTGS">RTGS</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Transfer Date
              </label>
              <input
                type="date"
                name="transferDate"
                value={form.transferDate}
                onChange={handleFormChange}
                className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                name="bankName"
                value={form.bankName}
                onChange={handleFormChange}
                className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                placeholder="Bank name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Ref / UTR No.
              </label>
              <input
                type="text"
                name="referenceNo"
                value={form.referenceNo}
                onChange={handleFormChange}
                className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                placeholder="UTR / transaction ID"
              />
            </div>
          </div>
        </div>
      );
    }

    if (mode === "UPI") {
      return (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Payer Name
              </label>
              <input
                type="text"
                name="upiName"
                value={form.upiName}
                onChange={handleFormChange}
                className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                placeholder="Name on UPI"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                UPI ID
              </label>
              <input
                type="text"
                name="upiId"
                value={form.upiId}
                onChange={handleFormChange}
                className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                placeholder="eg. name@bank"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Payment Date
              </label>
              <input
                type="date"
                name="upiDate"
                value={form.upiDate}
                onChange={handleFormChange}
                className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                UPI Ref / Txn ID
              </label>
              <input
                type="text"
                name="referenceNo"
                value={form.referenceNo}
                onChange={handleFormChange}
                className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                placeholder="Transaction ID"
              />
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderPaymentPreview = () => {
    const mode = form.paymentMode;

    if (mode === "Cash") {
      return (
        <p className="mb-2">
          Received with thanks from Shri/Smt./M/s{" "}
          <span className="font-semibold underline decoration-dotted">
            {form.patientName || "__________"}
          </span>{" "}
          the sum of Rupees{" "}
          <span className="font-semibold">₹ {formattedPay}</span> dated{" "}
          <span className="font-semibold underline decoration-dotted">
            {dateText}
          </span>{" "}
          by <span className="font-semibold">Cash</span>.
        </p>
      );
    }

    if (mode === "Cheque") {
      return (
        <p className="mb-2">
          Received with thanks from Shri/Smt./M/s{" "}
          <span className="font-semibold underline decoration-dotted">
            {form.patientName || "__________"}
          </span>{" "}
          the sum of Rupees{" "}
          <span className="font-semibold">₹ {formattedPay}</span> by{" "}
          <span className="font-semibold">Cheque</span>{" "}
          {form.chequeNumber && (
            <>
              No.{" "}
              <span className="font-semibold underline decoration-dotted">
                {form.chequeNumber}
              </span>
            </>
          )}{" "}
          {form.chequeDate && (
            <>
              {" "}
              dated{" "}
              <span className="font-semibold underline decoration-dotted">
                {form.chequeDate}
              </span>
            </>
          )}{" "}
          {form.bankName && (
            <>
              {" "}
              drawn on{" "}
              <span className="font-semibold underline decoration-dotted">
                {form.bankName}
              </span>
            </>
          )}{" "}
          {form.referenceNo && (
            <>
              {" "}
              (Ref:{" "}
              <span className="font-semibold underline decoration-dotted">
                {form.referenceNo}
              </span>
              )
            </>
          )}{" "}
          (Subject to realization).
        </p>
      );
    }

    if (mode === "BankTransfer") {
      return (
        <p className="mb-2">
          Received with thanks from Shri/Smt./M/s{" "}
          <span className="font-semibold underline decoration-dotted">
            {form.patientName || "__________"}
          </span>{" "}
          the sum of Rupees{" "}
          <span className="font-semibold">₹ {formattedPay}</span> by{" "}
          <span className="font-semibold">
            {form.transferType || "Bank Transfer"}
          </span>
          {form.transferDate && (
            <>
              {" "}
              on{" "}
              <span className="font-semibold underline decoration-dotted">
                {form.transferDate}
              </span>
            </>
          )}
          {form.bankName && (
            <>
              {" "}
              from{" "}
              <span className="font-semibold underline decoration-dotted">
                {form.bankName}
              </span>
            </>
          )}
          {form.referenceNo && (
            <>
              {" "}
              (UTR / Ref:{" "}
              <span className="font-semibold underline decoration-dotted">
                {form.referenceNo}
              </span>
              )
            </>
          )}
          .
        </p>
      );
    }

    if (mode === "UPI") {
      return (
        <p className="mb-2">
          Received with thanks from Shri/Smt./M/s{" "}
          <span className="font-semibold underline decoration-dotted">
            {form.patientName || "__________"}
          </span>{" "}
          the sum of Rupees{" "}
          <span className="font-semibold">₹ {formattedPay}</span> by{" "}
          <span className="font-semibold">UPI</span>
          {form.upiName && (
            <>
              {" "}
              from{" "}
              <span className="font-semibold underline decoration-dotted">
                {form.upiName}
              </span>
            </>
          )}
          {form.upiId && (
            <>
              {" "}
              (UPI ID:{" "}
              <span className="font-semibold underline decoration-dotted">
                {form.upiId}
              </span>
              )
            </>
          )}
          {form.upiDate && (
            <>
              {" "}
              on{" "}
              <span className="font-semibold underline decoration-dotted">
                {form.upiDate}
              </span>
            </>
          )}
          {form.referenceNo && (
            <>
              {" "}
              (Ref:{" "}
              <span className="font-semibold underline decoration-dotted">
                {form.referenceNo}
              </span>
              )
            </>
          )}
          .
        </p>
      );
    }

    return (
      <p className="mb-2">
        Received with thanks from Shri/Smt./M/s{" "}
        <span className="font-semibold underline decoration-dotted">
          {form.patientName || "__________"}
        </span>{" "}
        the sum of Rupees{" "}
        <span className="font-semibold">₹ {formattedPay}</span> dated{" "}
        <span className="font-semibold underline decoration-dotted">
          {dateText}
        </span>
        .
      </p>
    );
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">New Bill / Receipt</h3>

      {/* Top: Patient info */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
        <h4 className="text-sm font-semibold mb-2">Patient Details</h4>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Patient Name
            </label>
            <input
              type="text"
              name="patientName"
              value={form.patientName}
              onChange={handleFormChange}
              className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              placeholder="Shri/Smt./M/s"
              required
            />
          </div>
          {/* <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Age
            </label>
            <input
              type="number"
              name="age"
              value={form.age}
              onChange={handleFormChange}
              className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              placeholder="Years"
            />
          </div> */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleFormChange}
              className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Address
            </label>
            <textarea
              name="address"
              rows={2}
              value={form.address}
              onChange={handleFormChange}
              className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              placeholder="Full address"
              required
            />
          </div>
          {/* <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Sex
            </label>
            <div className="flex items-center gap-4 mt-1 text-sm">
              <label className="inline-flex items-center gap-1">
                <input
                  type="radio"
                  name="sex"
                  value="Male"
                  checked={form.sex === "Male"}
                  onChange={handleFormChange}
                  className="h-3 w-3"
                />
                <span>Male</span>
              </label>
              <label className="inline-flex items-center gap-1">
                <input
                  type="radio"
                  name="sex"
                  value="Female"
                  checked={form.sex === "Female"}
                  onChange={handleFormChange}
                  className="h-3 w-3"
                />
                <span>Female</span>
              </label>
              <label className="inline-flex items-center gap-1">
                <input
                  type="radio"
                  name="sex"
                  value="Other"
                  checked={form.sex === "Other"}
                  onChange={handleFormChange}
                  className="h-3 w-3"
                />
                <span>Other</span>
              </label>
            </div>
          </div> */}
        </div>
      </div>

      {/* Middle: Service rows (SIMPLIFIED as requested) */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
        <div className="flex  gap-4">
          <h3 className="text-lg font-semibold">Procedure Done :-</h3>

          <input
            type="text"
            name="procedureDone"
            value={form.procedureDone}
            onChange={handleFormChange}
            className="w-84 border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
            placeholder="Cataract Surgery, Retina Check-up"
          />
        </div>

        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-semibold">Treatment Breakup Details</h4>
          <button
            type="button"
            onClick={addServiceRow}
            className="text-xs px-3 py-1 rounded-md border border-slate-300 hover:bg-slate-50"
          >
            + Add Item
          </button>
        </div>

        {/* Header */}
        <div className="hidden md:grid grid-cols-12 gap-3 text-[11px] font-semibold text-slate-500 border-b border-slate-200 pb-1">
          <div className="col-span-1">Sr.</div>
          <div className="col-span-6">Description of Items/Service</div>
          <div className="col-span-1">Qty</div>
          <div className="col-span-2">Rate</div>
          <div className="col-span-2">Amount</div>
        </div>

        {/* Rows */}
        <div className="space-y-2">
          {servicesWithAmount.map((row, idx) => (
            <div
              key={row.id}
              className="relative grid grid-cols-12 gap-3 items-center pr-6"
            >
              <div className="col-span-12 md:col-span-1 text-sm md:text-[13px] flex items-center">
                {idx + 1}
              </div>

              <div className="col-span-12 md:col-span-6">
                <input
                  type="text"
                  value={row.description}
                  onChange={(e) =>
                    handleServiceChange(row.id, "description", e.target.value)
                  }
                  className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                  placeholder={`Description ${idx + 1}`}
                  required
                />
              </div>

              <div className="col-span-4 md:col-span-1">
                <input
                  type="number"
                  value={row.qty}
                  onChange={(e) =>
                    handleServiceChange(row.id, "qty", e.target.value)
                  }
                  className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-slate-500"
                  min="0"
                />
              </div>

              <div className="col-span-4 md:col-span-2">
                <input
                  type="number"
                  value={row.rate}
                  onChange={(e) =>
                    handleServiceChange(row.id, "rate", e.target.value)
                  }
                  className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-slate-500"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="col-span-4 md:col-span-2">
                <div className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-sm text-right bg-slate-50">
                  ₹ {row.lineAmount.toFixed(2)}
                </div>
              </div>

              {/* Delete button - absolute right */}
              <button
                type="button"
                onClick={() => removeServiceRow(row.id)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-red-500 hover:text-red-600 disabled:text-slate-300"
                disabled={services.length === 1}
                title={
                  services.length === 1
                    ? "At least one row required"
                    : "Remove item"
                }
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Mobile-friendly header shown above each row (for small screens) */}
        <div className="md:hidden space-y-2">
          {servicesWithAmount.map((row, idx) => (
            <div
              key={`m-${row.id}`}
              className="border border-slate-100 rounded-md p-2"
            >
              <div className="flex justify-between items-center text-sm mb-2">
                <div>Sr. {idx + 1}</div>
                <div className="text-right font-semibold">
                  ₹ {row.lineAmount.toFixed(2)}
                </div>
              </div>
              <div className="mb-2">
                <input
                  type="text"
                  value={row.description}
                  onChange={(e) =>
                    handleServiceChange(row.id, "description", e.target.value)
                  }
                  className="w-full border border-slate-300 rounded-md px-2 py-1 text-sm"
                  placeholder={`Description ${idx + 1}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={row.qty}
                  onChange={(e) =>
                    handleServiceChange(row.id, "qty", e.target.value)
                  }
                  className="w-full border border-slate-300 rounded-md px-2 py-1 text-sm text-right"
                  min="0"
                />
                <input
                  type="number"
                  value={row.rate}
                  onChange={(e) =>
                    handleServiceChange(row.id, "rate", e.target.value)
                  }
                  className="w-full border border-slate-300 rounded-md px-2 py-1 text-sm text-right"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom: summary + payment + legal text preview */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Left: amounts + payment */}
        <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
          <h4 className="text-sm font-semibold mb-2">Amount & Payment</h4>

          {/* Subtotal removed from UI; show only Total */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-800 font-semibold">Total</span>
              <span className="font-bold text-base">₹ {formattedTotal}</span>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-3 mt-2 space-y-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-slate-600">Pay (Received Now)</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">₹</span>
                <input
                  type="number"
                  name="pay"
                  value={Number.isNaN(pay) ? "" : pay}
                  onChange={handleFormChange}
                  className="w-28 border border-slate-300 rounded-md px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-slate-500"
                  step="0.01"
                  min="0"
                  max={total}
                />
              </div>
            </div>
            <div className="flex justify-between items-center text-sm border-t border-dashed border-slate-300 pt-2 mt-1">
              <span className="text-slate-800 font-semibold">Balance</span>
              <span className="font-bold text-base">₹ {formattedBalance}</span>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-3 mt-2 space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Payment Mode
                </label>
                <select
                  name="paymentMode"
                  value={form.paymentMode}
                  onChange={handleFormChange}
                  className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                >
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="BankTransfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Payment Date
                </label>
                <input
                  type="date"
                  name="paymentDate"
                  value={form.paymentDate}
                  onChange={handleFormChange}
                  className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </div>
            </div>

            {renderPaymentDetailsFields()}

            {/* COMMON drawn on / drawn as for ALL modes */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Drawn On
                </label>
                <input
                  type="text"
                  name="drawnOn"
                  value={form.drawnOn}
                  onChange={handleFormChange}
                  className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                  placeholder="Bank / UPI / Source"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Drawn As
                </label>
                <input
                  type="text"
                  name="drawnAs"
                  value={form.drawnAs}
                  onChange={handleFormChange}
                  className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                  placeholder="Cash / Cheque / IMPS / NEFT / RTGS / UPI"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 mt-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Remarks (optional)
                </label>
                <input
                  type="text"
                  name="remarks"
                  value={form.remarks}
                  onChange={handleFormChange}
                  className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                  placeholder="Towards consultation / surgery..."
                />
              </div>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              className="inline-flex items-center px-4 py-1.5 rounded-md text-sm font-medium border border-slate-300 hover:bg-slate-50"
              onClick={() => {
                /* optional: implement full reset if needed */
              }}
            >
              Clear
            </button>
            <button
              type="button"
              className="inline-flex items-center px-4 py-1.5 rounded-md text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60"
              onClick={handleSave}
              disabled={total <= 0}
            >
              Save &amp; Generate Receipt
            </button>
          </div>
        </div>

        {/* Right: bottom receipt text preview */}
        <div className="bg-white rounded-lg shadow-sm p-4 text-xs leading-relaxed text-slate-800">
          <h4 className="text-sm font-semibold mb-2">Receipt Preview</h4>

          {renderPaymentPreview()}

          {form.drawnOn || form.drawnAs ? (
            <p className="mb-2">
              Drawn on{" "}
              <span className="underline decoration-dotted">
                {form.drawnOn || "________________________"}
              </span>{" "}
              as{" "}
              <span className="underline decoration-dotted">
                {form.drawnAs || "________________________"}
              </span>{" "}
              (Subject to realization).
            </p>
          ) : null}

          {form.remarks && (
            <p className="mb-2">
              Remarks:{" "}
              <span className="underline decoration-dotted">
                {form.remarks}
              </span>
            </p>
          )}

          <p className="mb-4 text-[11px]">
            *Dispute if any Subject to Jamshedpur Jurisdiction
          </p>

          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200">
            <div className="text-left">
              <div className="h-10 border-b border-dashed border-slate-400 mb-1" />
              <div className="text-[11px] text-slate-700">
                Patient / Representative
              </div>
            </div>
            <div className="text-right">
              <div className="h-10 border-b border-dashed border-slate-400 mb-1" />
              <div className="text-[11px] text-slate-700">
                For Madhurekha Eye Care Centre
              </div>
            </div>
          </div>

          <div className="mt-3 text-[10px] text-slate-500">
            Total: ₹ {formattedTotal} | Balance: ₹ {formattedBalance}
          </div>
        </div>
      </div>
    </div>
  );
}
