import jsPDF from 'jspdf';

interface Employee {
  id: string;
  nom: string;
  prenom: string;
  code: string | null;
  poste: string | null;
  departement: string | null;
  numero_cnss: string | null;
}

interface Company {
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  tax_number: string | null;
}

interface PayslipData {
  employee: Employee;
  month: number;
  year: number;
  grossSalary: number;
  bonuses: number;
  overtime: number;
  familySituation: string;
  numberOfChildren: number;
  cnss: number;
  irpp: number;
  css: number;
  netSalary: number;
  company: Company | null;
}

// Convertir un nombre en lettres (français)
function numberToWords(num: number): string {
  const units = ['', 'UN', 'DEUX', 'TROIS', 'QUATRE', 'CINQ', 'SIX', 'SEPT', 'HUIT', 'NEUF'];
  const teens = ['DIX', 'ONZE', 'DOUZE', 'TREIZE', 'QUATORZE', 'QUINZE', 'SEIZE', 'DIX-SEPT', 'DIX-HUIT', 'DIX-NEUF'];
  const tens = ['', 'DIX', 'VINGT', 'TRENTE', 'QUARANTE', 'CINQUANTE', 'SOIXANTE', 'SOIXANTE-DIX', 'QUATRE-VINGT', 'QUATRE-VINGT-DIX'];

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
          result = 'MILLE ' + result;
        } else {
          result = word + ' MILLE ' + result;
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
function formatPeriode(month: number, year: number): string {
  const mois = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  return `${mois[month - 1]} ${year}`;
}

// Formater un nombre avec espace comme séparateur de milliers et 3 décimales
// Exemple: 1025.093 -> "1 025,093"
function formatNumber(num: number): string {
  const parts = num.toFixed(3).split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];
  
  // Ajouter espace tous les 3 chiffres depuis la droite
  let formatted = '';
  let count = 0;
  for (let i = integerPart.length - 1; i >= 0; i--) {
    if (count > 0 && count % 3 === 0) {
      formatted = ' ' + formatted;
    }
    formatted = integerPart[i] + formatted;
    count++;
  }
  
  return `${formatted},${decimalPart}`;
}

