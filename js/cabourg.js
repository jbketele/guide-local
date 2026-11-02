let mapCenter;
let mapZoom;

if (window.innerWidth < 768) {
    mapCenter = [49.2934373, -0.1155085];
    mapZoom = 15;
} else {
    mapCenter = [49.2934373, -0.1155085];
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

// =========================
// LANGUE
// =========================

const isEnglish = document.documentElement.lang === "en";

// Fichier JSON selon la langue
const dataFile = isEnglish
    ? "../data/cabourg-en.json"
    : "../data/cabourg.json";

// =========================
// CHARGEMENT DES DONNÉES
// =========================

fetch(dataFile)

    .then(response => {
        if (!response.ok) {
            throw new Error(`Erreur HTTP : ${response.status}`);
        }
        return response.json();
    })

    .then(data => {

        const elements = [
            ...data.lieux,
            ...data.restaurants
        ];

        // =========================
        // CARTE
        // =========================

        elements.forEach(element => {

            if (element.lat == null || element.lng == null) {
                return;
            }

            const marker = L.marker([
                element.lat,
                element.lng
            ]);

            marker.bindPopup(`
                <strong>${element.name}</strong>
                <br>
                <span>${element.category}</span>
            `);

            markers.addLayer(marker);
        });

        map.addLayer(markers);


        // =========================
        // RESTAURANTS
        // =========================

        const restaurantsContainer =
            document.querySelector(".restaurants-list");

        data.restaurants.forEach(restaurant => {

            const exists = [
                ...restaurantsContainer.querySelectorAll(".restaurant-card")
            ].some(card => card.dataset.name === restaurant.name);

            if (exists) return;

            const card = `
                <article class="restaurant-card"
                    data-name="${restaurant.name}">

                    <img
                        src="${restaurant.image}"
                        alt="${restaurant.name}"
                        loading="lazy"
                    >

                    <div class="restaurant-content">

                        <span class="category">
                            🍴 ${restaurant.category}
                        </span>

                        <h3>${restaurant.name}</h3>

                        <p>
                            ${restaurant.description}
                        </p>

                        <a
                            href="${restaurant.link || "#"}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="restaurant-link"
                        >
                            ${isEnglish
                    ? "Discover this place"
                    : "Découvrir l'adresse"}
                        </a>

                    </div>

                </article>
            `;

            restaurantsContainer.insertAdjacentHTML(
                "beforeend",
                card
            );
        });

    })

    .catch(error => {
        console.error("Erreur lors du chargement des données :", error);
    });