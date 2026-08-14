"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.haversineKm = haversineKm;
exports.isWithinRadius = isWithinRadius;
const EARTH_RADIUS_KM = 6371;
function haversineKm(lat1, lon1, lat2, lon2) {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}
function isWithinRadius(originLat, originLng, pointLat, pointLng, radiusKm) {
    if (pointLat == null || pointLng == null)
        return false;
    return haversineKm(originLat, originLng, pointLat, pointLng) <= radiusKm;
}
//# sourceMappingURL=geo.js.map