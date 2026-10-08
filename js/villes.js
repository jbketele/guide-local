console.log("villes.js chargé");

const villes = {
    cabourg: {
        fetch: "../data/cabourg.json",

        mapCenterMobile: [49.2934373, -0.1155085],
        mapCenterDesktop: [49.2934373, -0.1155085],

        mapZoomMobile: 15,
        mapZoomDesktop: 15
    },

    trouville: {
        fetch: "../data/trouville.json",

        mapCenterMobile: [49.36576539607871, 0.08221368011477992],
        mapCenterDesktop: [49.36576539607871, 0.08221368011477992],

        mapZoomMobile: 15,
        mapZoomDesktop: 15
    },

    merville: {
        fetch: "../data/merville.json",

        mapCenterMobile: [49.27956523539082, -0.21191259046092314],
        mapCenterDesktop: [49.281681142272035, -0.21439834509825006],

        mapZoomMobile: 14,
        mapZoomDesktop: 15
    },

    dives: {
        fetch: "../data/dives.json",

        mapCenterMobile: [49.2866417, -0.1001559],
        mapCenterDesktop: [49.2934373, -0.1155085],

        mapZoomMobile: 14,
        mapZoomDesktop: 15
    },

    houlgate: {
        fetch: "../data/houlgate.json",

        mapCenterMobile: [49.301234903946245, -0.0703207103834691],
        mapCenterDesktop: [49.301234903946245, -0.0703207103834691],

        mapZoomMobile: 14,
        mapZoomDesktop: 15
    },

    villers: {
        fetch: "../data/villers.json",

        mapCenterMobile: [49.32468119096079, 0.0015627342651525211],
        mapCenterDesktop: [49.32468119096079, 0.0015627342651525211],

        mapZoomMobile: 14,
        mapZoomDesktop: 15
    },

    deauville: {
        fetch: "../data/deauville.json",

        mapCenterMobile: [49.35754977693785, 0.07134117123700712],
        mapCenterDesktop: [49.3595018, 0.0746638],

        mapZoomMobile: 14,
        mapZoomDesktop: 15
    },

    honfleur: {
        fetch: "../data/honfleur.json",

        mapCenterMobile: [49.4222955409325, 0.23148449696602125],
        mapCenterDesktop: [49.42100971758151, 0.2339874711813117],

        mapZoomMobile: 15,
        mapZoomDesktop: 15
    }
};


const ville = document.body.dataset.ville;
console.log("Ville :", ville);
const config = villes[ville];
console.log("Config :", config);

// =========================
// NOMBRE MAXIMUM DE CARDS
// =========================

const maxCards = {

    incontournables: {
        mobile: 3,
        tablet: 4,
        desktop: 6
    },

    restaurants: {
        mobile: 3,
        tablet: 4,
        desktop: 6
    },

    favorites: {
        mobile: 3,
        tablet: 4,
        desktop: 6
    }

};


const screenType =
    window.innerWidth < 768
        ? "mobile"
        : window.innerWidth < 1200
            ? "tablet"
            : "desktop";

console.log("========== ÉCRAN ==========");
console.log("Largeur écran :", window.innerWidth);
console.log("Type écran :", screenType);
console.log("========== MAX CARDS ==========");
console.log("Maximum incontournables :", maxCards.incontournables[screenType]);
console.log("Maximum restaurants :", maxCards.restaurants[screenType]);
console.log("Maximum favoris :", maxCards.favorites[screenType]);

function setupSeeMore(selector, buttonId, max, textMore, textLess) {

    console.log("1 - début fonction");

    const cards = document.querySelectorAll(selector);

    console.log("2 - cards récupérées :", cards);

    const button = document.getElementById(buttonId);

    console.log("3 - bouton récupéré :", button);

    console.log("4 - selector :", selector);

    console.log("5 - nombre cards :", cards.length);

    console.log("6 - maximum :", max);

    console.log("7 - textMore :", textMore);

    console.log("8 - textLess :", textLess);

    if (!button) {

        console.log("9 - PAS DE BOUTON → return");

        return;

    }

    console.log("10 - bouton trouvé, on continue");
    console.log("11 - nombre de cards :", cards.length);

    console.log("12 - maximum :", max);
    if (cards.length <= max) {
        console.log("13 - pas assez de cards → return");
        button.style.display = "none";
        return;
    }

    console.log("14 - assez de cards, masquage...");
    cards.forEach((card, index) => {

        console.log(
            "Card",
            index + 1,
            "| nom :",
            card.dataset.name || card.querySelector("h3")?.textContent,
            "| cachée ?",
            index >= max
        );

        if (index >= max) {
            card.classList.add("card-hidden");

            console.log(
                "→ card-hidden AJOUTÉE à la card",
                index + 1
            );
        }

    });

    const hiddenCards =
        document.querySelectorAll(`${selector}.card-hidden`);

    button.addEventListener("click", () => {

        const isExpanded =
            button.classList.contains("expanded");

        if (isExpanded) {

            hiddenCards.forEach(card => {
                card.classList.add("card-hidden");
            });

            button.classList.remove("expanded");

            button.textContent = textMore;

            button.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        } else {

            hiddenCards.forEach(card => {
                card.classList.remove("card-hidden");
            });

            button.classList.add("expanded");

            button.textContent = textLess;
        }
    });
}

// =========================
// CARTE
// =========================

const isMobile = window.innerWidth < 768;

const mapCenter = isMobile
    ? config.mapCenterMobile
    : config.mapCenterDesktop;

const mapZoom = isMobile
    ? config.mapZoomMobile
    : config.mapZoomDesktop;


const map =
    L.map("map").setView(mapCenter, mapZoom);


L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: '&copy; OpenStreetMap contributors'
    }
).addTo(map);


// =========================
// GROUPE DE MARQUEURS
// =========================

const markers = L.markerClusterGroup({
    showCoverageOnHover: false,
    spiderfyOnMaxZoom: true,
    maxClusterRadius: 50
});


// =========================
// CHARGEMENT DES DONNÉES
// =========================

fetch(config.fetch)
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

            if (
                element.lat == null ||
                element.lng == null
            ) {
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
                ...restaurantsContainer.querySelectorAll(
                    ".restaurant-card"
                )
            ].some(card =>
                card.dataset.name === restaurant.name
            );


            if (exists) {
                return;
            }


            const card = `
                <article class="restaurant-card">

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


        console.log("=== SETUP SEE MORE ===");

        setupSeeMore(
            ".restaurant-card",
            "seeMoreRestaurants",
            maxCards.restaurants[screenType],
            "Voir plus de restaurants",
            "Voir moins de restaurants"
        );

        setupSeeMore(
            ".incontournable-card",
            "seeMoreIncontournables",
            maxCards.incontournables[screenType],
            "Voir plus d'incontournables",
            "Voir moins d'incontournables"
        );

        setupSeeMore(
            ".favorite-card",
            "seeMoreFavorites",
            maxCards.favorites[screenType],
            "Voir plus de coups de cœur",
            "Voir moins de coups de cœur"
        );
    })


    .catch(error => {

        console.error(
            "Erreur lors du chargement des données :",
            error
        );

    });