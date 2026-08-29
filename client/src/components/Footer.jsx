import {
  Link,
} from "react-router-dom";

import logoWhite from "../assets/merhak logo white simple.png";


function Footer() {
  return (
    <footer className="bg-[#0f73c4] text-white">

      <div className="merhak-container py-16">

        <div className="grid gap-12 md:grid-cols-3">

          <div>
            <img
              src={logoWhite}
              alt="MERHAK"
              className="h-12 w-auto"
            />

            <p className="mt-6 max-w-sm text-sm leading-7 text-white/75">
              Des vêtements premium conçus autour
              de matières naturelles, de belles
              coupes et d'un savoir-faire soigné.
            </p>
          </div>


          <div>
            <p className="font-semibold">
              Navigation
            </p>

            <div className="mt-5 flex flex-col gap-3 text-sm text-white/70">

              <Link to="/">
                Accueil
              </Link>

              <Link to="/store">
                Boutique
              </Link>

              <Link to="/about">
                À propos
              </Link>

              <Link to="/contact">
                Contact
              </Link>

            </div>
          </div>


          <div>
            <p className="font-semibold">
              MERHAK
            </p>

            <p className="mt-5 text-sm leading-7 text-white/70">
              Lin, coton, matières naturelles
              premium et confection sur mesure.
            </p>

            <p className="mt-3 text-sm text-white/70">
              Tunisie
            </p>
          </div>

        </div>


        <div className="mt-14 border-t border-white/15 pt-6 text-xs text-white/60">
          © {new Date().getFullYear()} MERHAK.
          Tous droits réservés.
        </div>

      </div>

    </footer>
  );
}


export default Footer;