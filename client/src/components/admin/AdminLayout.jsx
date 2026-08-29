import { useEffect } from "react";
import {
  Outlet,
} from "react-router-dom";

import AdminSidebar from "./AdminSidebar";


function AdminLayout() {
  useEffect(() => {
    document.documentElement.style.fontSize = "16px";
    return () => {
      document.documentElement.style.fontSize = "";
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f7fbfe]">

      <AdminSidebar />

      <main className="min-w-0 flex-1">
        <Outlet />
      </main>

    </div>
  );
}


export default AdminLayout;