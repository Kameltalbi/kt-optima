export interface Currency {
  id: string;
  name: string; // Ex: "Dirham marocain", "Euro", "Dollar américain"
  code: string; // Ex: "MAD", "EUR", "USD"
  symbol: string; // Ex: "DH", "€", "$"
  symbolPosition: 'before' | 'after'; // Position du symbole par rapport au montant
  decimalPlaces: number; // Nombre de décimales (généralement 2)
  wordSingular: string; // Ex: "dirham", "euro", "dollar"
  wordPlural: string; // Ex: "dirhams", "euros", "dollars"
  wordFractionSingular: string; // Ex: "centime", "cent", "cent"
  wordFractionPlural: string; // Ex: "centimes", "cents", "cents"
  isDefault: boolean;
}

export const defaultCurrencies: Currency[] = [
  {
    id: 'mad',
    name: 'Dirham marocain',
    code: 'MAD',
    symbol: 'DH',
    symbolPosition: 'after',
    decimalPlaces: 2,
    wordSingular: 'dirham',
    wordPlural: 'dirhams',
    wordFractionSingular: 'centime',
    wordFractionPlural: 'centimes',
    isDefault: true,
  },
  {
    id: 'eur',
    name: 'Euro',
    code: 'EUR',
    symbol: '€',
    symbolPosition: 'after',
    decimalPlaces: 2,
    wordSingular: 'euro',
    wordPlural: 'euros',
    wordFractionSingular: 'centime',
    wordFractionPlural: 'centimes',
    isDefault: false,
  },
  {
    id: 'usd',
    name: 'Dollar américain',
    code: 'USD',
    symbol: '$',
    symbolPosition: 'before',
    decimalPlaces: 2,
    wordSingular: 'dollar',
    wordPlural: 'dollars',
    wordFractionSingular: 'cent',
    wordFractionPlural: 'cents',
    isDefault: false,
  },
  {
    id: 'tnd',
    name: 'Dinar tunisien',
    code: 'TND',
    symbol: 'DT',
    symbolPosition: 'after',
    decimalPlaces: 3,
    wordSingular: 'dinar',
    wordPlural: 'dinars',
    wordFractionSingular: 'millime',
    wordFractionPlural: 'millimes',
    isDefault: false,
  },
];
