// Réexporter la fonction générique pour compatibilité
export { generateDocumentPDF as generateInvoicePDF } from './DocumentPDF';

interface Company {
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  tax_number: string | null;
  logo?: string | null;
}

// Formater un nombre avec espace comme séparateur de milliers et 2 décimales
function formatAmount(num: number): string {
  const parts = num.toFixed(2).split('.');
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

export function generateInvoicePDF(
  data: InvoiceDocumentData,
  company: Company | null
): Blob {
  // Format A4: 210mm x 297mm (portrait)
  const doc = new jsPDF('portrait', 'mm', 'a4');
  
  // Dimensions A4
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const startX = margin;
  const endX = pageWidth - margin;
  const contentWidth = pageWidth - 2 * margin;
  
  let y = margin;
  
  // ============ HEADER SECTION ============
  // Logo (si disponible)
  if (company?.logo) {
    // Note: jsPDF ne peut pas charger directement les images depuis URL
    // Il faudrait convertir l'image en base64 ou utiliser une autre méthode
    // Pour l'instant, on saute le logo
  }
  
  // Nom de l'entreprise
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text((company?.name || 'ENTREPRISE').toUpperCase(), startX, y);
  
  y += 7;
  
  // Adresse
  if (company?.address) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(company.address, startX, y);
    y += 5;
  }
  
  // Contact
  doc.setFontSize(9);
  if (company?.phone) {
    doc.text(`Tél: ${company.phone}`, startX, y);
    y += 4;
  }
  if (company?.email) {
    doc.text(company.email, startX, y);
    y += 4;
  }
  if (company?.tax_number) {
    doc.setFont('helvetica', 'bold');
    doc.text(`IF: ${company.tax_number}`, startX, y);
    y += 6;
  }
  
  // Ligne de séparation
  doc.setLineWidth(0.5);
  doc.line(startX, y, endX, y);
  y += 8;
  
  // ============ DOCUMENT TITLE AND INFO ============
  // Titre du document (droite)
  const getDocumentLabel = () => {
    switch (data.type) {
      case 'invoice':
        return 'FACTURE';
      case 'quote':
        return 'DEVIS';
      case 'credit_note':
        return 'AVOIR';
      default:
        return 'DOCUMENT';
    }
  };
  
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(getDocumentLabel(), endX, y, { align: 'right' });
  
  y += 6;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`N°: ${data.number}`, endX, y, { align: 'right' });
  
  y += 5;
  doc.text(`Date: ${new Date(data.date).toLocaleDateString('fr-FR')}`, endX, y, { align: 'right' });
  
  y += 10;
  
  // ============ CLIENT INFO ============
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Client', startX, y);
  
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.text(data.client.name, startX, y);
  
  if (data.client.address) {
    y += 4;
    doc.setFontSize(9);
    doc.text(data.client.address, startX, y);
  }
  
  y += 12;
  
  // ============ ITEMS TABLE ============
  const tableY = y;
  const rowHeight = 8;
  const headerHeight = 8;
  
  // En-tête du tableau
  doc.setLineWidth(0.5);
  doc.setFillColor(240, 240, 240);
  doc.rect(startX, tableY, contentWidth, headerHeight, 'F');
  doc.rect(startX, tableY, contentWidth, headerHeight);
  
  // Colonnes
  const colDescription = startX + 2;
  const colQuantity = startX + 120;
  const colUnitPrice = startX + 145;
  const colTotal = startX + 175;
  
  // Lignes verticales en-tête
  doc.line(colQuantity - 2, tableY, colQuantity - 2, tableY + headerHeight);
  doc.line(colUnitPrice - 2, tableY, colUnitPrice - 2, tableY + headerHeight);
  doc.line(colTotal - 2, tableY, colTotal - 2, tableY + headerHeight);
  
  // En-têtes
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Description', colDescription, tableY + 5.5);
  doc.text('Quantité', colQuantity, tableY + 5.5, { align: 'center' });
  doc.text('Prix unitaire', colUnitPrice, tableY + 5.5, { align: 'right' });
  doc.text('Total HT', colTotal, tableY + 5.5, { align: 'right' });
  
  // Contenu du tableau
  let currentY = tableY + headerHeight;
  const tableContentHeight = data.lines.length * rowHeight;
  
  doc.rect(startX, currentY, contentWidth, tableContentHeight);
  
  // Lignes verticales
  doc.line(colQuantity - 2, currentY, colQuantity - 2, currentY + tableContentHeight);
  doc.line(colUnitPrice - 2, currentY, colUnitPrice - 2, currentY + tableContentHeight);
  doc.line(colTotal - 2, currentY, colTotal - 2, currentY + tableContentHeight);
  
  // Lignes horizontales
  doc.setLineWidth(0.3);
  data.lines.forEach((_, index) => {
    if (index > 0) {
      doc.line(startX, currentY + index * rowHeight, endX, currentY + index * rowHeight);
    }
  });
  
  // Remplir les données
  doc.setFontSize(9);
  data.lines.forEach((line, index) => {
    const lineY = currentY + (index + 1) * rowHeight - 3;
    
    doc.setFont('helvetica', 'normal');
    // Description (peut être tronquée si trop longue)
    const description = line.description.length > 50 
      ? line.description.substring(0, 47) + '...' 
      : line.description;
    doc.text(description, colDescription, lineY);
    
    // Quantité
    doc.text(line.quantity.toString(), colQuantity, lineY, { align: 'center' });
    
    // Prix unitaire
    doc.text(formatAmount(line.unit_price), colUnitPrice, lineY, { align: 'right' });
    
    // Total HT
    doc.text(formatAmount(line.total_ht), colTotal, lineY, { align: 'right' });
  });
  
  y = currentY + tableContentHeight + 10;
  
  // ============ TOTALS SECTION ============
  const totalsX = startX + 100;
  const totalsWidth = contentWidth - 100;
  
  // Total HT
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Total HT:', totalsX, y);
  doc.text(formatAmount(data.total_ht), endX - 2, y, { align: 'right' });
  
  y += 6;
  
  // Taxes
  if (data.applied_taxes.length > 0) {
    data.applied_taxes.forEach((tax) => {
      const taxLabel = tax.type === 'percentage' 
        ? `${tax.name} (${tax.rate_or_value}%)`
        : tax.name;
      doc.text(`${taxLabel}:`, totalsX, y);
      doc.text(formatAmount(tax.amount), endX - 2, y, { align: 'right' });
      y += 6;
    });
    
    // Ligne de séparation
    doc.setLineWidth(0.5);
    doc.line(totalsX, y - 2, endX, y - 2);
    y += 4;
  }
  
  // Total TTC
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setLineWidth(0.8);
  doc.line(totalsX, y - 2, endX, y - 2);
  doc.text('Total TTC:', totalsX, y);
  doc.text(formatAmount(data.total_ttc), endX - 2, y, { align: 'right' });
  
  y += 10;
  
  // ============ NOTES ============
  if (data.notes) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setLineWidth(0.3);
    doc.line(startX, y, endX, y);
    y += 5;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', startX, y);
    y += 5;
    
    doc.setFont('helvetica', 'normal');
    // Diviser les notes en plusieurs lignes si nécessaire
    const notesLines = doc.splitTextToSize(data.notes, contentWidth);
    doc.text(notesLines, startX, y);
  }
  
  // ============ FOOTER ============
  const footerY = pageHeight - margin - 10;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setLineWidth(0.3);
  doc.line(startX, footerY, endX, footerY);
  
  if (company?.footer) {
    doc.text(company.footer, startX, footerY + 5);
  } else {
    doc.text('Document généré automatiquement', startX + contentWidth / 2, footerY + 5, { align: 'center' });
  }
  
  // Générer le blob
  const pdfBlob = doc.output('blob');
  return pdfBlob;
}
