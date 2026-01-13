import React, { useState } from 'react';
import { Search, Plus, X, Download, Save, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface DocumentLine {
  id: number;
  designation: string;
  quantite: number;
  prixHT: number;
  remise: number;
  tva: number;
}

export interface DocumentFormData {
  numero: string;
  date: string;
  clientId: string;
  clientNom: string;
  clientAdresse: string;
  clientMF: string;
  notes: string;
}

export interface EntrepriseInfo {
  nom: string;
  adresse: string;
  ville: string;
  tel: string;
  email: string;
  mf: string;
  logo?: string;
  piedDePage: string;
}

interface DocumentTemplateProps {
  docType?: 'facture' | 'devis' | 'bon_commande';
  entreprise?: EntrepriseInfo;
  readOnly?: boolean;
  onSave?: (data: { formData: DocumentFormData; lignes: DocumentLine[] }) => void;
}

const defaultEntreprise: EntrepriseInfo = {
  nom: 'MA SOCIÉTÉ SARL',
  adresse: '123 Avenue Principale',
  ville: 'Casablanca 20000',
  tel: '+212 5XX XXX XXX',
  email: 'contact@masociete.ma',
  mf: '1234567',
  piedDePage: 'RC: Casablanca 123456 | IF: 12345678 | ICE: 001234567890123 | Patente: 12345678\nIBAN: MA64 XXX XXXX XXXX XXXX XXXX XXX'
};

const DocumentTemplate: React.FC<DocumentTemplateProps> = ({
  docType: initialDocType = 'facture',
  entreprise = defaultEntreprise,
  readOnly = false,
  onSave
}) => {
  const [docType, setDocType] = useState(initialDocType);
  const [formData, setFormData] = useState<DocumentFormData>({
    numero: 'F-2025-001',
    date: new Date().toISOString().split('T')[0],
    clientId: '',
    clientNom: '',
    clientAdresse: '',
    clientMF: '',
    notes: '',
  });

  const [lignes, setLignes] = useState<DocumentLine[]>([
    { id: 1, designation: '', quantite: 1, prixHT: 0, remise: 0, tva: 20 }
  ]);

  const [searchClient, setSearchClient] = useState('');
  const [searchProduit, setSearchProduit] = useState('');
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [showProduitSearch, setShowProduitSearch] = useState<number | null>(null);

  // Données factices
  const clients = [
    { id: 1, nom: 'SARL TechnoPlus', adresse: 'Rue Mohammed V, Casablanca', mf: '1234567' },
    { id: 2, nom: 'STE Import Export Méditerranée', adresse: 'Avenue Hassan II, Rabat', mf: '7654321' },
    { id: 3, nom: 'Entreprise Moderne', adresse: 'Zone Industrielle, Tanger', mf: '9876543' },
  ];

  const produits = [
    { id: 1, ref: 'P001', designation: 'Ordinateur Portable HP', prixHT: 8500, tva: 20 },
    { id: 2, ref: 'P002', designation: 'Souris Sans Fil Logitech', prixHT: 250, tva: 20 },
    { id: 3, ref: 'P003', designation: 'Clavier Mécanique', prixHT: 850, tva: 20 },
    { id: 4, ref: 'P004', designation: 'Écran LED 24 pouces', prixHT: 3200, tva: 20 },
  ];

  const calculerLigne = (ligne: DocumentLine) => {
    const sousTotal = ligne.quantite * ligne.prixHT;
    const montantRemise = sousTotal * (ligne.remise / 100);
    const htApresRemise = sousTotal - montantRemise;
    const montantTVA = htApresRemise * (ligne.tva / 100);
    return {
      sousTotal,
      montantRemise,
      htApresRemise,
      montantTVA,
      totalTTC: htApresRemise + montantTVA
    };
  };

  const calculerTotaux = () => {
    let totalHT = 0;
    let totalRemise = 0;
    const tvaParTaux: Record<number, number> = {};

    lignes.forEach(ligne => {
      const calc = calculerLigne(ligne);
      totalHT += calc.sousTotal;
      totalRemise += calc.montantRemise;
      
      if (!tvaParTaux[ligne.tva]) {
        tvaParTaux[ligne.tva] = 0;
      }
      tvaParTaux[ligne.tva] += calc.montantTVA;
    });

    const totalHTApresRemise = totalHT - totalRemise;
    const totalTVA = Object.values(tvaParTaux).reduce((a, b) => a + b, 0);
    const totalTTC = totalHTApresRemise + totalTVA;

    return { totalHT, totalRemise, totalHTApresRemise, tvaParTaux, totalTVA, totalTTC };
  };

  const nombreEnLettres = (nombre: number) => {
    const entier = Math.floor(nombre);
    const decimal = Math.round((nombre - entier) * 100);
    
    if (entier === 0) return 'zéro dirhams';
    return `${entier} dirhams et ${decimal} centimes`;
  };

  const ajouterLigne = () => {
    setLignes([...lignes, { 
      id: Date.now(), 
      designation: '', 
      quantite: 1, 
      prixHT: 0, 
      remise: 0, 
      tva: 20 
    }]);
  };

  const supprimerLigne = (id: number) => {
    if (lignes.length > 1) {
      setLignes(lignes.filter(l => l.id !== id));
    }
  };

  const modifierLigne = (id: number, champ: keyof DocumentLine, valeur: string | number) => {
    setLignes(lignes.map(l => 
      l.id === id ? { ...l, [champ]: valeur } : l
    ));
  };

  const selectionnerClient = (client: typeof clients[0]) => {
    setFormData({
      ...formData,
      clientId: client.id.toString(),
      clientNom: client.nom,
      clientAdresse: client.adresse,
      clientMF: client.mf
    });
    setShowClientSearch(false);
    setSearchClient('');
  };

  const selectionnerProduit = (ligneId: number, produit: typeof produits[0]) => {
    setLignes(lignes.map(l => 
      l.id === ligneId ? { 
        ...l, 
        designation: produit.designation,
        prixHT: produit.prixHT,
        tva: produit.tva
      } : l
    ));
    setShowProduitSearch(null);
    setSearchProduit('');
  };

  const clientsFiltres = clients.filter(c => 
    c.nom.toLowerCase().includes(searchClient.toLowerCase()) ||
    c.mf.includes(searchClient)
  );

  const produitsFiltres = produits.filter(p => 
    p.designation.toLowerCase().includes(searchProduit.toLowerCase()) ||
    p.ref.toLowerCase().includes(searchProduit.toLowerCase())
  );

  const totaux = calculerTotaux();

  const handleSave = () => {
    onSave?.({ formData, lignes });
  };

  const getDocTypeLabel = () => {
    switch (docType) {
      case 'facture': return 'FACTURE';
      case 'devis': return 'DEVIS';
      case 'bon_commande': return 'BON DE COMMANDE';
      default: return 'DOCUMENT';
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Controls */}
        {!readOnly && (
          <div className="bg-card rounded-lg shadow-sm p-4 mb-6 border">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <select 
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as typeof docType)}
                  className="px-4 py-2 border rounded-lg font-medium bg-background text-sm"
                >
                  <option value="facture">Facture</option>
                  <option value="devis">Devis</option>
                  <option value="bon_commande">Bon de Commande</option>
                </select>
                <Input
                  value={formData.numero}
                  onChange={(e) => setFormData({...formData, numero: e.target.value})}
                  className="w-32 h-9"
                  placeholder="Numéro"
                />
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="h-9"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleSave} className="gap-1.5">
                  <Save className="w-4 h-4" />
                  Enregistrer
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Download className="w-4 h-4" />
                  PDF
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Printer className="w-4 h-4" />
                  Imprimer
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Document A4 Preview */}
        <div className="bg-card rounded-lg shadow-lg overflow-hidden border">
          <div className="bg-white p-8 md:p-12 min-h-[1000px]" style={{ maxWidth: '210mm', margin: '0 auto' }}>
            
            {/* En-tête */}
            <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-primary/20">
              <div className="flex-1">
                <div className="text-4xl mb-2">🏢</div>
                <h1 className="text-xl font-bold text-foreground">{entreprise.nom}</h1>
                <p className="text-sm text-muted-foreground">{entreprise.adresse}</p>
                <p className="text-sm text-muted-foreground">{entreprise.ville}</p>
                <p className="text-sm text-muted-foreground">Tél: {entreprise.tel}</p>
                <p className="text-sm text-muted-foreground">{entreprise.email}</p>
                <p className="text-sm font-medium mt-1">IF: {entreprise.mf}</p>
              </div>

              <div className="text-right">
                <div className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold text-lg mb-2">
                  {getDocTypeLabel()}
                </div>
                <p className="text-lg font-bold">{formData.numero}</p>
                <p className="text-muted-foreground">Date: {new Date(formData.date).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>

            {/* Recherche Client */}
            <div className="mb-8 p-4 bg-muted/30 rounded-lg">
              <Label className="text-xs font-semibold text-muted-foreground mb-2 block">CLIENT</Label>
              
              {!readOnly && (
                <div className="relative mb-3">
                  <div className="flex gap-2">
                    <Input
                      value={searchClient}
                      onChange={(e) => {
                        setSearchClient(e.target.value);
                        setShowClientSearch(true);
                      }}
                      onFocus={() => setShowClientSearch(true)}
                      placeholder="Rechercher un client..."
                      className="flex-1 h-9"
                    />
                    <Button size="sm" variant="outline" className="h-9">
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>

                  {showClientSearch && searchClient && (
                    <div className="absolute z-10 w-full mt-1 bg-card border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {clientsFiltres.map(client => (
                        <div
                          key={client.id}
                          onClick={() => selectionnerClient(client)}
                          className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                        >
                          <p className="font-medium text-sm">{client.nom}</p>
                          <p className="text-xs text-muted-foreground">{client.mf}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {formData.clientNom && (
                <div className="bg-card p-3 rounded border">
                  <p className="font-semibold">{formData.clientNom}</p>
                  <p className="text-sm text-muted-foreground">{formData.clientAdresse}</p>
                  <p className="text-sm">IF: {formData.clientMF}</p>
                </div>
              )}
            </div>

            {/* Tableau des produits */}
            <div className="mb-8">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border p-2 text-left font-semibold">Désignation</th>
                    <th className="border p-2 text-center font-semibold w-16">Qté</th>
                    <th className="border p-2 text-right font-semibold w-24">Prix HT</th>
                    <th className="border p-2 text-right font-semibold w-20">Remise %</th>
                    <th className="border p-2 text-center font-semibold w-16">TVA</th>
                    <th className="border p-2 text-right font-semibold w-28">Total HT</th>
                    {!readOnly && <th className="border p-2 w-10"></th>}
                  </tr>
                </thead>
                <tbody>
                  {lignes.map((ligne) => {
                    const calc = calculerLigne(ligne);
                    return (
                      <tr key={ligne.id} className="hover:bg-muted/20">
                        <td className="border p-1">
                          {readOnly ? (
                            <span className="px-2">{ligne.designation}</span>
                          ) : (
                            <div className="relative">
                              <Input
                                value={ligne.designation}
                                onChange={(e) => {
                                  modifierLigne(ligne.id, 'designation', e.target.value);
                                  setSearchProduit(e.target.value);
                                  setShowProduitSearch(ligne.id);
                                }}
                                placeholder="Rechercher produit..."
                                className="h-8 border-0 shadow-none"
                              />
                              {showProduitSearch === ligne.id && searchProduit && (
                                <div className="absolute z-10 w-full mt-1 bg-card border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                  {produitsFiltres.map(produit => (
                                    <div
                                      key={produit.id}
                                      onClick={() => selectionnerProduit(ligne.id, produit)}
                                      className="p-2 hover:bg-muted cursor-pointer border-b last:border-b-0"
                                    >
                                      <p className="font-medium text-sm">{produit.designation}</p>
                                      <p className="text-xs text-muted-foreground">{produit.ref} - {produit.prixHT} DH</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="border p-1">
                          {readOnly ? (
                            <span className="block text-center">{ligne.quantite}</span>
                          ) : (
                            <Input
                              type="number"
                              value={ligne.quantite}
                              onChange={(e) => modifierLigne(ligne.id, 'quantite', parseFloat(e.target.value) || 0)}
                              className="h-8 text-center border-0 shadow-none"
                              min="0"
                            />
                          )}
                        </td>
                        <td className="border p-1">
                          {readOnly ? (
                            <span className="block text-right px-2">{ligne.prixHT.toFixed(2)}</span>
                          ) : (
                            <Input
                              type="number"
                              value={ligne.prixHT}
                              onChange={(e) => modifierLigne(ligne.id, 'prixHT', parseFloat(e.target.value) || 0)}
                              className="h-8 text-right border-0 shadow-none"
                              min="0"
                              step="0.01"
                            />
                          )}
                        </td>
                        <td className="border p-1">
                          {readOnly ? (
                            <span className="block text-right px-2">{ligne.remise}</span>
                          ) : (
                            <Input
                              type="number"
                              value={ligne.remise}
                              onChange={(e) => modifierLigne(ligne.id, 'remise', parseFloat(e.target.value) || 0)}
                              className="h-8 text-right border-0 shadow-none"
                              min="0"
                              max="100"
                            />
                          )}
                        </td>
                        <td className="border p-1">
                          {readOnly ? (
                            <span className="block text-center">{ligne.tva}%</span>
                          ) : (
                            <select
                              value={ligne.tva}
                              onChange={(e) => modifierLigne(ligne.id, 'tva', parseFloat(e.target.value))}
                              className="w-full h-8 text-center border-0 bg-transparent text-sm"
                            >
                              <option value={0}>0%</option>
                              <option value={7}>7%</option>
                              <option value={10}>10%</option>
                              <option value={20}>20%</option>
                            </select>
                          )}
                        </td>
                        <td className="border p-2 text-right font-medium">
                          {calc.htApresRemise.toFixed(2)} DH
                        </td>
                        {!readOnly && (
                          <td className="border p-1 text-center">
                            <button
                              onClick={() => supprimerLigne(ligne.id)}
                              className="text-destructive hover:text-destructive/80 disabled:opacity-30"
                              disabled={lignes.length === 1}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {!readOnly && (
                <Button
                  onClick={ajouterLigne}
                  variant="outline"
                  size="sm"
                  className="mt-3 gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter une ligne
                </Button>
              )}
            </div>

            {/* Totaux */}
            <div className="flex justify-end mb-8">
              <div className="w-80">
                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total HT:</span>
                    <span>{totaux.totalHT.toFixed(2)} DH</span>
                  </div>
                  
                  {totaux.totalRemise > 0 && (
                    <div className="flex justify-between text-sm text-destructive">
                      <span>Remise:</span>
                      <span>-{totaux.totalRemise.toFixed(2)} DH</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm font-medium">
                    <span>Net HT:</span>
                    <span>{totaux.totalHTApresRemise.toFixed(2)} DH</span>
                  </div>

                  {Object.entries(totaux.tvaParTaux).map(([taux, montant]) => (
                    <div key={taux} className="flex justify-between text-sm">
                      <span>TVA {taux}%:</span>
                      <span>{montant.toFixed(2)} DH</span>
                    </div>
                  ))}

                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-primary/20">
                    <span>Total TTC:</span>
                    <span className="text-primary">{totaux.totalTTC.toFixed(2)} DH</span>
                  </div>

                  <div className="pt-2 text-xs text-muted-foreground italic">
                    <p>Arrêté la présente facture à la somme de:</p>
                    <p className="font-medium text-foreground">{nombreEnLettres(totaux.totalTTC)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {!readOnly && (
              <div className="mb-8">
                <Label className="text-xs font-semibold text-muted-foreground mb-2 block">Notes / Conditions</Label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg text-sm bg-background resize-y min-h-[80px]"
                  placeholder="Conditions de paiement, remarques..."
                />
              </div>
            )}

            {formData.notes && readOnly && (
              <div className="mb-8 p-3 bg-muted/30 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{formData.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-12 pt-6 border-t text-center">
              <p className="text-sm text-muted-foreground mb-2">Merci pour votre confiance</p>
              <div className="text-xs text-muted-foreground whitespace-pre-line">
                {entreprise.piedDePage}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentTemplate;
