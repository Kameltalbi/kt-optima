import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-[#0F172A] text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Colonne 1 — Produit */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Produit
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="#fonctionnalites"
                  className="text-sm hover:text-white transition-colors duration-200"
                >
                  Fonctionnalités
                </Link>
              </li>
              <li>
                <Link
                  to="#modules"
                  className="text-sm hover:text-white transition-colors duration-200"
                >
                  Modules
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-sm hover:text-white transition-colors duration-200"
                >
                  Tarifs
                </Link>
              </li>
              <li>
                <a
                  href="#demo"
                  className="text-sm hover:text-white transition-colors duration-200"
                >
                  Démonstration
                </a>
              </li>
              <li>
                <a
                  href="#securite"
                  className="text-sm hover:text-white transition-colors duration-200"
                >
                  Sécurité & données
                </a>
              </li>
            </ul>
          </div>

          {/* Colonne 2 — Solutions */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Solutions
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#gestion-commerciale"
                  className="text-sm hover:text-white transition-colors duration-200"
                >
                  Gestion commerciale
                </a>
              </li>
              <li>
                <a
                  href="#tresorerie"
                  className="text-sm hover:text-white transition-colors duration-200"
                >
                  Trésorerie
                </a>
              </li>
              <li>
                <a
                  href="#stock"
                  className="text-sm hover:text-white transition-colors duration-200"
                >
                  Stock
                </a>
              </li>
              <li>
                <a
                  href="#rh"
                  className="text-sm hover:text-white transition-colors duration-200"
                >
                  Ressources humaines
                </a>
              </li>
              <li>
                <a
                  href="#comptabilite"
                  className="text-sm hover:text-white transition-colors duration-200"
                >
                  Comptabilité
                </a>
              </li>
            </ul>
          </div>

          {/* Colonne 3 — Entreprise */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Entreprise
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#a-propos"
                  className="text-sm hover:text-white transition-colors duration-200"
                >
                  À propos
                </a>
              </li>
              <li>
                <a
                  href="#methodologie"
                  className="text-sm hover:text-white transition-colors duration-200"
                >
                  Méthodologie
                </a>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm hover:text-white transition-colors duration-200"
                >
                  Contact
                </Link>
              </li>
              <li>
                <a
                  href="#support"
                  className="text-sm hover:text-white transition-colors duration-200"
                >
                  Support
                </a>
              </li>
              <li>
                <a
                  href="#documentation"
                  className="text-sm hover:text-white transition-colors duration-200"
                >
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Colonne 4 — Légal */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Légal
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#mentions-legales"
                  className="text-sm hover:text-white transition-colors duration-200"
                >
                  Mentions légales
                </a>
              </li>
              <li>
                <a
                  href="#confidentialite"
                  className="text-sm hover:text-white transition-colors duration-200"
                >
                  Politique de confidentialité
                </a>
              </li>
              <li>
                <a
                  href="#cgv"
                  className="text-sm hover:text-white transition-colors duration-200"
                >
                  Conditions d'utilisation
                </a>
              </li>
              <li>
                <a
                  href="#conformite"
                  className="text-sm hover:text-white transition-colors duration-200"
                >
                  Conformité & sécurité
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bas de footer */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} KT Optima – Tous droits réservés
            </p>
            <p className="text-xs text-gray-500">
              Plateforme ERP modulaire
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
