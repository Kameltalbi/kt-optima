import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Download } from "lucide-react";
import { CompanyDocumentLayout } from "@/components/documents/CompanyDocumentLayout";
import { InvoiceDocument, type InvoiceDocumentData } from "@/components/documents/InvoiceDocument";
import { useClients } from "@/hooks/use-clients";
import { useCredits } from "@/hooks/use-credits";
import { toast } from "sonner";

export default function CreditNotePreviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { clients } = useClients();
  const { clientCredits } = useCredits();
  const [documentData, setDocumentData] = useState<InvoiceDocumentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const credit = clientCredits.find(c => c.id === id);
    if (!credit) {
      toast.error("Avoir introuvable");
      navigate("/ventes/avoirs");
      return;
    }

    const client = clients.find(c => c.id === credit.client_id);
    if (!client) {
      toast.error("Client introuvable");
      navigate("/ventes/avoirs");
      return;
    }

    // Transformer les données
    // TODO: Récupérer les lignes depuis la base de données
    const data: InvoiceDocumentData = {
      type: 'credit_note',
      number: credit.number,
      date: credit.date,
      client: {
        name: client.nom,
        address: client.adresse || null,
      },
      lines: [
        {
          description: credit.comments || 'Avoir client',
          quantity: 1,
          unit_price: credit.subtotal,
          total_ht: credit.subtotal,
        },
      ],
      total_ht: credit.subtotal,
      applied_taxes: credit.tax > 0 ? [{
        tax_id: 'tva',
        name: 'TVA',
        type: 'percentage',
        rate_or_value: 19,
        amount: credit.tax,
      }] : [],
      total_ttc: credit.total,
      notes: credit.comments || null,
    };

    setDocumentData(data);
    setLoading(false);
  }, [id, clientCredits, clients, navigate]);

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
            onClick={() => navigate("/ventes/avoirs")}
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
