import {
  Link,
} from "react-router-dom";

import {
  StarIcon,
  CheckBadgeIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";


import Navbar from "../components/Navbar";
import Footer from "../components/Footer";


function Home() {
  return (
    <div className="bg-white">

      <Navbar />


      <section className="relative min-h-[calc(100vh-80px)] overflow-hidden">

        <img
          src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=2000&q=90"
          alt="Collection MERHAK"
          className="absolute inset-0 h-full w-full object-cover"
        />


        <div className="absolute inset-0 bg-gradient-to-r from-[#061d2c]/85 via-[#061d2c]/50 to-[#061d2c]/10" />


        <div className="merhak-container relative z-10 flex min-h-[calc(100vh-80px)] items-center">

          <div className="max-w-2xl py-20 text-white">

            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.35em] text-[#71d2ff]">
              Maison de vêtements premium
            </p>


            <h1 className="text-5xl font-light leading-[1.05] md:text-7xl">
              Naturellement
              <span className="block font-semibold">
                élégant.
              </span>
            </h1>


            <p className="mt-7 max-w-xl text-base leading-8 text-white/85 md:text-lg">
              Des pièces conçues dans des matières
              naturelles sélectionnées pour leur
              qualité, leur confort et leur élégance.
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
                className="rounded-full border border-white/70 px-8 py-4 text-center text-sm font-semibold transition hover:bg-white hover:text-[#0f73c4]"
              >
                Demander du sur-mesure
              </Link>

            </div>

          </div>

        </div>

      </section>


      <section className="bg-[#f7fbfe] py-24">

        <div className="merhak-container text-center">

          <p className="section-label">
            La maison MERHAK
          </p>


          <h2 className="mx-auto mt-5 max-w-4xl text-3xl font-light leading-tight md:text-5xl">
            La matière au cœur de
            <span className="font-semibold text-[#0f73c4]">
              {" "}chaque création.
            </span>
          </h2>


          <p className="mx-auto mt-7 max-w-2xl leading-8 text-[#667785]">
            Lin, coton et textiles naturels premium :
            nous sélectionnons des matières qui
            associent beauté, confort et caractère.
          </p>

        </div>

      </section>


      <section className="py-24">

        <div className="merhak-container">

          <div className="grid gap-6 md:grid-cols-3">

            <div className="premium-card">

              <StarIcon className="h-8 w-8 text-[#29b6f6]" />

              <h3 className="mt-7 text-xl font-semibold">
                Matières naturelles
              </h3>

              <p className="mt-3 leading-7 text-[#667785]">
                Lin, coton et tissus soigneusement
                sélectionnés pour leur qualité et
                leur confort.
              </p>

            </div>


            <div className="premium-card">

              <CheckBadgeIcon className="h-8 w-8 text-[#29b6f6]" />

              <h3 className="mt-7 text-xl font-semibold">
                Confection sur mesure
              </h3>

              <p className="mt-3 leading-7 text-[#667785]">
                Des pièces adaptées à vos mesures,
                vos préférences et votre style.
              </p>

            </div>


            <div className="premium-card">

              <SparklesIcon className="h-8 w-8 text-[#29b6f6]" />

              <h3 className="mt-7 text-xl font-semibold">
                Finitions premium
              </h3>

              <p className="mt-3 leading-7 text-[#667785]">
                Chaque détail est travaillé pour
                créer des vêtements élégants et
                durables.
              </p>

            </div>

          </div>

        </div>

      </section>


      <section className="bg-[#f7fbfe] py-24 text-white">

        <div className="merhak-container grid gap-12 lg:grid-cols-2 lg:items-center">

          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#0f73c4]">
              Sur mesure
            </p>


            <h2 className="mt-5 text-4xl font-light leading-tight md:text-5xl text-black">
              Une pièce créée
              <span className="block font-semibold">
                pour vous.
              </span>
            </h2>


            <p className="mt-6 max-w-xl leading-8 text-[#667785]">
              Choix de la matière, prise de mesures,
              coupe et finitions : MERHAK vous
              accompagne dans la création d'une pièce
              qui vous correspond.
            </p>


            

          </div>


          <div className="overflow-hidden rounded-[2rem]">

            <img
              src="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1200&q=90"
              alt="Confection MERHAK"
              className="h-[500px] w-full object-cover"
            />

          </div>

        </div>

      </section>


      <Footer />

    </div>
  );
}


export default Home;