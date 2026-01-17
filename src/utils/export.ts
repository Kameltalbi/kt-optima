/**
 * Utilitaires pour l'export de données en Excel/CSV
 */

export interface ExportColumn {
  key: string;
  label: string;
  format?: (value: any) => string;
}

/**
 * Exporte des données en CSV
 */
export function exportToCSV(
  data: any[],
  columns: ExportColumn[],
  filename: string = 'export.csv'
): void {
  // Créer les en-têtes
  const headers = columns.map(col => col.label).join(',');
  
  // Créer les lignes de données
  const rows = data.map(item => {
    return columns.map(col => {
      const value = item[col.key];
      const formatted = col.format ? col.format(value) : value;
      // Échapper les virgules et guillemets dans les valeurs
      if (typeof formatted === 'string' && (formatted.includes(',') || formatted.includes('"'))) {
        return `"${formatted.replace(/"/g, '""')}"`;
      }
      return formatted ?? '';
    }).join(',');
  });

  // Combiner en-têtes et données
  const csvContent = [headers, ...rows].join('\n');
  
  // Créer le blob et télécharger
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exporte des données en Excel (format CSV avec extension .xlsx simulé)
 * Note: Pour un vrai export Excel, utiliser une bibliothèque comme xlsx
 */
export function exportToExcel(
  data: any[],
  columns: ExportColumn[],
  filename: string = 'export.xlsx'
): void {
  // Pour l'instant, on utilise CSV avec extension .xlsx
  // TODO: Implémenter un vrai export Excel avec la bibliothèque xlsx
  exportToCSV(data, columns, filename.replace('.xlsx', '.csv'));
}

/**
 * Formate un montant pour l'export
 */
export function formatAmountForExport(value: number | null | undefined): string {
  if (value === null || value === undefined) return '0.00';
  return value.toFixed(2).replace('.', ',');
}

/**
 * Formate une date pour l'export
 */
export function formatDateForExport(value: string | Date | null | undefined): string {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toLocaleDateString('fr-FR');
}
