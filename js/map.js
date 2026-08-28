let mapCenter;
let mapZoom;

if (window.innerWidth < 768) {
    mapCenter = [49.30138935494273, 0.05989856448900266];
    mapZoom = 10;
} else {
    mapCenter = [49.32431960144406, -0.043661949418341006];
    mapZoom = 11;
}

const map =
    L.map("map").setView(mapCenter, mapZoom);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);