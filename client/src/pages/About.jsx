import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function About() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-[#f7fbfe] py-24">
        <div className="merhak-container text-center">

          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#0f73c4]">
            Notre histoire
          </p>

          <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-light leading-tight text-[#10212f] md:text-6xl">
            MERHAK, une vision plus
            <span className="font-semibold text-[#0f73c4]">
              {" "}naturelle de l'élégance.
            </span>
          </h1>

        </div>
      </section>

      <section className="py-24">
        <div className="merhak-container grid gap-14 lg:grid-cols-2 lg:items-center">

          <div className="overflow-hidden rounded-3xl">
            <img
              src="https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=90"
              alt="Savoir-faire MERHAK"
              className="h-[600px] w-full object-cover"
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#29b6f6]">
              Notre philosophie
            </p>

            <h2 className="mt-4 text-4xl font-semibold leading-tight text-[#10212f]">
              La qualité commence par la matière.
            </h2>

            <p className="mt-7 leading-8 text-[#667785]">
              MERHAK est une maison de vêtements premium qui accorde
              une attention particulière au choix des matières, à la
              coupe et à la qualité des finitions.
            </p>

            <p className="mt-5 leading-8 text-[#667785]">
              Nous privilégions le lin, le coton et d'autres matières
              naturelles sélectionnées pour leur confort, leur élégance
              et leur capacité à traverser le temps.
            </p>

            <p className="mt-5 leading-8 text-[#667785]">
              Notre service sur mesure permet également de créer une
              pièce adaptée aux préférences, aux mesures et au style
              de chaque client.
            </p>

            <div className="mt-10 border-l-4 border-[#29b6f6] pl-6">
              <p className="text-xl font-medium text-[#0f73c4]">
                La vraie élégance ne cherche pas à en faire trop.
              </p>
            </div>

          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}

export default About;