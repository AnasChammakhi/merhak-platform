import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeftIcon, CreditCardIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { apiFetch } from "../lib/api";
import { useCart } from "../context/useCart";

function BankPayment() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { clearCart } = useCart();
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!state?.form || !state?.items?.length) {
    return <div className="min-h-screen bg-white"><Navbar /><main className="merhak-container py-24 text-center"><h1 className="text-2xl font-bold text-[#10212f]">Session de paiement introuvable</h1><Link to="/cart" className="primary-button mt-6">Retourner au panier</Link></main><Footer /></div>;
  }

  const total = state.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
  const updateCard = (event) => setCard({ ...card, [event.target.name]: event.target.value });

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiFetch("/orders", {
        method: "POST",
        body: {
          ...state.form,
          paymentMethod: "CARD",
          items: state.items.map(({ productId, size, color, quantity, customNote }) => ({ productId, size, color, quantity, customNote })),
        },
      });
      clearCart();
      navigate("/checkout", { replace: true, state: { paid: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return <div className="min-h-screen bg-white"><Navbar /><main className="merhak-container py-12 lg:py-16"><button type="button" onClick={() => navigate(-1)} className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#0f73c4]"><ArrowLeftIcon className="h-4 w-4" /> Retour à la commande</button><div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_360px]"><form onSubmit={submit} className="rounded-2xl border border-[#e5f1f8] p-6 sm:p-8"><div className="flex items-center gap-3"><div className="rounded-xl bg-[#eef9ff] p-3 text-[#0f73c4]"><CreditCardIcon className="h-6 w-6" /></div><div><p className="section-label mb-1">Paiement sécurisé</p><h1 className="text-2xl font-bold text-[#10212f]">Paiement bancaire</h1></div></div><p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">Page provisoire : aucun paiement réel ne sera effectué. Utilisez le bouton ci-dessous pour simuler le paiement.</p><div className="mt-6 space-y-4"><div><label className="form-label">Numéro de carte</label><input className="form-input" name="number" inputMode="numeric" required placeholder="1234 5678 9012 3456" value={card.number} onChange={updateCard} /></div><div className="grid gap-4 sm:grid-cols-2"><div><label className="form-label">Expiration</label><input className="form-input" name="expiry" required placeholder="MM/AA" value={card.expiry} onChange={updateCard} /></div><div><label className="form-label">CVC</label><input className="form-input" name="cvc" inputMode="numeric" required placeholder="123" value={card.cvc} onChange={updateCard} /></div></div></div>{error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button disabled={loading} className="primary-button mt-8 w-full">{loading ? "Traitement..." : "Simuler le paiement"}</button><p className="mt-4 flex items-center justify-center gap-1 text-xs text-[#667785]"><LockClosedIcon className="h-4 w-4" /> Paiement provisoire et sécurisé</p></form><aside className="h-fit rounded-2xl border border-[#e5f1f8] bg-[#f7fbfe] p-6"><h2 className="font-bold text-[#10212f]">Résumé</h2><div className="mt-4 space-y-3 text-sm">{state.items.map((item) => <div key={item.key} className="flex justify-between gap-3"><span>{item.quantity} × {item.name}</span><strong>{(item.unitPrice * item.quantity).toFixed(2)} TND</strong></div>)}</div><div className="mt-5 flex justify-between border-t border-[#e5f1f8] pt-5 text-lg font-bold"><span>Total</span><span className="text-[#0f73c4]">{total.toFixed(2)} TND</span></div></aside></div></main><Footer /></div>;
}
export default BankPayment;
