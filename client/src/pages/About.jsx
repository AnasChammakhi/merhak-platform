import Navbar from "../components/Navbar";
import Footer from "../components/Footer";


function About() {
  return (
    <div className="bg-white">

      <Navbar />


      <section className="bg-[#f7fbfe] py-24">

        <div className="merhak-container text-center">

          <p className="section-label">
            Notre maison
          </p>


          <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-light leading-tight md:text-6xl">
            Une autre vision de
            <span className="font-semibold text-[#0f73c4]">
              {" "}l'élégance.
            </span>
          </h1>

        </div>

      </section>


      <section className="py-24">

        <div className="merhak-container grid gap-14 lg:grid-cols-2 lg:items-center">

          <div className="overflow-hidden rounded-[2rem]">

            <img
              src="https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=90"
              alt="Savoir-faire MERHAK"
              className="h-[600px] w-full object-cover"
            />

          </div>


          <div>

            <p className="section-label">
              Notre philosophie
            </p>


            <h2 className="mt-4 text-4xl font-semibold leading-tight">
              La qualité commence par la matière.
            </h2>


            <p className="mt-7 leading-8 text-[#667785]">
              MERHAK est une maison de vêtements
              premium qui place la matière, la coupe
              et les finitions au centre de chaque
              création.
            </p>


            <p className="mt-5 leading-8 text-[#667785]">
              Nous privilégions le lin, le coton et
              d'autres textiles naturels soigneusement
              sélectionnés pour leur toucher, leur
              tombé et leur confort.
            </p>


            <p className="mt-5 leading-8 text-[#667785]">
              Notre service sur mesure permet
              d'aller encore plus loin en adaptant
              chaque pièce aux mesures et aux envies
              de son propriétaire.
            </p>


            <div className="mt-10 border-l-4 border-[#29b6f6] pl-6">

              <p className="text-xl font-medium text-[#0f73c4]">
                Des matières vraies. Des coupes
                soignées. Des pièces faites pour durer.
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