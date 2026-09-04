import { useEffect, useMemo, useState } from "react";
import { MagnifyingGlassIcon, PlusIcon, EyeIcon, TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../../lib/api";

function CustomOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const navigate = useNavigate();

  async function loadOrders() {
    try {
      setLoading(true);
      const data = await apiFetch("/admin/custom-orders");
      setOrders(data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function handleDelete(order) {
    const confirmation = window.confirm(
      `Supprimer définitivement la commande sur-mesure #${order.id} ?`
    );

    if (!confirmation) {
      return;
    }

    try {
      await apiFetch(`/admin/custom-orders/${order.id}`, {
        method: "DELETE",
      });
      await loadOrders();
    } catch (error) {
      window.alert(error.message);
    }
  }

  async function handleStatusChange(order, newStatus) {
    if (order.status === newStatus) return;
    
    const originalOrders = [...orders];
    setOrders(orders.map(o => o.id === order.id ? { ...o, status: newStatus } : o));
    setUpdatingStatusId(order.id);
    
    try {
      await apiFetch(`/admin/orders/${order.id}`, {
        method: "PATCH",
        body: { status: newStatus }
      });
    } catch (error) {
      window.alert("Erreur lors de la mise à jour du statut: " + error.message);
      setOrders(originalOrders);
    } finally {
      setUpdatingStatusId(null);
    }
  }

  const filteredOrders = useMemo(() => {
    let result = orders;

    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter((order) => {
        const text = `${order.first_name} ${order.last_name} ${order.phone || ""}`.toLowerCase();
        return text.includes(term);
      });
    }

    if (statusFilter) {
      result = result.filter((order) => order.status === statusFilter);
    }

    return result;
  }, [orders, search, statusFilter]);

  function getStatusColor(status) {
    switch (status) {
      case "NEW": return "bg-blue-100 text-blue-700";
      case "CONFIRMED": return "bg-indigo-100 text-indigo-700";
      case "IN_PROGRESS": return "bg-yellow-100 text-yellow-700";
      case "READY": return "bg-green-100 text-green-700";
      case "DELIVERED": return "bg-emerald-100 text-emerald-700";
      case "CANCELLED": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  }

  function formatStatus(status) {
    switch (status) {
      case "NEW": return "Nouvelle";
      case "CONFIRMED": return "Confirmée";
      case "IN_PROGRESS": return "En cours";
      case "READY": return "Prête";
      case "DELIVERED": return "Livrée";
      case "CANCELLED": return "Annulée";
      default: return status;
    }
  }

  function formatPaymentStatus(status) {
    switch (status) {
      case "PAID": return <span className="inline-block rounded-full px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700">Payé</span>;
      case "DEPOSIT": return <span className="inline-block rounded-full px-2.5 py-1 text-xs font-medium bg-orange-100 text-orange-700">Acompte payé</span>;
      default: return <span className="inline-block rounded-full px-2.5 py-1 text-xs font-medium bg-red-100 text-red-700">Non payé</span>;
    }
  }

  return (
    <div className="p-8 lg:p-10">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold text-[#0f73c4]">Administration</p>
          <h1 className="mt-1 text-3xl font-semibold text-[#10212f]">Sur-Mesure</h1>
          <p className="mt-2 text-sm text-[#667785]">Gérez uniquement les commandes sur-mesure.</p>
        </div>

        <button
          onClick={() => navigate("/admin/custom-orders/new")}
          className="primary-button flex items-center justify-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Nouvelle commande
        </button>
      </div>

      {message && (
        <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {message}
        </p>
      )}

      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <div className="flex flex-1 items-center rounded-2xl border border-[#e5f1f8] bg-white px-4 shadow-sm">
          <MagnifyingGlassIcon className="h-5 w-5 text-[#8ca0ad]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un client ou téléphone..."
            className="w-full bg-transparent px-3 py-3 text-sm text-[#10212f] outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-2xl border border-[#e5f1f8] bg-white px-4 py-3 text-sm text-[#10212f] shadow-sm outline-none"
        >
          <option value="">Tous les statuts</option>
          <option value="NEW">Nouvelle</option>
          <option value="CONFIRMED">Confirmée</option>
          <option value="IN_PROGRESS">En cours</option>
          <option value="READY">Prête</option>
          <option value="DELIVERED">Livrée</option>
          <option value="CANCELLED">Annulée</option>
        </select>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#e5f1f8] bg-[#f7fbfe]">
              <tr>
                <th className="px-6 py-4 font-semibold text-[#10212f]">Commande</th>
                <th className="px-6 py-4 font-semibold text-[#10212f]">Client</th>
                <th className="px-6 py-4 font-semibold text-[#10212f]">Date</th>
                <th className="px-6 py-4 font-semibold text-[#10212f]">Statut</th>
                <th className="px-6 py-4 font-semibold text-[#10212f]">Paiement</th>
                <th className="px-6 py-4 font-semibold text-[#10212f]">Total</th>
                <th className="px-6 py-4 font-semibold text-right text-[#10212f]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf4f8]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center text-[#667785]">Chargement...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center text-[#667785]">Aucune commande sur-mesure trouvée.</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="transition hover:bg-[#fafdff]">
                    <td className="px-6 py-5 font-medium text-[#10212f]">#{order.id}</td>
                    <td className="px-6 py-5">
                      <p className="font-medium text-[#10212f]">{order.first_name} {order.last_name}</p>
                      <p className="text-xs text-[#8ca0ad]">{order.phone}</p>
                    </td>
                    <td className="px-6 py-5 text-[#667785]">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order, e.target.value)}
                          disabled={updatingStatusId === order.id}
                          className={`rounded-full px-2.5 py-1 text-xs font-medium outline-none cursor-pointer border-none appearance-none pr-6 ${getStatusColor(order.status)}`}
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='2' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9' /%3E%3C/svg%3E")`,
                            backgroundPosition: "right 0.3rem center",
                            backgroundRepeat: "no-repeat",
                            backgroundSize: "1em 1em"
                          }}
                        >
                          <option value="NEW">Nouvelle</option>
                          <option value="CONFIRMED">Confirmée</option>
                          <option value="IN_PROGRESS">En cours</option>
                          <option value="READY">Prête</option>
                          <option value="DELIVERED">Livrée</option>
                          <option value="CANCELLED">Annulée</option>
                        </select>
                        {updatingStatusId === order.id && (
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#0f73c4] border-t-transparent"></span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {formatPaymentStatus(order.payment_status)}
                    </td>
                    <td className="px-6 py-5 font-medium text-[#10212f]">
                      {Number(order.total_price).toFixed(3)} TND
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/custom-orders/${order.id}`}
                          className="rounded-xl p-2.5 text-[#667785] transition hover:bg-[#eaf8ff] hover:text-[#0f73c4]"
                          title="Gérer statut & paiements"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        <Link
                          to={`/admin/custom-orders/${order.id}/edit`}
                          className="rounded-xl p-2.5 text-[#667785] transition hover:bg-yellow-50 hover:text-yellow-600"
                          title="Modifier détails & prix"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(order)}
                          className="rounded-xl p-2.5 text-[#667785] transition hover:bg-red-50 hover:text-red-600"
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
    </div>
  );
}

export default CustomOrders;
