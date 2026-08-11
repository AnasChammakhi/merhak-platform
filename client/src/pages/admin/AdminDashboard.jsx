import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  UsersIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

function AdminDashboard() {
  const navigate = useNavigate();

  const [clientCount, setClientCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const storedUser = localStorage.getItem("user");

  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    user = null;
  }

  useEffect(() => {
    async function loadClients() {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:5000/api/admin/clients",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401) {
          localStorage.clear();
          navigate("/signin");
          return;
        }

        const data = await response.json();

        if (response.ok && Array.isArray(data)) {
          setClientCount(data.length);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadClients();
  }, [navigate]);

  return (
    <div className="p-8 lg:p-10">

      <p className="text-sm font-medium text-[#0f73c4]">
       Administration MERHAK 
      </p>

      <h1 className="mt-2 text-3xl font-semibold">
        Bonjour{user?.firstName ? ` ${user.firstName}` : ""}
      </h1>

      <p className="mt- text-[#667785]">
        Voici un aperçu de votre espace d'administration.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">

        <div className="rounded-3xl bg-white p-7 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf8ff]">
            <UsersIcon className="h-6 w-6 text-[#0f73c4]" />
          </div>

          <p className="mt-7 text-sm text-[#667785]">
            Clients enregistrés
          </p>

          <p className="mt-2 text-4xl font-semibold text-[#10212f]">
            {loading ? "..." : clientCount}
          </p>
        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;