import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  SparklesIcon,
  ShoppingBagIcon,
  CheckBadgeIcon,
  TruckIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  HeartIcon,
  ShareIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { apiFetch, getImageUrl, DEFAULT_PRODUCT_IMAGE } from "../lib/api";

const DEFAULT_SIZES = ["S", "M", "L", "XL", "Sur-Mesure"];
const DEFAULT_COLORS = [
  { name: "Lin Naturel / Écru", hex: "#e2d7c3" },
  { name: "Blanc Craie", hex: "#f8f7f4" },
  { name: "Bleu Indigo", hex: "#1c3d5a" },
  { name: "Vert Sauge", hex: "#7a8b7b" },
];

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // User selections
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLORS[0]);
  const [quantity, setQuantity] = useState(1);

  // Visionary Order Modal State
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    city: "Tunis",
    note: "",
  });

  // Accordions
  const [openTab, setOpenTab] = useState("details"); // "details", "sizes", "shipping"

  // Fetch product data and suggestions
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setLoading(true);
    setOrderSuccess(false);

    apiFetch(`/products/${id}`)
      .then((data) => {
        if (data.product) {
          setProduct(data.product);
          setSuggestions(data.suggestions || []);
          setSelectedImage(0);
          if (data.product.sizes && data.product.sizes.length > 0) {
            setSelectedSize(data.product.sizes[0]);
          }
          if (data.product.colors && data.product.colors.length > 0) {
            setSelectedColor(data.product.colors[0]);
          }
        }
      })
      .catch(() => {
        // Fallback handled gracefully
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleOrderSubmit = (e) => {
    e.preventDefault();
    setOrderSuccess(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="merhak-container py-32 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#0f73c4] border-t-transparent"></div>
          <p className="mt-4 text-sm font-medium text-[#667785]">
            Chargement de la création MERHAK...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="merhak-container py-32 text-center">
          <ShoppingBagIcon className="mx-auto h-16 w-16 text-[#29b6f6]" />
          <h2 className="mt-4 text-2xl font-bold text-[#10212f]">
            Pièce introuvable
          </h2>
          <p className="mt-2 text-sm text-[#667785]">
            Cet article n'est plus disponible ou a été déplacé.
          </p>
          <Link
            to="/store"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0f73c4] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#29b6f6]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Retourner à la boutique
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const galleryImages =
    product.images && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : [
          "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=90",
        ];

  const availableSizes = product.sizes || DEFAULT_SIZES;
  const availableColors = product.colors || DEFAULT_COLORS;
  const totalPrice = (product.price * quantity).toFixed(2);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Breadcrumbs & Back Bar */}
      <div className="border-b border-[#e5f1f8] bg-[#f7fbfe]">
        <div className="merhak-container py-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Back button */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 font-semibold text-[#0f73c4] transition hover:text-[#29b6f6]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Retour aux articles</span>
          </button>

          {/* Breadcrumbs */}
          <div className="hidden sm:flex items-center gap-2 text-[#8ca0ad]">
            <Link to="/" className="hover:text-[#10212f]">
              Accueil
            </Link>
            <span>/</span>
            <Link to="/store" className="hover:text-[#10212f]">
              Boutique
            </Link>
            {product.gender && (
              <>
                <span>/</span>
                <Link
                  to={`/store?gender=${product.gender.toLowerCase()}`}
                  className="capitalize hover:text-[#10212f]"
                >
                  {product.gender}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="font-semibold text-[#10212f] max-w-[200px] truncate">
              {product.name}
            </span>
          </div>
        </div>
      </div>

      {/* Main Product Showcase */}
      <main className="merhak-container py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* ============================================================ */}
          {/* LEFT: IMAGE GALLERY                                          */}
          {/* ============================================================ */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnails */}
            {galleryImages.length > 1 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0">
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(idx)}
                    className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition ${
                      selectedImage === idx
                        ? "border-[#0f73c4] shadow-md ring-2 ring-[#0f73c4]/20"
                        : "border-[#e5f1f8] opacity-75 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={getImageUrl(imgUrl)}
                      alt={`${product.name} vue ${idx + 1}`}
                      onError={(event) => {
                        event.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                      }}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Featured Image */}
            <div className="relative flex-1 overflow-hidden rounded-3xl border border-[#e5f1f8] bg-[#f7fbfe] aspect-[4/5] shadow-sm">
              <img
                src={getImageUrl(galleryImages[selectedImage] || galleryImages[0])}
                alt={product.name}
                onError={(event) => {
                  event.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                }}
                className="h-full w-full object-cover transition duration-700 hover:scale-105"
              />

              {/* Badges */}
              <div className="absolute left-5 top-5 flex flex-col gap-2">
                {product.badge && (
                  <span className="rounded-full bg-white/95 px-3.5 py-1 text-xs font-bold text-[#0f73c4] shadow-md backdrop-blur-md">
                    {product.badge}
                  </span>
                )}
                {product.fabric && (
                  <span className="rounded-full bg-black/60 px-3.5 py-1 text-xs font-medium text-white backdrop-blur-md">
                    {product.fabric}
                  </span>
                )}
              </div>

              {product.gender && (
                <span className="absolute right-5 top-5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#10212f] shadow-sm">
                  {product.gender}
                </span>
              )}
            </div>
          </div>

          {/* ============================================================ */}
          {/* RIGHT: PRODUCT INFO & ORDER ACTIONS                          */}
          {/* ============================================================ */}
          <div className="lg:col-span-5 flex flex-col">
            {/* Category / Sub-heading */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-[#0f73c4]">
                {product.category || "Collection Atelier"}
              </span>

              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                <CheckBadgeIcon className="h-4 w-4" />
                En stock & sur-mesure
              </span>
            </div>

            {/* Title */}
            <h1 className="mt-2 text-3xl font-bold text-[#10212f] lg:text-4xl leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-[#0f73c4]">
                {Number(product.price).toFixed(2)}{" "}
                <span className="text-base font-medium text-[#667785]">TND</span>
              </span>
              <span className="text-xs text-[#8ca0ad]">TTC • Livraison incluse</span>
            </div>

            {/* Short Description */}
            <p className="mt-5 text-sm text-[#667785] leading-relaxed">
              {product.description ||
                "Une pièce d'exception façonnée dans notre atelier à partir de fibres naturelles sélectionnées pour leur tenue et leur douceur."}
            </p>

            <div className="my-6 border-t border-[#e5f1f8]" />

            {/* COLOR SELECTOR */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold uppercase tracking-wider text-[#10212f]">
                  Teinte / Couleur :
                </span>
                <span className="font-medium text-[#0f73c4]">
                  {selectedColor?.name}
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {availableColors.map((color, cIdx) => (
                  <button
                    key={cIdx}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    title={color.name}
                    className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                      selectedColor?.name === color.name
                        ? "border-[#0f73c4] bg-[#eef9ff] text-[#0f73c4] ring-1 ring-[#0f73c4]"
                        : "border-[#e5f1f8] bg-white text-[#667785] hover:border-[#0f73c4]"
                    }`}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-black/20"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span>{color.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* SIZE SELECTOR */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold uppercase tracking-wider text-[#10212f]">
                  Taille :
                </span>
                <Link
                  to="/contact"
                  className="font-medium text-[#0f73c4] hover:underline"
                >
                  Guide & prise de mesures &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {availableSizes.map((size) => {
                  const isSurMesure = size.toLowerCase().includes("sur-mesure");
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`relative rounded-2xl py-2.5 text-xs font-bold transition ${
                        isSelected
                          ? "bg-[#0f73c4] text-white shadow-md shadow-[#0f73c4]/20"
                          : "border border-[#e5f1f8] bg-[#f7fbfe] text-[#10212f] hover:border-[#0f73c4] hover:bg-white"
                      } ${isSurMesure ? "col-span-2 sm:col-span-1" : ""}`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>

              {selectedSize.toLowerCase().includes("sur-mesure") && (
                <div className="mt-3 flex items-center gap-2 rounded-2xl bg-[#eef9ff] p-3 text-xs text-[#0f73c4]">
                  <SparklesIcon className="h-4 w-4 shrink-0" />
                  <span>
                    Option <strong>Sur-Mesure</strong> sélectionnée : notre atelier ajustera chaque mesure à votre morphologie.
                  </span>
                </div>
              )}
            </div>

            {/* QUANTITY & PRIMARY ORDER ACTION */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {/* Quantity Counter */}
              <div className="flex items-center justify-between rounded-full border border-[#e5f1f8] bg-[#f7fbfe] px-4 py-2.5 sm:w-36">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-6 w-6 text-base font-bold text-[#667785] hover:text-[#10212f]"
                >
                  -
                </button>
                <span className="text-sm font-bold text-[#10212f]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-6 w-6 text-base font-bold text-[#667785] hover:text-[#10212f]"
                >
                  +
                </button>
              </div>

              {/* Order Button */}
              <button
                type="button"
                onClick={() => setOrderModalOpen(true)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#0f73c4] px-8 py-4 text-sm font-bold text-white shadow-lg shadow-[#0f73c4]/25 transition-all hover:bg-[#29b6f6] hover:shadow-xl hover:shadow-[#29b6f6]/30 active:scale-98"
              >
                <ShoppingBagIcon className="h-5 w-5" />
                <span>Commander cette pièce ({totalPrice} TND)</span>
              </button>
            </div>

            {/* Secondary Bespoke Link */}
            <div className="mt-4 text-center">
              <Link
                to="/contact"
                className="text-xs font-semibold text-[#0f73c4] hover:underline"
              >
                Vous préférez essayer ou personnaliser le tissu en atelier ? Prenez rendez-vous &rarr;
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 grid grid-cols-3 gap-3 rounded-2xl border border-[#e5f1f8] bg-[#f7fbfe]/80 p-4 text-center text-[11px]">
              <div>
                <TruckIcon className="mx-auto h-5 w-5 text-[#0f73c4]" />
                <p className="mt-1 font-bold text-[#10212f]">Livraison Rapide</p>
                <p className="text-[#8ca0ad]">Sur toute la Tunisie</p>
              </div>
              <div>
                <SparklesIcon className="mx-auto h-5 w-5 text-[#29b6f6]" />
                <p className="mt-1 font-bold text-[#10212f]">Confection Atelier</p>
                <p className="text-[#8ca0ad]">Matières 100% nobles</p>
              </div>
              <div>
                <ShieldCheckIcon className="mx-auto h-5 w-5 text-[#0f73c4]" />
                <p className="mt-1 font-bold text-[#10212f]">Garantie Qualité</p>
                <p className="text-[#8ca0ad]">Ajustements possibles</p>
              </div>
            </div>

            {/* TABS / ACCORDIONS */}
            <div className="mt-8 space-y-2">
              {/* Tab 1: Details */}
              <div className="rounded-2xl border border-[#e5f1f8] overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setOpenTab(openTab === "details" ? "" : "details")
                  }
                  className="flex w-full items-center justify-between bg-white p-4 text-xs font-bold text-[#10212f]"
                >
                  <span>Matière & Savoir-Faire</span>
                  <ChevronDownIcon
                    className={`h-4 w-4 text-[#8ca0ad] transition-transform ${
                      openTab === "details" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openTab === "details" && (
                  <div className="p-4 pt-0 text-xs text-[#667785] leading-relaxed border-t border-[#f7fbfe] bg-[#f7fbfe]/40">
                    <p>{product.details || "Toutes nos pièces sont coupées et assemblées avec soin par nos maîtres artisans. Nous privilégions les fibres naturelles pures pour leur confort thermique et leur durabilité."}</p>
                    <ul className="mt-2 list-disc list-inside space-y-1">
                      <li>Matière principale : {product.fabric || "Lin & Coton naturel"}</li>
                      <li>Finitions : Coutures rabattues et boutons haute qualité</li>
                      <li>Lavage recommandé : 30°C cycle délicat ou nettoyage doux</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Tab 2: Sizing Guide */}
              <div className="rounded-2xl border border-[#e5f1f8] overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setOpenTab(openTab === "sizes" ? "" : "sizes")
                  }
                  className="flex w-full items-center justify-between bg-white p-4 text-xs font-bold text-[#10212f]"
                >
                  <span>Guide des Tailles & Sur-Mesure</span>
                  <ChevronDownIcon
                    className={`h-4 w-4 text-[#8ca0ad] transition-transform ${
                      openTab === "sizes" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openTab === "sizes" && (
                  <div className="p-4 pt-0 text-xs text-[#667785] leading-relaxed border-t border-[#f7fbfe] bg-[#f7fbfe]/40">
                    <p>
                      Nos vêtements adoptent une coupe moderne et fluide. Si vous hésitez entre deux tailles, nous vous conseillons de choisir votre taille habituelle ou de sélectionner l'option <strong>Sur-Mesure</strong>.
                    </p>
                  </div>
                )}
              </div>

              {/* Tab 3: Shipping */}
              <div className="rounded-2xl border border-[#e5f1f8] overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setOpenTab(openTab === "shipping" ? "" : "shipping")
                  }
                  className="flex w-full items-center justify-between bg-white p-4 text-xs font-bold text-[#10212f]"
                >
                  <span>Livraison & Délais de Confection</span>
                  <ChevronDownIcon
                    className={`h-4 w-4 text-[#8ca0ad] transition-transform ${
                      openTab === "shipping" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openTab === "shipping" && (
                  <div className="p-4 pt-0 text-xs text-[#667785] leading-relaxed border-t border-[#f7fbfe] bg-[#f7fbfe]/40">
                    <p>
                      • Prêt-à-porter : Expédition sous 24 à 48 heures ouvrées.<br />
                      • Pièce sur-mesure : Confection artisanale sous 5 à 7 jours ouvrés.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RELATED PRODUCTS / SUGGESTIONS SECTION                       */}
        {/* ============================================================ */}
        {suggestions.length > 0 && (
          <section className="mt-24 pt-16 border-t border-[#e5f1f8]">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
              <div>
                <p className="section-label">Vous aimerez aussi</p>
                <h2 className="text-2xl font-bold text-[#10212f] md:text-3xl">
                  Suggestions de notre atelier
                </h2>
              </div>
              <Link
                to="/store"
                className="mt-3 sm:mt-0 text-xs font-bold text-[#0f73c4] hover:underline"
              >
                Voir toute la boutique &rarr;
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {suggestions.map((item) => (
                <Link
                  key={item.id}
                  to={`/product/${item.id}`}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-[#e5f1f8] bg-white transition duration-300 hover:-translate-y-1 hover:border-[#29b6f6]/50 hover:shadow-xl"
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#f7fbfe]">
                    <img
                      src={getImageUrl(item.image || item.images?.[0])}
                      alt={item.name}
                      onError={(event) => {
                        event.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                      }}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    {item.fabric && (
                      <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-md">
                        {item.fabric}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0f73c4]">
                      {item.category}
                    </span>
                    <h4 className="mt-1 text-sm font-semibold text-[#10212f] group-hover:text-[#0f73c4] transition line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="mt-auto pt-4 text-base font-bold text-[#10212f]">
                      {Number(item.price).toFixed(2)}{" "}
                      <span className="text-xs font-normal text-[#667785]">TND</span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ============================================================ */}
      {/* VISIONARY ORDER MODAL                                        */}
      {/* ============================================================ */}
      {orderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#e5f1f8] pb-4">
              <div className="flex items-center gap-2">
                <ShoppingBagIcon className="h-5 w-5 text-[#0f73c4]" />
                <h3 className="text-base font-bold text-[#10212f]">
                  Pré-commande de votre pièce
                </h3>
              </div>
              <button
                onClick={() => setOrderModalOpen(false)}
                className="rounded-full p-1 text-[#8ca0ad] hover:bg-[#f7fbfe] hover:text-[#10212f]"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {orderSuccess ? (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckIcon className="h-8 w-8" />
                </div>
                <h4 className="mt-4 text-lg font-bold text-[#10212f]">
                  Demande de commande enregistrée !
                </h4>
                <p className="mt-2 text-xs text-[#667785] leading-relaxed max-w-sm mx-auto">
                  Merci <strong>{customerInfo.name || "cher client"}</strong>. Notre atelier MERHAK vous contactera au{" "}
                  <strong>{customerInfo.phone || "votre numéro"}</strong> pour valider les mensurations, le tissu et convenir de la livraison.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setOrderModalOpen(false);
                      setOrderSuccess(false);
                    }}
                    className="rounded-full bg-[#0f73c4] px-8 py-3 text-xs font-bold text-white shadow-md transition hover:bg-[#29b6f6]"
                  >
                    Fermer et continuer
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleOrderSubmit} className="mt-6 space-y-4">
                {/* Summary Box */}
                <div className="flex items-center gap-4 rounded-2xl bg-[#f7fbfe] p-4 border border-[#e5f1f8]">
                  <img
                    src={galleryImages[0]}
                    alt={product.name}
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                  <div className="flex-1 text-xs">
                    <h4 className="font-bold text-[#10212f]">{product.name}</h4>
                    <p className="text-[#667785]">
                      Taille : <span className="font-semibold text-[#0f73c4]">{selectedSize}</span> | Couleur : <span className="font-semibold text-[#0f73c4]">{selectedColor?.name}</span>
                    </p>
                    <p className="mt-1 font-bold text-[#0f73c4]">
                      {quantity} × {Number(product.price).toFixed(2)} TND = {totalPrice} TND
                    </p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#10212f]">
                      Votre Nom complet <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Ahmed Ben Salem"
                      value={customerInfo.name}
                      onChange={(e) =>
                        setCustomerInfo({ ...customerInfo, name: e.target.value })
                      }
                      className="w-full rounded-xl border border-[#e5f1f8] bg-[#f7fbfe] px-3.5 py-2.5 text-xs text-[#10212f] outline-none focus:border-[#29b6f6] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#10212f]">
                      Numéro de Téléphone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ex: 98 123 456"
                      value={customerInfo.phone}
                      onChange={(e) =>
                        setCustomerInfo({ ...customerInfo, phone: e.target.value })
                      }
                      className="w-full rounded-xl border border-[#e5f1f8] bg-[#f7fbfe] px-3.5 py-2.5 text-xs text-[#10212f] outline-none focus:border-[#29b6f6] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-[#10212f]">
                    Ville / Adresse de livraison
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: La Marsa, Tunis..."
                    value={customerInfo.city}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, city: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#e5f1f8] bg-[#f7fbfe] px-3.5 py-2.5 text-xs text-[#10212f] outline-none focus:border-[#29b6f6] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-[#10212f]">
                    Note pour l'atelier (Optionnel)
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Précisions de mesures, longueur de manche souhaitée..."
                    value={customerInfo.note}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, note: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#e5f1f8] bg-[#f7fbfe] px-3.5 py-2 text-xs text-[#10212f] outline-none focus:border-[#29b6f6] focus:bg-white"
                  />
                </div>

                <div className="pt-3 border-t border-[#e5f1f8] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setOrderModalOpen(false)}
                    className="rounded-full border border-[#dcecf6] px-5 py-2.5 text-xs font-semibold text-[#667785] hover:bg-[#f7fbfe]"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-[#0f73c4] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-[#0f73c4]/20 transition hover:bg-[#29b6f6]"
                  >
                    Confirmer la commande ({totalPrice} TND)
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default ProductDetail;
