import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  Squares2X2Icon,
  UsersIcon,
  ShoppingBagIcon,
  ScissorsIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";


import logoWhite from "../../assets/merhak logo white simple.png";
import sidebarBg from "../../assets/adminSideBarBg.jpg";

import {
  useAuth,
} from "../../context/AuthContext";


function AdminSidebar() {
  const navigate =
    useNavigate();

  const {
    user,
    logout,
  } = useAuth();


  const menuClass = ({
    isActive,
  }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${isActive
      ? "bg-white text-[#0f73c4]"
      : "text-white/70 hover:bg-white/10 hover:text-white"
    }`;


  async function handleLogout() {
    await logout();

    navigate(
      "/signin"
    );
  }


  return (
    <aside
      className="relative flex min-h-screen w-64 shrink-0 flex-col text-white"
      style={{
        backgroundImage: `url(${sidebarBg})`,
        backgroundSize: "cover",
        backgroundPosition: "right",
      }}
    >
      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-[#0f73c4]/60"></div>

      {/* Content wrapper */}
      <div className="relative z-10 flex h-full flex-col">
        <div className="border-b border-white/15 px-7 py-7">

          <img
            src={logoWhite}
            alt="MERHAK"
            className="h-10 w-auto"
          />

          <p className="mt-3 text-[10px] uppercase tracking-[0.25em] text-white/50">
            Administration
          </p>

        </div>


        <div className="border-b border-white/10 px-6 py-5">

          <p className="text-xs text-white/50">
            Connecté en tant que
          </p>

          <p className="mt-1 text-sm font-medium">
            {user?.name}
          </p>

        </div>


        <nav className="flex-1 space-y-2 p-4">

          <NavLink
            to="/admin"
            end
            className={
              menuClass
            }
          >
            <Squares2X2Icon className="h-5 w-5" />

            Tableau de bord
          </NavLink>


          <NavLink
            to="/admin/clients"
            className={
              menuClass
            }
          >
            <UsersIcon className="h-5 w-5" />

            Gestion des clients
          </NavLink>


          <NavLink
            to="/admin/orders"
            className={
              menuClass
            }
          >
            <ShoppingBagIcon className="h-5 w-5" />

            Gestion des commandes
          </NavLink>

          <NavLink
            to="/admin/custom-orders"
            className={
              menuClass
            }
          >
            <ScissorsIcon className="h-5 w-5" />

            Sur-Mesure
          </NavLink>

        </nav>


        <div className="border-t border-white/15 p-4">

          <button
            onClick={
              handleLogout
            }
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowRightStartOnRectangleIcon className="h-5 w-5" />

            Déconnexion
          </button>

        </div>
      </div>
    </aside>
  );
}


export default AdminSidebar;