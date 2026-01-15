import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Download } from "lucide-react";
import { CompanyDocumentLayout } from "@/components/documents/CompanyDocumentLayout";
import { InvoiceDocument, type InvoiceDocumentData } from "@/components/documents/InvoiceDocument";
import { useFacturesVentes } from "@/hooks/use-factures-ventes";
import { useClients } from "@/hooks/use-clients";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function InvoicePreviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { companyId } = useAuth();
  const { factures } = useFacturesVentes();
  const { clients } = useClients();
  const [documentData, setDocumentData] = useState<InvoiceDocumentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !companyId) {
      setLoading(false);
      return;
    }

    const loadDocument = async () => {
      try {
        // Récupérer la facture
        const facture = factures.find(f => f.id === id);
        if (!facture) {
          toast.error("Facture introuvable");
          navigate("/ventes/factures");
          return;
        }

        // Récupérer les lignes
        const { data: lignes, error: lignesError } = await supabase
          .from('facture_vente_lignes')
          .select('*')
          .eq('facture_vente_id', id)
          .order('ordre', { ascending: true });

        if (lignesError) {
          throw lignesError;
        }

        // Récupérer le client
        const client = clients.find(c => c.id === facture.client_id);
        if (!client) {
          toast.error("Client introuvable");
          navigate("/ventes/factures");
          return;
        }

        // Transformer les lignes
        const documentLines = (lignes || []).map((ligne: any) => ({
          description: ligne.description || '',
          quantity: ligne.quantite,
          unit_price: ligne.prix_unitaire,
          total_ht: ligne.montant_ht,
        }));

        // Pour l'instant, on simule les taxes appliquées
        // TODO: Récupérer les taxes appliquées depuis la base de données
        const appliedTaxes: InvoiceDocumentData['applied_taxes'] = [];
        
        // Si montant_tva > 0, on ajoute une taxe TVA
        if (facture.montant_tva > 0) {
          // On essaie de trouver le taux de TVA depuis les lignes
          const tauxTVA = (lignes as any)?.[0]?.taux_tva || 19;
          appliedTaxes.push({
            tax_id: 'tva',
            name: 'TVA',
            type: 'percentage',
            rate_or_value: tauxTVA,
            amount: facture.montant_tva,
          });
        }

        // Construire les données du document
        const data: InvoiceDocumentData = {
          type: 'invoice',
          number: facture.numero,
          date: facture.date_facture,
          client: {
            name: client.nom,
            address: client.adresse || null,
          },
          lines: documentLines,
          total_ht: facture.montant_ht,
          applied_taxes: appliedTaxes,
          total_ttc: facture.montant_ttc,
          notes: facture.notes,
        };

        setDocumentData(data);
      } catch (error) {
        console.error("Error loading invoice:", error);
        toast.error("Erreur lors du chargement de la facture");
        navigate("/ventes/factures");
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [id, companyId, factures, clients, navigate]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // TODO: Implémenter la génération PDF
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
      {/* Barre d'actions (hors document) */}
      <div className="max-w-5xl mx-auto mb-6 px-4 print:hidden">
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
          <Button
            variant="outline"
            onClick={() => navigate("/ventes/factures")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handlePrint}
              className="gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimer
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadPDF}
              className="gap-2"
            >
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
