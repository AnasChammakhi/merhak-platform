import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  StarIcon,
  CheckBadgeIcon,
  SparklesIcon,
  ArrowRightIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { apiFetch } from "../lib/api";

const DEFAULT_HOME_COLLECTIONS = [
  {
    id: "homme",
    name: "Collection Homme",
    gender: "homme",
    description: "Chemises en lin lavé, pantalons fluides et vestes sahariennes.",
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80",
    tags: ["Chemises", "Pantalons", "Vestes", "Tuniques"],
  },
  {
    id: "femme",
    name: "Collection Femme",
    gender: "femme",
    description: "Robes vaporeuses en soie & lin, chemisiers satinés et kimonos.",
    image:
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=80",
    tags: ["Robes", "Chemises", "Pantalons", "Vestes", "Jupes"],
  },
];

function Home() {
  const [collections, setCollections] = useState(DEFAULT_HOME_COLLECTIONS);

  useEffect(() => {
    apiFetch("/categories")
      .then((data) => {
        if (data.tree && data.tree.length > 0) {
          const formatted = data.tree.map((root, idx) => ({
            id: root.id,
            name: `Collection ${root.name}`,
            gender: root.name.toLowerCase(),
            description:
              root.description ||
              "Des pièces confectionnées dans des matières nobles et durables.",
            image:
              idx % 2 === 0
                ? "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80"
                : "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=80",
            tags: (root.children || []).map((c) => c.name),
          }));
          setCollections(formatted);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-white">
      <Navbar />

      {/* Hero Section */}
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
              <span className="block font-semibold">élégant.</span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-white/85 md:text-lg">
              Des pièces conçues dans des matières naturelles sélectionnées pour
              leur qualité, leur confort et leur élégance.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/store"
                className="rounded-full bg-[#29b6f6] px-8 py-4 text-center text-sm font-semibold text-white shadow-lg shadow-[#29b6f6]/30 transition hover:bg-white hover:text-[#0f73c4]"
              >
                Explorer la boutique
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

      {/* Dynamic Collections Showcase */}
      <section className="bg-white py-24 border-b border-[#e5f1f8]">
        <div className="merhak-container">
          <div className="text-center max-w-2xl mx-auto">
            <p className="section-label">Nos Collections</p>
            <h2 className="text-3xl font-light text-[#10212f] md:text-5xl">
              Découvrez nos <span className="font-semibold text-[#0f73c4]">créations</span>
            </h2>
            <p className="mt-4 text-sm text-[#667785]">
              Explorez nos univers et trouvez les pièces adaptées à votre quotidien et vos moments d'exception.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2">
            {collections.map((col) => (
              <div
                key={col.id}
                className="group relative overflow-hidden rounded-[2.5rem] border border-[#e5f1f8] bg-[#f7fbfe] transition duration-300 hover:shadow-2xl hover:shadow-[#0f73c4]/10"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <img
                    src={col.image}
                    alt={col.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
                      Collection
                    </span>
                    <h3 className="mt-2 text-2xl font-bold md:text-3xl">
                      {col.name}
                    </h3>
                  </div>
                </div>

                <div className="p-8">
                  <p className="text-sm text-[#667785] leading-relaxed">
                    {col.description}
                  </p>

                  {/* Subcategory tags */}
                  {col.tags && col.tags.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {col.tags.map((tag, tIdx) => (
                        <Link
                          key={tIdx}
                          to={`/store?gender=${col.gender}&category=${encodeURIComponent(
                            tag
                          )}`}
                          className="rounded-full bg-white border border-[#e5f1f8] px-3.5 py-1 text-xs font-medium text-[#10212f] transition hover:border-[#0f73c4] hover:text-[#0f73c4]"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                  )}

                  <div className="mt-8 pt-6 border-t border-[#e5f1f8] flex items-center justify-between">
                    <Link
                      to={`/store?gender=${col.gender}`}
                      className="inline-flex items-center gap-2 text-sm font-bold text-[#0f73c4] group-hover:text-[#29b6f6] transition"
                    >
                      <span>Voir toute la collection</span>
                      <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Value Section */}
      <section className="bg-[#f7fbfe] py-24">
        <div className="merhak-container text-center">
          <p className="section-label">La maison MERHAK</p>

          <h2 className="mx-auto mt-5 max-w-4xl text-3xl font-light leading-tight md:text-5xl">
            La matière au cœur de
            <span className="font-semibold text-[#0f73c4]">
              {" "}chaque création.
            </span>
          </h2>

          <p className="mx-auto mt-7 max-w-2xl leading-8 text-[#667785]">
            Lin, coton et textiles naturels premium : nous sélectionnons des
            matières qui associent beauté, confort et caractère.
          </p>
        </div>
      </section>

      {/* Highlights Grid */}
      <section className="py-24">
        <div className="merhak-container">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-[#e5f1f8] bg-white p-8 shadow-sm transition hover:shadow-md">
              <StarIcon className="h-8 w-8 text-[#29b6f6]" />
              <h3 className="mt-7 text-xl font-semibold">Matières naturelles</h3>
              <p className="mt-3 leading-7 text-[#667785]">
                Lin, coton et tissus soigneusement sélectionnés pour leur qualité
                et leur confort.
              </p>
            </div>

            <div className="rounded-3xl border border-[#e5f1f8] bg-white p-8 shadow-sm transition hover:shadow-md">
              <CheckBadgeIcon className="h-8 w-8 text-[#29b6f6]" />
              <h3 className="mt-7 text-xl font-semibold">Confection sur mesure</h3>
              <p className="mt-3 leading-7 text-[#667785]">
                Des pièces adaptées à vos mesures, vos préférences et votre style.
              </p>
            </div>

            <div className="rounded-3xl border border-[#e5f1f8] bg-white p-8 shadow-sm transition hover:shadow-md">
              <SparklesIcon className="h-8 w-8 text-[#29b6f6]" />
              <h3 className="mt-7 text-xl font-semibold">Finitions premium</h3>
              <p className="mt-3 leading-7 text-[#667785]">
                Chaque détail est travaillé pour créer des vêtements élégants et
                durables.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sur-Mesure Feature */}
      <section className="bg-[#f7fbfe] py-24 text-white">
        <div className="merhak-container grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#0f73c4]">
              Sur mesure
            </p>

            <h2 className="mt-5 text-4xl font-light leading-tight md:text-5xl text-black">
              Une pièce créée
              <span className="block font-semibold">pour vous.</span>
            </h2>

            <p className="mt-6 max-w-xl leading-8 text-[#667785]">
              Choix de la matière, prise de mesures, coupe et finitions : MERHAK
              vous accompagne dans la création d'une pièce qui vous correspond.
            </p>

            <div className="mt-8">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-[#0f73c4] px-8 py-4 text-sm font-semibold text-white shadow-md shadow-[#0f73c4]/20 transition hover:bg-[#29b6f6]"
              >
                Prendre rendez-vous avec l'atelier
              </Link>
            </div>
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