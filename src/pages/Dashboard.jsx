export default function Dashboard() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Overview</h3>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-xs text-slate-500">Today&apos;s Collection</p>
          <p className="text-2xl font-bold mt-1">₹0.00</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-xs text-slate-500">Total Outstanding</p>
          <p className="text-2xl font-bold mt-1">₹0.00</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-xs text-slate-500">Bills Today</p>
          <p className="text-2xl font-bold mt-1">0</p>
        </div>
      </div>
    </div>
  );
}
