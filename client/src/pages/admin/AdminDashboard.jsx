import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  UsersIcon,
  FolderIcon,
  ArrowRightIcon,
  TagIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../lib/api";

function AdminDashboard() {
  const { user } = useAuth();

  const [clientCount, setClientCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [rootCategoryCount, setRootCategoryCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [clients, catData] = await Promise.all([
          apiFetch("/admin/clients").catch(() => []),
          apiFetch("/categories").catch(() => ({ categories: [] })),
        ]);

        setClientCount(clients.length || 0);
        const allCats = catData.categories || [];
        setCategoryCount(allCats.length);
        setRootCategoryCount(allCats.filter((c) => !c.parent_id).length);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div className="p-8 lg:p-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#0f73c4]">
        Administration MERHAK
      </p>

      <h1 className="mt-2 text-3xl font-bold text-[#10212f]">
        Bonjour {user?.name}
      </h1>

      <p className="mt-1 text-sm text-[#667785]">
        Voici un aperçu de votre espace d'administration et de votre catalogue.
      </p>

      {/* KPI Cards */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {/* Clients Card */}
        <div className="rounded-3xl border border-[#e5f1f8] bg-white p-7 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf8ff]">
            <UsersIcon className="h-6 w-6 text-[#0f73c4]" />
          </div>

          <p className="mt-7 text-xs font-semibold uppercase tracking-wider text-[#667785]">
            Clients enregistrés
          </p>

          <p className="mt-2 text-4xl font-bold text-[#10212f]">
            {loading ? "..." : clientCount}
          </p>
        </div>

        {/* Categories Card */}
        <div className="rounded-3xl border border-[#e5f1f8] bg-white p-7 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0faff]">
            <FolderIcon className="h-6 w-6 text-[#29b6f6]" />
          </div>

          <p className="mt-7 text-xs font-semibold uppercase tracking-wider text-[#667785]">
            Catégories actives
          </p>

          <p className="mt-2 text-4xl font-bold text-[#10212f]">
            {loading ? "..." : categoryCount}
            <span className="ml-2 text-xs font-normal text-[#667785]">
              ({rootCategoryCount} collections)
            </span>
          </p>
        </div>
      </div>

      {/* Quick Access Section */}
      <section className="mt-12">
        <h2 className="text-lg font-bold text-[#10212f]">
          Gestion et accès rapide
        </h2>

        <div className="mt-5 grid gap-6 md:grid-cols-2">
          {/* Link to Clients */}
          <Link
            to="/admin/clients"
            className="group block rounded-3xl bg-gradient-to-br from-[#0f73c4] to-[#0d63a8] p-8 text-white shadow-lg shadow-[#0f73c4]/15 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#0f73c4]/25"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md">
              <UsersIcon className="h-6 w-6 text-white" />
            </div>

            <h3 className="mt-6 text-xl font-bold">
              Gestion des clients
            </h3>

            <p className="mt-2 text-xs leading-relaxed text-white/80">
              Consultez, ajoutez, modifiez les comptes clients et suivez leurs fiches de mesures personnalisées.
            </p>

            <div className="mt-6 flex items-center gap-2 text-xs font-semibold tracking-wide uppercase">
              <span>Accéder aux clients</span>
              <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Link to Categories */}
          <Link
            to="/admin/categories"
            className="group block rounded-3xl bg-gradient-to-br from-[#29b6f6] to-[#0f73c4] p-8 text-white shadow-lg shadow-[#29b6f6]/15 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#29b6f6]/25"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md">
              <FolderIcon className="h-6 w-6 text-white" />
            </div>

            <h3 className="mt-6 text-xl font-bold">
              Gestion des catégories
            </h3>

            <p className="mt-2 text-xs leading-relaxed text-white/80">
              Organisez l'arborescence (Homme, Femme, Collections et sous-catégories) qui pilote la boutique et la navbar.
            </p>

            <div className="mt-6 flex items-center gap-2 text-xs font-semibold tracking-wide uppercase">
              <span>Gérer les catégories</span>
              <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;