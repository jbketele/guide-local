let mapCenter;
let mapZoom;

if (window.innerWidth < 768) {
    mapCenter = [49.35754977693785, 0.07134117123700712];
    mapZoom = 14;
} else {
    mapCenter = [49.3595018, 0.0746638];
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


// Chargement des données de Deauville

fetch("../data/deauville.json")

    .then(response => response.json())

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
            ].some(card =>
                card.dataset.name === restaurant.name
            );

            if (exists) {
                return;
            }

            const card = `
                <article class="restaurant-card restaurant-hidden">

                    <img
                        src="${restaurant.image}"
                        alt="${restaurant.name}"
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
                            href="${restaurant.link}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="restaurant-link"
                        >
                            Découvrir l'adresse
                        </a>

                    </div>

                </article>
            `;

            restaurantsContainer.insertAdjacentHTML(
                "beforeend",
                card
            );
        });


        // =========================
        // BOUTON VOIR PLUS
        // =========================

        const seeMoreButton =
            document.getElementById("seeMoreRestaurants");

        const hiddenRestaurants =
            document.querySelectorAll(".restaurant-hidden");

        seeMoreButton.addEventListener("click", () => {

            const isExpanded =
                seeMoreButton.classList.contains("expanded");


            if (isExpanded) {

                // On referme la liste

                hiddenRestaurants.forEach((restaurant) => {
                    restaurant.classList.add("restaurant-hidden");
                });

                seeMoreButton.classList.remove("expanded");

                seeMoreButton.textContent =
                    "Voir plus de restaurants";


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

                seeMoreButton.textContent =
                    "Voir moins de restaurants";
            }
        });

    })

    .catch(error => {

        console.error(
            "Erreur lors du chargement des données :",
            error
        );

    });