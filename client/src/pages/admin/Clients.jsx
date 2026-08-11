import { useEffect, useState } from "react";

import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { useNavigate } from "react-router-dom";

const API_URL =
  "http://localhost:5000/api/admin/clients";

function Clients() {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });

  function getToken() {
    return localStorage.getItem("token");
  }

  async function handleUnauthorized(response) {
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/signin");

      return true;
    }

    if (response.status === 403) {
      navigate("/");

      return true;
    }

    return false;
  }

  // ========================================
  // LOAD CLIENTS
  // ========================================

  async function loadClients() {
    try {
      setLoading(true);

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (await handleUnauthorized(response)) {
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Impossible de charger les clients."
        );

        return;
      }

      setClients(data);
    } catch (error) {
      console.error(error);

      setMessage("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  // ========================================
  // FORM
  // ========================================

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  function openAddModal() {
    setEditingClient(null);
    setMessage("");

    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
    });

    setModalOpen(true);
  }

  function openEditModal(client) {
    setEditingClient(client);
    setMessage("");

    setFormData({
      firstName: client.first_name,
      lastName: client.last_name,
      email: client.email,
      phone: client.phone || "",
      password: "",
    });

    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingClient(null);
    setMessage("");
  }

  // ========================================
  // CREATE / UPDATE
  // ========================================

  async function handleSubmit(e) {
    e.preventDefault();

    setMessage("");

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email
    ) {
      setMessage("Veuillez remplir les champs obligatoires.");
      return;
    }

    if (!editingClient && !formData.password) {
      setMessage(
        "Le mot de passe est obligatoire pour créer un client."
      );

      return;
    }

    try {
      setSaving(true);

      const isEditing = Boolean(editingClient);

      const url = isEditing
        ? `${API_URL}/${editingClient.id}`
        : API_URL;

      const body = isEditing
        ? {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
          }
        : {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
          };

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },

        body: JSON.stringify(body),
      });

      if (await handleUnauthorized(response)) {
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Une erreur est survenue.");

        return;
      }

      closeModal();

      await loadClients();
    } catch (error) {
      console.error(error);

      setMessage("Impossible de contacter le serveur.");
    } finally {
      setSaving(false);
    }
  }

  // ========================================
  // DELETE
  // ========================================

  async function handleDelete(client) {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer ${client.first_name} ${client.last_name} ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/${client.id}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (await handleUnauthorized(response)) {
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Suppression impossible.");

        return;
      }

      await loadClients();
    } catch (error) {
      console.error(error);

      alert("Impossible de contacter le serveur.");
    }
  }

  // ========================================
  // SEARCH
  // ========================================

  const filteredClients = clients.filter((client) => {
    const value =
      `${client.first_name} ${client.last_name} ${client.email} ${client.phone || ""}`
        .toLowerCase();

    return value.includes(search.toLowerCase());
  });

  return (
    <div className="p-8 lg:p-10">
      {/* Header */}
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <p className="text-sm text-gray-500">
            Administration
          </p>

          <h1 className="mt-1 text-3xl font-semibold text-black">
            Gestion des clients
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Gérez les comptes clients MERHAK.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          <PlusIcon className="h-5 w-5" />

          Ajouter un client
        </button>
      </div>

      {/* Search */}
      <div className="mt-8 flex items-center rounded-xl bg-white px-4 shadow-sm">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un client..."
          className="w-full bg-transparent px-3 py-4 text-sm text-black outline-none"
        />
      </div>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                  Client
                </th>

                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                  Email
                </th>

                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                  Téléphone
                </th>

                <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-14 text-center text-sm text-gray-500"
                  >
                    Chargement...
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-14 text-center text-sm text-gray-500"
                  >
                    Aucun client trouvé.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                          {client.first_name?.[0]}
                          {client.last_name?.[0]}
                        </div>

                        <div>
                          <p className="font-medium text-black">
                            {client.first_name}{" "}
                            {client.last_name}
                          </p>

                          <p className="text-xs text-gray-400">
                            Client #{client.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-600">
                      {client.email}
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-600">
                      {client.phone || "—"}
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            openEditModal(client)
                          }
                          className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-black"
                          title="Modifier"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(client)
                          }
                          className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                          title="Supprimer"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-7 py-5">
              <div>
                <h2 className="text-xl font-semibold text-black">
                  {editingClient
                    ? "Modifier le client"
                    : "Ajouter un client"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingClient
                    ? "Modifiez les informations du client."
                    : "Créez un nouveau compte client."}
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-black"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-7"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-black">
                    Prénom
                  </label>

                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black outline-none transition focus:border-black"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-black">
                    Nom
                  </label>

                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black outline-none transition focus:border-black"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-black">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black outline-none transition focus:border-black"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-black">
                  Téléphone
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black outline-none transition focus:border-black"
                />
              </div>

              {!editingClient && (
                <div>
                  <label className="mb-2 block text-sm text-black">
                    Mot de passe
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black outline-none transition focus:border-black"
                    required
                  />

                  <p className="mt-2 text-xs text-gray-400">
                    Le client pourra utiliser ce mot de passe pour
                    se connecter.
                  </p>
                </div>
              )}

              {message && (
                <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                  {message}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-gray-300 px-5 py-3 text-sm text-gray-600 transition hover:bg-gray-50"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
                >
                  {saving
                    ? "Enregistrement..."
                    : editingClient
                      ? "Enregistrer"
                      : "Ajouter le client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Clients;