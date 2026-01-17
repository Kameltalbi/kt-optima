import jsPDF from 'jspdf';
import type { InvoiceDocumentData } from './InvoiceDocument';

interface Company {
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  tax_number: string | null;
  logo?: string | null;
  footer?: string | null;
}

// Formater un nombre avec espace comme séparateur de milliers et 3 décimales (format TND)
function formatAmount(num: number): string {
  const fixed = num.toFixed(3);
  const [intPart, decPart] = fixed.split('.');
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formattedInt},${decPart}`;
}

// Convertir un nombre en toutes lettres (français tunisien)
function numberToWords(num: number): string {
  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];

  const convertLessThanThousand = (n: number): string => {
    if (n === 0) return '';
    if (n < 20) return units[n];
    if (n < 100) {
      const t = Math.floor(n / 10);
      const u = n % 10;
    if (t === 7 || t === 9) {
      const offset = t === 7 ? 10 : 10;
      return tens[t] + (u === 1 ? '-et-' : '-') + units[offset + u];
    }
      if (u === 0) return tens[t] + (t === 8 ? 's' : '');
      if (u === 1 && t !== 8) return tens[t] + '-et-un';
      return tens[t] + '-' + units[u];
    }
    const h = Math.floor(n / 100);
    const rest = n % 100;
    let result = h === 1 ? 'cent' : units[h] + ' cent';
    if (rest === 0 && h > 1) result += 's';
    else if (rest > 0) result += ' ' + convertLessThanThousand(rest);
    return result;
  };

  if (num === 0) return 'zéro';

  const intPart = Math.floor(num);
  const decPart = Math.round((num - intPart) * 1000);

  let result = '';

  if (intPart >= 1000000) {
    const millions = Math.floor(intPart / 1000000);
    result += (millions === 1 ? 'un million' : convertLessThanThousand(millions) + ' millions');
    const rest = intPart % 1000000;
    if (rest > 0) result += ' ' + numberToWordsInt(rest);
  } else {
    result = numberToWordsInt(intPart);
  }

  result += ' dinars';

  if (decPart > 0) {
    result += ' et ' + convertLessThanThousand(decPart) + ' millimes';
  }

  return result.trim();
}

function numberToWordsInt(n: number): string {
  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];

  const convertLessThanThousand = (n: number): string => {
    if (n === 0) return '';
    if (n < 20) return units[n];
    if (n < 100) {
      const t = Math.floor(n / 10);
      const u = n % 10;
    if (t === 7 || t === 9) {
      const offset = t === 7 ? 10 : 10;
      return tens[t] + (u === 1 ? '-et-' : '-') + units[offset + u];
    }
      if (u === 0) return tens[t] + (t === 8 ? 's' : '');
      if (u === 1 && t !== 8) return tens[t] + '-et-un';
      return tens[t] + '-' + units[u];
    }
    const h = Math.floor(n / 100);
    const rest = n % 100;
    let result = h === 1 ? 'cent' : units[h] + ' cent';
    if (rest === 0 && h > 1) result += 's';
    else if (rest > 0) result += ' ' + convertLessThanThousand(rest);
    return result;
  };

  if (n === 0) return 'zéro';
  if (n < 1000) return convertLessThanThousand(n);

  const thousands = Math.floor(n / 1000);
  const rest = n % 1000;

  let result = thousands === 1 ? 'mille' : convertLessThanThousand(thousands) + ' mille';
  if (rest > 0) result += ' ' + convertLessThanThousand(rest);

  return result;
}

/**
 * Charger une image (URL) pour jsPDF sans la déformer
 */
async function loadImageForJsPDF(
  url: string
): Promise<{ dataUrl: string; format: 'PNG' | 'JPEG'; width: number; height: number } | null> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();

    const dataUrl = await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });

    if (!dataUrl) return null;

    const mimeMatch = dataUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);/);
    const mime = (mimeMatch?.[1] || '').toLowerCase();
    const format: 'PNG' | 'JPEG' = mime.includes('jpeg') || mime.includes('jpg') ? 'JPEG' : 'PNG';

    const img = new Image();
    img.crossOrigin = 'anonymous';

    const dims = await new Promise<{ w: number; h: number } | null>((resolve) => {
      img.onload = () => resolve({ w: img.naturalWidth || img.width, h: img.naturalHeight || img.height });
      img.onerror = () => resolve(null);
      img.src = dataUrl;
    });

    if (!dims?.w || !dims?.h) return null;

    return { dataUrl, format, width: dims.w, height: dims.h };
  } catch (error) {
    console.error('Error loading image:', error);
    return null;
  }
}

/**
 * Génère un PDF de document (facture, devis, avoir) - Design professionnel A4
 */
export async function generateDocumentPDF(
  data: InvoiceDocumentData,
  company: Company | null
): Promise<Blob> {
  const doc = new jsPDF('portrait', 'mm', 'a4');
  
  const pageWidth = 210;
  const pageHeight = 297;
  const marginLeft = 15;
  const marginRight = 15;
  const contentWidth = pageWidth - marginLeft - marginRight;
  const rightX = pageWidth - marginRight;
  
  let y = 20;
  
  // ============ HEADER - LOGO ET INFOS ENTREPRISE ============
  let logoLoaded = false;
  const logoMaxW = 30;
  const logoMaxH = 20;

  if (company?.logo) {
    try {
      const logo = await loadImageForJsPDF(company.logo);
      if (logo) {
        const ratio = logo.width / logo.height;
        let drawW = logoMaxW;
        let drawH = drawW / ratio;
        if (drawH > logoMaxH) {
          drawH = logoMaxH;
          drawW = drawH * ratio;
        }
        doc.addImage(logo.dataUrl, logo.format, marginLeft, y, drawW, drawH);
        logoLoaded = true;
      }
    } catch (error) {
      console.error('Error adding logo:', error);
    }
  }

  // Infos entreprise
  const companyInfoX = marginLeft;
  let companyY = logoLoaded ? y + logoMaxH + 5 : y;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(company?.name?.toUpperCase() || 'ENTREPRISE', companyInfoX, companyY);
  companyY += 5;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  
  if (company?.address) {
    const addressLines = doc.splitTextToSize(company.address, 80);
    doc.text(addressLines, companyInfoX, companyY);
    companyY += addressLines.length * 4;
  }
  if (company?.phone) {
    doc.text(`Tél: ${company.phone}`, companyInfoX, companyY);
    companyY += 4;
  }
  if (company?.email) {
    doc.text(company.email, companyInfoX, companyY);
    companyY += 4;
  }
  if (company?.tax_number) {
    doc.setFont('helvetica', 'bold');
    doc.text(`MF: ${company.tax_number}`, companyInfoX, companyY);
    companyY += 4;
  }

  // ============ TITRE DOCUMENT (à droite) ============
  let titleY = y;

  const getDocumentLabel = () => {
    switch (data.type) {
      case 'invoice': return 'FACTURE';
      case 'quote': return 'DEVIS';
      case 'credit_note': return 'AVOIR';
      default: return 'DOCUMENT';
    }
  };

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text(getDocumentLabel(), rightX, titleY, { align: 'right' });
  titleY += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`N°: ${data.number}`, rightX, titleY, { align: 'right' });
  titleY += 4;
  doc.text(`Date: ${new Date(data.date).toLocaleDateString('fr-FR')}`, rightX, titleY, { align: 'right' });
  titleY += 8;

  // Client
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Client:', rightX, titleY, { align: 'right' });
  titleY += 4;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(data.client.name, rightX, titleY, { align: 'right' });
  titleY += 4;
  
  if (data.client.address) {
    doc.setFontSize(9);
    const clientAddressLines = doc.splitTextToSize(data.client.address, 70);
    clientAddressLines.forEach((line: string) => {
      doc.text(line, rightX, titleY, { align: 'right' });
      titleY += 3.5;
    });
  }
  
  // Numéro fiscal du client
  if (data.client.tax_number) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text(`MF: ${data.client.tax_number}`, rightX, titleY, { align: 'right' });
    titleY += 4;
  }

  // Ligne de séparation
  y = Math.max(companyY, titleY) + 8;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(marginLeft, y, rightX, y);
  y += 8;

  // ============ TABLEAU DES LIGNES ============
  const tableStartY = y;
  const colWidths = { description: 90, quantity: 25, unitPrice: 35, total: 30 };
  const col1 = marginLeft;
  const col2 = col1 + colWidths.description;
  const col3 = col2 + colWidths.quantity;
  const col4 = col3 + colWidths.unitPrice;

  // En-tête du tableau
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.rect(col1, tableStartY, contentWidth, 8, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('Description', col1 + 3, tableStartY + 5.5);
  doc.text('Qté', col2 + colWidths.quantity / 2, tableStartY + 5.5, { align: 'center' });
  doc.text('Prix Unit.', col3 + colWidths.unitPrice - 3, tableStartY + 5.5, { align: 'right' });
  doc.text('Total HT', col4 + colWidths.total - 3, tableStartY + 5.5, { align: 'right' });

  doc.line(col2, tableStartY, col2, tableStartY + 8);
  doc.line(col3, tableStartY, col3, tableStartY + 8);
  doc.line(col4, tableStartY, col4, tableStartY + 8);

  // Contenu du tableau
  let currentY = tableStartY + 8;
  const rowHeight = 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  data.lines.forEach((line, index) => {
    const rowY = currentY + index * rowHeight;

    doc.setDrawColor(226, 232, 240);
    doc.rect(col1, rowY, contentWidth, rowHeight);
    doc.line(col2, rowY, col2, rowY + rowHeight);
    doc.line(col3, rowY, col3, rowY + rowHeight);
    doc.line(col4, rowY, col4, rowY + rowHeight);

    doc.setTextColor(30, 41, 59);

    let description = line.description;
    const maxDescWidth = colWidths.description - 6;
    while (doc.getTextWidth(description) > maxDescWidth && description.length > 3) {
      description = description.slice(0, -4) + '...';
    }
    doc.text(description, col1 + 3, rowY + 5);
    doc.text(line.quantity.toString(), col2 + colWidths.quantity / 2, rowY + 5, { align: 'center' });
    doc.text(formatAmount(line.unit_price), col3 + colWidths.unitPrice - 3, rowY + 5, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(formatAmount(line.total_ht), col4 + colWidths.total - 3, rowY + 5, { align: 'right' });
    doc.setFont('helvetica', 'normal');
  });

  y = currentY + data.lines.length * rowHeight + 12;

  // ============ SECTION TOTAUX (à droite) ============
  const totalsWidth = 85;
  const totalsX = rightX - totalsWidth;

  doc.setFontSize(9);

  // Total HT
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Total HT:', totalsX, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(formatAmount(data.total_ht), rightX, y, { align: 'right' });
  y += 5;

  // Remise
  if (data.discount && data.discount > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const discountLabel = data.discount_type === 'percentage' && data.discount_value
      ? `Remise (${data.discount_value}%):`
      : 'Remise:';
    doc.text(discountLabel, totalsX, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38); // red
    doc.text('-' + formatAmount(data.discount), rightX, y, { align: 'right' });
    y += 5;
  }

  // Taxes (TVA, etc.)
  if (data.applied_taxes.length > 0) {
    data.applied_taxes.forEach((tax) => {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const taxLabel = tax.type === 'percentage' 
        ? `${tax.name} (${tax.rate_or_value}%):`
        : `${tax.name}:`;
      doc.text(taxLabel, totalsX, y);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(formatAmount(tax.amount), rightX, y, { align: 'right' });
      y += 5;
    });
  }

  // Timbre fiscal
  if (data.fiscal_stamp && data.fiscal_stamp > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Timbre fiscal:', totalsX, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(formatAmount(data.fiscal_stamp), rightX, y, { align: 'right' });
    y += 5;
  }

  // Ligne de séparation
  y += 2;
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.8);
  doc.line(totalsX, y, rightX, y);
  y += 5;

  // Total TTC
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text('Total TTC:', totalsX, y);
  doc.text(formatAmount(data.total_ttc), rightX, y, { align: 'right' });
  y += 8;

  // Montant en toutes lettres
  const amountWords = data.amount_in_words || numberToWords(data.total_ttc);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(71, 85, 105);
  const wordsText = `Arrêté la présente ${getDocumentLabel().toLowerCase()} à la somme de: ${amountWords}`;
  const wordsLines = doc.splitTextToSize(wordsText, totalsWidth + 15);
  doc.text(wordsLines, totalsX - 15, y);
  y += wordsLines.length * 3.5 + 5;

  // ============ NOTES ============
  if (data.notes) {
    y += 5;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(marginLeft, y, rightX, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text('Notes:', marginLeft, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const notesLines = doc.splitTextToSize(data.notes, contentWidth);
    doc.text(notesLines, marginLeft, y);
  }

  // ============ FOOTER ============
  const footerY = pageHeight - 20;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(marginLeft, footerY, rightX, footerY);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);

  if (company?.footer) {
    const footerLines = doc.splitTextToSize(company.footer, contentWidth);
    doc.text(footerLines, pageWidth / 2, footerY + 5, { align: 'center' });
  } else {
    doc.text('Document généré automatiquement', pageWidth / 2, footerY + 5, { align: 'center' });
  }

  return doc.output('blob');
}
