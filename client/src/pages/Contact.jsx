import { useState } from "react";

import {
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    console.log(formData);
  }

  return (
    <div className="min-h-screen bg-[#f7fbfe]">
      <Navbar />

      <section className="py-20">
        <div className="merhak-container">

          <div className="mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#0f73c4]">
              Contact
            </p>

            <h1 className="mt-4 text-4xl font-semibold md:text-5xl">
              Parlons de votre projet.
            </h1>

            <p className="mt-5 max-w-2xl leading-7 text-[#667785]">
              Une question sur nos collections, nos matières ou une
              demande de confection sur mesure ? Notre équipe est à
              votre écoute.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">

            <div className="rounded-3xl bg-[#0f73c4] p-8 text-white md:p-10">
              <h2 className="text-2xl font-semibold">
                Maison MERHAK
              </h2>

              <p className="mt-4 leading-7 text-white/75">
                Nous vous accompagnons dans vos demandes de pièces,
                de matières et de confection personnalisée.
              </p>

              <div className="mt-10 space-y-7">

                <div className="flex gap-4">
                  <MapPinIcon className="h-6 w-6 text-[#8edcff]" />

                  <div>
                    <p className="font-medium">Adresse</p>
                    <p className="mt-1 text-sm text-white/70">
                      Tunis, Tunisie
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <EnvelopeIcon className="h-6 w-6 text-[#8edcff]" />

                  <div>
                    <p className="font-medium">Email</p>
                    <p className="mt-1 text-sm text-white/70">
                      contact@merhak.tn
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <PhoneIcon className="h-6 w-6 text-[#8edcff]" />

                  <div>
                    <p className="font-medium">Téléphone</p>
                    <p className="mt-1 text-sm text-white/70">
                      +216 XX XXX XXX
                    </p>
                  </div>
                </div>

              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-3xl bg-white p-8 shadow-sm md:p-10"
            >
              <div className="grid gap-6 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Nom complet
                  </label>

                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#dcecf6] px-4 py-3 outline-none transition focus:border-[#29b6f6]"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Téléphone
                  </label>

                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#dcecf6] px-4 py-3 outline-none transition focus:border-[#29b6f6]"
                  />
                </div>

              </div>

              <div className="mt-6">
                <label className="mb-2 block text-sm font-medium">
                  Email
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
                <label className="mb-2 block text-sm font-medium">
                  Sujet
                </label>

                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#dcecf6] bg-white px-4 py-3 outline-none focus:border-[#29b6f6]"
                  required
                >
                  <option value="">
                    Choisir un sujet
                  </option>

                  <option value="sur-mesure">
                    Demande sur mesure
                  </option>

                  <option value="produit">
                    Question sur un produit
                  </option>

                  <option value="matiere">
                    Question sur une matière
                  </option>

                  <option value="autre">
                    Autre demande
                  </option>
                </select>
              </div>

              <div className="mt-6">
                <label className="mb-2 block text-sm font-medium">
                  Message
                </label>

                <textarea
                  rows="6"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full resize-none rounded-xl border border-[#dcecf6] px-4 py-3 outline-none focus:border-[#29b6f6]"
                  required
                />
              </div>

              <button
                type="submit"
                className="mt-7 rounded-full bg-[#0f73c4] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[#29b6f6]"
              >
                Envoyer mon message
              </button>

            </form>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Contact;