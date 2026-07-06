/**
 * Calcula a distância em quilômetros entre dois pontos geográficos usando a Fórmula de Haversine.
 * 
 * @param lat1 Latitude do ponto 1 (ex: Ônibus)
 * @param lon1 Longitude do ponto 1 (ex: Ônibus)
 * @param lat2 Latitude do ponto 2 (ex: Casa do Aluno ou Escola)
 * @param lon2 Longitude do ponto 2 (ex: Casa do Aluno ou Escola)
 * @returns Distância em linha reta em quilômetros (km)
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Raio da Terra em km
  
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Estima o tempo de viagem baseado numa distância e velocidade média.
 * 
 * @param distanceKm Distância em quilômetros
 * @param speedKmh Velocidade média em km/h (default: 20 km/h)
 * @returns Tempo estimado em minutos (arredondado para cima)
 */
export function estimateTimeMinutes(distanceKm: number, speedKmh: number = 20): number {
  if (distanceKm <= 0) return 0;
  if (speedKmh <= 0) speedKmh = 20; // fallback to prevent Infinity
  
  const hours = distanceKm / speedKmh;
  const minutes = hours * 60;
  
  return Math.ceil(minutes);
}
