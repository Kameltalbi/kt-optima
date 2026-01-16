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
  // Format: 2 300,000 (espace pour milliers, virgule pour décimales)
  const fixed = num.toFixed(3);
  const [intPart, decPart] = fixed.split('.');
  // Ajouter des espaces comme séparateurs de milliers
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formattedInt},${decPart}`;
}

/**
 * Charger une image (URL) pour jsPDF sans la déformer:
 * - conversion en dataURL
 * - détection du format (PNG/JPEG)
 * - récupération des dimensions pour conserver le ratio
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

    // Dimensions via Image() (permet de garder le ratio dans addImage)
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
 * Fonction générique pour générer un PDF de document (facture, devis, avoir)
 * Design professionnel A4
 */
export async function generateDocumentPDF(
  data: InvoiceDocumentData,
  company: Company | null
): Promise<Blob> {
  const doc = new jsPDF('portrait', 'mm', 'a4');
  
  // Dimensions A4
  const pageWidth = 210;
  const pageHeight = 297;
  const marginLeft = 15;
  const marginRight = 15;
  const contentWidth = pageWidth - marginLeft - marginRight;
  
  let y = 20;
  
  // ============ HEADER - LOGO ET INFOS ENTREPRISE ============
  let logoLoaded = false;
  const logoMaxW = 30;
  const logoMaxH = 20;
  let logoReservedHeight = 0;

  if (company?.logo) {
    try {
      const logo = await loadImageForJsPDF(company.logo);
      if (logo) {
        const ratio = logo.width / logo.height;

        // Fit dans (logoMaxW x logoMaxH) sans déformation
        let drawW = logoMaxW;
        let drawH = drawW / ratio;
        if (drawH > logoMaxH) {
          drawH = logoMaxH;
          drawW = drawH * ratio;
        }

        const x = marginLeft + (logoMaxW - drawW) / 2;
        const yLogo = y + (logoMaxH - drawH) / 2;

        doc.addImage(logo.dataUrl, logo.format, x, yLogo, drawW, drawH);
        logoLoaded = true;
        logoReservedHeight = logoMaxH;
      }
    } catch (error) {
      console.error('Error adding logo:', error);
    }
  }

  // Infos entreprise à gauche (sous le logo ou à la place)
  const companyInfoX = marginLeft;
  let companyY = logoLoaded ? y + logoReservedHeight + 5 : y;
  
  // Nom de l'entreprise
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text(company?.name?.toUpperCase() || 'ENTREPRISE', companyInfoX, companyY);
  companyY += 6;
  
  // Adresse
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105); // slate-600
  if (company?.address) {
    const addressLines = doc.splitTextToSize(company.address, 80);
    doc.text(addressLines, companyInfoX, companyY);
    companyY += addressLines.length * 4;
  }
  
  // Contact
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
  const rightX = pageWidth - marginRight;
  let titleY = y;
  
  // Type de document
  const getDocumentLabel = () => {
    switch (data.type) {
      case 'invoice': return 'FACTURE';
      case 'quote': return 'DEVIS';
      case 'credit_note': return 'AVOIR';
      default: return 'DOCUMENT';
    }
  };
  
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235); // primary blue
  doc.text(getDocumentLabel(), rightX, titleY, { align: 'right' });
  titleY += 8;
  
  // Numéro et date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`N°: ${data.number}`, rightX, titleY, { align: 'right' });
  titleY += 5;
  doc.text(`Date: ${new Date(data.date).toLocaleDateString('fr-FR')}`, rightX, titleY, { align: 'right' });
  titleY += 10;
  
  // Client
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Client:', rightX, titleY, { align: 'right' });
  titleY += 5;
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(data.client.name, rightX, titleY, { align: 'right' });
  if (data.client.address) {
    titleY += 4;
    doc.setFontSize(9);
    doc.text(data.client.address, rightX, titleY, { align: 'right' });
  }
  
  // Ligne de séparation
  y = Math.max(companyY, titleY) + 10;
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.line(marginLeft, y, rightX, y);
  y += 10;
  
  // ============ TABLEAU DES LIGNES ============
  const tableStartY = y;
  const colWidths = {
    description: 90,
    quantity: 25,
    unitPrice: 35,
    total: 30
  };
  
  const col1 = marginLeft;
  const col2 = col1 + colWidths.description;
  const col3 = col2 + colWidths.quantity;
  const col4 = col3 + colWidths.unitPrice;
  const tableEndX = col4 + colWidths.total;
  
  // En-tête du tableau
  doc.setFillColor(241, 245, 249); // slate-100
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.rect(col1, tableStartY, contentWidth, 10, 'FD');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  
  doc.text('Description', col1 + 3, tableStartY + 7);
  doc.text('Qté', col2 + colWidths.quantity / 2, tableStartY + 7, { align: 'center' });
  doc.text('Prix Unit.', col3 + colWidths.unitPrice - 3, tableStartY + 7, { align: 'right' });
  doc.text('Total HT', col4 + colWidths.total - 3, tableStartY + 7, { align: 'right' });
  
  // Lignes verticales pour l'en-tête
  doc.line(col2, tableStartY, col2, tableStartY + 10);
  doc.line(col3, tableStartY, col3, tableStartY + 10);
  doc.line(col4, tableStartY, col4, tableStartY + 10);
  
  // Contenu du tableau
  let currentY = tableStartY + 10;
  const rowHeight = 8;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  data.lines.forEach((line, index) => {
    const rowY = currentY + index * rowHeight;
    
    // Bordure de la ligne
    doc.setDrawColor(226, 232, 240);
    doc.rect(col1, rowY, contentWidth, rowHeight);
    
    // Lignes verticales
    doc.line(col2, rowY, col2, rowY + rowHeight);
    doc.line(col3, rowY, col3, rowY + rowHeight);
    doc.line(col4, rowY, col4, rowY + rowHeight);
    
    // Contenu
    doc.setTextColor(30, 41, 59);
    
    // Description (tronquer si trop long)
    const maxDescWidth = colWidths.description - 6;
    let description = line.description;
    while (doc.getTextWidth(description) > maxDescWidth && description.length > 3) {
      description = description.slice(0, -4) + '...';
    }
    doc.text(description, col1 + 3, rowY + 5.5);
    
    // Quantité
    doc.text(line.quantity.toString(), col2 + colWidths.quantity / 2, rowY + 5.5, { align: 'center' });
    
    // Prix unitaire
    doc.text(formatAmount(line.unit_price), col3 + colWidths.unitPrice - 3, rowY + 5.5, { align: 'right' });
    
    // Total HT
    doc.setFont('helvetica', 'bold');
    doc.text(formatAmount(line.total_ht), col4 + colWidths.total - 3, rowY + 5.5, { align: 'right' });
    doc.setFont('helvetica', 'normal');
  });
  
  y = currentY + data.lines.length * rowHeight + 15;
  
  // ============ SECTION TOTAUX (à droite) ============
  const totalsWidth = 80;
  const totalsX = rightX - totalsWidth;
  
  // Total HT
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Total HT:', totalsX, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(formatAmount(data.total_ht), rightX, y, { align: 'right' });
  y += 6;
  
  // Taxes
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
      y += 6;
    });
  }
  
  // Ligne de séparation
  y += 2;
  doc.setDrawColor(148, 163, 184); // slate-400
  doc.setLineWidth(0.8);
  doc.line(totalsX, y, rightX, y);
  y += 6;
  
  // Total TTC
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235); // primary blue
  doc.text('Total TTC:', totalsX, y);
  doc.text(formatAmount(data.total_ttc), rightX, y, { align: 'right' });
  
  y += 15;
  
  // ============ NOTES ============
  if (data.notes) {
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(marginLeft, y, rightX, y);
    y += 8;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text('Notes:', marginLeft, y);
    y += 5;
    
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
  doc.setTextColor(100, 116, 139); // slate-500
  
  if (company?.footer) {
    const footerLines = doc.splitTextToSize(company.footer, contentWidth);
    doc.text(footerLines, pageWidth / 2, footerY + 5, { align: 'center' });
  } else {
    doc.text('Document généré automatiquement', pageWidth / 2, footerY + 5, { align: 'center' });
  }
  
  return doc.output('blob');
}
