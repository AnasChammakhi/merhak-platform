import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import merhakLogo from "../assets/merhak logo blue simple.png";

import {
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";

function Navbar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) return null;

    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  });

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setMobileOpen(false);

    navigate("/");
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#e5f1f8] bg-white/95 backdrop-blur-md">
      <div className="merhak-container">
        <nav className="flex h-20 items-center justify-between">

          <Link
            to="/"
            className="flex items-center"
          >
            <img
              src={merhakLogo}
              alt="Merhak"
              className="h-12 w-auto md:h-14"
            />
          </Link>

          <div className="hidden items-center gap-10 md:flex">
            <Link
              to="/"
              className="text-sm font-medium text-[#10212f] transition hover:text-[#0f73c4]"
            >
              Accueil
            </Link>

            <Link
              to="/about"
              className="text-sm font-medium text-[#10212f] transition hover:text-[#0f73c4]"
            >
              À propos
            </Link>

            <Link
              to="/contact"
              className="text-sm font-medium text-[#10212f] transition hover:text-[#0f73c4]"
            >
              Contact
            </Link>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {!user ? (
              <Link
                to="/signin"
                className="rounded-full bg-[#0f73c4] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#29b6f6]"
              >
                Se connecter
              </Link>
            ) : (
              <>
                <div className="flex items-center gap-2 rounded-full bg-[#f1f9fe] px-4 py-2">
                  <UserCircleIcon className="h-5 w-5 text-[#0f73c4]" />

                  <span className="text-sm font-medium text-[#10212f]">
                    {user.firstName}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-full border border-[#dcecf6] px-4 py-2 text-sm text-[#0f73c4] transition hover:border-[#0f73c4] hover:bg-[#f1f9fe]"
                >
                  <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
                  Déconnexion
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-[#0f73c4] md:hidden"
          >
            {mobileOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </nav>

        {mobileOpen && (
          <div className="border-t border-[#e5f1f8] py-5 md:hidden">
            <div className="flex flex-col gap-4">
              <Link to="/" onClick={() => setMobileOpen(false)}>
                Accueil
              </Link>

              <Link to="/about" onClick={() => setMobileOpen(false)}>
                À propos
              </Link>

              <Link to="/contact" onClick={() => setMobileOpen(false)}>
                Contact
              </Link>

              {!user ? (
                <Link
                  to="/signin"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 rounded-xl bg-[#0f73c4] px-5 py-3 text-center text-white"
                >
                  Se connecter
                </Link>
              ) : (
                <button
                  onClick={handleLogout}
                  className="mt-2 rounded-xl bg-[#0f73c4] px-5 py-3 text-white"
                >
                  Déconnexion
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </header>
  );
}

export default Navbar;