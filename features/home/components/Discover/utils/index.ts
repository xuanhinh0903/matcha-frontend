import { getDistance } from 'geolib';

export function computeDistance(
  [prevLat, prevLong]: [number, number],
  [lat, long]: [number, number]
): number {
  // Calculate distance in meters between two coordinates
  console.log(
    { latitude: prevLat, longitude: prevLong },
    { latitude: lat, longitude: long }
  );
  const distance = getDistance(
    { latitude: prevLat, longitude: prevLong },
    { latitude: lat, longitude: long }
  );

  // Convert to kilometers and return with one decimal place
  return Math.round(distance / 100) / 10;
}
