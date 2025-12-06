// src/pages/InvoicePrintPage.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

function formatMoney(val) {
  if (val == null) return "0.00";
  return Number(val).toFixed(2);
}

export default function InvoicePrintPage() {
  const { id } = useParams();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const data = await apiFetch(`/api/bills/${id}`);
        setBill(data);
        setError("");
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  if (loading) return <div className="p-8">Loading invoice...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!bill) return <div className="p-8">Invoice not found</div>;

  const patientName = bill.patient?.name || bill.patientName || "__________";

  const items = bill.items || bill.services || [];
  const subtotal = Number(bill.subtotal || 0);
  const adjust = Number(bill.adjust || 0);
  const total = Number(bill.total || 0);
  const paid = Number(bill.paid || 0);
  const balance = Number(bill.balance || 0);

  const invoiceNo = String(bill.id).padStart(4, "0");
  const dateText = bill.date || "";

  // extra fields – if backend save कर रहा है तो directly आएंगे, नहीं तो undefined रहेंगे
  const paymentMode = bill.paymentMode || "Cash";
  const referenceNo = bill.referenceNo || "";
  const drawnOn = bill.drawnOn || "";
  const drawnAs = bill.drawnAs || "";

  return (
    <div
      className="min-h-screen bg-slate-300 flex items-center justify-center print:bg-white"
      data-print-ready="1"
    >
      <div className="bg-white text-[11px] leading-relaxed w-[210mm] min-h-[297mm] mx-auto shadow print:shadow-none border border-slate-400">
        {/* Outer padding */}
        <div className="p-6">
          {/* Header */}
          {/* <div className="text-center border-b border-slate-400 pb-3">
            <h1 className="text-xl font-semibold tracking-wide">
              MADHUREKHA EYE CARE CENTRE
            </h1>
            <p className="text-[10px] mt-1">
              SONARI: E-501, Sonari East Layout, Near Subzi Sangh, Kali Puja
              Maidan, Jamshedpur - 831011
            </p>
            <p className="text-[9px]">
              PAN : ABFFM3115J &nbsp; | &nbsp; Reg. No: 2035700023
            </p>
          </div> */}
          <div className="border-b border-slate-400 pb-3">
            <div className="flex items-center justify-between">
              {/* Left logo */}
              <div className="w-16 h-16 flex-shrink-0">
                <img
                  src="/logo-left.png"
                  alt="Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>

              {/* Center content */}
              <div className="flex-1 text-center px-4">
                <h1 className="text-xl font-semibold tracking-wide">
                  MADHUREKHA EYE CARE CENTRE
                </h1>
                <p className="text-[10px] mt-1">
                  SONARI: E-501, Sonari East Layout, Near Subzi Sangh, Kali Puja
                  Maidan, Jamshedpur - 831011
                </p>
                <p className="text-[9px]">
                  PAN : ABFFM3115J &nbsp; | &nbsp; Reg. No: 2035700023
                </p>
              </div>

              {/* Right logo */}
              <div className="w-16 h-16 flex-shrink-0">
                <img
                  src="/logo-right.png"
                  alt="Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            </div>
          </div>

          {/* Doctors row */}
          <div className="flex justify-between text-[9px] mt-1 mb-2">
            <div>
              <div className="font-semibold">Dr. Pradipta Kundu</div>
              <div className="mt-0.5">
                Reg. No.: {bill.doctorReg1 || "________"}
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold">Dr. (Mrs.) Amita Kundu</div>
              <div className="mt-0.5">
                Reg. No.: {bill.doctorReg2 || "________"}
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="border-y border-slate-400 py-1 mb-3">
            <div className="text-center font-semibold text-[11px]">
              INVOICE CUM PAYMENT RECEIPT
            </div>
          </div>

          {/* Meta + patient info */}
          <div className="text-[10px] mb-2">
            {/* <div className="flex justify-between">
              <div>Invoice No.: {invoiceNo}</div>
              <div>Date: {dateText}</div>
            </div>
            <div className="flex justify-between mt-1">
              <div className="flex-1">
                Mr./Mrs.:{" "}
                <span className="font-semibold">{patientName}</span>
              </div>
              {bill.age != null && (
                <div className="w-32">Age: {bill.age} Years</div>
              )}
            </div> */}
            <div className="flex justify-between">
              <div>Invoice No.: {invoiceNo}</div>
              <div>Date: {dateText}</div>
            </div>
            <div className="flex justify-between mt-1">
              <div className="flex-1">
                Mr./Mrs.: <span className="font-semibold">{patientName}</span>
              </div>
              {bill.age != null && (
                <div>Age: {bill.age} Years</div>
              )}
            </div>

            <div className="mt-1">
              Address: {bill.address || <span>________________________</span>}
            </div>
          </div>

          {/* Items table */}
          <div className="mt-2 border border-slate-400">
            <div className="grid grid-cols-[32px_70px_auto_80px_80px_80px] bg-slate-100 border-b border-slate-400">
              <div className="px-2 py-1 border-r border-slate-400">Sr.</div>
              <div className="px-2 py-1 border-r border-slate-400">
                Hrs / Qty
              </div>
              <div className="px-2 py-1 border-r border-slate-400">Service</div>
              <div className="px-2 py-1 border-r border-slate-400 text-right">
                Rate / Price
              </div>
              <div className="px-2 py-1 border-r border-slate-400 text-right">
                Adjust
              </div>
              <div className="px-2 py-1 text-right">Sub Total</div>
            </div>

            {items.map((item, idx) => {
              const qty = Number(item.qty || 0);
              const rate = Number(item.rate || 0);
              const amount = Number(item.amount || qty * rate);
              return (
                <div
                  key={item.id || idx}
                  className="grid grid-cols-[32px_70px_auto_80px_80px_80px] border-t border-slate-200"
                >
                  <div className="px-2 py-1 border-r border-slate-200">
                    {idx + 1}
                  </div>
                  <div className="px-2 py-1 border-r border-slate-200">
                    {qty}
                  </div>
                  <div className="px-2 py-1 border-r border-slate-200">
                    {item.description}
                  </div>
                  <div className="px-2 py-1 border-r border-slate-200 text-right">
                    {formatMoney(rate)}
                  </div>
                  <div className="px-2 py-1 border-r border-slate-200 text-right">
                    0.00
                  </div>
                  <div className="px-2 py-1 text-right">
                    {formatMoney(amount)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary row */}
          <div className="mt-3 flex justify-end">
            <div className="w-64 border border-slate-400 text-[10px]">
              <div className="flex justify-between px-2 py-1 border-b border-slate-300">
                <span>Sub Total</span>
                <span>₹ {formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between px-2 py-1 border-b border-slate-300">
                <span>Adjust</span>
                <span>₹ {formatMoney(adjust)}</span>
              </div>
              <div className="flex justify-between px-2 py-1 border-b border-slate-300">
                <span>Tax</span>
                <span>₹ 0.00</span>
              </div>
              <div className="flex justify-between px-2 py-1 font-semibold">
                <span>Total Due</span>
                <span>₹ {formatMoney(total)}</span>
              </div>
            </div>
          </div>

          {/* Paid / Balance */}
          <div className="mt-2 text-[10px] flex justify-between">
            <div>Amount Paid: ₹ {formatMoney(paid)}</div>
            <div>Balance: ₹ {formatMoney(balance)}</div>
          </div>

          {/* Bottom receipt text */}
          <div className="mt-4 text-[10px]">
            <p className="mb-1">
              Received with thanks from Shri/Smt./M/s{" "}
              <span className="font-semibold">{patientName}</span> the sum of
              Rupees{" "}
              <span className="font-semibold">₹ {formatMoney(paid)}</span> dated{" "}
              {dateText} by{" "}
              <span className="font-semibold">{paymentMode || "________"}</span>{" "}
              / Bank / Transfer / Cheque No. / UPI
              {referenceNo && (
                <>
                  {" "}
                  (<span className="font-semibold">{referenceNo}</span>)
                </>
              )}
              .
            </p>
            <p className="mb-1">
              Drawn on{" "}
              <span className="underline decoration-dotted">
                {drawnOn || "________________________"}
              </span>{" "}
              (Subject to realization) as{" "}
              <span className="underline decoration-dotted">
                {drawnAs || "________________________"}
              </span>
              .
            </p>
            <p className="text-[9px]">
              * Dispute if any Subject to Jamshedpur Jurisdiction
            </p>
          </div>

          {/* Signatures */}
          <div className="mt-10 flex justify-between text-[9px]">
            <div className="w-48 text-center">
              <div className="border-b border-dotted border-slate-500 h-8" />
              <div className="mt-1">Patient / Representative</div>
            </div>
            <div className="w-56 text-center">
              <div className="border-b border-dotted border-slate-500 h-8" />
              <div className="mt-1">For Madhurekha Eye Care Centre</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
