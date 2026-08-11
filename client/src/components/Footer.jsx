import { Link } from "react-router-dom";
import merhakLogo from "../assets/merhak logo blue simple.png";

function Footer() {
  return (
    <footer className="bg-[#0f73c4] text-white">
      <div className="merhak-container py-14">

        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <img
              src={merhakLogo}
              alt="Merhak"
              className="h-14 w-auto brightness-0 invert"
            />

            <p className="mt-5 max-w-sm text-sm leading-7 text-white/75">
              Des vêtements premium confectionnés à partir de matières
              naturelles et sélectionnées avec soin.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider">
              Navigation
            </p>

            <div className="mt-5 flex flex-col gap-3 text-sm text-white/75">
              <Link to="/" className="hover:text-white">
                Accueil
              </Link>

              <Link to="/about" className="hover:text-white">
                À propos
              </Link>

              <Link to="/contact" className="hover:text-white">
                Contact
              </Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider">
              La maison
            </p>

            <p className="mt-5 text-sm leading-7 text-white/75">
              Lin, coton, matières naturelles et créations sur mesure.
            </p>

            <p className="mt-3 text-sm text-white/75">
              Tunis, Tunisie
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-white/15 pt-6 text-xs text-white/60">
          © {new Date().getFullYear()}. Tous droits réservés.
        </div>

      </div>
    </footer>
  );
}

export default Footer;