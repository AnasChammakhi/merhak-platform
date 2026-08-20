import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { apiFetch } from "../../lib/api";

export async function fetchClientMeasurements(clientId) {
  return await apiFetch(`/admin/clients/${clientId}/measurements`);
}

const emptyMeasurementForm = {
  label: "Moi",
  chestCirc: "",
  waistCirc: "",
  hipCirc: "",
  armCirc: "",
  wristCirc: "",
  frontSquare: "",
  backSquare: "",
  shoulderLen: "",
  walkLen: "",
  frontLen: "",
  dressLen: "",
  shirtLen: "",
  skirtLen: "",
  pantsLen: "",
  chestLen: "",
  other: "",
};

function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState(null);
  const [formData, setFormData] = useState(emptyMeasurementForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    try {
      setLoading(true);
      setErrorMsg("");

      const [clientData, measurementsData] = await Promise.all([
        apiFetch(`/admin/clients/${id}`),
        fetchClientMeasurements(id),
      ]);

      setClient(clientData);
      setMeasurements(measurementsData);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingMeasurement(null);
    setFormData({ ...emptyMeasurementForm });
    setFormError("");
    setModalOpen(true);
  }

  function openEditModal(measurement) {
    setEditingMeasurement(measurement);
    
    setFormData({
      label: measurement.label || "Moi",
      chestCirc: measurement.chest_circ || "",
      waistCirc: measurement.waist_circ || "",
      hipCirc: measurement.hip_circ || "",
      armCirc: measurement.arm_circ || "",
      wristCirc: measurement.wrist_circ || "",
      frontSquare: measurement.front_square || "",
      backSquare: measurement.back_square || "",
      shoulderLen: measurement.shoulder_len || "",
      walkLen: measurement.walk_len || "",
      frontLen: measurement.front_len || "",
      dressLen: measurement.dress_len || "",
      shirtLen: measurement.shirt_len || "",
      skirtLen: measurement.skirt_len || "",
      pantsLen: measurement.pants_len || "",
      chestLen: measurement.chest_len || "",
      other: measurement.other || "",
    });

    setFormError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingMeasurement(null);
    setFormError("");
  }

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    setSaving(true);

    try {
      if (editingMeasurement) {
        await apiFetch(`/admin/clients/${id}/measurements/${editingMeasurement.id}`, {
          method: "PUT",
          body: formData,
        });
      } else {
        await apiFetch(`/admin/clients/${id}/measurements`, {
          method: "POST",
          body: formData,
        });
      }

      closeModal();
      const updatedMeasurements = await fetchClientMeasurements(id);
      setMeasurements(updatedMeasurements);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(measurement) {
    const confirmation = window.confirm(
      `Supprimer définitivement les mesures "${measurement.label}" ?`
    );

    if (!confirmation) {
      return;
    }

    try {
      await apiFetch(`/admin/clients/${id}/measurements/${measurement.id}`, {
        method: "DELETE",
      });

      const updatedMeasurements = await fetchClientMeasurements(id);
      setMeasurements(updatedMeasurements);
    } catch (error) {
      window.alert(error.message);
    }
  }

  if (loading) {
    return (
      <div className="p-8 lg:p-10">
        <p className="text-[#667785]">Chargement...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="p-8 lg:p-10">
        <p className="text-red-600">{errorMsg}</p>
        <button
          onClick={() => navigate("/admin/clients")}
          className="mt-4 text-[#0f73c4] hover:underline"
        >
          Retour aux clients
        </button>
      </div>
    );
  }

  if (!client) return null;

  return (
    <div className="p-8 lg:p-10">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/admin/clients")}
          className="rounded-xl p-2.5 text-[#667785] transition hover:bg-[#eaf8ff] hover:text-[#0f73c4]"
          title="Retour aux clients"
        >
          <ArrowLeftIcon className="h-6 w-6" />
        </button>

        <div>
          <h1 className="text-3xl font-semibold text-[#10212f]">
            {client.name}
          </h1>
          <p className="mt-1 text-sm text-[#667785]">
            {client.email && <span>{client.email}</span>}
            {client.email && client.phone && <span className="mx-2">•</span>}
            {client.phone && <span>{client.phone}</span>}
          </p>
        </div>
      </div>

      {/* MEASUREMENTS SECTION */}
      <div className="mt-10 flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <h2 className="text-xl font-semibold text-[#10212f]">Mesures</h2>
          <p className="mt-1 text-sm text-[#667785]">
            Gérez les profils de mesures pour ce client.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="primary-button flex items-center justify-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Nouvelle mesure
        </button>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {measurements.length === 0 ? (
          <p className="col-span-full text-sm text-[#667785]">
            Aucune mesure enregistrée pour ce client.
          </p>
        ) : (
          measurements.map((measurement) => (
            <div
              key={measurement.id}
              className="relative rounded-3xl border border-[#e5f1f8] bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[#10212f]">
                    {measurement.label}
                  </h3>
                  <p className="mt-1 text-xs text-[#8ca0ad]">
                    {new Date(measurement.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(measurement)}
                    className="rounded-lg p-2 text-[#667785] hover:bg-[#eaf8ff] hover:text-[#0f73c4] transition"
                    title="Modifier"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(measurement)}
                    className="rounded-lg p-2 text-[#667785] hover:bg-red-50 hover:text-red-600 transition"
                    title="Supprimer"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="mt-4 text-sm text-[#667785]">
                {measurement.chest_circ && <p>Poitrine: {measurement.chest_circ} cm</p>}
                {measurement.waist_circ && <p>Taille: {measurement.waist_circ} cm</p>}
                {measurement.shoulder_len && <p>Epaule: {measurement.shoulder_len} cm</p>}
                {!measurement.chest_circ && !measurement.waist_circ && !measurement.shoulder_len && (
                  <p className="italic text-[#8ca0ad]">Aperçu non disponible...</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#071824]/55 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e5f1f8] px-7 py-6">
              <div>
                <h2 className="text-xl font-semibold text-[#10212f]">
                  {editingMeasurement ? "Modifier les mesures" : "Nouvelle mesure"}
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="rounded-xl p-2 text-[#8ca0ad] transition hover:bg-[#f1f8fc] hover:text-[#10212f]"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-7">
              <div className="mb-8">
                <label className="form-label">Label de profil</label>
                <input
                  name="label"
                  value={formData.label}
                  onChange={handleChange}
                  className="form-input"
                  required
                  placeholder="Ex: Moi, Ami Ahmed..."
                />
              </div>

              {/* Circonférences */}
              <div className="mb-6">
                <h3 className="mb-4 text-lg font-medium text-[#10212f]">Circonférences (cm)</h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="form-label text-xs">T.Poitrine</label>
                    <input type="number" step="0.01" min="0" name="chestCirc" value={formData.chestCirc} onChange={handleChange} className="form-input py-2" />
                  </div>
                  <div>
                    <label className="form-label text-xs">T.Taille</label>
                    <input type="number" step="0.01" min="0" name="waistCirc" value={formData.waistCirc} onChange={handleChange} className="form-input py-2" />
                  </div>
                  <div>
                    <label className="form-label text-xs">T.Hanche</label>
                    <input type="number" step="0.01" min="0" name="hipCirc" value={formData.hipCirc} onChange={handleChange} className="form-input py-2" />
                  </div>
                  <div>
                    <label className="form-label text-xs">T.Bras</label>
                    <input type="number" step="0.01" min="0" name="armCirc" value={formData.armCirc} onChange={handleChange} className="form-input py-2" />
                  </div>
                  <div>
                    <label className="form-label text-xs">T.Poignet</label>
                    <input type="number" step="0.01" min="0" name="wristCirc" value={formData.wristCirc} onChange={handleChange} className="form-input py-2" />
                  </div>
                </div>
              </div>

              {/* Longueurs */}
              <div className="mb-6">
                <h3 className="mb-4 text-lg font-medium text-[#10212f]">Longueurs (cm)</h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="form-label text-xs">L.Epaule</label>
                    <input type="number" step="0.01" min="0" name="shoulderLen" value={formData.shoulderLen} onChange={handleChange} className="form-input py-2" />
                  </div>
                  <div>
                    <label className="form-label text-xs">L.Manche</label>
                    <input type="number" step="0.01" min="0" name="walkLen" value={formData.walkLen} onChange={handleChange} className="form-input py-2" />
                  </div>
                  <div>
                    <label className="form-label text-xs">L.Devant</label>
                    <input type="number" step="0.01" min="0" name="frontLen" value={formData.frontLen} onChange={handleChange} className="form-input py-2" />
                  </div>
                  <div>
                    <label className="form-label text-xs">L.Robe</label>
                    <input type="number" step="0.01" min="0" name="dressLen" value={formData.dressLen} onChange={handleChange} className="form-input py-2" />
                  </div>
                  <div>
                    <label className="form-label text-xs">L.Chemise</label>
                    <input type="number" step="0.01" min="0" name="shirtLen" value={formData.shirtLen} onChange={handleChange} className="form-input py-2" />
                  </div>
                  <div>
                    <label className="form-label text-xs">L.Jupe</label>
                    <input type="number" step="0.01" min="0" name="skirtLen" value={formData.skirtLen} onChange={handleChange} className="form-input py-2" />
                  </div>
                  <div>
                    <label className="form-label text-xs">L.Pantalon</label>
                    <input type="number" step="0.01" min="0" name="pantsLen" value={formData.pantsLen} onChange={handleChange} className="form-input py-2" />
                  </div>
                  <div>
                    <label className="form-label text-xs">L.Poitrine</label>
                    <input type="number" step="0.01" min="0" name="chestLen" value={formData.chestLen} onChange={handleChange} className="form-input py-2" />
                  </div>
                </div>
              </div>

              {/* Carrure */}
              <div className="mb-6">
                <h3 className="mb-4 text-lg font-medium text-[#10212f]">Carrure (cm)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label text-xs">Carr DVT</label>
                    <input type="number" step="0.01" min="0" name="frontSquare" value={formData.frontSquare} onChange={handleChange} className="form-input py-2" />
                  </div>
                  <div>
                    <label className="form-label text-xs">Carr DOS</label>
                    <input type="number" step="0.01" min="0" name="backSquare" value={formData.backSquare} onChange={handleChange} className="form-input py-2" />
                  </div>
                </div>
              </div>

              {/* Autres */}
              <div className="mb-6">
                <label className="form-label">Autres détails</label>
                <textarea
                  name="other"
                  value={formData.other}
                  onChange={handleChange}
                  className="form-input h-24 resize-none"
                  placeholder="Remarques additionnelles..."
                ></textarea>
              </div>

              {formError && (
                <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {formError}
                </p>
              )}

              <div className="mt-7 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full border border-[#dcecf6] px-6 py-3 text-sm font-medium text-[#667785] transition hover:bg-[#f7fbfe]"
                >
                  Annuler
                </button>
                <button type="submit" disabled={saving} className="primary-button">
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientDetail;
