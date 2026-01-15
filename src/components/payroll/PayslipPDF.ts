import jsPDF from 'jspdf';
import { FichePaie } from '@/hooks/use-payroll';

interface Company {
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  tax_number: string | null;
}

// Convertir un nombre en lettres (français)
function numberToWords(num: number): string {
  const units = ['', 'UN', 'DEUX', 'TROIS', 'QUATRE', 'CINQ', 'SIX', 'SEPT', 'HUIT', 'NEUF'];
  const teens = ['DIX', 'ONZE', 'DOUZE', 'TREIZE', 'QUATORZE', 'QUINZE', 'SEIZE', 'DIX-SEPT', 'DIX-HUIT', 'DIX-NEUF'];
  const tens = ['', 'DIX', 'VINGT', 'TRENTE', 'QUARANTE', 'CINQUANTE', 'SOIXANTE', 'SOIXANTE-DIX', 'QUATRE-VINGT', 'QUATRE-VINGT-DIX'];
  const thousands = ['', 'MILLE', 'MILLION', 'MILLIARD'];

  if (num === 0) return 'ZERO';

  const parts = num.toFixed(3).split('.');
  const integerPart = parseInt(parts[0], 10);
  const decimalPart = parseInt(parts[1] || '0', 10);

  function convertHundreds(n: number): string {
    let result = '';
    if (n >= 100) {
      if (n >= 200) {
        result += units[Math.floor(n / 100)] + ' CENT ';
      } else {
        result += 'CENT ';
      }
      n %= 100;
    }
    if (n >= 10 && n < 20) {
      result += teens[n - 10];
    } else if (n >= 20) {
      const ten = Math.floor(n / 10);
      const unit = n % 10;
      if (ten === 7 || ten === 9) {
        result += tens[ten - 1] + '-' + (ten === 7 ? teens[unit] : teens[unit]);
      } else {
        result += tens[ten];
        if (unit > 0) {
          result += (unit === 1 && ten !== 8 ? ' ET ' : '-') + units[unit];
        }
      }
    } else if (n > 0) {
      result += units[n];
    }
    return result.trim();
  }

  function convert(n: number): string {
    if (n === 0) return '';
    if (n < 1000) return convertHundreds(n);
    
    let result = '';
    let scale = 0;
    
    while (n > 0) {
      const remainder = n % 1000;
      if (remainder > 0) {
        const word = convertHundreds(remainder);
        if (scale === 1 && remainder === 1) {
          result = thousands[scale] + ' ' + result;
        } else {
          result = word + ' ' + thousands[scale] + ' ' + result;
        }
      }
      n = Math.floor(n / 1000);
      scale++;
    }
    
    return result.trim();
  }

  let text = convert(integerPart) + ' DINARS';
  if (decimalPart > 0) {
    text += ' ' + convert(decimalPart) + ' MILLIMES';
  }
  return text;
}

// Format période en mois lisible
function formatPeriode(periode: string): string {
  const mois = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  const [year, month] = periode.split('-');
  const monthIndex = parseInt(month, 10) - 1;
  return `${mois[monthIndex]} ${year}`;
}

