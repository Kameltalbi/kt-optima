import { useParams, useNavigate } from "react-router-dom";
import { useClients } from "@/hooks/use-clients";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Edit, 
  Phone, 
  Mail, 
  MapPin, 
  Building2, 
  FileText,
  DollarSign,
  Calendar,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FactureVente {
  id: string;
  numero: string;
  date_facture: string;
  montant_ttc: number;
  montant_paye: number;
  montant_restant: number;
  statut: 'brouillon' | 'validee' | 'annulee' | 'payee';
}

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getClientById, loading } = useClients();
  const [factures, setFactures] = useState<FactureVente[]>([]);
  const [loadingFactures, setLoadingFactures] = useState(true);

  const client = id ? getClientById(id) : null;

  // Charger l'historique des ventes
  useEffect(() => {
    if (!id) return;

    const fetchFactures = async () => {
      try {
        setLoadingFactures(true);
        const { data, error } = await supabase
          .from('factures_ventes')
          .select('*')
          .eq('client_id', id)
          .order('date_facture', { ascending: false });

        if (error) throw error;
        setFactures(data || []);
      } catch (err) {
        console.error('Error fetching factures:', err);
        toast.error('Erreur lors du chargement de l\'historique');
      } finally {
        setLoadingFactures(false);
      }
    };

    fetchFactures();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate('/crm/clients')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Client introuvable</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalFactures = factures.length;
  const totalMontant = factures.reduce((sum, f) => sum + f.montant_ttc, 0);
  const totalPaye = factures.reduce((sum, f) => sum + f.montant_paye, 0);
  const totalRestant = factures.reduce((sum, f) => sum + f.montant_restant, 0);

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'brouillon':
        return <Badge variant="outline">Brouillon</Badge>;
      case 'validee':
        return <Badge className="bg-blue-500/10 text-blue-600 border-0">Validée</Badge>;
      case 'payee':
        return <Badge className="bg-success/10 text-success border-0">Payée</Badge>;
      case 'annulee':
        return <Badge variant="destructive">Annulée</Badge>;
      default:
        return <Badge variant="outline">{statut}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/crm/clients')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{client.nom}</h1>
            <p className="text-sm text-muted-foreground">
              {client.code && `${client.code} • `}
              {client.type === 'client' ? 'Client' : 'Prospect'}
            </p>
          </div>
        </div>
        <Button onClick={() => navigate(`/crm/clients/edit/${id}`)}>
          <Edit className="w-4 h-4 mr-2" />
          Modifier
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Solde actuel</p>
                <p className={`text-2xl font-bold mt-1 ${
                  client.solde_actuel > 0 ? 'text-success' : 
                  client.solde_actuel < 0 ? 'text-destructive' : 
                  'text-muted-foreground'
                }`}>
                  {client.solde_actuel.toLocaleString()} DT
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total factures</p>
                <p className="text-2xl font-bold mt-1">{totalFactures}</p>
              </div>
              <FileText className="w-8 h-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Montant total</p>
                <p className="text-2xl font-bold mt-1">{totalMontant.toLocaleString()} DT</p>
              </div>
              <DollarSign className="w-8 h-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Restant à payer</p>
                <p className={`text-2xl font-bold mt-1 ${
                  totalRestant > 0 ? 'text-warning' : 'text-success'
                }`}>
                  {totalRestant.toLocaleString()} DT
                </p>
              </div>
              <Calendar className="w-8 h-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations client */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {client.telephone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{client.telephone}</span>
                </div>
              )}
              {client.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{client.email}</span>
                </div>
              )}
              {client.adresse && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    <p>{client.adresse}</p>
                    {client.ville && <p>{client.ville}{client.code_postal && ` ${client.code_postal}`}</p>}
                    {client.pays && <p>{client.pays}</p>}
                  </div>
                </div>
              )}
              {client.numero_fiscal && (
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <div className="text-sm">
                    <p className="font-medium">Numéro fiscal</p>
                    <p className="text-muted-foreground">{client.numero_fiscal}</p>
                  </div>
                </div>
              )}
              {client.numero_registre_commerce && (
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <div className="text-sm">
                    <p className="font-medium">N° Registre Commerce</p>
                    <p className="text-muted-foreground">{client.numero_registre_commerce}</p>
                  </div>
                </div>
              )}
              {client.site_web && (
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <a href={client.site_web} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                    {client.site_web}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {client.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{client.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Historique des ventes */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historique des ventes</CardTitle>
              <CardDescription>Factures et documents liés à ce client</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingFactures ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : factures.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucune facture pour ce client</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Numéro</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Montant TTC</TableHead>
                        <TableHead>Payé</TableHead>
                        <TableHead>Restant</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {factures.map((facture) => (
                        <TableRow key={facture.id}>
                          <TableCell className="font-medium">{facture.numero}</TableCell>
                          <TableCell>
                            {new Date(facture.date_facture).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell className="font-medium">
                            {facture.montant_ttc.toLocaleString()} DT
                          </TableCell>
                          <TableCell>
                            {facture.montant_paye.toLocaleString()} DT
                          </TableCell>
                          <TableCell className={
                            facture.montant_restant > 0 ? 'text-warning font-medium' : 'text-success'
                          }>
                            {facture.montant_restant.toLocaleString()} DT
                          </TableCell>
                          <TableCell>
                            {getStatutBadge(facture.statut)}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => navigate(`/ventes/factures/${facture.id}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
