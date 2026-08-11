import { Link } from "react-router-dom";

import {
  SparklesIcon,
  ScissorsIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-[calc(100vh-80px)] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=2000&q=90"
          alt="Collection MERHAK"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#071924]/75 via-[#071924]/40 to-transparent" />

        <div className="merhak-container relative z-10 flex min-h-[calc(100vh-80px)] items-center">
          <div className="max-w-2xl py-20 text-white">

            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.35em] text-[#72d2ff]">
              Maison de vêtements premium
            </p>

            <h1 className="text-5xl font-light leading-[1.05] md:text-7xl">
              Naturellement
              <span className="block font-semibold">
                élégant.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-white/85 md:text-lg">
              Des pièces confectionnées avec des matières naturelles
              sélectionnées pour leur qualité, leur confort et leur
              élégance.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/about"
                className="rounded-full bg-[#29b6f6] px-8 py-4 text-center text-sm font-semibold text-white transition hover:bg-white hover:text-[#0f73c4]"
              >
                Découvrir MERHAK
              </Link>

              <Link
                to="/contact"
                className="rounded-full border border-white/70 px-8 py-4 text-center text-sm font-semibold text-white transition hover:bg-white hover:text-[#0f73c4]"
              >
                Demander du sur-mesure
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="bg-[#f7fbfe] py-24">
        <div className="merhak-container text-center">

          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#0f73c4]">
            La maison MERHAK
          </p>

          <h2 className="mx-auto mt-5 max-w-4xl text-3xl font-light leading-tight text-[#10212f] md:text-5xl">
            Une mode premium pensée autour de
            <span className="font-semibold text-[#0f73c4]">
              {" "}matières authentiques.
            </span>
          </h2>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-[#667785]">
            MERHAK privilégie les matières naturelles comme le lin,
            le coton et des textiles soigneusement sélectionnés afin
            d'offrir des vêtements durables, confortables et élégants.
          </p>

        </div>
      </section>

      {/* MATIÈRES */}
      <section className="py-24">
        <div className="merhak-container">

          <div className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#29b6f6]">
              Nos matières
            </p>

            <h2 className="mt-3 text-3xl font-semibold text-[#10212f] md:text-4xl">
              Le choix de la qualité.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">

            <div className="rounded-3xl border border-[#e5f1f8] bg-white p-8 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#0f73c4]/5">
              <SparklesIcon className="h-8 w-8 text-[#29b6f6]" />

              <h3 className="mt-7 text-xl font-semibold">
                Lin
              </h3>

              <p className="mt-3 leading-7 text-[#667785]">
                Léger, respirant et élégant. Une matière naturelle
                idéale pour des pièces raffinées et agréables à porter.
              </p>
            </div>

            <div className="rounded-3xl border border-[#e5f1f8] bg-white p-8 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#0f73c4]/5">
              <CheckBadgeIcon className="h-8 w-8 text-[#29b6f6]" />

              <h3 className="mt-7 text-xl font-semibold">
                Coton premium
              </h3>

              <p className="mt-3 leading-7 text-[#667785]">
                Doux, confortable et polyvalent pour des vêtements
                premium pensés pour durer.
              </p>
            </div>

            <div className="rounded-3xl border border-[#e5f1f8] bg-white p-8 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#0f73c4]/5">
              <ScissorsIcon className="h-8 w-8 text-[#29b6f6]" />

              <h3 className="mt-7 text-xl font-semibold">
                Matières sélectionnées
              </h3>

              <p className="mt-3 leading-7 text-[#667785]">
                Chaque tissu est choisi selon sa qualité, son toucher,
                son tombé et son adaptation au modèle.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* SUR MESURE */}
      <section className="bg-[#0f73c4] py-24 text-white">
        <div className="merhak-container grid gap-12 lg:grid-cols-2 lg:items-center">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#91dcff]">
              Le sur-mesure
            </p>

            <h2 className="mt-5 text-4xl font-light leading-tight md:text-5xl">
              Une pièce pensée
              <span className="block font-semibold">
                pour vous.
              </span>
            </h2>

            <p className="mt-6 max-w-xl leading-8 text-white/75">
              Parce que chaque silhouette est différente, MERHAK propose
              un service de confection sur mesure. Choix du tissu,
              ajustements, mesures et finitions sont pensés selon vos
              envies.
            </p>

            <Link
              to="/contact"
              className="mt-8 inline-flex rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#0f73c4] transition hover:bg-[#29b6f6] hover:text-white"
            >
              Parler de mon projet
            </Link>
          </div>

          <div className="overflow-hidden rounded-3xl">
            <img
              src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1200&q=90"
              alt="Confection MERHAK"
              className="h-[500px] w-full object-cover"
            />
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="merhak-container">
          <div className="rounded-[2rem] bg-[#f1f9fe] px-8 py-16 text-center md:px-16">

            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#0f73c4]">
              MERHAK
            </p>

            <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold md:text-4xl">
              Porter mieux. Porter autrement.
            </h2>

            <p className="mx-auto mt-5 max-w-xl leading-7 text-[#667785]">
              Découvrez une approche plus exigeante du vêtement,
              où la matière, la coupe et le détail comptent réellement.
            </p>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;