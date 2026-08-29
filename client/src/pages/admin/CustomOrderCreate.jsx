import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { apiFetch } from "../../lib/api";

function CustomOrderCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [clients, setClients] = useState([]);
  const [clientMeasurements, setClientMeasurements] = useState([]);

  // Client State
  const [isNewClient, setIsNewClient] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");

  // Measurement State
  const [isNewMeasurement, setIsNewMeasurement] = useState(false);
  const [selectedMeasurementId, setSelectedMeasurementId] = useState("");
  const [newMeasurementLabel, setNewMeasurementLabel] = useState("Moi");
  const [newMeasurementData, setNewMeasurementData] = useState({
    chestCirc: "", waistCirc: "", hipCirc: "", armCirc: "", wristCirc: "",
    frontSquare: "", backSquare: "", shoulderLen: "", walkLen: "", frontLen: "",
    dressLen: "", shirtLen: "", skirtLen: "", pantsLen: "", chestLen: "", other: ""
  });

  // Order Details
  const [articleName, setArticleName] = useState("");
  const [note, setNote] = useState("");
  
  // Fabric
  const [fabricProvidedByClient, setFabricProvidedByClient] = useState(false);
  const [fabricInputMode, setFabricInputMode] = useState("CALCULATE"); // "CALCULATE" | "DIRECT"
  const [directFabricTotal, setDirectFabricTotal] = useState("");
  const [fabricPricePerMeter, setFabricPricePerMeter] = useState("");
  const [metersNeeded, setMetersNeeded] = useState("");
  
  // Costs
  const [subcontractingCost, setSubcontractingCost] = useState("");
  const [laborCost, setLaborCost] = useState("");
  const [finalPrice, setFinalPrice] = useState("");
  
  // Deposit
  const [depositAmount, setDepositAmount] = useState("");
  const [depositDate, setDepositDate] = useState("");

  // Dates
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");

  // Image URL (temporary solution until proper upload is configured)
  const [imageUrl, setImageUrl] = useState("");

  // Format date for inputs (YYYY-MM-DD)
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
  };

  useEffect(() => {
    apiFetch("/admin/clients")
      .then(setClients)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedClientId && !isNewClient) {
      apiFetch(`/admin/clients/${selectedClientId}/measurements`)
        .then(setClientMeasurements)
        .catch(console.error);
    } else {
      setClientMeasurements([]);
      if (!isEditMode) setSelectedMeasurementId("");
    }
  }, [selectedClientId, isNewClient, isEditMode]);

  useEffect(() => {
    if (isEditMode) {
      apiFetch(`/admin/custom-orders/${id}`)
        .then((order) => {
          setSelectedClientId(order.client_id);
          setArticleName(order.customDetail.article_name || "");
          setNote(order.note || order.customDetail.note || "");
          
          setFabricProvidedByClient(Boolean(order.customDetail.fabric_provided_by_client));
          if (order.customDetail.fabric_price_per_meter !== null && order.customDetail.fabric_price_per_meter !== undefined) {
            setFabricInputMode("CALCULATE");
          } else if (order.customDetail.fabric_total_price && !order.customDetail.fabric_provided_by_client) {
            setFabricInputMode("DIRECT");
            setDirectFabricTotal(order.customDetail.fabric_total_price || "");
          }
          setFabricPricePerMeter(order.customDetail.fabric_price_per_meter || "");
          setMetersNeeded(order.customDetail.meters_needed || "");
          
          setSubcontractingCost(order.customDetail.subcontracting_cost || "");
          setLaborCost(order.customDetail.labor_cost || "");
          setFinalPrice(order.customDetail.final_price || order.total_price || "");
          
          setImageUrl(order.customDetail.image_url || "");
          
          setStartDate(formatDate(order.customDetail.start_date));
          setEndDate(formatDate(order.customDetail.end_date));
          setDeliveryDate(formatDate(order.customDetail.delivery_date));
          
          setSelectedMeasurementId(order.customDetail.measurement_id);

          setInitialLoading(false);
        })
        .catch((err) => {
          setErrorMsg("Erreur lors du chargement de la commande.");
          console.error(err);
          setInitialLoading(false);
        });
    }
  }, [id, isEditMode]);

  const fabricTotalPrice = useMemo(() => {
    if (fabricProvidedByClient) return 0;
    if (fabricInputMode === "DIRECT") return parseFloat(directFabricTotal) || 0;
    const price = parseFloat(fabricPricePerMeter) || 0;
    const meters = parseFloat(metersNeeded) || 0;
    return price * meters;
  }, [fabricProvidedByClient, fabricInputMode, directFabricTotal, fabricPricePerMeter, metersNeeded]);

  const recommendedPrice = useMemo(() => {
    return (fabricTotalPrice + (parseFloat(subcontractingCost) || 0) + (parseFloat(laborCost) || 0)) * 3;
  }, [fabricTotalPrice, subcontractingCost, laborCost]);

  function handleMeasurementChange(e) {
    setNewMeasurementData({ ...newMeasurementData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      if (!isEditMode) {
        if (!isNewClient && !selectedClientId) throw new Error("Veuillez sélectionner ou créer un client.");
        if (isNewClient && !newClientName.trim()) throw new Error("Le nom du client est requis.");
        
        if (!isNewMeasurement && !selectedMeasurementId) throw new Error("Veuillez sélectionner ou créer un profil de mesures.");
        if (isNewMeasurement && !newMeasurementLabel.trim()) throw new Error("Le label de mesure est requis.");
      }

      if (!articleName.trim()) throw new Error("Le nom de l'article est requis.");
      if (!startDate || !endDate || !deliveryDate) throw new Error("Les dates sont requises.");

      const payload = {
        articleName, note,
        fabricProvidedByClient, 
        fabricPricePerMeter: (!fabricProvidedByClient && fabricInputMode === "CALCULATE" && fabricPricePerMeter) ? parseFloat(fabricPricePerMeter) : null,
        metersNeeded: (!fabricProvidedByClient && fabricInputMode === "CALCULATE" && metersNeeded) ? parseFloat(metersNeeded) : null,
        fabricTotalPrice: fabricTotalPrice || null,
        subcontractingCost: parseFloat(subcontractingCost) || 0,
        laborCost: parseFloat(laborCost) || 0,
        recommendedPrice,
        finalPrice: parseFloat(finalPrice) || 0,
        startDate, endDate, deliveryDate,
        imageUrl: imageUrl || null
      };

      if (!isEditMode) {
        Object.assign(payload, {
          existingClientId: isNewClient ? null : selectedClientId,
          newClientName: isNewClient ? newClientName : null,
          newClientPhone: isNewClient ? newClientPhone : null,
          existingMeasurementId: isNewMeasurement ? null : selectedMeasurementId,
          newMeasurementLabel: isNewMeasurement ? newMeasurementLabel : null,
          newMeasurementData: isNewMeasurement ? newMeasurementData : null,
          depositAmount: depositAmount ? parseFloat(depositAmount) : null,
          depositDate: depositDate || null,
        });
      }

      const method = isEditMode ? "PUT" : "POST";
      const endpoint = isEditMode ? `/admin/custom-orders/${id}` : "/admin/custom-orders";
      
      const response = await apiFetch(endpoint, {
        method,
        body: payload
      });

      if (isEditMode) {
        navigate(`/admin/orders/${id}`); // Go back to view
      } else {
        navigate(`/admin/orders/${response.id}`); // View new order
      }
    } catch (err) {
      setErrorMsg(err.message);
      setLoading(false);
    }
  }

  if (initialLoading) {
    return <div className="p-10 text-center text-[#667785]">Chargement des détails...</div>;
  }

  return (
    <div className="p-8 lg:p-10 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/admin/custom-orders")}
          className="rounded-xl p-2.5 text-[#667785] transition hover:bg-[#eaf8ff] hover:text-[#0f73c4]"
        >
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-3xl font-semibold text-[#10212f]">
            {isEditMode ? `Modifier commande #${id}` : "Nouvelle commande Sur-Mesure"}
          </h1>
          <p className="mt-1 text-sm text-[#667785]">
            {isEditMode ? "Ajustez les détails et les prix." : "Remplissez les informations pour créer la commande."}
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* CLIENT SECTION (Hidden in Edit mode) */}
        {!isEditMode && (
          <section className="rounded-3xl border border-[#e5f1f8] bg-white p-7 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-[#10212f]">1. Client</h2>
              <button
                type="button"
                onClick={() => { setIsNewClient(!isNewClient); setSelectedClientId(""); }}
                className="text-sm font-medium text-[#0f73c4] hover:underline"
              >
                {isNewClient ? "Choisir un client existant" : "+ Nouveau client"}
              </button>
            </div>

            {isNewClient ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="form-label text-xs">Nom complet *</label>
                  <input required value={newClientName} onChange={e => setNewClientName(e.target.value)} className="form-input py-2" />
                </div>
                <div>
                  <label className="form-label text-xs">Téléphone</label>
                  <input value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} className="form-input py-2" />
                </div>
              </div>
            ) : (
              <div>
                <label className="form-label text-xs">Sélectionner un client *</label>
                <select required value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)} className="form-input py-2">
                  <option value="">-- Choisir --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>
                  ))}
                </select>
              </div>
            )}
          </section>
        )}

        {/* MEASUREMENTS SECTION (Hidden in Edit mode) */}
        {!isEditMode && (
          <section className="rounded-3xl border border-[#e5f1f8] bg-white p-7 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-[#10212f]">2. Mesures</h2>
              <button
                type="button"
                onClick={() => { setIsNewMeasurement(!isNewMeasurement); setSelectedMeasurementId(""); }}
                className="text-sm font-medium text-[#0f73c4] hover:underline"
              >
                {isNewMeasurement ? "Choisir des mesures existantes" : "+ Nouvelles mesures"}
              </button>
            </div>

            {isNewMeasurement ? (
              <div>
                <div className="mb-4">
                  <label className="form-label text-xs">Label du profil *</label>
                  <input required value={newMeasurementLabel} onChange={e => setNewMeasurementLabel(e.target.value)} className="form-input py-2" placeholder="Ex: Moi, Fille..." />
                </div>
                {/* Circonférences */}
                <div className="mt-6 mb-6">
                  <h3 className="mb-4 text-sm font-medium text-[#10212f]">Circonférences (cm)</h3>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <div><label className="form-label text-xs">T.Poitrine</label><input type="number" step="0.01" min="0" name="chestCirc" value={newMeasurementData.chestCirc} onChange={handleMeasurementChange} className="form-input py-2" /></div>
                    <div><label className="form-label text-xs">T.Taille</label><input type="number" step="0.01" min="0" name="waistCirc" value={newMeasurementData.waistCirc} onChange={handleMeasurementChange} className="form-input py-2" /></div>
                    <div><label className="form-label text-xs">T.Hanche</label><input type="number" step="0.01" min="0" name="hipCirc" value={newMeasurementData.hipCirc} onChange={handleMeasurementChange} className="form-input py-2" /></div>
                    <div><label className="form-label text-xs">T.Bras</label><input type="number" step="0.01" min="0" name="armCirc" value={newMeasurementData.armCirc} onChange={handleMeasurementChange} className="form-input py-2" /></div>
                    <div><label className="form-label text-xs">T.Poignet</label><input type="number" step="0.01" min="0" name="wristCirc" value={newMeasurementData.wristCirc} onChange={handleMeasurementChange} className="form-input py-2" /></div>
                  </div>
                </div>

                {/* Longueurs */}
                <div className="mb-6">
                  <h3 className="mb-4 text-sm font-medium text-[#10212f]">Longueurs (cm)</h3>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <div><label className="form-label text-xs">L.Epaule</label><input type="number" step="0.01" min="0" name="shoulderLen" value={newMeasurementData.shoulderLen} onChange={handleMeasurementChange} className="form-input py-2" /></div>
                    <div><label className="form-label text-xs">L.Manche</label><input type="number" step="0.01" min="0" name="walkLen" value={newMeasurementData.walkLen} onChange={handleMeasurementChange} className="form-input py-2" /></div>
                    <div><label className="form-label text-xs">L.Devant</label><input type="number" step="0.01" min="0" name="frontLen" value={newMeasurementData.frontLen} onChange={handleMeasurementChange} className="form-input py-2" /></div>
                    <div><label className="form-label text-xs">L.Robe</label><input type="number" step="0.01" min="0" name="dressLen" value={newMeasurementData.dressLen} onChange={handleMeasurementChange} className="form-input py-2" /></div>
                    <div><label className="form-label text-xs">L.Chemise</label><input type="number" step="0.01" min="0" name="shirtLen" value={newMeasurementData.shirtLen} onChange={handleMeasurementChange} className="form-input py-2" /></div>
                    <div><label className="form-label text-xs">L.Jupe</label><input type="number" step="0.01" min="0" name="skirtLen" value={newMeasurementData.skirtLen} onChange={handleMeasurementChange} className="form-input py-2" /></div>
                    <div><label className="form-label text-xs">L.Pantalon</label><input type="number" step="0.01" min="0" name="pantsLen" value={newMeasurementData.pantsLen} onChange={handleMeasurementChange} className="form-input py-2" /></div>
                    <div><label className="form-label text-xs">L.Poitrine</label><input type="number" step="0.01" min="0" name="chestLen" value={newMeasurementData.chestLen} onChange={handleMeasurementChange} className="form-input py-2" /></div>
                  </div>
                </div>

                {/* Carrure */}
                <div className="mb-6">
                  <h3 className="mb-4 text-sm font-medium text-[#10212f]">Carrure (cm)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="form-label text-xs">Carr DVT</label><input type="number" step="0.01" min="0" name="frontSquare" value={newMeasurementData.frontSquare} onChange={handleMeasurementChange} className="form-input py-2" /></div>
                    <div><label className="form-label text-xs">Carr DOS</label><input type="number" step="0.01" min="0" name="backSquare" value={newMeasurementData.backSquare} onChange={handleMeasurementChange} className="form-input py-2" /></div>
                  </div>
                </div>

                {/* Autres */}
                <div>
                  <label className="form-label text-xs">Autres détails</label>
                  <textarea name="other" value={newMeasurementData.other} onChange={handleMeasurementChange} className="form-input py-2 h-20 resize-none" placeholder="Remarques additionnelles..."></textarea>
                </div>
              </div>
            ) : (
              <div>
                <label className="form-label text-xs">Sélectionner un profil *</label>
                <select required value={selectedMeasurementId} onChange={e => setSelectedMeasurementId(e.target.value)} className="form-input py-2" disabled={!selectedClientId || isNewClient}>
                  <option value="">-- Choisir --</option>
                  {clientMeasurements.map(m => (
                    <option key={m.id} value={m.id}>{m.label} ({new Date(m.created_at).toLocaleDateString()})</option>
                  ))}
                </select>
                {(!selectedClientId || isNewClient) && <p className="text-xs text-[#8ca0ad] mt-1">Sélectionnez d'abord un client existant.</p>}
              </div>
            )}
          </section>
        )}

        {/* DETAILS SECTION */}
        <section className="rounded-3xl border border-[#e5f1f8] bg-white p-7 shadow-sm">
          <h2 className="text-lg font-semibold text-[#10212f] mb-6">{isEditMode ? "1. Détails & Tissu" : "3. Détails & Tissu"}</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="form-label text-xs">Nom de l'article *</label>
              <input required value={articleName} onChange={e => setArticleName(e.target.value)} className="form-input py-2" placeholder="Ex: Robe de soirée" />
            </div>
            <div>
              <label className="form-label text-xs">URL Photo de référence</label>
              <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="form-input py-2" placeholder="https://..." />
            </div>
            
            <div className="sm:col-span-2 border-t border-[#e5f1f8] pt-4 mt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={fabricProvidedByClient} onChange={e => setFabricProvidedByClient(e.target.checked)} className="w-5 h-5 accent-[#0f73c4] rounded" />
                <span className="text-sm font-medium text-[#10212f]">Le tissu est fourni par le client</span>
              </label>
            </div>

            {!fabricProvidedByClient && (
              <>
                <div className="sm:col-span-2 mt-1">
                  <div className="flex gap-2 p-1 bg-[#eaf8ff] rounded-lg w-max border border-[#dcecf6]">
                    <button
                      type="button"
                      onClick={() => setFabricInputMode("CALCULATE")}
                      className={`px-4 py-1.5 text-xs font-medium rounded-md transition ${fabricInputMode === "CALCULATE" ? "bg-white text-[#0f73c4] shadow-sm" : "text-[#667785] hover:text-[#10212f]"}`}
                    >
                      Calculer (mètre × prix)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFabricInputMode("DIRECT")}
                      className={`px-4 py-1.5 text-xs font-medium rounded-md transition ${fabricInputMode === "DIRECT" ? "bg-white text-[#0f73c4] shadow-sm" : "text-[#667785] hover:text-[#10212f]"}`}
                    >
                      Saisir directement
                    </button>
                  </div>
                </div>

                {fabricInputMode === "CALCULATE" ? (
                  <>
                    <div>
                      <label className="form-label text-xs">Prix tissu par mètre (TND)</label>
                      <input type="number" step="0.001" min="0" value={fabricPricePerMeter} onChange={e => setFabricPricePerMeter(e.target.value)} className="form-input py-2" />
                    </div>
                    <div>
                      <label className="form-label text-xs">Métrage nécessaire (m)</label>
                      <input type="number" step="0.01" min="0" value={metersNeeded} onChange={e => setMetersNeeded(e.target.value)} className="form-input py-2" />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="form-label text-xs">Prix total du tissu (TND)</label>
                    <input type="number" step="0.001" min="0" value={directFabricTotal} onChange={e => setDirectFabricTotal(e.target.value)} className="form-input py-2" />
                  </div>
                )}
              </>
            )}

            <div className="sm:col-span-2">
              <label className="form-label text-xs">Notes / Description détaillée</label>
              <textarea value={note} onChange={e => setNote(e.target.value)} className="form-input py-2 h-20 resize-none" />
            </div>
          </div>
        </section>

        {/* DATES SECTION */}
        <section className="rounded-3xl border border-[#e5f1f8] bg-white p-7 shadow-sm">
          <h2 className="text-lg font-semibold text-[#10212f] mb-6">{isEditMode ? "2. Planification" : "4. Planification"}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="form-label text-xs">Date de début *</label>
              <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className="form-input py-2" />
            </div>
            <div>
              <label className="form-label text-xs">Date de fin prévue *</label>
              <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} className="form-input py-2" />
            </div>
            <div>
              <label className="form-label text-xs">Date de livraison *</label>
              <input type="date" required value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className="form-input py-2" />
            </div>
          </div>
        </section>

        {/* FINANCE SECTION */}
        <section className="rounded-3xl border border-[#e5f1f8] bg-white p-7 shadow-sm">
          <h2 className="text-lg font-semibold text-[#10212f] mb-6">{isEditMode ? "3. Finances" : "5. Finances"}</h2>
          
          <div className="grid gap-6 sm:grid-cols-2 mb-6">
            <div>
              <label className="form-label text-xs">Coût Sous-traitance (TND)</label>
              <input type="number" step="0.001" min="0" value={subcontractingCost} onChange={e => setSubcontractingCost(e.target.value)} className="form-input py-2" />
            </div>
            <div>
              <label className="form-label text-xs">Coût Main d'œuvre (TND)</label>
              <input type="number" step="0.001" min="0" value={laborCost} onChange={e => setLaborCost(e.target.value)} className="form-input py-2" />
            </div>
          </div>

          <div className="bg-[#f7fbfe] p-5 rounded-2xl border border-[#e5f1f8] mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-[#10212f]">Prix Total Recommandé</span>
              <span className="text-lg font-bold text-[#0f73c4]">{recommendedPrice.toFixed(3)} TND</span>
            </div>
            <p className="text-xs text-[#8ca0ad]">Calcul: {fabricTotalPrice.toFixed(3)} (Tissu) + {(parseFloat(subcontractingCost)||0).toFixed(3)} (Sous-traitance) + {(parseFloat(laborCost)||0).toFixed(3)} (Main d'œuvre)</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <label className="form-label text-xs font-bold text-[#10212f]">Prix Final Convenu (TND) *</label>
              <input required type="number" step="0.001" min="0" value={finalPrice} onChange={e => setFinalPrice(e.target.value)} className="form-input py-2 border-[#0f73c4] bg-[#f7fbfe]" />
            </div>
            
            {!isEditMode && (
              <>
                <div>
                  <label className="form-label text-xs">Montant de l'acompte (TND)</label>
                  <input type="number" step="0.001" min="0" max={finalPrice} value={depositAmount} onChange={e => setDepositAmount(e.target.value)} className="form-input py-2" />
                </div>
                <div>
                  <label className="form-label text-xs">Date de l'acompte</label>
                  <input type="date" value={depositDate} onChange={e => setDepositDate(e.target.value)} className="form-input py-2" disabled={!depositAmount} />
                </div>
              </>
            )}
          </div>
          {isEditMode && (
            <p className="text-xs text-[#8ca0ad] mt-4">
              * L'acompte ne peut pas être modifié ici car il est lié à une écriture comptable. Modifiez l'acompte via la gestion des finances si nécessaire.
            </p>
          )}
        </section>

        <div className="flex justify-end gap-4 pb-10">
          <button
            type="button"
            onClick={() => navigate("/admin/custom-orders")}
            className="rounded-full border border-[#dcecf6] px-8 py-3 text-sm font-medium text-[#667785] transition hover:bg-[#f7fbfe]"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="primary-button px-10"
          >
            {loading ? "Enregistrement..." : (isEditMode ? "Enregistrer les modifications" : "Créer la commande")}
          </button>
        </div>

      </form>
    </div>
  );
}

export default CustomOrderCreate;
