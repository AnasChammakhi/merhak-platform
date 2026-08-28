import { useState, useEffect } from "react";
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
import { apiFetch } from "../lib/api";

const ALL_PRODUCTS = [
  {
    id: 1,
    name: "Chemise Col Officier en Lin Pur",
    gender: "homme",
    category: "Chemises",
    price: 145.0,
    fabric: "100% Lin naturel",
    image:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
    description: "Chemise homme à col mao en lin premium lavé, coupe décontractée.",
    badge: "Best-seller",
  },
  {
    id: 2,
    name: "Pantalon Coupe Droite en Lin & Coton",
    gender: "homme",
    category: "Pantalons",
    price: 180.0,
    fabric: "Mélange Lin & Coton",
    image:
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80",
    description: "Tombé fluide, taille avec cordon de serrage intérieur et poches italiennes.",
    badge: "Nouveau",
  },
  {
    id: 3,
    name: "Veste Saharienne en Lin Épais",
    gender: "homme",
    category: "Vestes",
    price: 290.0,
    fabric: "100% Lin lourd",
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
    description: "Veste d'atelier non doublée, 4 poches plaquées à rabat, idéale mi-saison.",
    badge: "Atelier",
  },
  {
    id: 4,
    name: "Tunique Gandoura Contemporaine",
    gender: "homme",
    category: "Tuniques",
    price: 160.0,
    fabric: "Coton peigné & Lin",
    image:
      "https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&w=800&q=80",
    description: "Coupe sobre et aérée, finitions coutures ton sur ton faites à la main.",
  },
  {
    id: 5,
    name: "Robe Longue Drapée en Lin & Soie",
    gender: "femme",
    category: "Robes",
    price: 260.0,
    fabric: "Soie & Lin",
    image:
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80",
    description: "Drapé vaporeux et silhouette sculptée, confectionnée dans notre atelier.",
    badge: "Exclusif",
  },
  {
    id: 6,
    name: "Chemisier Fluide en Coton Satiné",
    gender: "femme",
    category: "Chemises",
    price: 155.0,
    fabric: "100% Coton peigné",
    image:
      "https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=800&q=80",
    description: "Blouse élégante à manches raglan et boutons en nacre véritable.",
  },
  {
    id: 7,
    name: "Jupe Midi Évasée en Lin Pur",
    gender: "femme",
    category: "Jupes",
    price: 165.0,
    fabric: "100% Lin naturel",
    image:
      "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80",
    description: "Jupe à taille élastiquée et poches invisibles latérales, mouvement gracieux.",
  },
  {
    id: 8,
    name: "Veste Kimono d'Été en Lin",
    gender: "femme",
    category: "Vestes",
    price: 230.0,
    fabric: "Lin biologique",
    image:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80",
    description: "Veste kimono ceinturée à la taille, tombé structuré et moderne.",
    badge: "Coup de cœur",
  },
  {
    id: 9,
    name: "Pantalon Palazzo Évasé",
    gender: "femme",
    category: "Pantalons",
    price: 195.0,
    fabric: "Mélange Lin & Soie",
    image:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
    description: "Jambe large ultra-fluide pour une allure élancée et raffinée.",
  },
  {
    id: 10,
    name: "Costume 2 Pièces en Lin d'Atelier",
    gender: "homme",
    category: "Vestes",
    price: 420.0,
    fabric: "100% Lin pur tissé",
    image:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80",
    description: "Veste tailleur déstructurée avec son pantalon assorti, sur-mesure disponible.",
    badge: "Sur-Mesure",
  },
];

