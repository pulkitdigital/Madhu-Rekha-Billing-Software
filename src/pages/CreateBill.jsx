// src/pages/CreateBill.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";

let rowId = 1;

export default function CreateBill() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    patientName: "ROHIT",
    address: "",
    age: "",
    date: new Date().toISOString().slice(0, 10),
    doctorReg1: "",
    doctorReg2: "",
    adjust: "0",
    pay: "500",
    paymentMode: "Cash",
    referenceNo: "",
    drawnOn: "",   // ✅ NEW
    drawnAs: "",   // ✅ NEW
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

  // numeric derived values
  const adjust = Number(form.adjust) || 0;
  const pay = Number(form.pay) || 0;

  const servicesWithAmount = services.map((s) => {
    const qty = Number(s.qty) || 0;
    const rate = Number(s.rate) || 0;
    const lineAmount = qty * rate;
    return { ...s, qty, rate, lineAmount };
  });

  const subtotal = servicesWithAmount.reduce((sum, s) => sum + s.lineAmount, 0);
  const total = subtotal + adjust;
  const balance = total - pay;

  const formattedSubtotal = subtotal.toFixed(2);
  const formattedTotal = total.toFixed(2);
  const formattedPay = pay.toFixed(2);
  const formattedBalance = balance.toFixed(2);

  const dateText = form.date || "__________";

  const handleSave = async () => {
    // remove internal-only fields (id, lineAmount) before sending
    const cleanedServices = servicesWithAmount.map(
      ({ id, lineAmount, ...rest }) => rest
    );

    const payload = {
      ...form,
      services: cleanedServices, // drawnOn, drawnAs भी यहीं साथ में जाएंगे
    };

    try {
      const result = await apiFetch("/api/bills", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // result = { bill, payment, receipt }
      const billId = result.bill.id;
      alert(`Bill created. ID: ${billId}`);

      // redirect to bill detail
      navigate(`/bills/${billId}`);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">New Bill / Receipt</h3>

      {/* Top: Patient + Doctor info */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
        <h4 className="text-sm font-semibold mb-2">Patient & Doctor Details</h4>
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
            />
          </div>
          <div>
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
          </div>
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
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Dr. Pradipta Kundu
              </label>
              <input
                type="text"
                name="doctorReg1"
                value={form.doctorReg1}
                onChange={handleFormChange}
                className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Dr. (Mrs.) Amita Kundu
              </label>
              <input
                type="text"
                name="doctorReg2"
                value={form.doctorReg2}
                onChange={handleFormChange}
                className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Service rows */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-semibold">Service Details</h4>
          <button
            type="button"
            onClick={addServiceRow}
            className="text-xs px-3 py-1 rounded-md border border-slate-300 hover:bg-slate-50"
          >
            + Add Service
          </button>
        </div>

        <div className="hidden md:grid grid-cols-12 gap-3 text-[11px] font-semibold text-slate-500 border-b border-slate-200 pb-1">
          <div className="col-span-5">Service</div>
          <div className="col-span-2 text-right">Qty</div>
          <div className="col-span-2 text-right">Rate</div>
          <div className="col-span-2 text-right">Amount</div>
          <div className="col-span-1 text-center">–</div>
        </div>

        <div className="space-y-2">
          {servicesWithAmount.map((row, idx) => (
            <div key={row.id} className="grid grid-cols-12 gap-3 items-center">
              <div className="col-span-12 md:col-span-5">
                <input
                  type="text"
                  value={row.description}
                  onChange={(e) =>
                    handleServiceChange(row.id, "description", e.target.value)
                  }
                  className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                  placeholder={`Service ${idx + 1}`}
                />
              </div>
              <div className="col-span-4 md:col-span-2">
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
              <div className="col-span-3 md:col-span-2">
                <div className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-sm text-right bg-slate-50">
                  ₹ {row.lineAmount.toFixed(2)}
                </div>
              </div>
              <div className="col-span-1 flex justify-center">
                <button
                  type="button"
                  onClick={() => removeServiceRow(row.id)}
                  className="text-xs text-red-500 hover:text-red-600 disabled:text-slate-300"
                  disabled={services.length === 1}
                  title={
                    services.length === 1
                      ? "At least one row required"
                      : "Remove service"
                  }
                >
                  ✕
                </button>
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

          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-semibold">₹ {formattedSubtotal}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-slate-600">Adjust (+/-)</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">₹</span>
                <input
                  type="number"
                  name="adjust"
                  value={form.adjust}
                  onChange={handleFormChange}
                  className="w-28 border border-slate-300 rounded-md px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-slate-500"
                  step="0.01"
                />
              </div>
            </div>
            <div className="flex justify-between items-center text-sm border-t border-dashed border-slate-300 pt-2 mt-1">
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
                  value={form.pay}
                  onChange={handleFormChange}
                  className="w-28 border border-slate-300 rounded-md px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-slate-500"
                  step="0.01"
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
                  <option value="Bank">Bank</option>
                  <option value="Transfer">Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Cheque / UPI / Ref No.
                </label>
                <input
                  type="text"
                  name="referenceNo"
                  value={form.referenceNo}
                  onChange={handleFormChange}
                  className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                  placeholder="Optional"
                />
              </div>
            </div>

            {/* ✅ Drawn on + As inputs */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Drawn on
                </label>
                <input
                  type="text"
                  name="drawnOn"
                  value={form.drawnOn}
                  onChange={handleFormChange}
                  className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500"
                  placeholder="Bank / Branch / etc."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  As (remarks)
                </label>
                <input
                  type="text"
                  name="drawnAs"
                  value={form.drawnAs}
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
                // later: clear form for new bill
              }}
            >
              Clear
            </button>
            <button
              type="button"
              className="inline-flex items-center px-4 py-1.5 rounded-md text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60"
              onClick={handleSave}
            >
              Save &amp; Generate Receipt
            </button>
          </div>
        </div>

        {/* Right: bottom receipt text preview */}
        <div className="bg-white rounded-lg shadow-sm p-4 text-xs leading-relaxed text-slate-800">
          <h4 className="text-sm font-semibold mb-2">Receipt Preview</h4>

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
            by{" "}
            <span className="font-semibold">
              {form.paymentMode || "________"}
            </span>{" "}
            / Bank / Transfer / Cheque No. / UPI
            {form.referenceNo && (
              <>
                {" "}
                (<span className="font-semibold">{form.referenceNo}</span>)
              </>
            )}
          </p>

          <p className="mb-2">
            Drawn on{" "}
            <span className="underline decoration-dotted">
              {form.drawnOn || "________________________"}
            </span>{" "}
            (Subject to realization) as{" "}
            <span className="underline decoration-dotted">
              {form.drawnAs || "________________________"}
            </span>
          </p>

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
            Subtotal: ₹ {formattedSubtotal} | Total: ₹ {formattedTotal} | Balance: ₹{" "}
            {formattedBalance}
          </div>
        </div>
      </div>
    </div>
  );
}
