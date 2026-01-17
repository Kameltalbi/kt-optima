import { useCurrency } from "@/hooks/use-currency";

export interface AppliedTax {
  tax_id: string;
  name: string;
  type: 'percentage' | 'fixed';
  rate_or_value: number;
  amount: number;
}

export interface DocumentLine {
  description: string;
  quantity: number;
  unit_price: number;
  total_ht: number;
}

export interface InvoiceDocumentData {
  type: 'invoice' | 'quote' | 'credit_note';
  number: string;
  date: string;
  client: {
    name: string;
    address?: string | null;
    tax_number?: string | null; // Numéro fiscal du client (MF)
  };
  lines: DocumentLine[];
  total_ht: number;
  discount?: number | null; // Montant de la remise calculé
  discount_type?: 'percentage' | 'amount' | null; // Type de remise
  discount_value?: number | null; // Valeur saisie (% ou montant)
  applied_taxes: AppliedTax[];
  fiscal_stamp?: number | null; // Timbre fiscal (1,000 TND)
  total_ttc: number;
  amount_in_words?: string | null; // Montant en toutes lettres
  notes?: string | null;
}

interface InvoiceDocumentProps {
  data: InvoiceDocumentData;
}

export function InvoiceDocument({ data }: InvoiceDocumentProps) {
  const { formatAmount } = useCurrency();

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

  return (
    <div className="document-content space-y-6">
      {/* En-tête document */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{getDocumentLabel()}</h2>
          <div className="space-y-1 text-sm text-gray-600">
            <p><span className="font-semibold">N°:</span> {data.number}</p>
            <p><span className="font-semibold">Date:</span> {new Date(data.date).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-gray-900 mb-1">Client</p>
          <p className="text-sm text-gray-700">{data.client.name}</p>
          {data.client.address && (
            <p className="text-xs text-gray-600 mt-1">{data.client.address}</p>
          )}
          {data.client.tax_number && (
            <p className="text-xs text-gray-600 mt-1 font-medium">MF: {data.client.tax_number}</p>
          )}
        </div>
      </div>

      {/* Tableau des lignes */}
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Description
              </th>
              <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700 w-24">
                Quantité
              </th>
              <th className="border border-gray-300 px-4 py-3 text-right text-sm font-semibold text-gray-700 w-32">
                Prix unitaire
              </th>
              <th className="border border-gray-300 px-4 py-3 text-right text-sm font-semibold text-gray-700 w-32">
                Total HT
              </th>
            </tr>
          </thead>
          <tbody>
            {data.lines.length === 0 ? (
              <tr>
                <td colSpan={4} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                  Aucune ligne
                </td>
              </tr>
            ) : (
              data.lines.map((line, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                    {line.description}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center text-sm text-gray-700">
                    {line.quantity}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-right text-sm text-gray-700">
                    {formatAmount(line.unit_price)}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-right text-sm font-medium text-gray-900">
                    {formatAmount(line.total_ht)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Récapitulatif des totaux */}
      <div className="flex justify-end">
        <div className="w-80 space-y-2">
          {/* Total HT */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total HT:</span>
            <span className="font-medium text-gray-900">{formatAmount(data.total_ht)}</span>
          </div>

          {/* Remise */}
          {data.discount && data.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Remise{data.discount_type === 'percentage' && data.discount_value ? ` (${data.discount_value}%)` : ''}:
              </span>
              <span className="font-medium text-red-600">-{formatAmount(data.discount)}</span>
            </div>
          )}

          {/* Taxes appliquées */}
          {data.applied_taxes.length > 0 && (
            <>
              {data.applied_taxes.map((tax, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {tax.name}
                    {tax.type === 'percentage' && ` (${tax.rate_or_value}%)`}:
                  </span>
                  <span className="font-medium text-gray-900">{formatAmount(tax.amount)}</span>
                </div>
              ))}
            </>
          )}

          {/* Timbre fiscal */}
          {data.fiscal_stamp && data.fiscal_stamp > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Timbre fiscal:</span>
              <span className="font-medium text-gray-900">{formatAmount(data.fiscal_stamp)}</span>
            </div>
          )}

          {/* Ligne de séparation */}
          <div className="border-t border-gray-300 my-2"></div>

          {/* Total TTC */}
          <div className="flex justify-between text-lg font-bold pt-2 border-t-2 border-gray-400">
            <span className="text-gray-900">Total TTC:</span>
            <span className="text-gray-900">{formatAmount(data.total_ttc)}</span>
          </div>

          {/* Montant en toutes lettres */}
          {data.amount_in_words && (
            <div className="pt-2 text-sm italic text-gray-600">
              Arrêté la présente facture à la somme de: <span className="font-medium">{data.amount_in_words}</span>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {data.notes && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-2">Notes:</p>
          <p className="text-sm text-gray-600 whitespace-pre-line">{data.notes}</p>
        </div>
      )}
    </div>
  );
}
