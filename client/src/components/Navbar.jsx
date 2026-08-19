import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";


import logoBlue from "../assets/merhak logo blue simple.png";

import {
  useAuth,
} from "../context/AuthContext";


function Navbar() {
  const navigate =
    useNavigate();

  const {
    user,
    logout,
  } = useAuth();


  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);


  async function handleLogout() {
    try {
      await logout();

      navigate("/");
    } catch (error) {
      console.error(error);
    }
  }


  return (
    <header className="sticky top-0 z-50 border-b border-[#e5f1f8] bg-white/95 backdrop-blur-md">

      <div className="merhak-container">

        <nav className="flex h-20 items-center justify-between">

          <Link
            to="/"
            className="flex items-center"
          >
            <img
              src={logoBlue}
              alt="MERHAK"
              className="h-10 w-auto"
            />
          </Link>


          <div className="hidden items-center gap-10 md:flex">

            <Link
              to="/"
              className="nav-link"
            >
              Accueil
            </Link>

            <Link
              to="/about"
              className="nav-link"
            >
              À propos
            </Link>

            <Link
              to="/contact"
              className="nav-link"
            >
              Contact
            </Link>

          </div>


          <div className="hidden items-center gap-3 md:flex">

            {!user ? (
              <Link
                to="/signin"
                className="rounded-full bg-[#0f73c4] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#0f73c4]/20 transition-all hover:-translate-y-0.5 hover:bg-[#29b6f6] hover:shadow-lg hover:shadow-[#29b6f6]/30"
              >
                Se connecter
              </Link>
            ) : (
              <>
                {user.role ===
                  "ADMIN" && (
                  <Link
                    to="/admin"
                    className="rounded-full border border-[#0f73c4] px-5 py-2.5 text-sm font-semibold text-[#0f73c4] transition hover:bg-[#eef9ff]"
                  >
                    Administration
                  </Link>
                )}


                <div className="flex items-center gap-2 rounded-full bg-[#eef9ff] px-4 py-2.5">
                  <UserCircleIcon className="h-5 w-5 text-[#0f73c4]" />

                  <span className="text-sm font-medium text-[#10212f]">
                    {user.name}
                  </span>
                </div>


                <button
                  onClick={
                    handleLogout
                  }
                  className="flex items-center gap-2 rounded-full border border-[#dcecf6] px-4 py-2.5 text-sm text-[#0f73c4] transition hover:border-[#0f73c4] hover:bg-[#eef9ff]"
                >
                  <ArrowRightStartOnRectangleIcon className="h-4 w-4" />

                  Déconnexion
                </button>
              </>
            )}

          </div>


          <button
            onClick={() =>
              setMobileOpen(
                !mobileOpen
              )
            }
            className="rounded-xl p-2 text-[#0f73c4] md:hidden"
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

            <div className="flex flex-col gap-5">

              <Link
                to="/"
                onClick={() =>
                  setMobileOpen(
                    false
                  )
                }
              >
                Accueil
              </Link>

              <Link
                to="/about"
                onClick={() =>
                  setMobileOpen(
                    false
                  )
                }
              >
                À propos
              </Link>

              <Link
                to="/contact"
                onClick={() =>
                  setMobileOpen(
                    false
                  )
                }
              >
                Contact
              </Link>


              {!user ? (
                <Link
                  to="/signin"
                  className="block rounded-xl bg-[#0f73c4] px-5 py-3 text-center font-medium text-white shadow-sm shadow-[#0f73c4]/20 transition-all active:scale-95"
                >
                  Se connecter
                </Link>
              ) : (
                <>
                  <p className="text-sm text-[#667785]">
                    Bonjour{" "}
                    <strong className="text-[#10212f]">
                      {user.name}
                    </strong>
                  </p>


                  {user.role ===
                    "ADMIN" && (
                    <Link
                      to="/admin"
                      className="rounded-xl bg-[#eef9ff] px-5 py-3 text-center text-[#0f73c4]"
                    >
                      Administration
                    </Link>
                  )}


                  <button
                    onClick={
                      handleLogout
                    }
                    className="rounded-xl bg-[#0f73c4] px-5 py-3 text-white"
                  >
                    Déconnexion
                  </button>
                </>
              )}

            </div>

          </div>
        )}

      </div>

    </header>
  );
}


export default Navbar;