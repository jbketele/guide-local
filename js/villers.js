let mapCenter;
let mapZoom;

if (window.innerWidth < 768) {
    mapCenter = [49.32468119096079, 0.0015627342651525211];
    mapZoom = 14;
} else {
    mapCenter = [49.32468119096079, 0.0015627342651525211];
    mapZoom = 15;
}

const map =
    L.map("map").setView(mapCenter, mapZoom);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);


// Groupe de marqueurs avec clustering

const markers = L.markerClusterGroup({
    showCoverageOnHover: false,
    spiderfyOnMaxZoom: true,
    maxClusterRadius: 50
});

// Chargement des données de Houlgate

fetch("../data/villers.json")

    .then(response => response.json())
    .then(data => {
        const elements = [
            ...data.lieux,
            ...data.restaurants
        ];

        elements.forEach(element => {
            // Ignore les lieux sans coordonnées
            if (element.lat == null || element.lng == null) {
                return;
            }

            // Création du marqueur
            const marker = L.marker([
                element.lat,
                element.lng
            ]);

            // Contenu de la popup
            marker.bindPopup(`
                <strong>${element.name}</strong>
                <br>
                <span>${element.category}</span>
            `);

            // Ajout au groupe
            markers.addLayer(marker);
        });

        // Ajout du groupe à la carte
        map.addLayer(markers);
    })

    .catch(error => {
        console.error(
            "Erreur lors du chargement des données :",
            error
        );
    });