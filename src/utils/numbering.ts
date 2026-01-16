/**
 * Génère le prochain code disponible pour un type donné
 * @param items - Liste des items existants (produits, services, etc.)
 * @param prefix - Préfixe du code (ex: "PROD", "SERV", "CAT")
 * @param getCode - Fonction pour extraire le code d'un item
 * @returns Le prochain code disponible (ex: "PROD-001", "SERV-002")
 */
export function generateNextCode<T>(
  items: T[],
  prefix: string,
  getCode: (item: T) => string | undefined
): string {
  // Extraire tous les codes existants qui commencent par le préfixe
  const existingCodes = items
    .map(getCode)
    .filter((code): code is string => {
      if (!code) return false;
      const upperCode = code.toUpperCase();
      const upperPrefix = prefix.toUpperCase();
      return upperCode.startsWith(upperPrefix + "-") || upperCode.startsWith(upperPrefix);
    });

  // Trouver le numéro le plus élevé
  let maxNumber = 0;
  const prefixPattern = new RegExp(`^${prefix.toUpperCase()}-?(\\d+)$`, "i");

  existingCodes.forEach((code) => {
    const match = code.match(prefixPattern);
    if (match) {
      const number = parseInt(match[1], 10);
      if (number > maxNumber) {
        maxNumber = number;
      }
    }
  });

  // Générer le prochain numéro
  const nextNumber = maxNumber + 1;
  const paddedNumber = String(nextNumber).padStart(3, "0");

  return `${prefix.toUpperCase()}-${paddedNumber}`;
}
