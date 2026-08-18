import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  UsersIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";


import {
  useAuth,
} from "../../context/AuthContext";

import {
  apiFetch,
} from "../../lib/api";


function AdminDashboard() {
  const {
    user,
  } = useAuth();


  const [
    clientCount,
    setClientCount,
  ] = useState(0);


  const [
    loading,
    setLoading,
  ] = useState(true);


  useEffect(() => {
    async function load() {
      try {
        const clients =
          await apiFetch(
            "/admin/clients"
          );

        setClientCount(
          clients.length
        );
      } catch (error) {
        console.error(
          error
        );
      } finally {
        setLoading(false);
      }
    }


    load();
  }, []);


  return (
    <div className="p-8 lg:p-10">

      <p className="text-sm font-semibold text-[#0f73c4]">
        Administration MERHAK
      </p>


      <h1 className="mt-2 text-3xl font-semibold text-[#10212f]">
        Bonjour {user?.firstName}
      </h1>


      <p className="mt-2 text-[#667785]">
        Voici un aperçu de votre espace
        d'administration.
      </p>


      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">

        <div className="rounded-3xl bg-white p-7 shadow-sm">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf8ff]">

            <UsersIcon className="h-6 w-6 text-[#0f73c4]" />

          </div>


          <p className="mt-7 text-sm text-[#667785]">
            Clients enregistrés
          </p>


          <p className="mt-2 text-4xl font-semibold text-[#10212f]">
            {loading
              ? "..."
              : clientCount}
          </p>

        </div>

      </div>


      <section className="mt-10">

        <h2 className="text-xl font-semibold text-[#10212f]">
          Accès rapide
        </h2>


        <Link
          to="/admin/clients"
          className="group mt-5 block max-w-xl rounded-3xl bg-[#0f73c4] p-8 text-white transition hover:bg-[#29b6f6]"
        >

          <UsersIcon className="h-7 w-7" />


          <h3 className="mt-8 text-xl font-semibold">
            Gestion des clients
          </h3>


          <p className="mt-3 text-sm leading-6 text-white/75">
            Consultez, ajoutez, modifiez et
            supprimez les comptes clients MERHAK.
          </p>


          <div className="mt-7 flex items-center gap-2 text-sm font-medium">

            Accéder

            <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" />

          </div>

        </Link>

      </section>

    </div>
  );
}


export default AdminDashboard;