import {
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
  ChatBubbleOvalLeftEllipsisIcon,
} from "@heroicons/react/24/outline";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import contactImg from "../assets/contact.jpg";

function Contact() {
  return (
    <div className="bg-[#f7fbfe]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative flex h-[50vh] min-h-[450px] items-center justify-center overflow-hidden">
        <img
          src={contactImg}
          alt="Atelier MERHAK"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#061d2c]/90 via-[#061d2c]/60 to-[#061d2c]/30" />
        
        <div className="relative z-10 text-center text-white px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#8edcff] mb-4">
            Contact
          </p>
          <h1 className="text-4xl font-light tracking-wide md:text-6xl">
            L'Atelier <span className="font-semibold">MERHAK</span>
          </h1>
        </div>
      </section>

      {/* Content Section */}
      <section className="relative z-20 -mt-24 mb-24 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          
          <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-2xl shadow-[#061d2c]/10 ring-1 ring-black/5">
            <div className="grid lg:grid-cols-2">
              
              {/* Info Column */}
              <div className="p-10 md:p-16 lg:p-20">
                <h2 className="text-3xl font-light leading-tight text-[#10212f] md:text-4xl">
                  Nous sommes à <span className="font-semibold text-[#0f73c4]">votre écoute.</span>
                </h2>
                
                <p className="mt-6 text-lg leading-8 text-[#667785]">
Création sur mesure, question sur nos collections ou toute autre demande , notre équipe vous accompagne dans la confection de la pièce parfaite.                </p>

                <div className="mt-14 space-y-10">
                  <div className="group flex items-start gap-6">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f7fbfe] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#eef9ff]">
                      <MapPinIcon className="h-7 w-7 text-[#0f73c4]" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-[#10212f]">Boutique & Atelier</p>
                      <p className="mt-2 text-base leading-7 text-[#667785]">
                        87, Avenue Habib Bourguiba 
                        <br />
                        Village Artisanal ,Ezzahra
                        <br />
                        Tunisie
                      </p>
                    </div>
                  </div>

                  <a href="mailto:contact@merhak.tn" className="group flex items-start gap-6 transition hover:opacity-80">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f7fbfe] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#eef9ff]">
                      <EnvelopeIcon className="h-7 w-7 text-[#0f73c4]" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-[#10212f]">E-mail</p>
                      <p className="mt-2 text-base leading-7 text-[#667785]">
                        contact@merhak.tn
                      </p>
                    </div>
                  </a>

                  <a href="tel:+21654382645" className="group flex items-start gap-6 transition hover:opacity-80">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f7fbfe] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#eef9ff]">
                      <PhoneIcon className="h-7 w-7 text-[#0f73c4]" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-[#10212f]">Téléphone</p>
                      <p className="mt-2 text-base leading-7 text-[#667785]">
                        (+216) 54 382 645
                      </p>
                    </div>
                  </a>

                  <a href="https://wa.me/21654382645" target="_blank" rel="noopener noreferrer" className="group flex items-start gap-6 transition hover:opacity-80">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f7fbfe] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#eef9ff]">
                      <ChatBubbleOvalLeftEllipsisIcon className="h-7 w-7 text-[#25D366]" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-[#10212f]">WhatsApp</p>
                      <p className="mt-2 text-base leading-7 text-[#667785]">
                        (+216) 54 382 645
                      </p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Map Column */}
              <div className="relative min-h-[500px] w-full lg:min-h-full">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1022.9404137861355!2d10.303353131231034!3d36.74142707959404!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12fd49000696de4d%3A0x289d0631b1171b7c!2sMerhak%20Haute%20Couture!5e1!3m2!1sfr!2stn!4v1786717569742!5m2!1sfr!2stn"
                  className="absolute inset-0 h-full w-full border-0 grayscale hover:grayscale-0 transition-all duration-700"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                ></iframe>
              </div>

            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Contact;