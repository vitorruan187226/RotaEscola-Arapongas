/**
 * Busca as coordenadas (latitude e longitude) de um endereço usando a API pública e gratuita do Nominatim (OpenStreetMap).
 * Adiciona 'Arapongas, PR' automaticamente para melhorar a precisão da busca se não estiver presente.
 * 
 * @param address Endereço digitado pelo usuário
 * @returns Objeto com lat e lon como strings (ou null em caso de erro)
 */
export async function geocodeAddress(address: string): Promise<{ lat: string, lon: string } | null> {
  if (!address.trim()) return null;

  try {
    // Adiciona Arapongas ao contexto da busca para maior precisão, caso não tenha sido digitado
    let query = address;
    if (!query.toLowerCase().includes('arapongas')) {
      query = `${query}, Arapongas - PR`;
    }

    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: data[0].lat,
        lon: data[0].lon
      };
    }
    
    return null;
  } catch (error) {
    console.error('Erro na geolocalização:', error);
    return null;
  }
}
