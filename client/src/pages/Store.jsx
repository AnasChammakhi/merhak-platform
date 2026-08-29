import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ShoppingBagIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { apiFetch, getImageUrl, DEFAULT_PRODUCT_IMAGE } from "../lib/api";

const DEFAULT_CATEGORIES = [
  "Toutes les catégories",
  "Chemises",
  "Pantalons",
  "Robes",
  "Vestes",
  "Tuniques",
  "Jupes",
];

const FABRICS_LIST = [
  "Toutes les matières",
  "Lin",
  "Coton",
  "Soie",
  "Laine",
];

function Store() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [dbTree, setDbTree] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGender, setSelectedGender] = useState(
    searchParams.get("gender") || "all"
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "Toutes les catégories"
  );
  const [selectedFabric, setSelectedFabric] = useState("Toutes les matières");
  const [maxPrice, setMaxPrice] = useState(500);
  const [sortBy, setSortBy] = useState("default");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync state when URL search params change
  useEffect(() => {
    const genderParam = searchParams.get("gender");
    const categoryParam = searchParams.get("category");

    if (genderParam) {
      setSelectedGender(genderParam.toLowerCase());
    } else {
      setSelectedGender("all");
    }

    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory("Toutes les catégories");
    }
  }, [searchParams]);

  // Load dynamic categories from backend
  useEffect(() => {
    apiFetch("/categories")
      .then((data) => {
        if (data.categories && data.categories.length > 0) {
          setDbCategories(data.categories);
          setDbTree(data.tree || []);
        }
      })
      .catch(() => {});

    apiFetch("/products")
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      })
      .catch(() => {});
  }, []);

  // Compute dynamic category options based on selected gender / collection
  const categoriesList = useMemo(() => {
    if (dbCategories.length === 0) return DEFAULT_CATEGORIES;

    if (selectedGender !== "all") {
      const parent = dbTree.find(
        (r) => r.name.toLowerCase() === selectedGender.toLowerCase()
      );
      if (parent && parent.children && parent.children.length > 0) {
        return ["Toutes les catégories", ...parent.children.map((c) => c.name)];
      }
    }

    // Subcategories or all unique category names
    const subcats = dbCategories
      .filter((c) => c.parent_id !== null)
      .map((c) => c.name);
    const unique = Array.from(new Set(subcats));
    return unique.length > 0 ? ["Toutes les catégories", ...unique] : DEFAULT_CATEGORIES;
  }, [dbCategories, dbTree, selectedGender]);

  // Available Genders from DB roots or fallback
  const availableGenders = useMemo(() => {
    if (dbTree.length > 0) {
      const roots = dbTree.map((r) => ({
        id: r.name.toLowerCase(),
        label: r.name,
      }));
      return [{ id: "all", label: "Tous" }, ...roots];
    }
    return [
      { id: "all", label: "Tous" },
      { id: "homme", label: "Homme" },
      { id: "femme", label: "Femme" },
    ];
  }, [dbTree]);

  const updateGender = (gender) => {
    setSelectedGender(gender);
    setSelectedCategory("Toutes les catégories"); // Reset subcategory when switching gender
    const newParams = new URLSearchParams(searchParams);
    if (gender === "all") {
      newParams.delete("gender");
    } else {
      newParams.set("gender", gender);
    }
    newParams.delete("category");
    setSearchParams(newParams);
  };

  const updateCategory = (category) => {
    setSelectedCategory(category);
    const newParams = new URLSearchParams(searchParams);
    if (category === "Toutes les catégories") {
      newParams.delete("category");
    } else {
      newParams.set("category", category);
    }
    setSearchParams(newParams);
  };

  const visibleRootCategories = useMemo(() => {
    if (dbTree.length > 0) {
      return dbTree.map((root) => ({
        id: root.id,
        name: root.name,
        childNames: (root.children || []).map((child) => child.name),
      }));
    }

    return [
      { id: "homme", name: "Homme", childNames: ["Chemises", "Pantalons", "Vestes", "Tuniques"] },
      { id: "femme", name: "Femme", childNames: ["Robes", "Chemises", "Pantalons", "Jupes"] },
    ];
  }, [dbTree]);

  const currentRootCategories =
    selectedGender === "all"
      ? visibleRootCategories
      : visibleRootCategories.filter((root) => root.name.toLowerCase() === selectedGender.toLowerCase());

  const resetFilters = () => {
    setSelectedGender("all");
    setSelectedCategory("Toutes les catégories");
    setSelectedFabric("Toutes les matières");
    setMaxPrice(500);
    setSearchQuery("");
    setSearchParams(new URLSearchParams());
  };

  const activeFiltersCount =
    (selectedGender !== "all" ? 1 : 0) +
    (selectedCategory !== "Toutes les catégories" ? 1 : 0) +
    (selectedFabric !== "Toutes les matières" ? 1 : 0) +
    (searchQuery.trim() !== "" ? 1 : 0) +
    (maxPrice < 500 ? 1 : 0);

  // Filtering logic
  const filteredProducts = products
    .filter((product) => {
      const matchesGender =
        selectedGender === "all" ||
        !product.gender ||
        product.gender.toLowerCase() === selectedGender.toLowerCase();

      const matchesCategory =
        selectedCategory === "Toutes les catégories" ||
        (product.category &&
          product.category.toLowerCase().includes(selectedCategory.toLowerCase()));

      const matchesFabric =
        selectedFabric === "Toutes les matières" ||
        (product.fabric &&
          product.fabric.toLowerCase().includes(selectedFabric.toLowerCase()));

      const matchesPrice = product.price <= maxPrice;

      const matchesSearch =
        searchQuery === "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.fabric &&
          product.fabric.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.description &&
          product.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return (
        matchesGender &&
        matchesCategory &&
        matchesFabric &&
        matchesPrice &&
        matchesSearch
      );
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      return 0;
    });

  // Calculate dynamic counts for sidebar
  const getCategoryCount = (cat) => {
    if (cat === "Toutes les catégories") {
      if (selectedGender === "all") return products.length;
      return products.filter((p) => p.gender === selectedGender).length;
    }
    return products.filter((p) => {
      const matchG = selectedGender === "all" || p.gender === selectedGender;
      return (
        matchG &&
        p.category &&
        p.category.toLowerCase().includes(cat.toLowerCase())
      );
    }).length;
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Header Banner */}
      <section className="border-b border-[#e5f1f8] bg-[#f7fbfe] py-12">
        <div className="merhak-container">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0f73c4]">
                <Link to="/" className="hover:underline">
                  Accueil
                </Link>
                <span>/</span>
                <span>Boutique</span>
                {selectedGender !== "all" && (
                  <>
                    <span>/</span>
                    <span className="capitalize">{selectedGender}</span>
                  </>
                )}
                {selectedCategory !== "Toutes les catégories" && (
                  <>
                    <span>/</span>
                    <span>{selectedCategory}</span>
                  </>
                )}
              </div>

              <h1 className="mt-2 text-3xl font-light text-[#10212f] md:text-4xl">
                {selectedGender === "homme" ? (
                  <>
                    Collection <span className="font-semibold text-[#0f73c4]">Homme</span>
                  </>
                ) : selectedGender === "femme" ? (
                  <>
                    Collection <span className="font-semibold text-[#0f73c4]">Femme</span>
                  </>
                ) : (
                  <>
                    Boutique & <span className="font-semibold text-[#0f73c4]">Atelier</span>
                  </>
                )}
              </h1>
            </div>

            <p className="max-w-md text-sm text-[#667785]">
              Matières naturelles sélectionnées, coupes fluides et finitions faites pour durer.
            </p>
          </div>

        </div>
      </section>

      {/* Main E-Commerce Content */}
      <main className="merhak-container py-10">
        {/* Mobile Filter Toggle */}
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-[#dcecf6] bg-white px-5 py-2.5 text-sm font-semibold text-[#0f73c4] shadow-sm"
          >
            <FunnelIcon className="h-4 w-4" />
            <span>Filtres</span>
            {activeFiltersCount > 0 && (
              <span className="rounded-full bg-[#0f73c4] px-2 py-0.5 text-xs text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <span className="text-xs font-medium text-[#667785]">
            {filteredProducts.length} article{filteredProducts.length > 1 ? "s" : ""}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* ============================================================ */}
          {/* LEFT SIDEBAR FILTERS (Desktop) */}
          {/* ============================================================ */}
          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-28 space-y-8 rounded-3xl border border-[#e5f1f8] bg-[#f7fbfe]/70 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-[#e5f1f8] pb-4">
                <h3 className="text-base font-bold text-[#10212f] flex items-center gap-2">
                  <AdjustmentsHorizontalIcon className="h-5 w-5 text-[#0f73c4]" />
                  Filtres
                </h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="text-xs font-semibold text-[#0f73c4] hover:underline"
                  >
                    Effacer ({activeFiltersCount})
                  </button>
                )}
              </div>

              {/* GENDER / ROOT COLLECTIONS FILTER */}
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#667785]">
                  Univers / Collection
                </p>
                <div
                  className={`grid gap-1.5 rounded-2xl bg-white p-1 border border-[#e5f1f8] ${
                    availableGenders.length <= 3 ? "grid-cols-3" : "grid-cols-2"
                  }`}
                >
                  {availableGenders.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => updateGender(g.id)}
                      className={`rounded-xl py-2 text-xs font-semibold transition ${
                        selectedGender === g.id
                          ? "bg-[#0f73c4] text-white shadow-sm"
                          : "text-[#667785] hover:bg-[#f7fbfe] hover:text-[#10212f]"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* CATEGORIES LIST */}
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#667785]">
                  Catégories
                </p>
                <ul className="space-y-1">
                  {categoriesList.map((cat) => {
                    const count = getCategoryCount(cat);
                    const isSelected = selectedCategory === cat;
                    return (
                      <li key={cat}>
                        <button
                          type="button"
                          onClick={() => updateCategory(cat)}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition ${
                            isSelected
                              ? "bg-white font-semibold text-[#0f73c4] shadow-sm border border-[#e5f1f8]"
                              : "text-[#10212f] hover:bg-white/60 hover:text-[#0f73c4]"
                          }`}
                        >
                          <span>{cat}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] ${
                              isSelected
                                ? "bg-[#eef9ff] text-[#0f73c4]"
                                : "text-[#8ca0ad]"
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* FABRIC FILTER */}
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#667785]">
                  Matière & Tissu
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {FABRICS_LIST.map((fabric) => {
                    const isSelected = selectedFabric === fabric;
                    return (
                      <button
                        key={fabric}
                        type="button"
                        onClick={() => setSelectedFabric(fabric)}
                        className={`rounded-full px-3 py-1.5 text-xs transition ${
                          isSelected
                            ? "bg-[#0f73c4] font-medium text-white shadow-sm"
                            : "bg-white border border-[#e5f1f8] text-[#667785] hover:border-[#0f73c4] hover:text-[#0f73c4]"
                        }`}
                      >
                        {fabric}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PRICE RANGE */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#667785]">
                    Prix max
                  </p>
                  <span className="text-xs font-bold text-[#10212f]">
                    {maxPrice} TND
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="500"
                  step="10"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-[#dcecf6] accent-[#0f73c4]"
                />
              </div>

              {/* Bespoke Callout */}
              <div className="rounded-2xl border border-[#dcecf6] bg-gradient-to-br from-white to-[#eef9ff] p-4 text-center">
                <SparklesIcon className="mx-auto h-6 w-6 text-[#0f73c4]" />
                <h4 className="mt-2 text-xs font-bold uppercase tracking-wider text-[#10212f]">
                  Besoin d'une coupe spéciale ?
                </h4>
                <p className="mt-1 text-xs text-[#667785]">
                  Nous adaptons chaque modèle à vos mensurations exactes.
                </p>
                <Link
                  to="/contact"
                  className="mt-3 inline-block w-full rounded-xl bg-[#0f73c4] py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#29b6f6]"
                >
                  Demander du sur-mesure
                </Link>
              </div>
            </div>
          </aside>

          {/* ============================================================ */}
          {/* RIGHT PRODUCTS SECTION */}
          {/* ============================================================ */}
          <section className="lg:col-span-9">
            <div className="mb-6 flex items-center justify-between rounded-3xl border border-[#e5f1f8] bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative w-full max-w-md">
                  <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8ca0ad]" />
                  <input
                    type="text"
                    placeholder="Rechercher dans la boutique..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-full border border-[#e5f1f8] bg-[#f7fbfe] py-2.5 pl-10 pr-10 text-xs text-[#10212f] placeholder-[#8ca0ad] outline-none transition focus:border-[#29b6f6] focus:bg-white"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8ca0ad] hover:text-[#10212f]"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden text-xs text-[#8ca0ad] md:inline">
                  <strong className="text-[#10212f] font-semibold">{filteredProducts.length}</strong>{" "}
                  pièce{filteredProducts.length > 1 ? "s" : ""}
                </span>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-full border border-[#e5f1f8] bg-[#f7fbfe] px-4 py-2.5 text-xs font-medium text-[#10212f] outline-none transition focus:border-[#29b6f6]"
                >
                  <option value="default">Tri: Sélection</option>
                  <option value="price-asc">Prix: Croissant</option>
                  <option value="price-desc">Prix: Décroissant</option>
                  <option value="name-asc">Nom: A &rarr; Z</option>
                </select>
              </div>
            </div>

            {/* Active Filters Bar */}
            {activeFiltersCount > 0 && (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-[#8ca0ad]">
                  Filtres actifs:
                </span>

                {selectedGender !== "all" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#eef9ff] px-3 py-1 text-xs font-semibold capitalize text-[#0f73c4]">
                    {selectedGender}
                    <button
                      onClick={() => updateGender("all")}
                      className="hover:text-red-500"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}

                {selectedCategory !== "Toutes les catégories" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#eef9ff] px-3 py-1 text-xs font-semibold text-[#0f73c4]">
                    {selectedCategory}
                    <button
                      onClick={() => updateCategory("Toutes les catégories")}
                      className="hover:text-red-500"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}

                {selectedFabric !== "Toutes les matières" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#eef9ff] px-3 py-1 text-xs font-semibold text-[#0f73c4]">
                    {selectedFabric}
                    <button
                      onClick={() => setSelectedFabric("Toutes les matières")}
                      className="hover:text-red-500"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}

                {searchQuery && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#eef9ff] px-3 py-1 text-xs font-semibold text-[#0f73c4]">
                    "{searchQuery}"
                    <button
                      onClick={() => setSearchQuery("")}
                      className="hover:text-red-500"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}

                <button
                  onClick={resetFilters}
                  className="text-xs text-[#8ca0ad] underline hover:text-[#0f73c4]"
                >
                  Tout réinitialiser
                </button>
              </div>
            )}

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#dcecf6] bg-[#f7fbfe] p-16 text-center">
                <ShoppingBagIcon className="mx-auto h-12 w-12 text-[#29b6f6]" />
                <h3 className="mt-4 text-lg font-semibold text-[#10212f]">
                  Aucun article ne correspond à votre sélection
                </h3>
                <p className="mt-2 text-sm text-[#667785]">
                  Vérifiez vos filtres ou contactez notre atelier pour une confection sur-mesure.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-6 rounded-full bg-[#0f73c4] px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-[#29b6f6]"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group flex flex-col overflow-hidden rounded-3xl border border-[#e5f1f8] bg-white transition duration-300 hover:-translate-y-1 hover:border-[#29b6f6]/40 hover:shadow-xl hover:shadow-[#0f73c4]/5"
                  >
                    {/* Product Image Clickable */}
                    <Link
                      to={`/product/${product.id}`}
                      className="relative aspect-[4/5] w-full overflow-hidden bg-[#f7fbfe] block"
                    >
                      <img
                        src={getImageUrl(product.image || product.images?.[0])}
                        alt={product.name}
                        onError={(event) => {
                          event.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                        }}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />

                      {product.badge && (
                        <span className="absolute left-3.5 top-3.5 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-[#0f73c4] shadow-sm backdrop-blur-md">
                          {product.badge}
                        </span>
                      )}

                      {product.gender && (
                        <span className="absolute right-3.5 top-3.5 rounded-full bg-black/50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                          {product.gender}
                        </span>
                      )}

                      {product.fabric && (
                        <span className="absolute bottom-3.5 left-3.5 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-md">
                          {product.fabric}
                        </span>
                      )}
                    </Link>

                    {/* Details */}
                    <div className="flex flex-1 flex-col p-5">
                      <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-[#0f73c4]">
                        {product.category}
                      </div>

                      <Link
                        to={`/product/${product.id}`}
                        className="transition hover:text-[#0f73c4]"
                      >
                        <h3 className="text-base font-semibold text-[#10212f]">
                          {product.name}
                        </h3>
                      </Link>

                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#667785]">
                        {product.description}
                      </p>

                      <div className="mt-auto flex items-center justify-between pt-5 border-t border-[#f0f6fa]">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-[#8ca0ad]">
                            Prix
                          </span>
                          <p className="text-lg font-bold text-[#10212f]">
                            {Number(product.price).toFixed(2)}{" "}
                            <span className="text-xs font-normal text-[#667785]">
                              TND
                            </span>
                          </p>
                        </div>

                        <Link
                          to={`/product/${product.id}`}
                          className="inline-flex items-center gap-1 rounded-full bg-[#eef9ff] px-4 py-2 text-xs font-semibold text-[#0f73c4] transition hover:bg-[#0f73c4] hover:text-white"
                        >
                          <SparklesIcon className="h-3.5 w-3.5" />
                          Voir la pièce
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ============================================================ */}
      {/* MOBILE FILTERS MODAL / DRAWER */}
      {/* ============================================================ */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/50 backdrop-blur-sm lg:hidden">
          <div className="ml-auto flex h-full w-full max-w-xs flex-col bg-white p-6 shadow-2xl animate-in slide-in-from-right">
            <div className="flex items-center justify-between border-b border-[#e5f1f8] pb-4">
              <h3 className="text-base font-bold text-[#10212f]">Filtres</h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-full p-1 text-[#667785] hover:bg-[#f7fbfe]"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto py-4">
              {/* Gender */}
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#667785]">
                  Collection
                </p>
                <div
                  className={`grid gap-1 rounded-xl bg-[#f7fbfe] p-1 border border-[#e5f1f8] ${
                    availableGenders.length <= 3 ? "grid-cols-3" : "grid-cols-2"
                  }`}
                >
                  {availableGenders.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => updateGender(g.id)}
                      className={`rounded-lg py-1.5 text-xs font-semibold capitalize ${
                        selectedGender === g.id
                          ? "bg-[#0f73c4] text-white"
                          : "text-[#667785]"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#667785]">
                  Catégories
                </p>
                <div className="space-y-1">
                  {categoriesList.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => updateCategory(cat)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs ${
                        selectedCategory === cat
                          ? "bg-[#eef9ff] font-semibold text-[#0f73c4]"
                          : "text-[#10212f]"
                      }`}
                    >
                      <span>{cat}</span>
                      {selectedCategory === cat && (
                        <CheckIcon className="h-3.5 w-3.5 text-[#0f73c4]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fabric */}
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#667785]">
                  Matière
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {FABRICS_LIST.map((fabric) => (
                    <button
                      key={fabric}
                      type="button"
                      onClick={() => setSelectedFabric(fabric)}
                      className={`rounded-full px-3 py-1 text-xs ${
                        selectedFabric === fabric
                          ? "bg-[#0f73c4] text-white"
                          : "bg-[#f7fbfe] text-[#667785]"
                      }`}
                    >
                      {fabric}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-[#e5f1f8] pt-4">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full rounded-full bg-[#0f73c4] py-3 text-center text-sm font-semibold text-white shadow-md shadow-[#0f73c4]/20"
              >
                Afficher les résultats ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Store;
