import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Download } from "lucide-react";
import { CompanyDocumentLayout } from "@/components/documents/CompanyDocumentLayout";
import { InvoiceDocument, type InvoiceDocumentData } from "@/components/documents/InvoiceDocument";
import { useClients } from "@/hooks/use-clients";
import { toast } from "sonner";

// TODO: Remplacer par un hook réel quand les devis seront dans Supabase
const mockQuotes = [
  {
    id: "1",
    number: "DEV-2024-001",
    date: "2024-01-12",
    client_id: "1",
    total: 15000,
    tax: 3000,
    lines: [
      { description: "Service conseil", quantity: 10, unit_price: 1500, total_ht: 15000 },
    ],
  },
];

export default function QuotePreviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { clients } = useClients();
  const [documentData, setDocumentData] = useState<InvoiceDocumentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    // TODO: Remplacer par un appel Supabase réel
    const quote = mockQuotes.find(q => q.id === id);
    if (!quote) {
      toast.error("Devis introuvable");
      navigate("/ventes/devis");
      return;
    }

    const client = clients.find(c => c.id === quote.client_id);
    if (!client) {
      toast.error("Client introuvable");
      navigate("/ventes/devis");
      return;
    }

    // Calculer le total HT avant remise depuis les lignes
    const totalHTBeforeDiscount = quote.lines.reduce((sum, l) => sum + l.total_ht, 0);

    // Transformer les données avec remise
    const data: InvoiceDocumentData = {
      type: 'quote',
      number: quote.number,
      date: quote.date,
      client: {
        name: client.nom,
        address: client.adresse || null,
        tax_number: client.numero_fiscal || null,
      },
      lines: quote.lines.map(line => ({
        description: line.description,
        quantity: line.quantity,
        unit_price: line.unit_price,
        total_ht: line.total_ht,
      })),
      total_ht: totalHTBeforeDiscount,
      discount: (quote as any).remise_montant || 0,
      discount_type: (quote as any).remise_type || null,
      discount_value: (quote as any).remise_valeur || 0,
      applied_taxes: quote.tax > 0 ? [{
        tax_id: 'tva',
        name: 'TVA',
        type: 'percentage',
        rate_or_value: 19,
        amount: quote.tax,
      }] : [],
      total_ttc: quote.total,
    };

    setDocumentData(data);
    setLoading(false);
  }, [id, clients, navigate]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    toast.info("Génération PDF à venir");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!documentData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Document introuvable</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Barre d'actions */}
      <div className="max-w-5xl mx-auto mb-6 px-4 print:hidden">
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
          <Button
            variant="outline"
            onClick={() => navigate("/ventes/devis")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="w-4 h-4" />
              Imprimer
            </Button>
            <Button variant="outline" onClick={handleDownloadPDF} className="gap-2">
              <Download className="w-4 h-4" />
              Télécharger PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Document */}
      <div className="flex justify-center">
        <CompanyDocumentLayout>
          <InvoiceDocument data={documentData} />
        </CompanyDocumentLayout>
      </div>
    </div>
  );
}