const CATEGORIES_LIST = [
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

  const [products, setProducts] = useState(ALL_PRODUCTS);
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

  // Optionally fetch dynamic products from API
  useEffect(() => {
    apiFetch("/products")
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      })
      .catch(() => {
        // Fall back to sample products
      });
  }, []);

  const updateGender = (gender) => {
    setSelectedGender(gender);
    const newParams = new URLSearchParams(searchParams);
    if (gender === "all") {
      newParams.delete("gender");
    } else {
      newParams.set("gender", gender);
    }
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
        product.category.toLowerCase() === selectedCategory.toLowerCase();

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
  const getGenderCount = (g) => {
    if (g === "all") return products.length;
    return products.filter((p) => p.gender === g).length;
  };

  const getCategoryCount = (cat) => {
    if (cat === "Toutes les catégories") return products.length;
    return products.filter((p) => {
      const matchG = selectedGender === "all" || p.gender === selectedGender;
      return matchG && p.category.toLowerCase() === cat.toLowerCase();
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

              {/* GENDER FILTER */}
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#667785]">
                  Univers / Genre
                </p>
                <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-white p-1 border border-[#e5f1f8]">
                  {[
                    { id: "all", label: "Tous" },
                    { id: "homme", label: "Homme" },
                    { id: "femme", label: "Femme" },
                  ].map((g) => (
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
                  {CATEGORIES_LIST.map((cat) => {
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
                  Besoin d'une taille spéciale ?
                </h4>
                <p className="mt-1 text-xs text-[#667785]">
                  Nous confectionnons la pièce de votre choix à vos mesures.
                </p>
                <Link
                  to="/contact"
                  className="mt-3 inline-block w-full rounded-xl bg-[#0f73c4] py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#29b6f6]"
                >
                  Contacter l'atelier
                </Link>
              </div>
            </div>
          </aside>

          {/* ============================================================ */}
          {/* RIGHT PRODUCTS SECTION */}
          {/* ============================================================ */}
          <section className="lg:col-span-9">
            {/* Top Toolbar */}
            <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-[#e5f1f8] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Search Bar */}
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8ca0ad]" />
                <input
                  type="text"
                  placeholder="Rechercher une chemise, un pantalon, un tissu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-[#e5f1f8] bg-[#f7fbfe] py-2.5 pl-10 pr-4 text-xs text-[#10212f] placeholder-[#8ca0ad] outline-none transition focus:border-[#29b6f6] focus:bg-white"
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

              {/* Sort & Count */}
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <span className="hidden text-xs text-[#8ca0ad] md:inline">
                  <strong className="text-[#10212f] font-semibold">
                    {filteredProducts.length}
                  </strong>{" "}
                  pièce{filteredProducts.length > 1 ? "s" : ""}
                </span>

                <div className="flex items-center gap-2">
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
                    {/* Product Image */}
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#f7fbfe]">
                      <img
                        src={product.image}
                        alt={product.name}
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
                    </div>

                    {/* Details */}
                    <div className="flex flex-1 flex-col p-5">
                      <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-[#0f73c4]">
                        {product.category}
                      </div>

                      <h3 className="text-base font-semibold text-[#10212f]">
                        {product.name}
                      </h3>

                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#667785]">
                        {product.description}
                      </p>

                      <div className="mt-auto flex items-center justify-between pt-5 border-t border-[#f0f6fa]">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-[#8ca0ad]">
                            Prix
                          </span>
                          <p className="text-lg font-bold text-[#10212f]">
                            {product.price.toFixed(2)}{" "}
                            <span className="text-xs font-normal text-[#667785]">
                              TND
                            </span>
                          </p>
                        </div>

                        <Link
                          to="/contact"
                          className="inline-flex items-center gap-1 rounded-full bg-[#eef9ff] px-4 py-2 text-xs font-semibold text-[#0f73c4] transition hover:bg-[#0f73c4] hover:text-white"
                        >
                          <SparklesIcon className="h-3.5 w-3.5" />
                          Commander
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
                  Genre
                </p>
                <div className="grid grid-cols-3 gap-1 rounded-xl bg-[#f7fbfe] p-1 border border-[#e5f1f8]">
                  {["all", "homme", "femme"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => updateGender(g)}
                      className={`rounded-lg py-1.5 text-xs font-semibold capitalize ${
                        selectedGender === g
                          ? "bg-[#0f73c4] text-white"
                          : "text-[#667785]"
                      }`}
                    >
                      {g === "all" ? "Tous" : g}
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
                  {CATEGORIES_LIST.map((cat) => (
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
