import { countries } from './countries'; // Importa la lista de países

/**
 * Función para buscar países por nombre o código de país.
 * @param query - Término de búsqueda (nombre o código de país).
 * @returns Lista de países que coinciden con la búsqueda.
 */
export const searchCountries = (query: string) => {
  return countries.filter((country) => {
    // Buscar por nombre en español o inglés (ignorando mayúsculas/minúsculas)
    const nameMatch = country.name.toLowerCase().includes(query.toLowerCase()) ||
                      country.name_en.toLowerCase().includes(query.toLowerCase());

    // Buscar por código de país (por ejemplo, "+34")
    const codeMatch = country.dial_code.includes(query);

    return nameMatch || codeMatch;
  });
};