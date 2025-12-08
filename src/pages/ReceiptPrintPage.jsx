// // src/pages/ReceiptPrintPage.jsx
// import { useParams } from "react-router-dom";
// import { useEffect, useState } from "react";
// import { apiFetch } from "../lib/api";

// function formatMoney(v) {
//   if (v == null) return "0.00";
//   return Number(v).toFixed(2);
// }

// export default function ReceiptPrintPage() {
//   const { paymentId } = useParams();
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const run = async () => {
//       try {
//         setLoading(true);
//         const res = await apiFetch(`/api/payments/${paymentId}`);
//         setData(res);
//         setError("");
//       } catch (e) {
//         setError(e.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     run();
//   }, [paymentId]);

//   if (loading) return <div className="p-8">Loading receipt...</div>;
//   if (error) return <div className="p-8 text-red-600">{error}</div>;
//   if (!data) return <div className="p-8">Receipt not found</div>;

//   const { bill } = data;
//   const patientName = bill.patientName || "__________";

//   const mode = data.mode || "Cash";
//   const referenceNo = data.referenceNo || "";
//   const drawnOn = data.drawnOn || "";
//   const drawnAs = data.drawnAs || "";

//   return (
//     <div
//       className="min-h-screen bg-slate-300 flex items-center justify-center print:bg-white print:min-h-0"
//       data-print-ready="1"
//     >
//       {/* A5 landscape */}
//       <div className="bg-white text-[10px] leading-tight w-[210mm] h-[80mm] mx-auto shadow print:shadow-none border border-slate-400 overflow-hidden">
//         <div className="p-3">
//           {/* Header with left/right logo (same style as invoice) */}
//           <div className="border-b border-slate-400 pb-1.5">
//             <div className="flex items-center justify-between">
//               {/* Left logo */}
//               <div className="w-12 h-12 flex-shrink-0">
//                 <img
//                   src="/logo-left.png"
//                   alt="Logo"
//                   className="w-full h-full object-contain"
//                   onError={(e) => {
//                     e.target.style.display = "none";
//                   }}
//                 />
//               </div>

//               {/* Center text */}
//               <div className="flex-1 text-center px-4">
//                 <h1 className="text-sm font-semibold tracking-wide">
//                   MADHUREKHA EYE CARE CENTRE
//                 </h1>
//                 <p className="text-[9px] mt-0.5">
//                   SONARI: E-501, Sonari East Layout, Near Subzi Sangh, Kali
//                   Puja Maidan, Jamshedpur - 831011
//                 </p>
//                 <p className="text-[8px] mt-0.5">
//                   PAN : ABFFM3115J &nbsp; | &nbsp; Reg. No: 2035700023
//                 </p>
//               </div>

//               {/* Right logo */}
//               <div className="w-12 h-12 flex-shrink-0">
//                 <img
//                   src="/logo-right.png"
//                   alt="Logo"
//                   className="w-full h-full object-contain"
//                   onError={(e) => {
//                     e.target.style.display = "none";
//                   }}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Title */}
//           <div className="border-b border-slate-400 py-0.5 mb-1.5">
//             <div className="text-center font-semibold text-[10px]">
//               PAYMENT RECEIPT
//             </div>
//           </div>

//           {/* Meta row */}
//           <div className="flex justify-between text-[9px] mb-1.5">
//             <div>Receipt No.: {data.receiptNo}</div>
//             <div>Date: {data.paymentDate}</div>
//           </div>

//           {/* Main row: description + bill summary box */}
//           <div className="flex justify-between gap-4">
//             {/* Left: text block */}
//             <div className="flex-1 text-[9px] space-y-1">
//               <p className="mb-1">
//                 Received with thanks from Shri/Smt./M/s{" "}
//                 <span className="font-semibold">{patientName}</span> the sum of
//                 Rupees{" "}
//                 <span className="font-semibold">
//                   ₹ {formatMoney(data.amount)}
//                 </span>{" "}
//                 by <span className="font-semibold">{mode}</span> / Bank /
//                 Transfer / Cheque No. / UPI
//                 {referenceNo && (
//                   <>
//                     {" "}
//                     (<span className="font-semibold">{referenceNo}</span>)
//                   </>
//                 )}
//                 .
//               </p>

//               {/* Drawn on / as line styled like invoice */}
//               <p className="mb-1">
//                 Drawn on{" "}
//                 <span className="underline decoration-dotted">
//                   {drawnOn || "________________________"}
//                 </span>{" "}
//                 (Subject to realization) as{" "}
//                 <span className="underline decoration-dotted">
//                   {drawnAs || "________________________"}
//                 </span>{" "}
//                 towards consultation / services.
//               </p>

//               <p className="text-[8px] mt-2">
//                 * Dispute if any Subject to Jamshedpur Jurisdiction
//               </p>
//             </div>

//             {/* Right: Bill summary box */}
//             <div className="w-52 border border-slate-400 text-[9px]">
//               <div className="px-2 py-0.5 border-b border-slate-300 font-semibold">
//                 Bill Summary
//               </div>
//               <div className="px-2 py-0.5 border-b border-slate-200">
//                 Bill No.: {String(bill.id).padStart(4, "0")}
//               </div>
//               <div className="px-2 py-0.5 border-b border-slate-200">
//                 Bill Date: {bill.date}
//               </div>
//               <div className="px-2 py-0.5 border-b border-slate-200">
//                 Bill Total: ₹ {formatMoney(bill.total)}
//               </div>
//               <div className="px-2 py-0.5 border-b border-slate-200">
//                 Paid (incl. this): ₹ {formatMoney(bill.paid)}
//               </div>
//               <div className="px-2 py-0.5">
//                 Balance: ₹ {formatMoney(bill.balance)}
//               </div>
//             </div>
//           </div>

//           {/* Signatures */}
//           <div className="mt-6 flex justify-between text-[8px]">
//             <div className="w-48 text-center">
//               <div className="border-b border-dotted border-slate-500 h-6" />
//               <div className="mt-0.5">Patient / Representative</div>
//             </div>
//             <div className="w-52 text-center">
//               <div className="border-b border-dotted border-slate-500 h-6" />
//               <div className="mt-0.5">For Madhurekha Eye Care Centre</div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
















// src/pages/ReceiptPrintPage.jsx
import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

function formatMoney(v) {
  if (v == null) return "0.00";
  return Number(v).toFixed(2);
}

export default function ReceiptPrintPage() {
  const { paymentId } = useParams();
  const location = useLocation();
  const search = new URLSearchParams(location.search);
  const isPdf = search.get("pdf") === "1";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const res = await apiFetch(`/api/payments/${paymentId}`);
        setData(res);
        setError("");
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [paymentId]);

  if (loading) return <div className="p-8">Loading receipt...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!data) return <div className="p-8">Receipt not found</div>;

  const { bill } = data;
  const patientName = bill.patientName || "__________";

  const mode = data.mode || "Cash";
  const referenceNo = data.referenceNo || "";
  const drawnOn = data.drawnOn || "";
  const drawnAs = data.drawnAs || "";

  const outerClass = isPdf
    ? "bg-white flex justify-center"
    : "min-h-screen bg-slate-300 flex items-center justify-center print:bg-white print:min-h-0";

  return (
    <div className={outerClass} data-print-ready="1">
      {/* A5-ish landscape: 210mm x 80mm (height controlled by Playwright) */}
      <div className="bg-white text-[10px] leading-tight w-[210mm] h-[148mm] mx-auto shadow print:shadow-none border border-slate-400 overflow-hidden">
        <div className="p-3">
          {/* Header with left/right logo (same style as invoice) */}
          <div className="border-b border-slate-400 pb-1.5">
            <div className="flex items-center justify-between">
              {/* Left logo */}
              <div className="w-12 h-12 flex-shrink-0">
                <img
                  src="/logo-left.png"
                  alt="Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>

              {/* Center text */}
              <div className="flex-1 text-center px-4">
                <h1 className="text-sm font-semibold tracking-wide">
                  MADHUREKHA EYE CARE CENTRE
                </h1>
                <p className="text-[9px] mt-0.5">
                  SONARI: E-501, Sonari East Layout, Near Subzi Sangh, Kali
                  Puja Maidan, Jamshedpur - 831011
                </p>
                <p className="text-[8px] mt-0.5">
                  PAN : ABFFM3115J &nbsp; | &nbsp; Reg. No: 2035700023
                </p>
              </div>

              {/* Right logo */}
              <div className="w-12 h-12 flex-shrink-0">
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

          {/* Title */}
          <div className="border-b border-slate-400 py-0.5 mb-1.5">
            <div className="text-center font-semibold text-[10px]">
              PAYMENT RECEIPT
            </div>
          </div>

          {/* Meta row */}
          <div className="flex justify-between text-[9px] mb-1.5">
            <div>Receipt No.: {data.receiptNo}</div>
            <div>Date: {data.paymentDate}</div>
          </div>

          {/* Main row: description + bill summary box */}
          <div className="flex justify-between gap-4">
            {/* Left: text block */}
            <div className="flex-1 text-[9px] space-y-1">
              <p className="mb-1">
                Received with thanks from Shri/Smt./M/s{" "}
                <span className="font-semibold">{patientName}</span> the sum of
                Rupees{" "}
                <span className="font-semibold">
                  ₹ {formatMoney(data.amount)}
                </span>{" "}
                by <span className="font-semibold">{mode}</span> / Bank /
                Transfer / Cheque No. / UPI
                {referenceNo && (
                  <>
                    {" "}
                    (<span className="font-semibold">{referenceNo}</span>)
                  </>
                )}
                .
              </p>

              {/* Drawn on / as line styled like invoice */}
              <p className="mb-1">
                Drawn on{" "}
                <span className="underline decoration-dotted">
                  {drawnOn || "________________________"}
                </span>{" "}
                (Subject to realization) as{" "}
                <span className="underline decoration-dotted">
                  {drawnAs || "________________________"}
                </span>{" "}
                towards consultation / services.
              </p>

              <p className="text-[8px] mt-2">
                * Dispute if any Subject to Jamshedpur Jurisdiction
              </p>
            </div>

            {/* Right: Bill summary box */}
            <div className="w-52 border border-slate-400 text-[9px]">
              <div className="px-2 py-0.5 border-b border-slate-300 font-semibold">
                Bill Summary
              </div>
              <div className="px-2 py-0.5 border-b border-slate-200">
                Bill No.: {String(bill.id).padStart(4, "0")}
              </div>
              <div className="px-2 py-0.5 border-b border-slate-200">
                Bill Date: {bill.date}
              </div>
              <div className="px-2 py-0.5 border-b border-slate-200">
                Bill Total: ₹ {formatMoney(bill.total)}
              </div>
              <div className="px-2 py-0.5 border-b border-slate-200">
                Paid (incl. this): ₹ {formatMoney(bill.paid)}
              </div>
              <div className="px-2 py-0.5">
                Balance: ₹ {formatMoney(bill.balance)}
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="mt-6 flex justify-between text-[8px]">
            <div className="w-48 text-center">
              <div className="border-b border-dotted border-slate-500 h-6" />
              <div className="mt-0.5">Patient / Representative</div>
            </div>
            <div className="w-52 text-center">
              <div className="border-b border-dotted border-slate-500 h-6" />
              <div className="mt-0.5">For Madhurekha Eye Care Centre</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
