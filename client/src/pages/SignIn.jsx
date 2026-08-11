// src/pages/SignIn.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function SignIn() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setMessage("");

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Connexion impossible.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      setMessage("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7fbfe]">
      <Navbar />

      <section className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">

          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#29b6f6]">
              MERHAK
            </p>

            <h1 className="mt-4 text-4xl font-semibold text-[#10212f]">
              Bon retour parmi nous
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#667785]">
              Connectez-vous à votre espace MERHAK.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl bg-white p-8 shadow-sm md:p-10"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-[#10212f]">
                Adresse e-mail
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full rounded-xl border border-[#dcecf6] bg-white px-4 py-3 text-[#10212f] outline-none transition placeholder:text-gray-400 focus:border-[#29b6f6]"
                required
              />
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-[#10212f]">
                Mot de passe
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#dcecf6] bg-white px-4 py-3 text-[#10212f] outline-none transition placeholder:text-gray-400 focus:border-[#29b6f6]"
                required
              />
            </div>

            {message && (
              <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-8 w-full rounded-full bg-[#0f73c4] py-3.5 text-sm font-semibold text-white transition hover:bg-[#29b6f6] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>

            <p className="mt-7 text-center text-sm text-[#667785]">
              Pas encore de compte ?{" "}
              <Link
                to="/signup"
                className="font-semibold text-[#0f73c4] hover:text-[#29b6f6]"
              >
                Créer un compte
              </Link>
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}

export default SignIn;