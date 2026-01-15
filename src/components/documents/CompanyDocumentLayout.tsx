import { ReactNode } from "react";
import { DocumentHeader } from "./DocumentHeader";
import { DocumentFooter } from "./DocumentFooter";

interface CompanyDocumentLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * Layout de document A4 réutilisable pour les documents professionnels
 * (factures, devis, avoirs, etc.)
 * 
 * Format A4 : 210mm x 297mm
 * Marges standard : 10mm de chaque côté
 */
export function CompanyDocumentLayout({
  children,
  className = "",
}: CompanyDocumentLayoutProps) {
  return (
    <div
      className={`company-document-layout flex flex-col ${className}`}
      style={{
        width: "210mm",
        minHeight: "297mm",
        margin: "0 auto",
        backgroundColor: "white",
        padding: "15mm 10mm",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Header fixe */}
      <DocumentHeader />

      {/* Contenu métier injecté */}
      <main className="flex-1 min-h-0">
        {children}
      </main>

      {/* Footer fixe */}
      <DocumentFooter />
    </div>
  );
}
