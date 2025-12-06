import Sidebar from "../components/layout/Sidebar.jsx";
import Topbar from "../components/layout/Topbar.jsx";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="w-screen h-screen flex overflow-hidden bg-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-6 overflow-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
 