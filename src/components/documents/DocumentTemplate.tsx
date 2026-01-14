import React, { useState, useRef } from 'react';
import { Search, Plus, X, Download, Save, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useCurrency } from '@/hooks/use-currency';
import { useTaxes } from '@/hooks/use-taxes';

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
  docType?: 'facture' | 'devis' | 'bon_commande' | 'bon_livraison';
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
  const { defaultCurrency, formatAmount } = useCurrency();
  const { enabledTaxes, calculateTax } = useTaxes();
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
    
    // Calculer les taxes activées sur le montant HT après remise
    const taxesCalculees = enabledTaxes.map(tax => ({
      tax,
      montant: calculateTax(totalHTApresRemise, tax)
    }));
    
    const totalTaxes = taxesCalculees.reduce((sum, t) => sum + t.montant, 0);
    const totalTTC = totalHTApresRemise + totalTVA + totalTaxes;

    return { 
      totalHT, 
      totalRemise, 
      totalHTApresRemise, 
      tvaParTaux, 
      totalTVA, 
      taxesCalculees,
      totalTaxes,
      totalTTC 
    };
  };

  const nombreEnLettres = (nombre: number) => {
    if (!defaultCurrency) {
      // Fallback si pas de devise - ne devrait pas arriver si les devises sont configurées
      const entier = Math.floor(nombre);
      const decimal = Math.round((nombre - entier) * 100);
      if (entier === 0 && decimal === 0) return 'zéro';
      return `${entier}${decimal > 0 ? ` et ${decimal}` : ''}`;
    }

    const entier = Math.floor(nombre);
    // Utiliser le nombre de décimales de la devise (2 pour la plupart, 3 pour le dinar tunisien)
    const decimalMultiplier = Math.pow(10, defaultCurrency.decimalPlaces);
    const decimal = Math.round((nombre - entier) * decimalMultiplier);
    
    if (entier === 0 && decimal === 0) {
      return `zéro ${defaultCurrency.wordSingular}`;
    }
    
    const convertisseur = (num: number): string => {
      if (num === 0) return '';
      if (num < 0) return 'moins ' + convertisseur(-num);
      
      const unites = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 
                      'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
      const dizaines = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];
      
      if (num < 20) return unites[num];
      
      if (num < 100) {
        const dizaine = Math.floor(num / 10);
        const unite = num % 10;
        
        if (dizaine === 7 || dizaine === 9) {
          // Soixante-dix, quatre-vingt-dix
          const base = dizaine === 7 ? 60 : 80;
          const reste = num - base;
          if (reste === 0) return dizaines[dizaine];
          if (reste === 1) return dizaines[dizaine] + '-et-un';
          return dizaines[dizaine] + '-' + convertisseur(reste);
        }
        
        if (unite === 0) {
          if (dizaine === 8) return 'quatre-vingts';
          return dizaines[dizaine];
        }
        if (unite === 1 && dizaine !== 8) return dizaines[dizaine] + '-et-un';
        return dizaines[dizaine] + '-' + unites[unite];
      }
      
      if (num < 1000) {
        const centaine = Math.floor(num / 100);
        const reste = num % 100;
        
        let result = '';
        if (centaine === 1) {
          result = 'cent';
        } else {
          result = unites[centaine] + ' cent';
        }
        
        if (reste === 0) {
          if (centaine > 1) result += 's';
          return result;
        }
        
        // Pour le reste, convertir en tenant compte que 80 ne prend pas de "s" dans ce contexte
        let resteLettres = '';
        if (reste === 80) {
          resteLettres = 'quatre-vingt'; // Pas de "s" car il y a un nombre avant
        } else {
          resteLettres = convertisseur(reste);
        }
        
        return result + ' ' + resteLettres;
      }
      
      if (num < 1000000) {
        const millier = Math.floor(num / 1000);
        const reste = num % 1000;
        
        let result = '';
        if (millier === 1) {
          result = 'mille';
        } else {
          result = convertisseur(millier) + ' mille';
        }
        
        if (reste === 0) return result;
        if (reste < 100) return result + ' ' + convertisseur(reste);
        return result + ' ' + convertisseur(reste);
      }
      
      if (num < 1000000000) {
        const million = Math.floor(num / 1000000);
        const reste = num % 1000000;
        
        let result = '';
        if (million === 1) {
          result = 'un million';
        } else {
          result = convertisseur(million) + ' millions';
        }
        
        if (reste === 0) return result;
        return result + ' ' + convertisseur(reste);
      }
      
      return num.toString(); // Pour les nombres très grands
    };
    
    let result = '';
    
    if (entier > 0) {
      const entierLettres = convertisseur(entier);
      result = entierLettres;
      if (entier === 1) {
        result += ` ${defaultCurrency.wordSingular}`;
      } else {
        result += ` ${defaultCurrency.wordPlural}`;
      }
    }
    
    if (decimal > 0) {
      if (entier > 0) result += ' et ';
      const decimalLettres = convertisseur(decimal);
      result += decimalLettres;
      if (decimal === 1) {
        result += ` ${defaultCurrency.wordFractionSingular}`;
      } else {
        result += ` ${defaultCurrency.wordFractionPlural}`;
      }
    }
    
    return result;
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

  const documentRef = useRef<HTMLDivElement>(null);

  const handleSave = () => {
    onSave?.({ formData, lignes });
  };

  const handleDownloadPDF = async () => {
    if (!documentRef.current) return;

    try {
      // Afficher un indicateur de chargement
      const loadingButton = document.querySelector('[data-pdf-button]') as HTMLElement;
      if (loadingButton) {
        loadingButton.style.opacity = '0.5';
        loadingButton.style.pointerEvents = 'none';
      }

      // Créer une copie du document pour la conversion PDF
      const clone = documentRef.current.cloneNode(true) as HTMLElement;
      
      // Masquer les éléments à ne pas imprimer
      const noPrintElements = clone.querySelectorAll('.no-print');
      noPrintElements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.display = 'none';
      });

      // Remplacer tous les inputs par leur valeur en texte
      const inputs = clone.querySelectorAll('input, select, textarea');
      inputs.forEach((input) => {
        const htmlInput = input as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        let value = '';
        
        if (htmlInput instanceof HTMLSelectElement) {
          const selectedOption = htmlInput.options[htmlInput.selectedIndex];
          value = selectedOption ? selectedOption.text : htmlInput.value;
        } else {
          value = htmlInput.value || '';
        }
        
        // Pour les nombres, formater correctement
        if (htmlInput.type === 'number' && value) {
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            if (htmlInput.classList.contains('text-right') || htmlInput.style.textAlign === 'right') {
              value = numValue.toFixed(2);
            } else {
              value = numValue.toString();
            }
          }
        }
        
        const span = document.createElement('span');
        // Afficher la valeur ou un espace si vide pour maintenir la hauteur
        span.textContent = value || (htmlInput.type === 'number' ? '0' : ' ');
        span.style.display = 'inline-block';
        span.style.width = '100%';
        span.style.padding = '4px 8px';
        span.style.minHeight = '24px';
        span.style.lineHeight = '24px';
        span.style.verticalAlign = 'middle';
        
        // Copier les styles de positionnement
        const computedStyle = window.getComputedStyle(htmlInput);
        const textAlign = computedStyle.textAlign || htmlInput.style.textAlign || 'left';
        span.style.textAlign = textAlign;
        span.style.fontSize = computedStyle.fontSize || '14px';
        span.style.fontWeight = computedStyle.fontWeight || 'normal';
        span.style.color = '#000000'; // Forcer la couleur noire pour la visibilité
        span.style.backgroundColor = 'transparent';
        span.style.border = 'none';
        span.style.fontFamily = computedStyle.fontFamily || 'Arial, sans-serif';
        
        // Pour les nombres, s'assurer qu'ils sont bien formatés
        if (htmlInput.type === 'number' && value) {
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            if (textAlign === 'right') {
              span.textContent = numValue.toFixed(2);
            } else {
              span.textContent = numValue.toString();
            }
          }
        }
        
        if (htmlInput.parentNode) {
          htmlInput.parentNode.replaceChild(span, htmlInput);
        }
      });

      // Masquer les dropdowns et autres éléments interactifs
      const dropdowns = clone.querySelectorAll('[class*="dropdown"], [class*="popover"], [class*="absolute"]');
      dropdowns.forEach((el) => {
        const htmlEl = el as HTMLElement;
        if (htmlEl.style.position === 'absolute' || htmlEl.classList.contains('absolute')) {
          htmlEl.style.display = 'none';
        }
      });

      // Ajuster la hauteur du clone pour qu'elle corresponde au contenu réel
      // Remplacer height fixe par minHeight pour permettre au contenu de définir la hauteur
      clone.style.height = 'auto';
      clone.style.minHeight = '297mm';
      
      // Ajouter temporairement le clone au DOM pour le capturer
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.visibility = 'visible';
      clone.style.opacity = '1';
      document.body.appendChild(clone);

      // Attendre un peu pour que le DOM se mette à jour et que la hauteur soit calculée
      await new Promise(resolve => setTimeout(resolve, 200));

      // Calculer la hauteur réelle du contenu
      const actualHeight = Math.max(clone.scrollHeight, clone.offsetHeight);
      
      // Capturer le contenu du document
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: clone.offsetWidth,
        height: actualHeight,
        allowTaint: true,
        removeContainer: true,
      });

      // Supprimer le clone
      if (clone.parentNode) {
        document.body.removeChild(clone);
      }

      // Calculer les dimensions A4
      const imgWidth = 210; // Largeur A4 en mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Ajouter l'image au PDF
      const imgData = canvas.toDataURL('image/png');
      const pageHeight = 297; // Hauteur A4 en mm
      const pageWidth = 210; // Largeur A4 en mm

      // Tolérance pour éviter les pages vides dues aux arrondis (2mm)
      const tolerance = 2;

      // Si le contenu dépasse une page (avec tolérance), diviser en plusieurs pages
      if (imgHeight <= pageHeight + tolerance) {
        // Le contenu tient sur une page - ajuster la hauteur si nécessaire
        const actualHeight = Math.min(imgHeight, pageHeight);
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, actualHeight);
      } else {
        // Le contenu dépasse une page, diviser en plusieurs pages
        let heightLeft = imgHeight;
        let position = 0;

        // Première page
        pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
        heightLeft -= pageHeight;

        // Pages supplémentaires - seulement si vraiment nécessaire
        while (heightLeft > tolerance) {
          position -= pageHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
          heightLeft -= pageHeight;
        }
      }

      // Télécharger le PDF
      pdf.save(`${formData.numero || 'document'}.pdf`);

      // Restaurer le bouton
      if (loadingButton) {
        loadingButton.style.opacity = '1';
        loadingButton.style.pointerEvents = 'auto';
      }
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
    }
  };

  const handlePrint = () => {
    if (!documentRef.current) return;
    
    // Créer une copie du document pour la conversion
    const clone = documentRef.current.cloneNode(true) as HTMLElement;
    
    // Masquer les éléments à ne pas imprimer
    const noPrintElements = clone.querySelectorAll('.no-print');
    noPrintElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.display = 'none';
    });

    // Remplacer tous les inputs par leur valeur en texte
    const inputs = clone.querySelectorAll('input, select, textarea');
    inputs.forEach((input) => {
      const htmlInput = input as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      let value = '';
      
      if (htmlInput instanceof HTMLSelectElement) {
        const selectedOption = htmlInput.options[htmlInput.selectedIndex];
        value = selectedOption ? selectedOption.text : htmlInput.value;
      } else {
        value = htmlInput.value || '';
      }
      
      // Pour les nombres, formater correctement
      if (htmlInput.type === 'number' && value) {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          const computedStyle = window.getComputedStyle(htmlInput);
          const textAlign = computedStyle.textAlign || htmlInput.style.textAlign || 'left';
          if (textAlign === 'right') {
            value = numValue.toFixed(2);
          } else {
            value = numValue.toString();
          }
        }
      }
      
      const span = document.createElement('span');
      // Afficher la valeur ou un espace si vide pour maintenir la hauteur
      span.textContent = value || (htmlInput.type === 'number' ? '0' : ' ');
      span.style.display = 'inline-block';
      span.style.width = '100%';
      span.style.padding = '4px 8px';
      span.style.minHeight = '24px';
      span.style.lineHeight = '24px';
      span.style.verticalAlign = 'middle';
      
      // Copier les styles de positionnement
      const computedStyle = window.getComputedStyle(htmlInput);
      const textAlign = computedStyle.textAlign || htmlInput.style.textAlign || 'left';
      span.style.textAlign = textAlign;
      span.style.fontSize = computedStyle.fontSize || '14px';
      span.style.fontWeight = computedStyle.fontWeight || 'normal';
      span.style.color = '#000000'; // Forcer la couleur noire pour la visibilité
      span.style.backgroundColor = 'transparent';
      span.style.border = 'none';
      span.style.fontFamily = computedStyle.fontFamily || 'Arial, sans-serif';
      
      if (htmlInput.parentNode) {
        htmlInput.parentNode.replaceChild(span, htmlInput);
      }
    });

    // Masquer les dropdowns et autres éléments interactifs
    const dropdowns = clone.querySelectorAll('[class*="dropdown"], [class*="popover"], [class*="absolute"]');
    dropdowns.forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.style.position === 'absolute' || htmlEl.classList.contains('absolute')) {
        htmlEl.style.display = 'none';
      }
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${formData.numero || 'Document'}</title>
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
            }
            * {
              box-sizing: border-box;
            }
          </style>
        </head>
        <body>
          ${clone.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const getDocTypeLabel = () => {
    switch (docType) {
      case 'facture': return 'FACTURE';
      case 'devis': return 'DEVIS';
      case 'bon_commande': return 'BON DE COMMANDE';
      case 'bon_livraison': return 'BON DE LIVRAISON';
      default: return 'DOCUMENT';
    }
  };

  return (
    <div className="bg-muted/30 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Controls */}
        <div className="bg-card rounded-lg shadow-sm p-4 mb-6 border">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {!readOnly ? (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <select 
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as typeof docType)}
                    className="px-4 py-2 border rounded-lg font-medium bg-background text-sm"
                  >
                    <option value="facture">Facture</option>
                    <option value="devis">Devis</option>
                    <option value="bon_commande">Bon de Commande</option>
                    <option value="bon_livraison">Bon de Livraison</option>
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
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-1.5"
                    onClick={handleDownloadPDF}
                    data-pdf-button
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-1.5"
                    onClick={handlePrint}
                    data-print-button
                  >
                    <Printer className="w-4 h-4" />
                    Imprimer
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-auto">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-1.5"
                  onClick={handleDownloadPDF}
                  data-pdf-button
                >
                  <Download className="w-4 h-4" />
                  PDF
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-1.5"
                  onClick={handlePrint}
                  data-print-button
                >
                  <Printer className="w-4 h-4" />
                  Imprimer
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Document A4 Preview */}
        <div className="bg-card rounded-lg shadow-lg overflow-hidden border">
          <div 
            ref={documentRef}
            className="bg-white flex flex-col" 
            style={{ 
              width: '210mm', 
              minHeight: '297mm',
              height: '297mm',
              margin: '0 auto',
              maxWidth: '100%',
              paddingLeft: '10mm',
              paddingRight: '10mm',
              paddingTop: '15mm',
              paddingBottom: '0mm'
            }}
          >
            
            {/* En-tête */}
            <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-primary/20">
              <div className="flex-1">
                {entreprise.logo ? (
                  <img 
                    src={entreprise.logo} 
                    alt={entreprise.nom}
                    className="h-16 w-auto mb-2 object-contain"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="text-4xl mb-2">🏢</div>
                )}
                <h1 className="text-xl font-bold text-foreground">{entreprise.nom}</h1>
                <p className="text-sm text-muted-foreground">{entreprise.adresse}</p>
                {entreprise.ville && <p className="text-sm text-muted-foreground">{entreprise.ville}</p>}
                {entreprise.tel && <p className="text-sm text-muted-foreground">Tél: {entreprise.tel}</p>}
                {entreprise.email && <p className="text-sm text-muted-foreground">{entreprise.email}</p>}
                {entreprise.mf && <p className="text-sm font-medium mt-1">IF: {entreprise.mf}</p>}
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
            <div className="mb-8 flex-1">
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
                                className="h-8 border-0 shadow-none bg-transparent text-sm"
                                style={{ color: '#000', fontWeight: 'normal' }}
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
                                      <p className="text-xs text-muted-foreground">{produit.ref} - {formatAmount(produit.prixHT)}</p>
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
                              className="h-8 text-center border-0 shadow-none bg-transparent text-sm"
                              style={{ color: '#000', fontWeight: 'normal' }}
                              min="0"
                            />
                          )}
                        </td>
                        <td className="border p-1">
                          {readOnly ? (
                            <span className="block text-right px-2">{formatAmount(ligne.prixHT)}</span>
                          ) : (
                            <Input
                              type="number"
                              value={ligne.prixHT}
                              onChange={(e) => modifierLigne(ligne.id, 'prixHT', parseFloat(e.target.value) || 0)}
                              className="h-8 text-right border-0 shadow-none bg-transparent text-sm"
                              style={{ color: '#000', fontWeight: 'normal' }}
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
                              className="h-8 text-right border-0 shadow-none bg-transparent text-sm"
                              style={{ color: '#000', fontWeight: 'normal' }}
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
                              style={{ color: '#000', fontWeight: 'normal' }}
                            >
                              <option value={0}>0%</option>
                              <option value={7}>7%</option>
                              <option value={10}>10%</option>
                              <option value={20}>20%</option>
                            </select>
                          )}
                        </td>
                        <td className="border p-2 text-right font-medium">
                          {formatAmount(calc.htApresRemise)}
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
                  className="mt-3 gap-1.5 no-print"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter une ligne
                </Button>
              )}
            </div>

            {/* Totaux */}
            <div className="flex justify-end mb-4">
              <div className="w-80">
                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total HT:</span>
                    <span>{formatAmount(totaux.totalHT)}</span>
                  </div>
                  
                  {totaux.totalRemise > 0 && (
                    <div className="flex justify-between text-sm text-destructive">
                      <span>Remise:</span>
                      <span>-{formatAmount(totaux.totalRemise)}</span>
                    </div>
                  )}

                    <div className="flex justify-between text-sm font-medium">
                      <span>Net HT:</span>
                      <span>{formatAmount(totaux.totalHTApresRemise)}</span>
                    </div>

                    {Object.entries(totaux.tvaParTaux).map(([taux, montant]) => (
                      <div key={taux} className="flex justify-between text-sm">
                        <span>TVA {taux}%:</span>
                        <span>{formatAmount(montant)}</span>
                      </div>
                    ))}

                    {/* Taxes activées */}
                    {totaux.taxesCalculees && totaux.taxesCalculees.length > 0 && totaux.taxesCalculees.map(({ tax, montant }) => (
                      <div key={tax.id} className="flex justify-between text-sm">
                        <span>
                          {tax.name} {tax.type === 'percentage' ? `${tax.value}%` : ''}:
                        </span>
                        <span>{formatAmount(montant)}</span>
                      </div>
                    ))}

                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-primary/20">
                      <span>Total TTC:</span>
                      <span className="text-primary">{formatAmount(totaux.totalTTC)}</span>
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
              <div className="mb-4">
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
              <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{formData.notes}</p>
              </div>
            )}

            {/* Footer - Positionné à 1cm du bas */}
            <div 
              className="border-t text-center"
              style={{
                marginTop: 'auto',
                paddingTop: '4mm',
                paddingBottom: '10mm',
                fontSize: '9pt',
                color: '#6b7280'
              }}
            >
              <div className="whitespace-pre-line" style={{ fontSize: '9pt', lineHeight: '1.3', color: '#6b7280' }}>
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
