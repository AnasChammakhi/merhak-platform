import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";


import {
  apiFetch,
} from "../../lib/api";


const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
};


function Clients() {
  const [
    clients,
    setClients,
  ] = useState([]);


  const [
    search,
    setSearch,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    saving,
    setSaving,
  ] = useState(false);


  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);


  const [
    editingClient,
    setEditingClient,
  ] = useState(null);


  const [
    formData,
    setFormData,
  ] = useState(
    emptyForm
  );


  const [
    message,
    setMessage,
  ] = useState("");


  async function loadClients() {
    try {
      setLoading(true);

      const data =
        await apiFetch(
          "/admin/clients"
        );

      setClients(data);
    } catch (error) {
      setMessage(
        error.message
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadClients();
  }, []);


  function handleChange(
    event
  ) {
    setFormData({
      ...formData,

      [event.target.name]:
        event.target.value,
    });
  }


  function openAddModal() {
    setEditingClient(
      null
    );

    setFormData({
      ...emptyForm,
    });

    setMessage("");

    setModalOpen(
      true
    );
  }


  function openEditModal(
    client
  ) {
    setEditingClient(
      client
    );

    setFormData({
      firstName:
        client.first_name,

      lastName:
        client.last_name,

      email:
        client.email,

      phone:
        client.phone || "",

      password:
        "",
    });

    setMessage("");

    setModalOpen(
      true
    );
  }


  function closeModal() {
    setModalOpen(
      false
    );

    setEditingClient(
      null
    );

    setMessage("");
  }


  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    setMessage("");
    setSaving(true);


    try {
      if (
        editingClient
      ) {
        await apiFetch(
          `/admin/clients/${editingClient.id}`,
          {
            method: "PUT",

            body: {
              firstName:
                formData.firstName,

              lastName:
                formData.lastName,

              email:
                formData.email,

              phone:
                formData.phone,

              password:
                formData.password ||
                undefined,
            },
          }
        );
      } else {
        await apiFetch(
          "/admin/clients",
          {
            method: "POST",

            body: {
              firstName:
                formData.firstName,

              lastName:
                formData.lastName,

              email:
                formData.email,

              phone:
                formData.phone,

              password:
                formData.password,
            },
          }
        );
      }


      closeModal();

      await loadClients();
    } catch (error) {
      setMessage(
        error.message
      );
    } finally {
      setSaving(false);
    }
  }


  async function handleDelete(
    client
  ) {
    const confirmation =
      window.confirm(
        `Supprimer définitivement ${client.first_name} ${client.last_name} ?`
      );


    if (!confirmation) {
      return;
    }


    try {
      await apiFetch(
        `/admin/clients/${client.id}`,
        {
          method:
            "DELETE",
        }
      );


      await loadClients();
    } catch (error) {
      window.alert(
        error.message
      );
    }
  }


  const filteredClients =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();


      if (!term) {
        return clients;
      }


      return clients.filter(
        (client) => {
          const text =
            `
              ${client.first_name}
              ${client.last_name}
              ${client.email}
              ${client.phone || ""}
            `.toLowerCase();


          return text.includes(
            term
          );
        }
      );
    }, [
      clients,
      search,
    ]);


  return (
    <div className="p-8 lg:p-10">

      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

        <div>

          <p className="text-sm font-semibold text-[#0f73c4]">
            Administration
          </p>

          <h1 className="mt-1 text-3xl font-semibold text-[#10212f]">
            Gestion des clients
          </h1>

          <p className="mt-2 text-sm text-[#667785]">
            Gérez les comptes clients MERHAK.
          </p>

        </div>


        <button
          onClick={
            openAddModal
          }
          className="primary-button flex items-center justify-center gap-2"
        >

          <PlusIcon className="h-5 w-5" />

          Ajouter un client

        </button>

      </div>


      <div className="mt-8 flex items-center rounded-2xl border border-[#e5f1f8] bg-white px-4 shadow-sm">

        <MagnifyingGlassIcon className="h-5 w-5 text-[#8ca0ad]" />

        <input
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          placeholder="Rechercher par nom, e-mail ou téléphone..."
          className="w-full bg-transparent px-3 py-4 text-sm text-[#10212f] outline-none"
        />

      </div>


      <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="border-b border-[#e5f1f8] bg-[#f7fbfe]">

              <tr>

                <th className="table-heading">
                  Client
                </th>

                <th className="table-heading">
                  E-mail
                </th>

                <th className="table-heading">
                  Téléphone
                </th>

                <th className="table-heading text-right">
                  Actions
                </th>

              </tr>

            </thead>


            <tbody className="divide-y divide-[#edf4f8]">

              {loading ? (
                <tr>

                  <td
                    colSpan="4"
                    className="px-6 py-16 text-center text-sm text-[#667785]"
                  >
                    Chargement...
                  </td>

                </tr>
              ) : filteredClients.length ===
                0 ? (
                <tr>

                  <td
                    colSpan="4"
                    className="px-6 py-16 text-center text-sm text-[#667785]"
                  >
                    Aucun client trouvé.
                  </td>

                </tr>
              ) : (
                filteredClients.map(
                  (client) => (
                    <tr
                      key={
                        client.id
                      }
                      className="transition hover:bg-[#fafdff]"
                    >

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-3">

                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eaf8ff] text-sm font-bold text-[#0f73c4]">
                            {client.first_name?.[0]}
                            {client.last_name?.[0]}
                          </div>


                          <div>

                            <p className="font-medium text-[#10212f]">
                              {client.first_name}{" "}
                              {client.last_name}
                            </p>

                            <p className="mt-0.5 text-xs text-[#8ca0ad]">
                              Client #{client.id}
                            </p>

                          </div>

                        </div>

                      </td>


                      <td className="px-6 py-5 text-sm text-[#667785]">
                        {client.email}
                      </td>


                      <td className="px-6 py-5 text-sm text-[#667785]">
                        {client.phone ||
                          "—"}
                      </td>


                      <td className="px-6 py-5">

                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() =>
                              openEditModal(
                                client
                              )
                            }
                            className="rounded-xl p-2.5 text-[#667785] transition hover:bg-[#eaf8ff] hover:text-[#0f73c4]"
                            title="Modifier"
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>


                          <button
                            onClick={() =>
                              handleDelete(
                                client
                              )
                            }
                            className="rounded-xl p-2.5 text-[#667785] transition hover:bg-red-50 hover:text-red-600"
                            title="Supprimer"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>

                        </div>

                      </td>

                    </tr>
                  )
                )
              )}

            </tbody>

          </table>

        </div>

      </div>


      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#071824]/55 p-4 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-[#e5f1f8] px-7 py-6">

              <div>

                <h2 className="text-xl font-semibold text-[#10212f]">
                  {editingClient
                    ? "Modifier le client"
                    : "Ajouter un client"}
                </h2>

                <p className="mt-1 text-sm text-[#667785]">
                  {editingClient
                    ? "Mettez à jour les informations du client."
                    : "Créez un nouveau compte client MERHAK."}
                </p>

              </div>


              <button
                onClick={
                  closeModal
                }
                className="rounded-xl p-2 text-[#8ca0ad] transition hover:bg-[#f1f8fc] hover:text-[#10212f]"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>

            </div>


            <form
              onSubmit={
                handleSubmit
              }
              className="p-7"
            >

              <div className="grid gap-5 sm:grid-cols-2">

                <div>

                  <label className="form-label">
                    Prénom
                  </label>

                  <input
                    name="firstName"
                    value={
                      formData.firstName
                    }
                    onChange={
                      handleChange
                    }
                    className="form-input"
                    required
                  />

                </div>


                <div>

                  <label className="form-label">
                    Nom
                  </label>

                  <input
                    name="lastName"
                    value={
                      formData.lastName
                    }
                    onChange={
                      handleChange
                    }
                    className="form-input"
                    required
                  />

                </div>

              </div>


              <label className="form-label mt-5">
                Adresse e-mail
              </label>

              <input
                type="email"
                name="email"
                value={
                  formData.email
                }
                onChange={
                  handleChange
                }
                className="form-input"
                required
              />


              <label className="form-label mt-5">
                Téléphone
              </label>

              <input
                name="phone"
                value={
                  formData.phone
                }
                onChange={
                  handleChange
                }
                className="form-input"
              />


              <label className="form-label mt-5">
                {editingClient
                  ? "Nouveau mot de passe"
                  : "Mot de passe"}
              </label>

              <input
                type="password"
                name="password"
                value={
                  formData.password
                }
                onChange={
                  handleChange
                }
                minLength="10"
                className="form-input"
                required={
                  !editingClient
                }
              />


              {editingClient && (
                <p className="mt-2 text-xs text-[#8ca0ad]">
                  Laissez vide pour conserver le mot de passe actuel.
                </p>
              )}


              {message && (
                <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {message}
                </p>
              )}


              <div className="mt-7 flex justify-end gap-3">

                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  className="rounded-full border border-[#dcecf6] px-6 py-3 text-sm font-medium text-[#667785] transition hover:bg-[#f7fbfe]"
                >
                  Annuler
                </button>


                <button
                  type="submit"
                  disabled={saving}
                  className="primary-button"
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