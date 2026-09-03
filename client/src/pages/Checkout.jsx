import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeftIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { apiFetch } from "../lib/api";
import { useCart } from "../context/useCart";

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, total, clearCart } = useCart();
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", address: "", deliveryMethod: "DOMICILE", paymentMethod: "COD", note: "" });
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  async function submit(event) {
    event.preventDefault(); setError(""); setLoading(true);
    if (form.paymentMethod === "CARD") {
      navigate("/bank-payment", { state: { form, items } });
      setLoading(false);
      return;
    }
    try { await apiFetch("/orders", { method: "POST", body: { ...form, items: items.map(({ productId, size, color, quantity, customNote }) => ({ productId, size, color, quantity, customNote })) } }); clearCart(); setSubmitted(true); } catch (err) { setError(err.message); } finally { setLoading(false); }
  }
  if (location.state?.paid) {
    return <div className="min-h-screen bg-white"><Navbar /><main className="merhak-container py-24 text-center"><CheckCircleIcon className="mx-auto h-16 w-16 text-emerald-500" /><h1 className="mt-5 text-3xl font-bold text-[#10212f]">Commande enregistrée</h1><p className="mx-auto mt-3 max-w-md text-sm text-[#667785]">Votre paiement provisoire a été accepté. Notre équipe vous contactera pour confirmer la commande.</p><Link to="/store" className="primary-button mt-8">Retourner à la boutique</Link></main><Footer /></div>;
  }
  if (submitted) return <div className="min-h-screen bg-white"><Navbar /><main className="merhak-container py-24 text-center"><CheckCircleIcon className="mx-auto h-16 w-16 text-emerald-500" /><h1 className="mt-5 text-3xl font-bold text-[#10212f]">Commande enregistrée</h1><p className="mx-auto mt-3 max-w-md text-sm text-[#667785]">Merci pour votre confiance. Notre équipe vous contactera pour confirmer la livraison et les détails de votre commande.</p><Link to="/store" className="primary-button mt-8">Retourner à la boutique</Link></main><Footer /></div>;
  if (!items.length) return <div className="min-h-screen bg-white"><Navbar /><main className="merhak-container py-24 text-center"><h1 className="text-2xl font-bold">Votre panier est vide</h1><Link to="/store" className="primary-button mt-6">Voir la boutique</Link></main><Footer /></div>;
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="merhak-container py-12 lg:py-16">
        <Link to="/cart" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#0f73c4]"><ArrowLeftIcon className="h-4 w-4" /> Retour au panier</Link>
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <form onSubmit={submit} className="space-y-8">
            <div><p className="section-label">Dernière étape</p><h1 className="text-3xl font-bold text-[#10212f]">Finaliser la commande</h1></div>
            <section className="space-y-4">
              <h2 className="text-lg font-bold">Coordonnées du client</h2>
              <div className="grid gap-4 sm:grid-cols-2"><input className="form-input" name="firstName" required placeholder="Prénom *" value={form.firstName} onChange={update} /><input className="form-input" name="lastName" required placeholder="Nom *" value={form.lastName} onChange={update} /></div>
              <input className="form-input" name="phone" required placeholder="Téléphone *" value={form.phone} onChange={update} />
              <input className="form-input" name="address" required placeholder="Adresse complète *" value={form.address} onChange={update} />
            </section>
            <section className="space-y-4">
              <h2 className="text-lg font-bold">Livraison et paiement</h2>
              <select className="form-input" name="deliveryMethod" value={form.deliveryMethod} onChange={update}><option value="DOMICILE">Livraison à domicile</option><option value="ATELIER">Retrait à l'atelier</option></select>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm font-semibold ${form.paymentMethod === "COD" ? "border-[#0f73c4] bg-[#eef9ff] text-[#0f73c4]" : "border-[#e5f1f8]"}`}><input type="radio" name="paymentMethod" value="COD" checked={form.paymentMethod === "COD"} onChange={update} /> Paiement à la livraison</label>
                <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm font-semibold ${form.paymentMethod === "CARD" ? "border-[#0f73c4] bg-[#eef9ff] text-[#0f73c4]" : "border-[#e5f1f8]"}`}><input type="radio" name="paymentMethod" value="CARD" checked={form.paymentMethod === "CARD"} onChange={update} /> Carte bancaire</label>
              </div>
              <textarea className="form-input resize-none" rows="3" name="note" placeholder="Détails communs pour toute la commande (facultatif)" value={form.note} onChange={update} />
            </section>
            {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <button disabled={loading} className="primary-button w-full sm:w-auto">{loading ? "Envoi en cours..." : form.paymentMethod === "CARD" ? "Continuer vers le paiement bancaire" : `Confirmer la commande · ${total.toFixed(2)} TND`}</button>
          </form>
          <aside className="h-fit rounded-2xl border border-[#e5f1f8] bg-[#f7fbfe] p-6 lg:sticky lg:top-28"><h2 className="font-bold">Votre commande</h2><div className="mt-4 space-y-3">{items.map((item) => <div key={item.key} className="flex justify-between gap-3 text-sm"><span>{item.quantity} × {item.name}</span><strong>{(item.unitPrice * item.quantity).toFixed(2)} TND</strong></div>)}</div><div className="mt-5 flex justify-between border-t border-[#e5f1f8] pt-5 text-lg font-bold"><span>Total</span><span className="text-[#0f73c4]">{total.toFixed(2)} TND</span></div></aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
export default Checkout;
