export default function Topbar() {
  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6">
      <h2 className="text-sm md:text-base font-semibold">
        Billing Dashboard
      </h2>
      <div className="text-xs md:text-sm text-slate-500">
        Clinic User
      </div>
    </header>
  );
}
