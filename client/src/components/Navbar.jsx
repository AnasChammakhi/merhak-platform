import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightStartOnRectangleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

import logoBlue from "../assets/merhak logo blue simple.png";
import { useAuth } from "../context/AuthContext";

const BOUTIQUE_CATEGORIES = {
  homme: {
    title: "Homme",
    gender: "homme",
    description: "Élégance naturelle & coupes contemporaines",
    items: [
      { name: "Toute la collection Homme", category: "" },
      { name: "Chemises en lin & coton", category: "Chemises" },
      { name: "Pantalons & Bermudas", category: "Pantalons" },
      { name: "Vestes & Costumes", category: "Vestes" },
      { name: "Tuniques & Djellabas", category: "Tuniques" },
    ],
  },
  femme: {
    title: "Femme",
    gender: "femme",
    description: "Lignes fluides & matières nobles",
    items: [
      { name: "Toute la collection Femme", category: "" },
      { name: "Robes & Ensembles", category: "Robes" },
      { name: "Chemises & Blouses", category: "Chemises" },
      { name: "Pantalons & Jupes", category: "Pantalons" },
      { name: "Vestes & Kimonos", category: "Vestes" },
      { name: "Jupes fluides", category: "Jupes" },
    ],
  },
};

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileBoutiqueOpen, setMobileBoutiqueOpen] = useState(true);
  const [mobileHommeOpen, setMobileHommeOpen] = useState(true);
  const [mobileFemmeOpen, setMobileFemmeOpen] = useState(true);

  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  async function handleLogout() {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  }

  const handleCategoryClick = (gender, category) => {
    setDropdownOpen(false);
    setMobileOpen(false);
    const params = new URLSearchParams();
    if (gender) params.set("gender", gender);
    if (category) params.set("category", category);
    navigate(`/store?${params.toString()}`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#e5f1f8] bg-white/95 backdrop-blur-md">
      <div className="merhak-container">
        <nav className="flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={logoBlue} alt="MERHAK" className="h-10 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-8 lg:gap-10 md:flex">
            <Link to="/" className="nav-link">
              Accueil
            </Link>

            {/* Boutique Dropdown Trigger */}
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className={`nav-link inline-flex items-center gap-1.5 py-2 ${
                  dropdownOpen ? "text-[#0f73c4] font-semibold" : ""
                }`}
                aria-expanded={dropdownOpen}
              >
                <span>Boutique</span>
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180 text-[#0f73c4]" : "text-[#8ca0ad]"
                  }`}
                />
              </button>

              {/* Mega Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute left-1/2 top-full -translate-x-1/2 w-[620px] rounded-3xl border border-[#e5f1f8] bg-white p-6 shadow-2xl shadow-[#0f73c4]/15 ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-2 gap-6 divide-x divide-[#f0f6fa]">
                    {/* HOMME Column */}
                    <div className="pr-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-widest text-[#0f73c4]">
                            Collection
                          </span>
                          <h4 className="text-lg font-bold text-[#10212f]">
                            Homme
                          </h4>
                        </div>
                        <span className="rounded-full bg-[#eef9ff] px-2.5 py-0.5 text-[11px] font-semibold text-[#0f73c4]">
                          Atelier
                        </span>
                      </div>
                      <p className="mb-4 text-xs text-[#667785]">
                        {BOUTIQUE_CATEGORIES.homme.description}
                      </p>

                      <ul className="space-y-1.5">
                        {BOUTIQUE_CATEGORIES.homme.items.map((item, idx) => (
                          <li key={idx}>
                            <button
                              type="button"
                              onClick={() =>
                                handleCategoryClick("homme", item.category)
                              }
                              className="group flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-[#10212f] transition hover:bg-[#f7fbfe] hover:text-[#0f73c4]"
                            >
                              <span
                                className={
                                  idx === 0
                                    ? "font-semibold text-[#0f73c4]"
                                    : "font-normal"
                                }
                              >
                                {item.name}
                              </span>
                              <ChevronRightIcon className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100 group-hover:translate-x-0.5 text-[#0f73c4]" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* FEMME Column */}
                    <div className="pl-6">
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-widest text-[#29b6f6]">
                            Collection
                          </span>
                          <h4 className="text-lg font-bold text-[#10212f]">
                            Femme
                          </h4>
                        </div>
                        <span className="rounded-full bg-[#f0faff] px-2.5 py-0.5 text-[11px] font-semibold text-[#29b6f6]">
                          Couture
                        </span>
                      </div>
                      <p className="mb-4 text-xs text-[#667785]">
                        {BOUTIQUE_CATEGORIES.femme.description}
                      </p>

                      <ul className="space-y-1.5">
                        {BOUTIQUE_CATEGORIES.femme.items.map((item, idx) => (
                          <li key={idx}>
                            <button
                              type="button"
                              onClick={() =>
                                handleCategoryClick("femme", item.category)
                              }
                              className="group flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-[#10212f] transition hover:bg-[#f7fbfe] hover:text-[#0f73c4]"
                            >
                              <span
                                className={
                                  idx === 0
                                    ? "font-semibold text-[#0f73c4]"
                                    : "font-normal"
                                }
                              >
                                {item.name}
                              </span>
                              <ChevronRightIcon className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100 group-hover:translate-x-0.5 text-[#0f73c4]" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Bottom Bar */}
                  <div className="mt-5 border-t border-[#f0f6fa] pt-4">
                    <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#eef9ff] to-[#f7fbfe] p-3 text-xs">
                      <div className="flex items-center gap-2 text-[#0f73c4] font-medium">
                        <SparklesIcon className="h-4 w-4" />
                        <span>Création 100% personnalisée sur vos mesures</span>
                      </div>
                      <Link
                        to="/contact"
                        onClick={() => setDropdownOpen(false)}
                        className="font-semibold text-[#0f73c4] hover:underline"
                      >
                        Demander un devis &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link to="/about" className="nav-link">
              À propos
            </Link>

            <Link to="/contact" className="nav-link">
              Contact
            </Link>
          </div>

          {/* User / Auth Actions */}
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
                {user.role === "ADMIN" && (
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
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-full border border-[#dcecf6] px-4 py-2.5 text-sm text-[#0f73c4] transition hover:border-[#0f73c4] hover:bg-[#eef9ff]"
                >
                  <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
                  Déconnexion
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-xl p-2 text-[#0f73c4] md:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </nav>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="border-t border-[#e5f1f8] py-5 md:hidden">
            <div className="flex flex-col gap-4">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="font-medium text-[#10212f]"
              >
                Accueil
              </Link>

              {/* Mobile Boutique Dropdown / Accordion */}
              <div className="rounded-2xl border border-[#e5f1f8] bg-[#f7fbfe] p-3">
                <button
                  type="button"
                  onClick={() => setMobileBoutiqueOpen(!mobileBoutiqueOpen)}
                  className="flex w-full items-center justify-between text-base font-semibold text-[#0f73c4]"
                >
                  <span>Boutique</span>
                  <ChevronDownIcon
                    className={`h-4 w-4 transition-transform ${
                      mobileBoutiqueOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {mobileBoutiqueOpen && (
                  <div className="mt-3 space-y-3 pt-2 border-t border-[#e5f1f8]/60">
                    <Link
                      to="/store"
                      onClick={() => setMobileOpen(false)}
                      className="block text-xs font-semibold uppercase tracking-wider text-[#0f73c4] hover:underline"
                    >
                      → Voir tous les articles
                    </Link>

                    {/* Mobile Homme */}
                    <div className="rounded-xl bg-white p-3 border border-[#e5f1f8]">
                      <button
                        type="button"
                        onClick={() => setMobileHommeOpen(!mobileHommeOpen)}
                        className="flex w-full items-center justify-between text-sm font-semibold text-[#10212f]"
                      >
                        <span>Homme</span>
                        <ChevronDownIcon
                          className={`h-3.5 w-3.5 text-[#8ca0ad] transition-transform ${
                            mobileHommeOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {mobileHommeOpen && (
                        <div className="mt-2 space-y-1.5 pl-2 border-l border-[#eef9ff]">
                          {BOUTIQUE_CATEGORIES.homme.items.map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() =>
                                handleCategoryClick("homme", item.category)
                              }
                              className="block w-full text-left text-xs text-[#667785] hover:text-[#0f73c4] py-1"
                            >
                              {item.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Mobile Femme */}
                    <div className="rounded-xl bg-white p-3 border border-[#e5f1f8]">
                      <button
                        type="button"
                        onClick={() => setMobileFemmeOpen(!mobileFemmeOpen)}
                        className="flex w-full items-center justify-between text-sm font-semibold text-[#10212f]"
                      >
                        <span>Femme</span>
                        <ChevronDownIcon
                          className={`h-3.5 w-3.5 text-[#8ca0ad] transition-transform ${
                            mobileFemmeOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {mobileFemmeOpen && (
                        <div className="mt-2 space-y-1.5 pl-2 border-l border-[#eef9ff]">
                          {BOUTIQUE_CATEGORIES.femme.items.map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() =>
                                handleCategoryClick("femme", item.category)
                              }
                              className="block w-full text-left text-xs text-[#667785] hover:text-[#0f73c4] py-1"
                            >
                              {item.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/about"
                onClick={() => setMobileOpen(false)}
                className="font-medium text-[#10212f]"
              >
                À propos
              </Link>

              <Link
                to="/contact"
                onClick={() => setMobileOpen(false)}
                className="font-medium text-[#10212f]"
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
                    <strong className="text-[#10212f]">{user.name}</strong>
                  </p>

                  {user.role === "ADMIN" && (
                    <Link
                      to="/admin"
                      className="rounded-xl bg-[#eef9ff] px-5 py-3 text-center text-[#0f73c4]"
                    >
                      Administration
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
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