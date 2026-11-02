// Détection de la langue
const isEnglish = document.documentElement.lang === "en";

// Chemins des ressources
const dataPath = "/data/";
const imagePath = "/images/";

const DEFAULT_IMAGE = `${imagePath}cote-fleurie-honfleur.jpg`;

// Fichiers JSON des villes selon la langue
const suffix = isEnglish ? "-en" : "";

const citiesFiles = [
    { name: "Merville-Franceville", file: `${dataPath}merville${suffix}.json` },
    { name: "Cabourg", file: `${dataPath}cabourg${suffix}.json` },
    { name: "Dives-sur-Mer", file: `${dataPath}dives${suffix}.json` },
    { name: "Houlgate", file: `${dataPath}houlgate${suffix}.json` },
    { name: "Villers-sur-Mer", file: `${dataPath}villers${suffix}.json` },
    { name: "Deauville", file: `${dataPath}deauville${suffix}.json` },
    { name: "Trouville-sur-Mer", file: `${dataPath}trouville${suffix}.json` },
    { name: "Honfleur", file: `${dataPath}honfleur${suffix}.json` }
];

// Nombre de favoris à afficher selon la taille de l'écran
function getNumberOfFavorites() {
    return window.matchMedia("(max-width: 767px)").matches ? 3 : 4;
}

// Mélange aléatoire de Fisher-Yates
function shuffleArray(array) {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[j]] = [
            shuffled[j],
            shuffled[i]
        ];
    }

    return shuffled;
}


// Charge les données d'une ville
async function loadCityFavorites(cityFile) {
    try {
        const response = await fetch(cityFile.file);

        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}`);
        }

        const data = await response.json();

        const places = (data.lieux || []).map(place => ({
            ...place,
            city: data.ville || cityFile.name,
            itemType: "lieu"
        }));

        const restaurants = (data.restaurants || []).map(restaurant => ({
            ...restaurant,
            city: data.ville || cityFile.name,
            itemType: "restaurant"
        }));

        return [...places, ...restaurants];

    } catch (error) {
        console.error(
            `Impossible de charger les données de ${cityFile.name} :`,
            error
        );

        return [];
    }
}


// Crée une carte HTML
function createFavoriteCard(item) {
    const image = item.image
        ? resolveImagePath(item.image)
        : DEFAULT_IMAGE;

    const category = item.itemType === "restaurant"
        ? item.category || (isEnglish ? "Restaurant" : "Restaurant")
        : item.category || (isEnglish ? "Place to discover" : "Lieu à découvrir");

    return `
        <article class="favorite-card">
            <img
                src="${image}"
                alt="${escapeHTML(item.name)}"
                loading="lazy"
                onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}'"
            >

            <div class="favorite-content">
                <span class="category">
                    ${escapeHTML(category)} · ${escapeHTML(item.city)}
                </span>

                <h3>${escapeHTML(item.name)}</h3>

                <p>${escapeHTML(item.description || "")}</p>
            </div>
        </article>
    `;
}


// Convertit les chemins d'images en chemins adaptés à la page d'accueil
function resolveImagePath(path) {
    if (!path) return DEFAULT_IMAGE;

    const filename = path.split("/").pop();
    return `${imagePath}${filename}`;
}


// Échappe les caractères HTML
function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}


// Charge les données et affiche trois cartes aléatoires
async function displayRandomFavorites() {
    const container = document.querySelector("#favorites-container");

    if (!container) return;

    const cityResults = await Promise.all(
        citiesFiles.map(cityFile => loadCityFavorites(cityFile))
    );

    const allFavorites = cityResults.flat();

    // Séparer les restaurants et les autres lieux
    const restaurants = shuffleArray(
        allFavorites.filter(item => item.itemType === "restaurant")
    );

    const places = shuffleArray(
        allFavorites.filter(item => item.itemType !== "restaurant")
    );

    // Tirer au sort un maximum de 2 restaurants
    const selectedRestaurants = restaurants.slice(0, 2);

    // Compléter avec des lieux pour atteindre 4 cartes
    const selectedPlaces = places.slice(0, getNumberOfFavorites() - selectedRestaurants.length);

    // Mélanger les 4 cartes pour varier leur ordre d'affichage
    const selectedFavorites = shuffleArray([
        ...selectedRestaurants,
        ...selectedPlaces
    ]);

    container.innerHTML = selectedFavorites
        .map(createFavoriteCard)
        .join("");
}

displayRandomFavorites();