export function generatePayslipPDFSimple(data: PayslipData): Blob {
  // Format A5: 148mm x 210mm (portrait)
  const doc = new jsPDF('portrait', 'mm', 'a5');
  const { employee, month, year, grossSalary, bonuses, overtime, familySituation, numberOfChildren, cnss, irpp, css, netSalary, company } = data;
  
  // Dimensions A5
  const pageWidth = 148;
  const pageHeight = 210;
  const margin = 10;
  const startX = margin;
  const endX = pageWidth - margin;
  const contentWidth = pageWidth - 2 * margin;
  
  let y = margin;
  
  // ============ CONTAINER BORDER ============
  doc.setLineWidth(2);
  doc.setDrawColor(0);
  doc.rect(startX, y, contentWidth, pageHeight - 2 * margin);
  
  // Padding interne
  const padding = 8;
  let currentY = y + padding;
  
  // ============ HEADER SECTION ============
  doc.setLineWidth(2);
  doc.line(startX + padding, currentY, endX - padding, currentY);
  
  // Nom entreprise
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text((company?.name || 'ENTREPRISE').toUpperCase(), startX + padding, currentY + 5);
  
  // Adresse
  if (company?.address) {
    currentY += 5;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(company.address, startX + padding, currentY);
  }
  
  // CNSS Employeur
  currentY += 4;
  doc.setFontSize(11);
  doc.text(`CNSS Employeur : `, startX + padding, currentY);
  doc.setFont('helvetica', 'bold');
  doc.text(company?.tax_number || '________', startX + padding + 35, currentY);
  
  currentY += 8;
  
  // Titre
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('BULLETIN DE PAIE – BULLETIN FIN DU MOIS', startX + padding + contentWidth / 2 - padding, currentY, { align: 'center' });
  
  currentY += 6;
  
  // ============ EMPLOYEE INFO SECTION ============
  doc.setLineWidth(1);
  const infoBoxY = currentY;
  const infoBoxHeight = 28;
  doc.rect(startX + padding, infoBoxY, contentWidth - 2 * padding, infoBoxHeight);
  
  // Ligne verticale séparatrice
  const infoDivX = startX + padding + (contentWidth - 2 * padding) / 2;
  doc.line(infoDivX, infoBoxY, infoDivX, infoBoxY + infoBoxHeight);
  
  // Colonne gauche
  let infoY = infoBoxY + 4;
  const leftCol = startX + padding + 2;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Matricule : ${employee.code || '______'}`, leftCol, infoY);
  infoY += 4;
  doc.text(`N° CNSS : ${employee.numero_cnss || '______'}`, leftCol, infoY);
  infoY += 4;
  doc.text(`Nom & Prénom : ${employee.nom.toUpperCase()} ${employee.prenom.toUpperCase()}`, leftCol, infoY);
  infoY += 4;
  doc.text(`Qualification : ${employee.poste?.toUpperCase() || '______'}`, leftCol, infoY);
  infoY += 4;
  doc.text(`Service : ${employee.departement?.toUpperCase() || 'ADM'}`, leftCol, infoY);
  
  // Colonne droite
  infoY = infoBoxY + 4;
  const rightCol = infoDivX + 2;
  
  doc.text(`Mois : ${formatPeriode(month, year)}`, rightCol, infoY);
  infoY += 4;
  const sitFam = familySituation === 'married' ? `Marié(e) - ${numberOfChildren}` : 'Célibataire';
  doc.text(`Sit. Familiale : ${sitFam}`, rightCol, infoY);
  infoY += 4;
  const baseText = formatNumber(grossSalary);
  doc.text(`Salaire de base : ${baseText}`, rightCol, infoY);
  infoY += 4;
  doc.text(`Grade & Échelon : M - 1 - 1`, rightCol, infoY);
  
  currentY = infoBoxY + infoBoxHeight + 5;
  
  // ============ SALARY TABLE SECTION ============
  const tableY = currentY;
  const rowHeight = 5.5;
  
  // Calculer les montants pour les rubriques
  const salaireBase = grossSalary - bonuses - overtime;
  const indemnitePresence = bonuses > 0 ? bonuses * 0.4 : 0;
  const primeDouche = bonuses > 0 ? bonuses * 0.3 : 0;
  const indemniteTransport = bonuses > 0 ? bonuses * 0.3 : 0;
  const primePanier = bonuses > 0 ? bonuses * 0.1 : 0;
  const salaireBrut = grossSalary;
  const salaireImposable = grossSalary - cnss;
  const salaireDu = grossSalary - cnss - irpp;
  
  // Données du tableau
  const lignes = [
    { code: '01', libelle: 'SALAIRE DE BASE MENSUEL', nbr: '22,00', gains: salaireBase, retenues: null },
    ...(indemnitePresence > 0 ? [{ code: '05', libelle: 'INDEMNITÉ DE PRÉSENCE', nbr: '', gains: indemnitePresence, retenues: null }] : []),
    ...(primeDouche > 0 ? [{ code: '1B', libelle: 'PRIME DE DOUCHE', nbr: '', gains: primeDouche, retenues: null }] : []),
    ...(indemniteTransport > 0 ? [{ code: '10', libelle: 'INDEMNITÉ DE TRANSPORT', nbr: '', gains: indemniteTransport, retenues: null }] : []),
    ...(primePanier > 0 ? [{ code: '22', libelle: 'PRIME DE PANIER', nbr: '', gains: primePanier, retenues: null }] : []),
    ...(overtime > 0 ? [{ code: '10', libelle: 'HEURES SUPPLEMENTAIRES', nbr: '', gains: overtime, retenues: null }] : []),
    { code: '40', libelle: 'SALAIRE BRUT', nbr: '', gains: salaireBrut, retenues: null, isBold: true },
    { code: '41', libelle: 'CNSS', nbr: grossSalary > 0 ? ((cnss / grossSalary) * 100).toFixed(2) : '', gains: null, retenues: cnss },
    { code: '50', libelle: 'SALAIRE IMPOSABLE', nbr: '', gains: salaireImposable, retenues: null, isBold: true },
    { code: '51', libelle: 'IRPP', nbr: '', gains: null, retenues: irpp },
    { code: '52', libelle: 'CSS', nbr: '', gains: null, retenues: css > 0 ? css : null },
    { code: '80', libelle: 'SALAIRE NET', nbr: '', gains: netSalary, retenues: null, isBold: true },
  ];
  
  // Colonnes du tableau
  const colCode = startX + padding + 1;
  const colLibelle = startX + padding + 12;
  const colNbr = startX + padding + 70;
  const colGains = startX + padding + 85;
  const colRetenues = startX + padding + 115;
  const tableEndX = endX - padding;
  
  // En-tête du tableau
  doc.setLineWidth(1);
  doc.rect(startX + padding, tableY, contentWidth - 2 * padding, rowHeight);
  
  // Lignes verticales en-tête
  doc.line(colLibelle - 1, tableY, colLibelle - 1, tableY + rowHeight);
  doc.line(colNbr - 1, tableY, colNbr - 1, tableY + rowHeight);
  doc.line(colGains - 1, tableY, colGains - 1, tableY + rowHeight);
  doc.line(colRetenues - 1, tableY, colRetenues - 1, tableY + rowHeight);
  
  // En-têtes
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('CODE', colCode, tableY + 3.5);
  doc.text('LIBELLÉ', colLibelle, tableY + 3.5);
  doc.text('NBR', colNbr, tableY + 3.5);
  doc.text('GAINS', colGains, tableY + 3.5);
  doc.text('RETENUES', colRetenues, tableY + 3.5);
  
  // Contenu du tableau
  let currentTableY = tableY + rowHeight;
  const tableContentHeight = lignes.length * rowHeight;
  
  doc.rect(startX + padding, currentTableY, contentWidth - 2 * padding, tableContentHeight);
  
  // Lignes verticales
  doc.line(colLibelle - 1, currentTableY, colLibelle - 1, currentTableY + tableContentHeight);
  doc.line(colNbr - 1, currentTableY, colNbr - 1, currentTableY + tableContentHeight);
  doc.line(colGains - 1, currentTableY, colGains - 1, currentTableY + tableContentHeight);
  doc.line(colRetenues - 1, currentTableY, colRetenues - 1, currentTableY + tableContentHeight);
  
  // Lignes horizontales
  doc.setLineWidth(0.5);
  lignes.forEach((_, index) => {
    if (index > 0) {
      doc.line(startX + padding, currentTableY + index * rowHeight, tableEndX, currentTableY + index * rowHeight);
    }
  });
  
  // Remplir les données
  doc.setFontSize(11);
  lignes.forEach((ligne, index) => {
    const lineY = currentTableY + (index + 1) * rowHeight - 2;
    
    if (ligne.isBold) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    
    doc.text(ligne.code, colCode, lineY);
    doc.text(ligne.libelle, colLibelle, lineY);
    
    if (ligne.nbr) {
      doc.text(ligne.nbr, colNbr, lineY, { align: 'right' });
    }
    
    if (ligne.gains !== null && ligne.gains !== undefined) {
      const gainsText = formatNumber(ligne.gains);
      doc.text(gainsText, colRetenues - 1, lineY, { align: 'right' });
    }
    
    if (ligne.retenues !== null && ligne.retenues !== undefined) {
      const retenuesText = formatNumber(ligne.retenues);
      doc.text(retenuesText, tableEndX - 1, lineY, { align: 'right' });
    }
  });
  
  currentY = currentTableY + tableContentHeight + 5;
  
  // ============ FOOTER SECTION ============
  const footerY = currentY;
  const footerHeight = 20;
  
  doc.setLineWidth(1);
  doc.rect(startX + padding, footerY, contentWidth - 2 * padding, footerHeight);
  
  // Divisions (2fr 1fr 1fr)
  const footerDiv1 = startX + padding + (contentWidth - 2 * padding) * 0.5; // 50%
  const footerDiv2 = startX + padding + (contentWidth - 2 * padding) * 0.75; // 75%
  
  doc.line(footerDiv1, footerY, footerDiv1, footerY + footerHeight);
  doc.line(footerDiv2, footerY, footerDiv2, footerY + footerHeight);
  
  // Montant en lettres (gauche - 50%)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const wordsText = numberToWords(netSalary);
  doc.text(wordsText, startX + padding + 2, footerY + 8, { maxWidth: footerDiv1 - startX - padding - 4 });
  
  // Mode de paiement (centre - 25%)
  doc.setFontSize(11);
  doc.text('MODE DE PAIEMENT', footerDiv1 + 2, footerY + 4, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text('Virement', footerDiv1 + 2, footerY + 8, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('000000000000000000', footerDiv1 + 2, footerY + 12, { align: 'center' });
  
  // Net à payer (droite - 25%)
  doc.setFontSize(11);
  doc.text('NET À PAYER', footerDiv2 + 2, footerY + 4, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  const netText = formatNumber(netSalary);
  doc.text(netText, tableEndX - 1, footerY + 12, { align: 'right' });
  
  // Générer le blob
  const pdfBlob = doc.output('blob');
  return pdfBlob;
}
