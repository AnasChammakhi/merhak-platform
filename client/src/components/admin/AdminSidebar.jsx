import {
  Squares2X2Icon,
  UsersIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";

import { NavLink, useNavigate } from "react-router-dom";
import merhakLogoWhite from "../../assets/merhak logo white simple.png";

function AdminSidebar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/signin");
  }

  const menuClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
      isActive
        ? "bg-[#075a9c] text-white shadow-sm"
        : "text-white/70 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col bg-[#0f73c4] text-white">

      <div className="border-b border-white/15 px-7 py-7">
        <img
          src={merhakLogoWhite}
          alt="Merhak"
          className="h-14 w-auto"
        />
      </div>

      <nav className="flex-1 space-y-2 p-4">

        <NavLink
          to="/admin"
          end
          className={menuClass}
        >
          <Squares2X2Icon className="h-5 w-5" />
          Tableau de bord
        </NavLink>

        <NavLink
          to="/admin/clients"
          className={menuClass}
        >
          <UsersIcon className="h-5 w-5" />
          Gestion des clients
        </NavLink>

      </nav>

      <div className="border-t border-white/15 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
          Déconnexion
        </button>
      </div>

    </aside>
  );
}

export default AdminSidebar;