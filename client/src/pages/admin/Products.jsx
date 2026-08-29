import { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBagIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  PhotoIcon,
  ArrowUpTrayIcon,
  FolderIcon,
  CheckIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon,
  TagIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

import { apiFetch, getImageUrl } from "../../lib/api";

const emptyForm = {
  name: "",
  categoryId: "",
  description: "",
  price: "",
  cost: "",
  fabricType: "100% Lin naturel",
  deliveryCost: "0",
  packagingCost: "0",
  stock: "10",
  active: true,
  images: [],
  variants: [],
};

const FABRIC_SUGGESTIONS = [
  "100% Lin naturel",
  "Mélange Lin & Coton",
  "100% Coton peigné",
  "Soie & Lin",
  "Satin de Coton",
  "Lin lourd d'Atelier",
  "Laine légère & Lin",
  "Lin biologique",
];

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Filters & Search
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("general"); // "general", "pricing", "images", "variants"
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  // Image Upload state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const fileInputRef = useRef(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Load products and categories
  async function loadData() {
    try {
      setLoading(true);
      const [prodsData, catsData] = await Promise.all([
        apiFetch("/admin/products").catch(() => []),
        apiFetch("/categories").catch(() => ({ categories: [] })),
      ]);

      setProducts(prodsData || []);
      setCategories(catsData.categories || []);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Quick Seed
  async function handleSeed() {
    if (
      !window.confirm(
        "Voulez-vous initialiser le catalogue avec les pièces de démonstration MERHAK ?"
      )
    ) {
      return;
    }
    try {
      setSaving(true);
      const res = await apiFetch("/admin/products/seed", { method: "POST" });
      setMessage({
        type: "success",
        text: res.message || "Catalogue initialisé !",
      });
      await loadData();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  }

  // Open Create Modal
  function handleOpenCreate() {
    setEditingProduct(null);
    setFormData({
      ...emptyForm,
      categoryId: categories[0]?.id ? String(categories[0].id) : "",
      images: [],
    });
    setActiveTab("general");
    setImageUrlInput("");
    setModalOpen(true);
  }

  // Open Edit Modal
  function handleOpenEdit(product) {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      categoryId: product.category_id ? String(product.category_id) : "",
      description: product.description || "",
      price: product.price ? String(product.price) : "",
      cost: product.cost ? String(product.cost) : "0",
      fabricType: product.fabric || product.fabric_type || "",
      deliveryCost: product.delivery_cost ? String(product.delivery_cost) : "0",
      packagingCost: product.packaging_cost
        ? String(product.packaging_cost)
        : "0",
      stock: product.stock !== undefined ? String(product.stock) : "10",
      active: Boolean(product.active),
      images: product.images ? product.images.map((img) => img.url || img) : [],
      variants: product.variants || [],
    });
    setActiveTab("general");
    setImageUrlInput("");
    setModalOpen(true);
  }

  // Open Delete Modal
  function handleOpenDelete(product) {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  }

  // Handle Image File Upload with Folder Placement Algorithm
  async function handleImageFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const data = new FormData();
      data.append("image", file);
      if (formData.categoryId) {
        data.append("categoryId", formData.categoryId);
      }

      const res = await apiFetch("/admin/products/upload-image", {
        method: "POST",
        body: data,
      });

      if (res.url) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, res.url],
        }));
        setMessage({
          type: "success",
          text: `Image enregistrée dans le dossier ${res.folder}`,
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // Add Image via URL
  function handleAddImageUrl() {
    if (!imageUrlInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, imageUrlInput.trim()],
    }));
    setImageUrlInput("");
  }

  // Remove Image
  function handleRemoveImage(index) {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }

  // Set Cover Image
  function handleSetCoverImage(index) {
    setFormData((prev) => {
      const selected = prev.images[index];
      const rest = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: [selected, ...rest],
      };
    });
  }

  // Submit Product Create or Update
  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.name.trim()) {
      setMessage({ type: "error", text: "Le nom du produit est obligatoire." });
      return;
    }
    if (!formData.categoryId) {
      setMessage({
        type: "error",
        text: "Veuillez sélectionner une catégorie.",
      });
      return;
    }
    if (!formData.price || isNaN(Number(formData.price))) {
      setMessage({
        type: "error",
        text: "Veuillez indiquer un prix de vente valide.",
      });
      return;
    }

    try {
      setSaving(true);
      setMessage({ type: "", text: "" });

      const payload = {
        name: formData.name.trim(),
        categoryId: Number(formData.categoryId),
        description: formData.description.trim() || null,
        price: Number(formData.price),
        cost: Number(formData.cost) || 0,
        fabricType: formData.fabricType.trim() || null,
        deliveryCost: Number(formData.deliveryCost) || 0,
        packagingCost: Number(formData.packagingCost) || 0,
        stock: Number(formData.stock) || 0,
        active: Boolean(formData.active),
        images: formData.images,
        variants: formData.variants,
      };

      if (editingProduct) {
        await apiFetch(`/admin/products/${editingProduct.id}`, {
          method: "PUT",
          body: payload,
        });
        setMessage({ type: "success", text: "Produit mis à jour avec succès." });
      } else {
        await apiFetch("/admin/products", {
          method: "POST",
          body: payload,
        });
        setMessage({ type: "success", text: "Produit créé avec succès." });
      }

      setModalOpen(false);
      setFormData(emptyForm);
      await loadData();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  }

  // Confirm Delete
  async function confirmDelete() {
    if (!productToDelete) return;
    try {
      setSaving(true);
      await apiFetch(`/admin/products/${productToDelete.id}`, {
        method: "DELETE",
      });
      setMessage({ type: "success", text: "Produit supprimé avec succès." });
      setDeleteModalOpen(false);
      setProductToDelete(null);
      await loadData();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  }

  // Filter and Sort Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchSearch =
          search === "" ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.fabric && p.fabric.toLowerCase().includes(search.toLowerCase())) ||
          (p.category_name &&
            p.category_name.toLowerCase().includes(search.toLowerCase())) ||
          (p.description &&
            p.description.toLowerCase().includes(search.toLowerCase()));

        const matchCat =
          categoryFilter === "all" ||
          String(p.category_id) === String(categoryFilter) ||
          String(p.parent_category_id) === String(categoryFilter);

        const matchStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && p.active) ||
          (statusFilter === "inactive" && !p.active);

        return matchSearch && matchCat && matchStatus;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        if (sortBy === "stock") return a.stock - b.stock;
        return b.id - a.id; // recent
      });
  }, [products, search, categoryFilter, statusFilter, sortBy]);

  // Selected Category Info for Folder Preview
  const selectedCategoryObj = useMemo(() => {
    return categories.find((c) => String(c.id) === String(formData.categoryId));
  }, [categories, formData.categoryId]);

  const targetFolderSlug = useMemo(() => {
    if (!selectedCategoryObj) return "general";
    if (selectedCategoryObj.parent_name) {
      return `${selectedCategoryObj.parent_name.toLowerCase()}/${selectedCategoryObj.name.toLowerCase()}`;
    }
    return selectedCategoryObj.name.toLowerCase();
  }, [selectedCategoryObj]);

  // Stats calculation
  const totalCount = products.length;
  const activeCount = products.filter((p) => p.active).length;
  const totalStockCount = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const totalStockValue = products.reduce(
    (acc, p) => acc + (Number(p.price) || 0) * (p.stock || 0),
    0
  );

  return (
    <div className="p-8 lg:p-10">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#0f73c4]">
            Administration / E-commerce
          </p>
          <h1 className="mt-1 text-3xl font-bold text-[#10212f]">
            Catalogue & Gestion des Produits
          </h1>
          <p className="mt-1 text-sm text-[#667785]">
            Gérez vos fiches articles, prix, stocks et importez les images dans des dossiers organisés par catégorie.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/boutique"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[#dcecf6] bg-white px-5 py-2.5 text-xs font-semibold text-[#10212f] shadow-sm transition hover:border-[#0f73c4] hover:text-[#0f73c4]"
          >
            <EyeIcon className="h-4 w-4" />
            Voir la boutique
          </a>

          {products.length === 0 && (
            <button
              onClick={handleSeed}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full border border-[#0f73c4] bg-[#eef9ff] px-5 py-2.5 text-xs font-semibold text-[#0f73c4] shadow-sm transition hover:bg-[#0f73c4] hover:text-white"
            >
              <SparklesIcon className="h-4 w-4" />
              Initialiser le catalogue
            </button>
          )}

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 rounded-full bg-[#0f73c4] px-6 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#0f73c4]/20 transition hover:bg-[#29b6f6]"
          >
            <PlusIcon className="h-4 w-4" />
            Nouveau Produit
          </button>
        </div>
      </div>

      {/* Alert message */}
      {message.text && (
        <div
          className={`mt-6 flex items-center justify-between rounded-2xl p-4 text-sm ${
            message.type === "error"
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          }`}
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessage({ type: "", text: "" })}
            className="text-gray-400 hover:text-gray-700"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-[#e5f1f8] bg-white p-6 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef9ff] text-[#0f73c4]">
            <ShoppingBagIcon className="h-5 w-5" />
          </div>
          <p className="mt-4 text-xs font-medium uppercase tracking-wider text-[#667785]">
            Total Produits
          </p>
          <p className="mt-1 text-2xl font-bold text-[#10212f]">
            {loading ? "..." : totalCount}
          </p>
        </div>

        <div className="rounded-3xl border border-[#e5f1f8] bg-white p-6 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckBadgeIcon className="h-5 w-5" />
          </div>
          <p className="mt-4 text-xs font-medium uppercase tracking-wider text-[#667785]">
            Produits Actifs
          </p>
          <p className="mt-1 text-2xl font-bold text-[#10212f]">
            {loading ? "..." : activeCount}
          </p>
        </div>

        <div className="rounded-3xl border border-[#e5f1f8] bg-white p-6 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0faff] text-[#29b6f6]">
            <TagIcon className="h-5 w-5" />
          </div>
          <p className="mt-4 text-xs font-medium uppercase tracking-wider text-[#667785]">
            Pièces en Stock
          </p>
          <p className="mt-1 text-2xl font-bold text-[#10212f]">
            {loading ? "..." : totalStockCount}
          </p>
        </div>

        <div className="rounded-3xl border border-[#e5f1f8] bg-white p-6 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <CurrencyDollarIcon className="h-5 w-5" />
          </div>
          <p className="mt-4 text-xs font-medium uppercase tracking-wider text-[#667785]">
            Valeur du Stock
          </p>
          <p className="mt-1 text-2xl font-bold text-[#10212f]">
            {loading ? "..." : `${totalStockValue.toFixed(0)} TND`}
          </p>
        </div>
      </div>

      {/* Toolbar Filters */}
      <div className="mt-8 flex flex-col gap-4 rounded-3xl border border-[#e5f1f8] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8ca0ad]" />
          <input
            type="text"
            placeholder="Rechercher par nom, tissu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-[#e5f1f8] bg-[#f7fbfe] py-2.5 pl-10 pr-4 text-xs text-[#10212f] outline-none transition focus:border-[#29b6f6] focus:bg-white sm:max-w-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-full border border-[#e5f1f8] bg-[#f7fbfe] px-4 py-2 text-xs font-medium text-[#10212f] outline-none transition focus:border-[#29b6f6]"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.parent_name ? `${c.parent_name} > ${c.name}` : c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-full border border-[#e5f1f8] bg-[#f7fbfe] px-4 py-2 text-xs font-medium text-[#10212f] outline-none transition focus:border-[#29b6f6]"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs seulement</option>
            <option value="inactive">Inactifs / Brouillons</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-full border border-[#e5f1f8] bg-[#f7fbfe] px-4 py-2 text-xs font-medium text-[#10212f] outline-none transition focus:border-[#29b6f6]"
          >
            <option value="recent">Plus récents</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
            <option value="name-asc">Nom A &rarr; Z</option>
            <option value="stock">Stock disponible</option>
          </select>
        </div>
      </div>

      {/* Product Table */}
      {loading ? (
        <div className="mt-8 rounded-3xl border border-[#e5f1f8] bg-white p-12 text-center text-sm text-[#667785]">
          Chargement du catalogue...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-[#dcecf6] bg-[#f7fbfe] p-16 text-center">
          <ShoppingBagIcon className="mx-auto h-12 w-12 text-[#29b6f6]" />
          <h3 className="mt-4 text-base font-bold text-[#10212f]">
            Aucun produit trouvé
          </h3>
          <p className="mt-2 text-xs text-[#667785] max-w-sm mx-auto">
            Créez votre première pièce ou réinitialisez vos filtres.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-6 rounded-full bg-[#0f73c4] px-6 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#0f73c4]/20 transition hover:bg-[#29b6f6]"
          >
            + Ajouter un produit
          </button>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-3xl border border-[#e5f1f8] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#e5f1f8] bg-[#f7fbfe] text-[11px] font-bold uppercase tracking-wider text-[#667785]">
                <tr>
                  <th className="px-6 py-4">Article</th>
                  <th className="px-6 py-4">Catégorie</th>
                  <th className="px-6 py-4">Matière</th>
                  <th className="px-6 py-4 text-right">Prix de vente</th>
                  <th className="px-6 py-4 text-right">Coût (Marge)</th>
                  <th className="px-6 py-4 text-center">Stock</th>
                  <th className="px-6 py-4 text-center">Statut</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5f1f8]">
                {filteredProducts.map((p) => {
                  const price = Number(p.price) || 0;
                  const cost = Number(p.cost) || 0;
                  const margin = price > 0 ? (((price - cost) / price) * 100).toFixed(0) : 0;
                  const coverImage = p.image || p.images?.[0]?.url || p.images?.[0];

                  return (
                    <tr key={p.id} className="transition hover:bg-[#f7fbfe]/60">
                      {/* Product details & thumbnail */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getImageUrl(coverImage)}
                            alt={p.name}
                            className="h-12 w-12 rounded-xl object-cover border border-[#e5f1f8] bg-[#f7fbfe]"
                          />
                          <div>
                            <h4 className="font-bold text-[#10212f]">
                              {p.name}
                            </h4>
                            <span className="text-[10px] text-[#8ca0ad]">
                              Réf : #{p.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-[#eef9ff] px-2.5 py-1 text-[11px] font-semibold text-[#0f73c4]">
                          {p.parent_category_name
                            ? `${p.parent_category_name} > ${p.category_name}`
                            : p.category_name || "Général"}
                        </span>
                      </td>

                      {/* Fabric */}
                      <td className="px-6 py-4 font-medium text-[#667785]">
                        {p.fabric || "-"}
                      </td>

                      {/* Selling Price */}
                      <td className="px-6 py-4 text-right font-bold text-[#10212f]">
                        {price.toFixed(2)} TND
                      </td>

                      {/* Cost & Margin */}
                      <td className="px-6 py-4 text-right">
                        <span className="text-[#667785] font-medium">
                          {cost.toFixed(2)} TND
                        </span>
                        {cost > 0 && (
                          <span className="block text-[10px] font-semibold text-emerald-600">
                            +{margin}% marge
                          </span>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            p.stock > 0
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {p.stock} en stock
                        </span>
                      </td>

                      {/* Active Status */}
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            p.active
                              ? "bg-blue-50 text-[#0f73c4]"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {p.active ? "Actif" : "Inactif"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/product/${p.id}`}
                            target="_blank"
                            className="rounded-lg border border-[#dcecf6] p-1.5 text-[#667785] transition hover:border-[#0f73c4] hover:text-[#0f73c4]"
                            title="Voir la page produit"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>

                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="rounded-lg border border-[#dcecf6] p-1.5 text-[#667785] transition hover:border-[#0f73c4] hover:text-[#0f73c4]"
                            title="Modifier"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleOpenDelete(p)}
                            className="rounded-lg border border-[#dcecf6] p-1.5 text-[#667785] transition hover:border-red-400 hover:text-red-500"
                            title="Supprimer"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ADD / EDIT PRODUCT                                    */}
      {/* ============================================================ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-3xl bg-white p-7 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#e5f1f8] pb-4">
              <div>
                <h3 className="text-lg font-bold text-[#10212f]">
                  {editingProduct ? "Modifier le produit" : "Ajouter un nouveau produit"}
                </h3>
                <p className="text-xs text-[#667785]">
                  Remplissez les détails et téléversez les images dans le dossier dédié.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-full p-1 text-[#8ca0ad] hover:bg-[#f7fbfe] hover:text-[#10212f]"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex gap-2 border-b border-[#e5f1f8] pt-4 pb-2 text-xs font-semibold">
              {[
                { id: "general", label: "1. Général" },
                { id: "pricing", label: "2. Prix & Stocks" },
                { id: "images", label: `3. Photos (${formData.images.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-full px-4 py-2 transition ${
                    activeTab === tab.id
                      ? "bg-[#0f73c4] text-white shadow-sm"
                      : "bg-[#f7fbfe] text-[#667785] hover:text-[#10212f]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-6 space-y-5">
              {/* ========================================== */}
              {/* TAB 1: GENERAL                             */}
              {/* ========================================== */}
              {activeTab === "general" && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#10212f]">
                      Nom du vêtement / Produit <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Chemise Col Officier en Lin Pur"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full rounded-2xl border border-[#e5f1f8] bg-[#f7fbfe] px-4 py-3 text-xs text-[#10212f] outline-none focus:border-[#29b6f6] focus:bg-white"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#10212f]">
                        Catégorie / Collection <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.categoryId}
                        onChange={(e) =>
                          setFormData({ ...formData, categoryId: e.target.value })
                        }
                        className="w-full rounded-2xl border border-[#e5f1f8] bg-[#f7fbfe] px-4 py-3 text-xs text-[#10212f] outline-none focus:border-[#29b6f6] focus:bg-white"
                      >
                        <option value="">-- Choisir une catégorie --</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.parent_name
                              ? `↳ ${c.parent_name} > ${c.name}`
                              : `[Racine] ${c.name}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#10212f]">
                        Matière & Tissu
                      </label>
                      <input
                        type="text"
                        list="fabric-list"
                        placeholder="Ex: 100% Lin naturel"
                        value={formData.fabricType}
                        onChange={(e) =>
                          setFormData({ ...formData, fabricType: e.target.value })
                        }
                        className="w-full rounded-2xl border border-[#e5f1f8] bg-[#f7fbfe] px-4 py-3 text-xs text-[#10212f] outline-none focus:border-[#29b6f6] focus:bg-white"
                      />
                      <datalist id="fabric-list">
                        {FABRIC_SUGGESTIONS.map((f) => (
                          <option key={f} value={f} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#10212f]">
                      Description détaillée
                    </label>
                    <textarea
                      rows="4"
                      placeholder="Décrivez la coupe, les finitions, le tombé du tissu et les conseils de porté..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="w-full rounded-2xl border border-[#e5f1f8] bg-[#f7fbfe] px-4 py-3 text-xs text-[#10212f] outline-none focus:border-[#29b6f6] focus:bg-white"
                    />
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* TAB 2: PRICING & STOCK                     */}
              {/* ========================================== */}
              {activeTab === "pricing" && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#10212f]">
                        Prix de vente (TND) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        placeholder="Ex: 180"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        className="w-full rounded-2xl border border-[#e5f1f8] bg-[#f7fbfe] px-4 py-3 text-xs text-[#10212f] outline-none focus:border-[#29b6f6] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#10212f]">
                        Coût de revient / Façon (TND)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Ex: 80"
                        value={formData.cost}
                        onChange={(e) =>
                          setFormData({ ...formData, cost: e.target.value })
                        }
                        className="w-full rounded-2xl border border-[#e5f1f8] bg-[#f7fbfe] px-4 py-3 text-xs text-[#10212f] outline-none focus:border-[#29b6f6] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#10212f]">
                        Quantité en stock
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="10"
                        value={formData.stock}
                        onChange={(e) =>
                          setFormData({ ...formData, stock: e.target.value })
                        }
                        className="w-full rounded-2xl border border-[#e5f1f8] bg-[#f7fbfe] px-4 py-3 text-xs text-[#10212f] outline-none focus:border-[#29b6f6] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#10212f]">
                        Frais de livraison (TND)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="0"
                        value={formData.deliveryCost}
                        onChange={(e) =>
                          setFormData({ ...formData, deliveryCost: e.target.value })
                        }
                        className="w-full rounded-2xl border border-[#e5f1f8] bg-[#f7fbfe] px-4 py-3 text-xs text-[#10212f] outline-none focus:border-[#29b6f6] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#10212f]">
                        Frais d'emballage (TND)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="0"
                        value={formData.packagingCost}
                        onChange={(e) =>
                          setFormData({ ...formData, packagingCost: e.target.value })
                        }
                        className="w-full rounded-2xl border border-[#e5f1f8] bg-[#f7fbfe] px-4 py-3 text-xs text-[#10212f] outline-none focus:border-[#29b6f6] focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Active Switch */}
                  <div className="flex items-center gap-3 rounded-2xl border border-[#e5f1f8] bg-[#f7fbfe] p-4">
                    <input
                      type="checkbox"
                      id="product-active"
                      checked={formData.active}
                      onChange={(e) =>
                        setFormData({ ...formData, active: e.target.checked })
                      }
                      className="h-4 w-4 rounded text-[#0f73c4] focus:ring-[#29b6f6]"
                    />
                    <label
                      htmlFor="product-active"
                      className="text-xs font-semibold text-[#10212f] cursor-pointer"
                    >
                      Article Actif (Visible immédiatement sur la boutique MERHAK)
                    </label>
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* TAB 3: IMAGES & AUTOMATIC FOLDERS          */}
              {/* ========================================== */}
              {activeTab === "images" && (
                <div className="space-y-6">
                  {/* Dynamic Category Folder Indicator */}
                  <div className="rounded-2xl border border-[#dcecf6] bg-[#f0faff] p-4 text-xs">
                    <div className="flex items-center gap-2 font-bold text-[#0f73c4]">
                      <FolderIcon className="h-5 w-5" />
                      <span>Dossier de stockage automatique :</span>
                    </div>
                    <p className="mt-1 font-mono text-[11px] text-[#10212f]">
                      📁 /assets/products/{targetFolderSlug}/
                    </p>
                    <p className="mt-1 text-[11px] text-[#667785]">
                      Tout fichier importé sera automatiquement placé dans ce sous-dossier de la catégorie pour une organisation nette de vos médias.
                    </p>
                  </div>

                  {/* Upload Box */}
                  <div className="rounded-3xl border-2 border-dashed border-[#dcecf6] bg-[#f7fbfe] p-6 text-center">
                    <PhotoIcon className="mx-auto h-10 w-10 text-[#29b6f6]" />
                    <p className="mt-2 text-xs font-bold text-[#10212f]">
                      Importer une photo depuis votre appareil
                    </p>
                    <p className="text-[11px] text-[#8ca0ad]">
                      JPG, PNG, WebP (Max 10 Mo)
                    </p>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                      id="product-image-upload"
                    />

                    <button
                      type="button"
                      disabled={uploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#0f73c4] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#29b6f6] disabled:opacity-50"
                    >
                      <ArrowUpTrayIcon className="h-4 w-4" />
                      {uploadingImage ? "Téléversement..." : "Sélectionner un fichier"}
                    </button>
                  </div>

                  {/* Add by URL */}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Ou coller une URL d'image (https://...)"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      className="flex-1 rounded-2xl border border-[#e5f1f8] bg-[#f7fbfe] px-4 py-2.5 text-xs text-[#10212f] outline-none focus:border-[#29b6f6] focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="rounded-2xl border border-[#dcecf6] bg-white px-4 py-2 text-xs font-semibold text-[#0f73c4] hover:bg-[#eef9ff]"
                    >
                      Ajouter URL
                    </button>
                  </div>

                  {/* Existing Images Gallery */}
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#667785]">
                      Photos du produit ({formData.images.length})
                    </p>

                    {formData.images.length === 0 ? (
                      <p className="text-xs text-[#8ca0ad]">
                        Aucune photo pour l'instant. Ajoutez-en au moins une pour la boutique.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {formData.images.map((imgUrl, idx) => (
                          <div
                            key={idx}
                            className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-[#e5f1f8] bg-[#f7fbfe]"
                          >
                            <img
                              src={getImageUrl(imgUrl)}
                              alt={`Aperçu ${idx + 1}`}
                              className="h-full w-full object-cover"
                            />

                            {/* Cover Badge */}
                            {idx === 0 && (
                              <span className="absolute left-2 top-2 rounded-full bg-[#0f73c4] px-2 py-0.5 text-[9px] font-bold text-white shadow-sm">
                                Principale
                              </span>
                            )}

                            {/* Actions overlay */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                              {idx !== 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleSetCoverImage(idx)}
                                  className="rounded-full bg-white p-1.5 text-xs text-[#0f73c4] hover:bg-[#eef9ff]"
                                  title="Définir comme photo principale"
                                >
                                  ★
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="rounded-full bg-red-600 p-1.5 text-xs text-white hover:bg-red-700"
                                title="Supprimer"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Modal Actions Footer */}
              <div className="pt-4 border-t border-[#e5f1f8] flex items-center justify-between">
                <div className="text-xs text-[#8ca0ad]">
                  {activeTab !== "images" && (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveTab(
                          activeTab === "general" ? "pricing" : "images"
                        )
                      }
                      className="text-[#0f73c4] font-semibold hover:underline"
                    >
                      Étape suivante &rarr;
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-full border border-[#dcecf6] px-5 py-2.5 text-xs font-semibold text-[#667785] hover:bg-[#f7fbfe]"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-full bg-[#0f73c4] px-7 py-2.5 text-xs font-bold text-white shadow-md shadow-[#0f73c4]/20 transition hover:bg-[#29b6f6] disabled:opacity-50"
                  >
                    {saving
                      ? "Enregistrement..."
                      : editingProduct
                      ? "Enregistrer les modifications"
                      : "Créer le produit"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: DELETE CONFIRMATION                                   */}
      {/* ============================================================ */}
      {deleteModalOpen && productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl animate-in fade-in zoom-in-95">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <ExclamationTriangleIcon className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-base font-bold text-[#10212f]">
              Supprimer cet article ?
            </h3>

            <p className="mt-2 text-xs text-[#667785]">
              Êtes-vous sûr de vouloir retirer définitivement{" "}
              <strong className="text-[#10212f]">
                "{productToDelete.name}"
              </strong>{" "}
              du catalogue ?
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setProductToDelete(null);
                }}
                className="rounded-full border border-[#dcecf6] px-5 py-2.5 text-xs font-semibold text-[#667785] hover:bg-[#f7fbfe]"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={confirmDelete}
                className="rounded-full bg-red-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-red-600/20 transition hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? "Suppression..." : "Confirmer la suppression"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
