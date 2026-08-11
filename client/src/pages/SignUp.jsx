// src/pages/SignUp.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function SignUp() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setMessage("");

    if (formData.password !== formData.confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Impossible de créer votre compte."
        );
        return;
      }

      navigate("/signin");
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
        <div className="w-full max-w-lg">

          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#29b6f6]">
              MERHAK
            </p>

            <h1 className="mt-4 text-4xl font-semibold text-[#10212f]">
              Créer votre compte
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#667785]">
              Rejoignez MERHAK et profitez d'un espace dédié à vos commandes et vos créations sur mesure.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl bg-white p-8 shadow-sm md:p-10"
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#10212f]">
                  Prénom
                </label>

                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#dcecf6] px-4 py-3 outline-none transition focus:border-[#29b6f6]"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#10212f]">
                  Nom
                </label>

                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#dcecf6] px-4 py-3 outline-none transition focus:border-[#29b6f6]"
                  required
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-[#10212f]">
                Adresse e-mail
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#dcecf6] px-4 py-3 outline-none transition focus:border-[#29b6f6]"
                required
              />
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-[#10212f]">
                Téléphone
              </label>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+216 XX XXX XXX"
                className="w-full rounded-xl border border-[#dcecf6] px-4 py-3 outline-none transition focus:border-[#29b6f6]"
              />
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-[#10212f]">
                Mot de passe
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#dcecf6] px-4 py-3 outline-none transition focus:border-[#29b6f6]"
                required
              />
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-[#10212f]">
                Confirmer le mot de passe
              </label>

              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#dcecf6] px-4 py-3 outline-none transition focus:border-[#29b6f6]"
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
              {loading ? "Création..." : "Créer mon compte"}
            </button>

            <p className="mt-7 text-center text-sm text-[#667785]">
              Vous avez déjà un compte ?{" "}
              <Link
                to="/signin"
                className="font-semibold text-[#0f73c4] hover:text-[#29b6f6]"
              >
                Se connecter
              </Link>
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}

export default SignUp;