export function generatePayslipPDF(fiche: FichePaie, company: Company | null) {
  const doc = new jsPDF();
  const employe = fiche.employe;
  
  // Couleurs
  const black = '#000000';
  
  // ============ EN-TÊTE ENTREPRISE ============
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(company?.name || 'ENTREPRISE', 14, 15);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  if (company?.address) {
    doc.text(company.address, 14, 21);
  }
  
  doc.setFont('helvetica', 'bold');
  doc.text(`CNSS Employeur :     ${company?.tax_number || '________'}`, 14, 30);
  
  // Titre du bulletin
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('BULLETIN DE PAIE', 14, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('BULLETIN FIN DU MOIS', 80, 42);
  
  // ============ CADRE INFORMATIONS EMPLOYÉ ============
  const infoY = 50;
  const boxWidth = 182;
  const boxHeight = 35;
  
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.rect(14, infoY, boxWidth, boxHeight);
  
  // Colonne gauche
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`MATRICULE..........${employe?.code || '______'}`, 18, infoY + 8);
  doc.text(`N°CNSS ...............${employe?.numero_cnss || '______'}`, 18, infoY + 14);
  doc.text(`NOM & PRENOM .${employe?.nom?.toUpperCase() || ''} ${employe?.prenom || ''}`, 18, infoY + 20);
  doc.text(`QUALIFICATION...${employe?.poste?.toUpperCase() || '______'}`, 18, infoY + 26);
  doc.text(`SERVICE ..............${employe?.departement?.toUpperCase() || 'ADM'}`, 18, infoY + 32);
  
  // Colonne droite
  const rightCol = 115;
  doc.text(`MOIS : ..................${formatPeriode(fiche.periode)}`, rightCol, infoY + 8);
  doc.text(`SIT.FAMILIALE :... Célibataire`, rightCol, infoY + 14);
  doc.text(`S.Base :       ${fiche.salaire_base.toLocaleString('fr-FR', { minimumFractionDigits: 3 })}`, rightCol, infoY + 20);
  doc.text(`GRADE & ECHELON M - 1 - 1`, rightCol, infoY + 26);
  
  // ============ TABLEAU DES RUBRIQUES ============
  const tableY = infoY + boxHeight + 5;
  const tableWidth = 182;
  const rowHeight = 7;
  
  // En-tête du tableau
  doc.setFillColor(255, 255, 255);
  doc.rect(14, tableY, tableWidth, rowHeight);
  doc.line(14, tableY, 196, tableY);
  doc.line(14, tableY + rowHeight, 196, tableY + rowHeight);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('CODE', 18, tableY + 5);
  doc.text('LIBELLE', 40, tableY + 5);
  doc.text('NBR', 118, tableY + 5);
  doc.text('GAINS', 142, tableY + 5);
  doc.text('RETENUES', 170, tableY + 5);
  
  // Lignes verticales en-tête
  doc.line(14, tableY, 14, tableY + rowHeight);
  doc.line(35, tableY, 35, tableY + rowHeight);
  doc.line(112, tableY, 112, tableY + rowHeight);
  doc.line(135, tableY, 135, tableY + rowHeight);
  doc.line(163, tableY, 163, tableY + rowHeight);
  doc.line(196, tableY, 196, tableY + rowHeight);
  
  // Données du tableau
  const lignes = [
    { code: '01', libelle: 'SALAIRE DE BASE MENSUEL', nbr: '22,00', gains: fiche.salaire_base, retenues: null },
    { code: '05', libelle: 'INDEMNITE DE PRESENCE', nbr: '', gains: fiche.indemnites > 0 ? fiche.indemnites * 0.4 : null, retenues: null },
    { code: '1B', libelle: 'PRIME DE DOUCHE', nbr: '', gains: fiche.primes > 0 ? fiche.primes * 0.3 : null, retenues: null },
    { code: '10', libelle: 'INDEMNITE DE TRANSPORT', nbr: '', gains: fiche.indemnites > 0 ? fiche.indemnites * 0.3 : null, retenues: null },
    { code: '22', libelle: 'PRIME DE PANIER', nbr: '', gains: fiche.primes > 0 ? fiche.primes * 0.1 : null, retenues: null },
    { code: '40', libelle: 'SALAIRE BRUT', nbr: '', gains: fiche.brut, retenues: null, isBold: true },
    { code: '41', libelle: 'C N S S', nbr: fiche.taux_cnss_salarie.toFixed(2), gains: null, retenues: fiche.cnss_salarie },
    { code: '50', libelle: 'SALAIRE IMPOSABLE', nbr: '', gains: fiche.base_imposable, retenues: null, isBold: true },
    { code: '51', libelle: 'I R P P', nbr: '', gains: null, retenues: fiche.irpp_mensuel },
    { code: '52', libelle: 'SALAIRE DU', nbr: '', gains: fiche.brut - fiche.cnss_salarie - fiche.irpp_mensuel, retenues: null, isBold: true },
    { code: '60', libelle: 'C.S.S', nbr: '', gains: null, retenues: fiche.autres_retenues > 0 ? fiche.autres_retenues : 0 },
    { code: '80', libelle: 'SALAIRE NET', nbr: '', gains: fiche.net_a_payer, retenues: null, isBold: true },
  ];
  
  let currentY = tableY + rowHeight;
  const tableContentHeight = lignes.length * rowHeight + 100; // Extra space for empty rows
  
  // Dessiner le cadre du contenu du tableau
  doc.rect(14, currentY, tableWidth, tableContentHeight);
  
  // Lignes verticales pour tout le tableau
  doc.line(35, currentY, 35, currentY + tableContentHeight);
  doc.line(112, currentY, 112, currentY + tableContentHeight);
  doc.line(135, currentY, 135, currentY + tableContentHeight);
  doc.line(163, currentY, 163, currentY + tableContentHeight);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  lignes.forEach((ligne) => {
    currentY += rowHeight;
    
    if (ligne.isBold) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    
    doc.text(ligne.code, 18, currentY);
    doc.text(ligne.libelle, 40, currentY);
    if (ligne.nbr) {
      doc.text(ligne.nbr, 118, currentY);
    }
    if (ligne.gains !== null && ligne.gains !== undefined) {
      doc.text(ligne.gains.toLocaleString('fr-FR', { minimumFractionDigits: 3 }), 158, currentY, { align: 'right' });
    }
    if (ligne.retenues !== null && ligne.retenues !== undefined) {
      doc.text(ligne.retenues.toLocaleString('fr-FR', { minimumFractionDigits: 3 }), 192, currentY, { align: 'right' });
    }
  });
  
  // ============ PIED DE PAGE ============
  const footerY = 250;
  
  // Cadre du pied de page
  doc.rect(14, footerY, tableWidth, 25);
  
  // Montant en lettres
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(numberToWords(fiche.net_a_payer), 18, footerY + 10);
  
  // Mode de paiement
  doc.line(102, footerY, 102, footerY + 25);
  doc.setFontSize(9);
  doc.text('MODE PAYEMENT', 110, footerY + 8);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Virement', 120, footerY + 14);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('0000000000000000000', 108, footerY + 21);
  
  // Net à payer
  doc.line(152, footerY, 152, footerY + 25);
  doc.setFontSize(9);
  doc.text('NET A PAYER', 160, footerY + 8);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(fiche.net_a_payer.toLocaleString('fr-FR', { minimumFractionDigits: 3 }), 180, footerY + 18, { align: 'center' });
  
  // Télécharger
  const filename = `bulletin-paie-${fiche.periode}-${employe?.nom || 'employe'}.pdf`;
  doc.save(filename);
  
  return filename;
}
