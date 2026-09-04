import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeftIcon, BanknotesIcon, TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import { apiFetch } from "../../lib/api";

function CustomOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [savingStatus, setSavingStatus] = useState(false);
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");

  const [paying, setPaying] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    try {
      setLoading(true);
      setErrorMsg("");

      const orderData = await apiFetch(`/admin/custom-orders/${id}`);
      setOrder(orderData);
      setStatus(orderData.status);
      setNote(orderData.note || "");
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveStatus() {
    try {
      setSavingStatus(true);
      const updatedOrder = await apiFetch(`/admin/orders/${id}`, {
        method: "PATCH",
        body: { status, note },
      });
      setOrder({ ...order, status: updatedOrder.status, note: updatedOrder.note });
    } catch (error) {
      window.alert(error.message);
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleMarkAsPaid() {
    try {
      setPaying(true);
      await apiFetch(`/admin/orders/${id}/pay`, {
        method: "POST",
      });
      await loadData();
    } catch (error) {
      window.alert(error.message);
    } finally {
      setPaying(false);
    }
  }

  async function handleDelete() {
    const confirmation = window.confirm(
      `Supprimer définitivement la commande #${order.id} ?`
    );

    if (!confirmation) return;

    try {
      await apiFetch(`/admin/orders/${id}`, {
        method: "DELETE",
      });
      navigate("/admin/custom-orders");
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
          onClick={() => navigate("/admin/custom-orders")}
          className="mt-4 text-[#0f73c4] hover:underline"
        >
          Retour aux commandes sur-mesure
        </button>
      </div>
    );
  }

  if (!order) return null;

  const isCustom = order.type === "CUSTOM";
  const customDetail = order.customDetail;
  const financeEntries = order.financeEntries || [];
  
  const hasCustomOrderFinanceEntry = financeEntries.some(e => e.type === "CUSTOM_ORDER");
  
  let amountDue = 0;
  if (isCustom && customDetail) {
    amountDue = Number(customDetail.final_price || 0) - Number(customDetail.deposit_amount || 0);
  }
  const canMarkAsPaid = isCustom && amountDue > 0 && !hasCustomOrderFinanceEntry;

  return (
    <div className="p-8 lg:p-10">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/admin/custom-orders")}
          className="rounded-xl p-2.5 text-[#667785] transition hover:bg-[#eaf8ff] hover:text-[#0f73c4]"
          title="Retour aux commandes"
        >
          <ArrowLeftIcon className="h-6 w-6" />
        </button>

        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold text-[#10212f]">
              Commande #{order.id}
            </h1>
            <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${isCustom ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
              {isCustom ? 'Sur-mesure' : 'Standard'}
            </span>
          </div>
          <p className="mt-1 text-sm text-[#667785]">
            Créée le {new Date(order.created_at).toLocaleString()}
          </p>
        </div>

        <div className="flex gap-2">
          {canMarkAsPaid && (
            <button
              onClick={handleMarkAsPaid}
              disabled={paying}
              className="flex items-center gap-2 rounded-xl bg-[#0f73c4] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0c60a3]"
            >
              <BanknotesIcon className="h-5 w-5" />
              {paying ? "Enregistrement..." : "Marquer comme payé"}
            </button>
          )}
          <button
            onClick={() => navigate(`/admin/custom-orders/${order.id}/edit`)}
            className="rounded-xl p-2.5 text-[#667785] transition hover:bg-yellow-50 hover:text-yellow-600"
            title="Modifier détails & prix"
          >
            <PencilIcon className="h-6 w-6" />
          </button>
          <button
            onClick={handleDelete}
            className="rounded-xl p-2.5 text-[#667785] transition hover:bg-red-50 hover:text-red-600"
            title="Supprimer"
          >
            <TrashIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* LEFT COLUMN: Client & Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Client Info */}
          <section className="rounded-3xl border border-[#e5f1f8] bg-white p-7 shadow-sm">
            <h2 className="text-lg font-semibold text-[#10212f]">Informations Client</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-[#8ca0ad]">Nom complet</p>
                <p className="font-medium text-[#10212f]">{order.first_name} {order.last_name}</p>
              </div>
              <div>
                <p className="text-xs text-[#8ca0ad]">Téléphone</p>
                <p className="font-medium text-[#10212f]">{order.phone}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-[#8ca0ad]">Adresse de livraison</p>
                <p className="font-medium text-[#10212f]">{order.address}</p>
              </div>
            </div>
          </section>

          {/* Items / Custom Detail */}
          {isCustom ? (
            <section className="rounded-3xl border border-[#e5f1f8] bg-white p-7 shadow-sm">
              <h2 className="text-lg font-semibold text-[#10212f]">Détails Sur-Mesure</h2>
              {customDetail ? (
                <div className="mt-4 space-y-6">
                  <div>
                    <p className="text-xs text-[#8ca0ad]">Article</p>
                    <p className="font-medium text-[#10212f]">{customDetail.article_name}</p>
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-[#8ca0ad]">Date de début</p>
                      <p className="font-medium text-[#10212f]">{new Date(customDetail.start_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#8ca0ad]">Date de fin (prévue)</p>
                      <p className="font-medium text-[#10212f]">{new Date(customDetail.end_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#8ca0ad]">Date de livraison</p>
                      <p className="font-medium text-[#10212f]">{new Date(customDetail.delivery_date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {customDetail.measurement && (
                    <div>
                      <p className="text-xs text-[#8ca0ad]">Profil de mesures utilisé</p>
                      <p className="font-medium text-[#0f73c4]">{customDetail.measurement.label}</p>
                    </div>
                  )}

                  <div className="border-t border-[#e5f1f8] pt-4">
                    <h3 className="font-medium text-[#10212f] mb-3">Finances</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-[#8ca0ad]">Prix final</p>
                        <p className="font-medium text-[#10212f]">{Number(customDetail.final_price).toFixed(3)} TND</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#8ca0ad]">Acompte versé</p>
                        <p className="font-medium text-[#10212f]">{Number(customDetail.deposit_amount || 0).toFixed(3)} TND</p>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="text-xs text-[#8ca0ad]">Solde restant</p>
                        <p className={`font-medium ${amountDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {amountDue > 0 ? `${amountDue.toFixed(3)} TND` : 'Payé en totalité'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-[#667785]">Détails non trouvés.</p>
              )}
            </section>
          ) : (
            <section className="rounded-3xl border border-[#e5f1f8] bg-white p-7 shadow-sm">
              <h2 className="text-lg font-semibold text-[#10212f]">Articles</h2>
              <div className="mt-4 divide-y divide-[#edf4f8]">
                {order.items && order.items.length > 0 ? (
                  order.items.map(item => (
                    <div key={item.id} className="py-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-[#10212f]">{item.product_name}</p>
                        <p className="text-xs text-[#8ca0ad]">
                          {item.size || ''} {item.color ? `- ${item.color}` : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-[#10212f]">{Number(item.unit_price).toFixed(3)} TND</p>
                        <p className="text-xs text-[#8ca0ad]">x {item.quantity}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#667785]">Aucun article.</p>
                )}
                
                <div className="pt-4 flex justify-between items-center">
                  <p className="font-semibold text-[#10212f]">Total</p>
                  <p className="font-bold text-lg text-[#0f73c4]">{Number(order.total_price).toFixed(3)} TND</p>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* RIGHT COLUMN: Status & Note */}
        <div className="space-y-8">
          <section className="rounded-3xl border border-[#e5f1f8] bg-white p-7 shadow-sm">
            <h2 className="text-lg font-semibold text-[#10212f] mb-4">Statut & Notes</h2>
            
            <div className="space-y-4">
              <div>
                <label className="form-label block text-xs text-[#8ca0ad] mb-1">Statut de la commande</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl border border-[#e5f1f8] bg-[#f7fbfe] px-4 py-2.5 text-sm text-[#10212f] outline-none"
                >
                  <option value="NEW">Nouvelle</option>
                  <option value="CONFIRMED">Confirmée</option>
                  <option value="IN_PROGRESS">En cours</option>
                  <option value="READY">Prête</option>
                  <option value="DELIVERED">Livrée</option>
                  <option value="CANCELLED">Annulée</option>
                </select>
              </div>

              <div>
                <label className="form-label block text-xs text-[#8ca0ad] mb-1">Note interne (optionnelle)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full h-24 resize-none rounded-xl border border-[#e5f1f8] bg-[#f7fbfe] p-4 text-sm text-[#10212f] outline-none"
                  placeholder="Ajouter une note..."
                ></textarea>
              </div>

              <button
                onClick={handleSaveStatus}
                disabled={savingStatus}
                className="w-full rounded-xl bg-[#0f73c4] py-3 text-sm font-medium text-white transition hover:bg-[#0c60a3]"
              >
                {savingStatus ? "Enregistrement..." : "Enregistrer les modifications"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default CustomOrderDetail;
