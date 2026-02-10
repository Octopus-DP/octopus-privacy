/**
 * Fonction de recherche profonde (deep search) dans un objet
 * Recherche le terme dans toutes les valeurs de l'objet, y compris les tableaux et objets imbriqués
 * Insensible à la casse
 */
export function deepSearch(obj: any, searchTerm: string): boolean {
  if (!searchTerm || searchTerm.trim() === '') {
    return true;
  }

  const normalizedSearch = searchTerm.toLowerCase().trim();

  function searchInValue(value: any): boolean {
    // Null ou undefined
    if (value === null || value === undefined) {
      return false;
    }

    // String
    if (typeof value === 'string') {
      return value.toLowerCase().includes(normalizedSearch);
    }

    // Number
    if (typeof value === 'number') {
      return value.toString().includes(normalizedSearch);
    }

    // Boolean
    if (typeof value === 'boolean') {
      return value.toString().toLowerCase().includes(normalizedSearch);
    }

    // Array
    if (Array.isArray(value)) {
      return value.some(item => searchInValue(item));
    }

    // Object
    if (typeof value === 'object') {
      return Object.values(value).some(val => searchInValue(val));
    }

    return false;
  }

  return searchInValue(obj);
}

/**
 * Filtrer un tableau d'objets selon un terme de recherche
 */
export function filterBySearch<T>(items: T[], searchTerm: string): T[] {
  if (!searchTerm || searchTerm.trim() === '') {
    return items;
  }

  return items.filter(item => deepSearch(item, searchTerm));
}
