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
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";

import logoBlue from "../assets/merhak logo blue simple.png";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";
import { useCart } from "../context/useCart";

const DEFAULT_BOUTIQUE = [
  {
    id: "homme",
    name: "Homme",
    gender: "homme",
    description: "Élégance naturelle & coupes contemporaines",
    children: [
      { name: "Chemises en lin & coton", category: "Chemises" },
      { name: "Pantalons & Bermudas", category: "Pantalons" },
      { name: "Vestes & Costumes", category: "Vestes" },
      { name: "Tuniques & Djellabas", category: "Tuniques" },
    ],
  },
  {
    id: "femme",
    name: "Femme",
    gender: "femme",
    description: "Lignes fluides & matières nobles",
    children: [
      { name: "Robes & Ensembles", category: "Robes" },
      { name: "Chemises & Blouses", category: "Chemises" },
      { name: "Pantalons & Jupes", category: "Pantalons" },
      { name: "Vestes & Kimonos", category: "Vestes" },
      { name: "Jupes fluides", category: "Jupes" },
    ],
  },
];

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileBoutiqueOpen, setMobileBoutiqueOpen] = useState(true);
  const [openMobileAccordions, setOpenMobileAccordions] = useState({});
  const [activeRootCategory, setActiveRootCategory] = useState(null);

  const [categoriesTree, setCategoriesTree] = useState(DEFAULT_BOUTIQUE);

  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);

  // Fetch dynamic categories
  useEffect(() => {
    apiFetch("/categories")
      .then((data) => {
        if (data.tree && data.tree.length > 0) {
          const formatted = data.tree.map((root) => ({
            id: root.id,
            name: root.name,
            gender: root.name.toLowerCase(),
            description: root.description || "Collection MERHAK",
            children: (root.children || []).map((sub) => ({
              id: sub.id,
              name: sub.name,
              category: sub.name,
            })),
          }));
          setCategoriesTree(formatted);
          setActiveRootCategory((prev) => prev || formatted[0]?.name || null);
        }
      })
      .catch(() => {
        setActiveRootCategory((prev) => prev || DEFAULT_BOUTIQUE[0]?.name || null);
      });
  }, []);

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

  const currentRootCategory =
    categoriesTree.find((root) => root.name === activeRootCategory) || categoriesTree[0] || DEFAULT_BOUTIQUE[0];

  const toggleMobileAccordion = (id) => {
    setOpenMobileAccordions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
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
                <div className="absolute left-1/2 top-full -translate-x-1/2 w-[700px] rounded-3xl border border-[#e5f1f8] bg-white p-6 shadow-2xl shadow-[#0f73c4]/15 ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="grid gap-6 md:grid-cols-[220px_1fr]">
                    <div className="rounded-2xl bg-[#f7fbfe] p-3">
                      <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#0f73c4]">
                        Catégories racines
                      </p>
                      <div className="space-y-2">
                        {categoriesTree.map((root) => (
                          <button
                            key={root.id || root.name}
                            type="button"
                            onMouseEnter={() => setActiveRootCategory(root.name)}
                            onClick={() => {
                              setActiveRootCategory(root.name);
                              handleCategoryClick(root.gender || root.name.toLowerCase(), "");
                            }}
                            className={`w-full rounded-2xl border px-3 py-2.5 text-left transition ${
                              activeRootCategory === root.name
                                ? "border-[#0f73c4] bg-[#eef9ff] text-[#0f73c4] shadow-sm"
                                : "border-transparent bg-white text-[#10212f] hover:border-[#dcecf6] hover:bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <div className="text-sm font-bold">{root.name}</div>
                                <div className="mt-0.5 text-[10px] uppercase tracking-wider text-[#8ca0ad]">
                                  {root.children?.length || 0} sous-catégories
                                </div>
                              </div>
                              <ChevronRightIcon className="h-4 w-4" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#e5f1f8] bg-white p-4">
                      {currentRootCategory && (
                        <>
                          <div className="mb-4 flex items-center justify-between gap-4">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-[#0f73c4]">
                                Collection
                              </span>
                              <h4 className="mt-1 text-xl font-bold text-[#10212f]">
                                {currentRootCategory.name}
                              </h4>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                handleCategoryClick(
                                  currentRootCategory.gender || currentRootCategory.name.toLowerCase(),
                                  ""
                                )
                              }
                              className="rounded-full bg-[#eef9ff] px-3 py-1.5 text-[11px] font-semibold text-[#0f73c4] hover:bg-[#0f73c4] hover:text-white transition"
                            >
                              Tout voir
                            </button>
                          </div>

                          <p className="mb-4 text-xs text-[#667785]">
                            {currentRootCategory.description}
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {currentRootCategory.children && currentRootCategory.children.length > 0 ? (
                              currentRootCategory.children.map((sub, index) => (
                                <button
                                  key={sub.id || `${currentRootCategory.name}-${sub.name}-${index}`}
                                  type="button"
                                  onClick={() =>
                                    handleCategoryClick(
                                      currentRootCategory.gender || currentRootCategory.name.toLowerCase(),
                                      sub.category || sub.name
                                    )
                                  }
                                  className="rounded-full border border-[#dcecf6] bg-[#f7fbfe] px-3 py-1.5 text-xs font-medium text-[#10212f] transition hover:border-[#0f73c4] hover:bg-[#eef9ff] hover:text-[#0f73c4]"
                                >
                                  {sub.name}
                                </button>
                              ))
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  handleCategoryClick(
                                    currentRootCategory.gender || currentRootCategory.name.toLowerCase(),
                                    ""
                                  )
                                }
                                className="rounded-full border border-[#dcecf6] bg-[#f7fbfe] px-3 py-1.5 text-xs font-medium text-[#10212f]"
                              >
                                Voir toute la collection
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 border-t border-[#f0f6fa] pt-4">
                    <div className="flex items-center justify-between rounded-2xl bg-linear-to-r from-[#eef9ff] to-[#f7fbfe] p-3 text-xs">
                      <div className="flex items-center gap-2 text-[#0f73c4] font-medium">
                        <SparklesIcon className="h-4 w-4" />
                        <span>Création 100% personnalisée sur vos mesures</span>
                      </div>
                      <Link
                        to="/contact"
                        onClick={() => setDropdownOpen(false)}
                        className="font-semibold text-[#0f73c4] hover:underline"
                      >
                        Demander du sur-mesure &rarr;
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
            <Link to="/cart" className="relative rounded-full p-2 text-[#0f73c4] hover:bg-[#eef9ff]" aria-label="Ouvrir le panier">
              <ShoppingBagIcon className="h-5 w-5" />
              {itemCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0f73c4] px-1 text-[10px] font-bold text-white">{itemCount}</span>}
            </Link>
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

              {/* Mobile Boutique Accordion */}
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

                    {/* Dynamic Sections */}
                    {categoriesTree.map((root) => {
                      const isOpen = openMobileAccordions[root.id] !== false;
                      return (
                        <div
                          key={root.id}
                          className="rounded-xl bg-white p-3 border border-[#e5f1f8]"
                        >
                          <button
                            type="button"
                            onClick={() => toggleMobileAccordion(root.id)}
                            className="flex w-full items-center justify-between text-sm font-semibold text-[#10212f]"
                          >
                            <span>{root.name}</span>
                            <ChevronDownIcon
                              className={`h-3.5 w-3.5 text-[#8ca0ad] transition-transform ${
                                isOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                          {isOpen && (
                            <div className="mt-2 space-y-1.5 pl-2 border-l border-[#eef9ff]">
                              <button
                                type="button"
                                onClick={() =>
                                  handleCategoryClick(root.gender || root.name.toLowerCase(), "")
                                }
                                className="block w-full text-left text-xs font-medium text-[#0f73c4] py-1"
                              >
                                Toute la collection {root.name}
                              </button>
                              {root.children &&
                                root.children.map((sub) => (
                                  <button
                                    key={sub.id || sub.name}
                                    type="button"
                                    onClick={() =>
                                      handleCategoryClick(
                                        root.gender || root.name.toLowerCase(),
                                        sub.category || sub.name
                                      )
                                    }
                                    className="block w-full text-left text-xs text-[#667785] hover:text-[#0f73c4] py-1"
                                  >
                                    {sub.name}
                                  </button>
                                ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
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

              <Link to="/cart" onClick={() => setMobileOpen(false)} className="flex items-center justify-between rounded-xl bg-[#eef9ff] px-4 py-3 font-semibold text-[#0f73c4]">
                <span className="flex items-center gap-2"><ShoppingBagIcon className="h-5 w-5" /> Panier</span>
                <span>{itemCount}</span>
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