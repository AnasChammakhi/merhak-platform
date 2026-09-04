import { useEffect, useMemo, useState } from "react";
import {
  FolderIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronRightIcon,
  TagIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

import { apiFetch } from "../../lib/api";

const emptyForm = {
  name: "",
  description: "",
  parentId: "",
};

function Categories() {
  const [categories, setCategories] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("tree"); // "tree" or "table"
  const [parentFilter, setParentFilter] = useState("all");

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Load categories from API
  async function loadCategories() {
    try {
      setLoading(true);
      const data = await apiFetch("/categories");
      setCategories(data.categories || []);
      setCategoryTree(data.tree || []);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  // Quick Seed Categories
  async function handleSeedCategories() {
    if (!window.confirm("Voulez-vous initialiser les catégories recommandées (Homme, Femme et sous-catégories) ?")) {
      return;
    }
    try {
      setSaving(true);
      const res = await apiFetch("/categories/seed", {
        method: "POST",
      });
      setMessage({ type: "success", text: res.message || "Catégories initialisées !" });
      await loadCategories();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  }

  // Open modal for Create
  function handleOpenCreate(defaultParentId = "") {
    setEditingCategory(null);
    setFormData({
      name: "",
      description: "",
      parentId: defaultParentId ? String(defaultParentId) : "",
    });
    setModalOpen(true);
  }

  // Open modal for Edit
  function handleOpenEdit(category) {
    setEditingCategory(category);
    setFormData({
      name: category.name || "",
      description: category.description || "",
      parentId: category.parent_id ? String(category.parent_id) : "",
    });
    setModalOpen(true);
  }

  // Open modal for Delete
  function handleOpenDelete(category) {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  }

  // Submit Create or Update
  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name.trim()) {
      setMessage({ type: "error", text: "Le nom de la catégorie est obligatoire." });
      return;
    }

    try {
      setSaving(true);
      setMessage({ type: "", text: "" });

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        parentId: formData.parentId ? Number(formData.parentId) : null,
      };

      if (editingCategory) {
        await apiFetch(`/categories/${editingCategory.id}`, {
          method: "PUT",
          body: payload,
        });
        setMessage({ type: "success", text: "Catégorie modifiée avec succès." });
      } else {
        await apiFetch("/categories", {
          method: "POST",
          body: payload,
        });
        setMessage({ type: "success", text: "Catégorie créée avec succès." });
      }

      setModalOpen(false);
      setFormData(emptyForm);
      await loadCategories();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  }

  // Confirm Delete
  async function confirmDelete() {
    if (!categoryToDelete) return;

    try {
      setSaving(true);
      await apiFetch(`/categories/${categoryToDelete.id}`, {
        method: "DELETE",
      });
      setMessage({ type: "success", text: "Catégorie supprimée avec succès." });
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
      await loadCategories();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  }

  // Filtered categories for Table View
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      const matchSearch =
        search === "" ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(search.toLowerCase())) ||
        (c.parent_name && c.parent_name.toLowerCase().includes(search.toLowerCase()));

      const matchParent =
        parentFilter === "all" ||
        (parentFilter === "root" && !c.parent_id) ||
        (parentFilter !== "all" && parentFilter !== "root" && String(c.parent_id) === String(parentFilter));

      return matchSearch && matchParent;
    });
  }, [categories, search, parentFilter]);

  // Root categories list for dropdowns
  const rootCategories = useMemo(() => {
    return categories.filter((c) => !c.parent_id);
  }, [categories]);

  // Stats calculation
  const totalCategories = categories.length;
  const rootCount = categories.filter((c) => !c.parent_id).length;
  const subCount = categories.filter((c) => c.parent_id).length;

  return (
    <div className="p-8 lg:p-10">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#0f73c4]">Administration</p>
          <h1 className="mt-1 text-3xl font-semibold text-[#10212f]">
            Gestion des catégories
          </h1>
          <p className="mt-2 text-sm text-[#667785]">
            Configurez les collections principales et leurs sous-catégories.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {categories.length === 0 && (
            <button
              onClick={handleSeedCategories}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full border border-[#0f73c4] bg-[#eef9ff] px-5 py-2.5 text-xs font-semibold text-[#0f73c4] shadow-sm transition hover:bg-[#0f73c4] hover:text-white"
            >
              <SparklesIcon className="h-4 w-4" />
              Initialiser par défaut
            </button>
          )}

          <button
            onClick={() => handleOpenCreate("")}
            className="primary-button flex items-center justify-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Nouvelle catégorie
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

      {/* Stats Cards */}
      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        <div className="rounded-3xl border border-[#e5f1f8] bg-white p-6 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef9ff] text-[#0f73c4]">
            <FolderIcon className="h-5 w-5" />
          </div>
          <p className="mt-4 text-xs font-medium uppercase tracking-wider text-[#667785]">
            Total Catégories
          </p>
          <p className="mt-1 text-2xl font-bold text-[#10212f]">
            {loading ? "..." : totalCategories}
          </p>
        </div>

        <div className="rounded-3xl border border-[#e5f1f8] bg-white p-6 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0faff] text-[#29b6f6]">
            <TagIcon className="h-5 w-5" />
          </div>
          <p className="mt-4 text-xs font-medium uppercase tracking-wider text-[#667785]">
            Collections Principales (Racine)
          </p>
          <p className="mt-1 text-2xl font-bold text-[#10212f]">
            {loading ? "..." : rootCount}
          </p>
        </div>

        <div className="rounded-3xl border border-[#e5f1f8] bg-white p-6 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7fbfe] text-[#10212f]">
            <Squares2X2Icon className="h-5 w-5" />
          </div>
          <p className="mt-4 text-xs font-medium uppercase tracking-wider text-[#667785]">
            Sous-catégories
          </p>
          <p className="mt-1 text-2xl font-bold text-[#10212f]">
            {loading ? "..." : subCount}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <div className="flex flex-1 items-center rounded-2xl border border-[#e5f1f8] bg-white px-4 shadow-sm">
          <MagnifyingGlassIcon className="h-5 w-5 text-[#8ca0ad]" />
          <input
            type="text"
            placeholder="Rechercher une catégorie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent px-3 py-3 text-sm text-[#10212f] outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Parent filter */}
          <select
            value={parentFilter}
            onChange={(e) => setParentFilter(e.target.value)}
            className="rounded-2xl border border-[#e5f1f8] bg-white px-4 py-3 text-sm text-[#10212f] shadow-sm outline-none"
          >
            <option value="all">Tous les niveaux</option>
            <option value="root">Racine seulement</option>
            {rootCategories.map((r) => (
              <option key={r.id} value={r.id}>
                Sous-catégories de: {r.name}
              </option>
            ))}
          </select>

          {/* View mode toggle */}
          <div className="flex items-center rounded-full border border-[#e5f1f8] bg-[#f7fbfe] p-1">
            <button
              onClick={() => setViewMode("tree")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                viewMode === "tree"
                  ? "bg-[#0f73c4] text-white shadow-sm"
                  : "text-[#667785] hover:text-[#10212f]"
              }`}
            >
              <Squares2X2Icon className="h-3.5 w-3.5" />
              Arborescence
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                viewMode === "table"
                  ? "bg-[#0f73c4] text-white shadow-sm"
                  : "text-[#667785] hover:text-[#10212f]"
              }`}
            >
              <ListBulletIcon className="h-3.5 w-3.5" />
              Tableau
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="mt-8 rounded-3xl border border-[#e5f1f8] bg-white p-12 text-center text-sm text-[#667785]">
          Chargement des catégories...
        </div>
      ) : categories.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-[#dcecf6] bg-[#f7fbfe] p-16 text-center">
          <FolderIcon className="mx-auto h-12 w-12 text-[#29b6f6]" />
          <h3 className="mt-4 text-base font-bold text-[#10212f]">
            Aucune catégorie pour le moment
          </h3>
          <p className="mt-2 text-xs text-[#667785] max-w-sm mx-auto">
            Créez votre première collection ou initialisez les catégories recommandées pour structurer votre boutique.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={handleSeedCategories}
              className="rounded-full border border-[#0f73c4] bg-[#eef9ff] px-5 py-2.5 text-xs font-semibold text-[#0f73c4] transition hover:bg-[#0f73c4] hover:text-white"
            >
              ⚡ Initialiser automatiquement
            </button>
            <button
              onClick={() => handleOpenCreate("")}
              className="rounded-full bg-[#0f73c4] px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#0f73c4]/20 transition hover:bg-[#29b6f6]"
            >
              + Créer manuellement
            </button>
          </div>
        </div>
      ) : viewMode === "tree" ? (
        /* ============================================================ */
        /* TREE / HIERARCHICAL VIEW                                    */
        /* ============================================================ */
        <div className="mt-8 space-y-6">
          {categoryTree.map((root) => (
            <div
              key={root.id}
              className="overflow-hidden rounded-3xl border border-[#e5f1f8] bg-white shadow-sm"
            >
              {/* Root Category Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#e5f1f8] bg-gradient-to-r from-[#f7fbfe] to-white p-6 gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef9ff] text-[#0f73c4]">
                    <FolderIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-[#10212f]">
                        {root.name}
                      </h3>
                      <span className="rounded-full bg-[#0f73c4] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        Collection Racine
                      </span>
                    </div>
                    {root.description && (
                      <p className="mt-0.5 text-xs text-[#667785]">
                        {root.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#eef9ff] px-3 py-1 text-xs font-semibold text-[#0f73c4]">
                    {root.children?.length || 0} sous-catégorie(s)
                  </span>

                  <button
                    onClick={() => handleOpenCreate(root.id)}
                    title="Ajouter une sous-catégorie"
                    className="inline-flex items-center gap-1 rounded-xl bg-white border border-[#dcecf6] px-3 py-1.5 text-xs font-medium text-[#0f73c4] transition hover:bg-[#eef9ff]"
                  >
                    <PlusIcon className="h-3.5 w-3.5" />
                    Sous-catégorie
                  </button>

                  <button
                    onClick={() => handleOpenEdit(root)}
                    className="rounded-xl p-2 text-[#667785] transition hover:bg-yellow-50 hover:text-yellow-600"
                    title="Modifier"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>

                  <button
                    onClick={() => handleOpenDelete(root)}
                    className="rounded-xl p-2 text-[#667785] transition hover:bg-red-50 hover:text-red-600"
                    title="Supprimer"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Subcategories Grid */}
              <div className="p-6">
                {root.children && root.children.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {root.children.map((sub) => (
                      <div
                        key={sub.id}
                        className="group flex items-center justify-between rounded-2xl border border-[#e5f1f8] bg-[#f7fbfe]/60 p-4 transition hover:border-[#29b6f6]/50 hover:bg-white hover:shadow-md"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <TagIcon className="h-4 w-4 shrink-0 text-[#0f73c4]" />
                          <div className="min-w-0">
                            <h4 className="truncate text-xs font-bold text-[#10212f]">
                              {sub.name}
                            </h4>
                            {sub.description && (
                              <p className="truncate text-[11px] text-[#8ca0ad]">
                                {sub.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={() => handleOpenEdit(sub)}
                            className="rounded-lg p-1 text-[#667785] hover:bg-[#eef9ff] hover:text-[#0f73c4]"
                            title="Modifier"
                          >
                            <PencilSquareIcon className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(sub)}
                            className="rounded-lg p-1 text-[#667785] hover:bg-red-50 hover:text-red-500"
                            title="Supprimer"
                          >
                            <TrashIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#e5f1f8] p-6 text-center text-xs text-[#8ca0ad]">
                    Aucune sous-catégorie sous {root.name}.{" "}
                    <button
                      onClick={() => handleOpenCreate(root.id)}
                      className="font-semibold text-[#0f73c4] underline"
                    >
                      En ajouter une maintenant
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ============================================================ */
        /* TABULAR VIEW                                                 */
        /* ============================================================ */
        <div className="mt-8 overflow-hidden rounded-3xl border border-[#e5f1f8] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#e5f1f8] bg-[#f7fbfe]">
                <tr>
                  <th className="px-6 py-4 font-semibold text-[#10212f]">Nom de la catégorie</th>
                  <th className="px-6 py-4 font-semibold text-[#10212f]">Catégorie parente</th>
                  <th className="px-6 py-4 font-semibold text-[#10212f]">Description</th>
                  <th className="px-6 py-4 font-semibold text-center text-[#10212f]">Sous-catégories</th>
                  <th className="px-6 py-4 font-semibold text-right text-[#10212f]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5f1f8]">
                {filteredCategories.map((c) => (
                  <tr key={c.id} className="transition hover:bg-[#f7fbfe]/50">
                    <td className="px-6 py-4 font-semibold text-[#10212f]">
                      <div className="flex items-center gap-2">
                        {c.parent_id ? (
                          <span className="text-[#8ca0ad]">&rarr;</span>
                        ) : (
                          <FolderIcon className="h-4 w-4 text-[#0f73c4]" />
                        )}
                        <span>{c.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {c.parent_name ? (
                        <span className="rounded-full bg-[#eef9ff] px-2.5 py-0.5 text-[11px] font-semibold text-[#0f73c4]">
                          {c.parent_name}
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#8ca0ad]">Racine (Principale)</span>
                      )}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-[#667785]">
                      {c.description || "-"}
                    </td>
                    <td className="px-6 py-4 text-center text-[#667785]">
                      {c.subcategory_count || 0}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="rounded-xl p-2.5 text-[#667785] transition hover:bg-yellow-50 hover:text-yellow-600"
                          title="Modifier"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(c)}
                          className="rounded-xl p-2.5 text-[#667785] transition hover:bg-red-50 hover:text-red-600"
                          title="Supprimer"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ADD / EDIT CATEGORY                                   */}
      {/* ============================================================ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#e5f1f8] pb-4">
              <h3 className="text-lg font-bold text-[#10212f]">
                {editingCategory ? "Modifier la catégorie" : "Nouvelle catégorie"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-full p-1 text-[#8ca0ad] hover:bg-[#f7fbfe] hover:text-[#10212f]"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Name */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#10212f]">
                  Nom de la catégorie <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Homme, Chemises, Robes..."
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full rounded-2xl border border-[#e5f1f8] bg-[#f7fbfe] px-4 py-3 text-xs text-[#10212f] outline-none transition focus:border-[#29b6f6] focus:bg-white"
                />
              </div>

              {/* Parent Category */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#10212f]">
                  Catégorie parente (Niveau)
                </label>
                <select
                  value={formData.parentId}
                  onChange={(e) =>
                    setFormData({ ...formData, parentId: e.target.value })
                  }
                  className="w-full rounded-2xl border border-[#e5f1f8] bg-[#f7fbfe] px-4 py-3 text-xs text-[#10212f] outline-none transition focus:border-[#29b6f6] focus:bg-white"
                >
                  <option value="">-- Aucune (Catégorie principale / Racine) --</option>
                  {categories
                    .filter((c) => !editingCategory || c.id !== editingCategory.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.parent_name ? `↳ ${c.parent_name} > ${c.name}` : c.name}
                      </option>
                    ))}
                </select>
                <p className="mt-1 text-[11px] text-[#8ca0ad]">
                  Sélectionnez "Homme" ou "Femme" pour créer une sous-catégorie visible dans le menu déroulant.
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#10212f]">
                  Description (Optionnelle)
                </label>
                <textarea
                  rows="3"
                  placeholder="Brève description de la collection ou du type de vêtement..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full rounded-2xl border border-[#e5f1f8] bg-[#f7fbfe] px-4 py-3 text-xs text-[#10212f] outline-none transition focus:border-[#29b6f6] focus:bg-white"
                />
              </div>

              {/* Actions */}
              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[#e5f1f8]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-full border border-[#dcecf6] px-5 py-2.5 text-xs font-semibold text-[#667785] transition hover:bg-[#f7fbfe]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-[#0f73c4] px-6 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#0f73c4]/20 transition hover:bg-[#29b6f6] disabled:opacity-50"
                >
                  {saving ? "Enregistrement..." : editingCategory ? "Modifier" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: DELETE CONFIRMATION                                   */}
      {/* ============================================================ */}
      {deleteModalOpen && categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl animate-in fade-in zoom-in-95">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <ExclamationTriangleIcon className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-base font-bold text-[#10212f]">
              Supprimer la catégorie ?
            </h3>

            <p className="mt-2 text-xs text-[#667785]">
              Êtes-vous sûr de vouloir supprimer la catégorie{" "}
              <strong className="text-[#10212f]">"{categoryToDelete.name}"</strong> ?
              {categoryToDelete.subcategory_count > 0 && (
                <span className="block mt-1 text-amber-600 font-medium">
                  Attention: {categoryToDelete.subcategory_count} sous-catégorie(s) seront également affectées.
                </span>
              )}
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setCategoryToDelete(null);
                }}
                className="rounded-full border border-[#dcecf6] px-5 py-2.5 text-xs font-semibold text-[#667785] transition hover:bg-[#f7fbfe]"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={confirmDelete}
                className="rounded-full bg-red-600 px-6 py-2.5 text-xs font-semibold text-white shadow-md shadow-red-600/20 transition hover:bg-red-700 disabled:opacity-50"
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

export default Categories;
