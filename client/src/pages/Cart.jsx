import { Link, useNavigate } from "react-router-dom";
import { ArrowLeftIcon, MinusIcon, PlusIcon, TrashIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getImageUrl, DEFAULT_PRODUCT_IMAGE } from "../lib/api";
import { useCart } from "../context/useCart";

function Cart() {
  const navigate = useNavigate();
  const { items, total, updateQuantity, updateNote, removeItem } = useCart();

  return <div className="min-h-screen bg-white"><Navbar />
    <main className="merhak-container py-12 lg:py-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div><p className="section-label">Votre sélection</p><h1 className="text-3xl font-bold text-[#10212f]">Le panier</h1></div>
        <Link to="/store" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0f73c4]"><ArrowLeftIcon className="h-4 w-4" /> Continuer mes achats</Link>
      </div>
      {items.length === 0 ? <div className="rounded-3xl border border-[#e5f1f8] bg-[#f7fbfe] py-20 text-center"><ShoppingBagIcon className="mx-auto h-14 w-14 text-[#29b6f6]" /><h2 className="mt-4 text-xl font-bold text-[#10212f]">Votre panier est vide</h2><Link to="/store" className="primary-button mt-6">Découvrir la boutique</Link></div> :
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">{items.map((item) => <article key={item.key} className="rounded-2xl border border-[#e5f1f8] p-4 sm:flex sm:gap-5"><img src={getImageUrl(item.image)} onError={(e) => { e.currentTarget.src = DEFAULT_PRODUCT_IMAGE; }} alt={item.name} className="h-32 w-full rounded-xl object-cover sm:h-36 sm:w-28" /><div className="flex min-w-0 flex-1 flex-col pt-4 sm:pt-0"><div className="flex justify-between gap-4"><div><h2 className="font-bold text-[#10212f]">{item.name}</h2><p className="mt-1 text-xs text-[#667785]">Taille : {item.size} · Couleur : {item.color}</p></div><button type="button" onClick={() => removeItem(item.key)} aria-label={`Supprimer ${item.name}`} className="text-[#8ca0ad] hover:text-red-500"><TrashIcon className="h-5 w-5" /></button></div><div className="mt-auto flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3 rounded-full bg-[#f7fbfe] px-3 py-2"><button type="button" onClick={() => updateQuantity(item.key, item.quantity - 1)}><MinusIcon className="h-4 w-4" /></button><span className="min-w-5 text-center text-sm font-bold">{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.key, item.quantity + 1)}><PlusIcon className="h-4 w-4" /></button></div><strong className="text-[#0f73c4]">{(item.unitPrice * item.quantity).toFixed(2)} TND</strong></div><textarea value={item.customNote} onChange={(e) => updateNote(item.key, e.target.value)} rows="2" placeholder="Détails sur-mesure pour cet article (mesures, longueur, finition...)" className="form-input mt-4 resize-none text-xs" /></div></article>)}</div>
          <aside className="h-fit rounded-2xl border border-[#e5f1f8] bg-[#f7fbfe] p-6 lg:sticky lg:top-28"><h2 className="text-lg font-bold text-[#10212f]">Résumé de la commande</h2><div className="mt-5 flex justify-between border-t border-[#e5f1f8] pt-5 text-lg font-bold"><span>Total</span><span className="text-[#0f73c4]">{total.toFixed(2)} TND</span></div><button type="button" onClick={() => navigate("/checkout")} className="primary-button mt-6 w-full">Passer la commande</button><p className="mt-3 text-center text-xs text-[#667785]">Les détails communs seront demandés à l'étape suivante.</p></aside>
        </div>}
    </main><Footer /></div>;
}
export default Cart;
