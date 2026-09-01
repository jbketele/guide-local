let mapCenter;
let mapZoom;

if (window.innerWidth < 768) {
    mapCenter = [49.2934373, -0.1155085];
    mapZoom = 14;
} else {
    mapCenter = [49.2934373, -0.1155085];
    mapZoom = 15;
}

const map =
    L.map("map").setView(mapCenter, mapZoom);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

setTimeout(() => {
    map.invalidateSize();
}, 100);