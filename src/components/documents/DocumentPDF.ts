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

// Formater un nombre avec espace comme séparateur de milliers et 2 décimales
// Correspond au format français: "2 300,00"
function formatAmount(num: number): string {
  // Utiliser toLocaleString pour le format français
  return num.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Fonction générique pour générer un PDF de document (facture, devis, avoir, bon de livraison)
 * Correspond exactement au design HTML de CompanyDocumentLayout + InvoiceDocument
 */
export function generateDocumentPDF(
  data: InvoiceDocumentData,
  company: Company | null
): Blob {
  // Format A4: 210mm x 297mm (portrait)
  const doc = new jsPDF('portrait', 'mm', 'a4');
  
  // Dimensions A4
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15; // 15mm comme dans CompanyDocumentLayout (padding: 15mm 10mm)
  const startX = 10; // 10mm de marge gauche
  const endX = pageWidth - 10; // 10mm de marge droite
  const contentWidth = pageWidth - 20; // 10mm de chaque côté
  
  let y = 15; // Commencer à 15mm du haut
  
  // ============ HEADER SECTION (DocumentHeader) ============
  // Logo ou icône (si disponible)
  if (company?.logo) {
    // Note: jsPDF ne peut pas charger directement les images depuis URL
    // Il faudrait convertir l'image en base64 ou utiliser une autre méthode
    // Pour l'instant, on saute le logo
  } else {
    // Icône Building2 (cercle avec icône)
    doc.setFillColor(59, 130, 246, 0.1); // bg-primary/10
    doc.circle(startX + 6, y + 6, 6, 'F');
    // On ne peut pas dessiner l'icône SVG, donc on saute
  }
  
  y += 8; // Espace pour le logo/icône
  
  // Nom de l'entreprise (text-xl font-bold)
  doc.setFontSize(20); // text-xl = 20px ≈ 7.5mm
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39); // text-gray-900
  doc.text((company?.name || 'ENTREPRISE').toUpperCase(), startX, y);
  
  y += 6;
  
  // Adresse (text-sm text-gray-600)
  if (company?.address) {
    doc.setFontSize(11); // text-sm = 14px ≈ 5mm
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99); // text-gray-600
    doc.text(company.address, startX, y);
    y += 5;
  }
  
  // Contact (text-sm text-gray-600)
  doc.setFontSize(11);
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
    doc.setTextColor(55, 65, 81); // text-gray-700
    doc.text(`IF: ${company.tax_number}`, startX, y);
    y += 6;
  }
  
  // Ligne de séparation (border-b-2 border-gray-200)
  doc.setLineWidth(0.5);
  doc.setDrawColor(229, 231, 235); // border-gray-200
  doc.line(startX, y, endX, y);
  y += 8; // mb-8 pb-6
  
  // ============ DOCUMENT TITLE AND INFO (InvoiceDocument header) ============
  // Titre du document (droite) - text-2xl font-bold
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
  
  doc.setFontSize(24); // text-2xl = 24px
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39); // text-gray-900
  doc.text(getDocumentLabel(), endX, y, { align: 'right' });
  
  y += 6;
  
  // Numéro et date (text-sm text-gray-600)
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text(`N°: ${data.number}`, endX, y, { align: 'right' });
  
  y += 4;
  doc.text(`Date: ${new Date(data.date).toLocaleDateString('fr-FR')}`, endX, y, { align: 'right' });
  
  y += 8; // mb-6
  
  // ============ CLIENT INFO (InvoiceDocument client section) ============
  // Client label (font-semibold text-gray-900)
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text('Client', endX, y, { align: 'right' });
  
  y += 4; // mb-1
  
  // Nom client (text-sm text-gray-700)
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(55, 65, 81);
  doc.text(data.client.name, endX, y, { align: 'right' });
  
  if (data.client.address) {
    y += 4; // mt-1
    doc.setFontSize(9); // text-xs
    doc.setTextColor(75, 85, 99); // text-gray-600
    doc.text(data.client.address, endX, y, { align: 'right' });
  }
  
  y += 12; // space-y-6
  
  // ============ ITEMS TABLE (InvoiceDocument table) ============
  const tableY = y;
  const rowHeight = 10; // py-3 ≈ 10mm
  const headerHeight = 10;
  
  // Tableau avec bordures arrondies (border border-gray-300 rounded-lg)
  // En-tête du tableau (bg-gray-100)
  doc.setFillColor(243, 244, 246); // bg-gray-100
  doc.setDrawColor(209, 213, 219); // border-gray-300
  doc.setLineWidth(0.5);
  doc.roundedRect(startX, tableY, contentWidth, headerHeight, 2, 2, 'FD');
  
  // Colonnes
  const colDescription = startX + 4; // px-4
  const colQuantity = startX + 120;
  const colUnitPrice = startX + 145;
  const colTotal = startX + 175;
  
  // Lignes verticales en-tête
  doc.line(colQuantity - 2, tableY, colQuantity - 2, tableY + headerHeight);
  doc.line(colUnitPrice - 2, tableY, colUnitPrice - 2, tableY + headerHeight);
  doc.line(colTotal - 2, tableY, colTotal - 2, tableY + headerHeight);
  
  // En-têtes (text-sm font-semibold text-gray-700)
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(55, 65, 81);
  doc.text('Description', colDescription, tableY + 6);
  doc.text('Quantité', colQuantity, tableY + 6, { align: 'center' });
  doc.text('Prix unitaire', colUnitPrice, tableY + 6, { align: 'right' });
  doc.text('Total HT', colTotal, tableY + 6, { align: 'right' });
  
  // Contenu du tableau
  let currentY = tableY + headerHeight;
  const tableContentHeight = data.lines.length * rowHeight;
  
  // Bordures du tableau
  doc.setLineWidth(0.5);
  data.lines.forEach((_, index) => {
    const rowY = currentY + index * rowHeight;
    // Ligne horizontale
    doc.line(startX, rowY, endX, rowY);
    // Lignes verticales
    doc.line(colQuantity - 2, rowY, colQuantity - 2, rowY + rowHeight);
    doc.line(colUnitPrice - 2, rowY, colUnitPrice - 2, rowY + rowHeight);
    doc.line(colTotal - 2, rowY, colTotal - 2, rowY + rowHeight);
  });
  
  // Dernière ligne horizontale
  doc.line(startX, currentY + tableContentHeight, endX, currentY + tableContentHeight);
  
  // Remplir les données (text-sm text-gray-900)
  doc.setFontSize(11);
  data.lines.forEach((line, index) => {
    const lineY = currentY + (index + 1) * rowHeight - 3;
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(17, 24, 39); // text-gray-900
    
    // Description
    const description = line.description.length > 50 
      ? line.description.substring(0, 47) + '...' 
      : line.description;
    doc.text(description, colDescription, lineY);
    
    // Quantité (text-center)
    doc.setTextColor(55, 65, 81); // text-gray-700
    doc.text(line.quantity.toString(), colQuantity, lineY, { align: 'center' });
    
    // Prix unitaire (text-right)
    doc.text(formatAmount(line.unit_price), colUnitPrice, lineY, { align: 'right' });
    
    // Total HT (text-right font-medium)
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text(formatAmount(line.total_ht), colTotal, lineY, { align: 'right' });
  });
  
  y = currentY + tableContentHeight + 12; // space-y-6
  
  // ============ TOTALS SECTION (InvoiceDocument totals) ============
  // Aligné à droite (flex justify-end)
  const totalsX = startX + 100; // w-80 ≈ 100mm
  const totalsStartY = y;
  
  // Total HT (text-sm)
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99); // text-gray-600
  doc.text('Total HT:', totalsX, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39); // text-gray-900
  doc.text(formatAmount(data.total_ht), endX - 2, y, { align: 'right' });
  
  y += 6; // space-y-2
  
  // Taxes appliquées
  if (data.applied_taxes.length > 0) {
    data.applied_taxes.forEach((tax) => {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(75, 85, 99);
      const taxLabel = tax.type === 'percentage' 
        ? `${tax.name} (${tax.rate_or_value}%)`
        : tax.name;
      doc.text(`${taxLabel}:`, totalsX, y);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(17, 24, 39);
      doc.text(formatAmount(tax.amount), endX - 2, y, { align: 'right' });
      y += 6;
    });
    
    // Ligne de séparation (border-t border-gray-300 my-2)
    doc.setLineWidth(0.3);
    doc.setDrawColor(209, 213, 219);
    doc.line(totalsX, y - 1, endX, y - 1);
    y += 4;
  }
  
  // Total TTC (text-lg font-bold pt-2 border-t-2 border-gray-400)
  doc.setLineWidth(0.8);
  doc.setDrawColor(156, 163, 175); // border-gray-400
  doc.line(totalsX, y - 1, endX, y - 1);
  y += 2; // pt-2
  
  doc.setFontSize(14); // text-lg = 18px
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text('Total TTC:', totalsX, y);
  doc.text(formatAmount(data.total_ttc), endX - 2, y, { align: 'right' });
  
  y += 12; // space-y-6
  
  // ============ NOTES (InvoiceDocument notes) ============
  if (data.notes) {
    doc.setLineWidth(0.3);
    doc.setDrawColor(229, 231, 235); // border-gray-200
    doc.line(startX, y, endX, y);
    y += 6; // pt-4
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(55, 65, 81); // text-gray-700
    doc.text('Notes:', startX, y);
    y += 5; // mb-2
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99); // text-gray-600
    // Diviser les notes en plusieurs lignes si nécessaire
    const notesLines = doc.splitTextToSize(data.notes, contentWidth);
    doc.text(notesLines, startX, y);
    y += notesLines.length * 4;
  }
  
  // ============ FOOTER (DocumentFooter) ============
  const footerY = pageHeight - margin - 15;
  doc.setLineWidth(0.5);
  doc.setDrawColor(229, 231, 235); // border-gray-200
  doc.line(startX, footerY, endX, footerY);
  
  y = footerY + 6; // pt-6
  
  doc.setFontSize(9); // text-xs = 12px
  doc.setFont('helvetica', 'normal');
  
  if (company?.footer) {
    doc.setTextColor(75, 85, 99); // text-gray-600
    const footerLines = doc.splitTextToSize(company.footer, contentWidth);
    doc.text(footerLines, startX, y);
  } else {
    doc.setTextColor(107, 114, 128); // text-gray-500
    doc.text('Document généré automatiquement', startX + contentWidth / 2, y, { align: 'center' });
  }
  
  // Générer le blob
  const pdfBlob = doc.output('blob');
  return pdfBlob;
}

// Réexporter la fonction pour les factures (compatibilité)
export { generateDocumentPDF as generateInvoicePDF };
