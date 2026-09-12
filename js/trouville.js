let mapCenter;
let mapZoom;

if (window.innerWidth < 768) {
    mapCenter = [49.36576539607871, 0.08221368011477992];
    mapZoom = 15;
} else {
    mapCenter = [49.36576539607871, 0.08221368011477992];
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

// Chargement des données de Dives

fetch("../data/trouville.json")

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

const seeMoreButton = document.getElementById("seeMoreRestaurants");
const hiddenRestaurants = document.querySelectorAll(".restaurant-hidden");

if (seeMoreButton) {
    seeMoreButton.addEventListener("click", () => {
        const isExpanded = seeMoreButton.classList.contains("expanded");

        if (isExpanded) {
            // On referme la liste
            hiddenRestaurants.forEach((restaurant) => {
                restaurant.classList.add("restaurant-hidden");
            });

            seeMoreButton.classList.remove("expanded");
            seeMoreButton.textContent = "Voir plus de restaurants";

            // Retour au niveau du bouton
            seeMoreButton.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        } else {
            // On affiche les restaurants supplémentaires
            hiddenRestaurants.forEach((restaurant) => {
                restaurant.classList.remove("restaurant-hidden");
            });

            seeMoreButton.classList.add("expanded");
            seeMoreButton.textContent = "Voir moins de restaurants";
        }
    });
}