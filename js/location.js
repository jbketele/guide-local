const cities = [
    {
        name: "Merville-Franceville",
        file: "./data/merville.json"
    },
    {
        name: "Cabourg",
        file: "./data/cabourg.json"
    },
    {
        name: "Dives-sur-Mer",
        file: "./data/dives.json"
    },
    {
        name: "Houlgate",
        file: "./data/houlgate.json"
    },
    {
        name: "Villers-sur-Mer",
        file: "./data/villers.json"
    },
    {
        name: "Deauville",
        file: "./data/deauville.json"
    },
    {
        name: "Trouville-sur-Mer",
        file: "./data/trouville.json"
    },
    {
        name: "Honfleur",
        file: "./data/honfleur.json"
    }
];

const locateButton = document.getElementById("locate-me");
const locationStatus = document.getElementById("location-status");
const nearbyList = document.getElementById("nearby-list");


// --------------------------------------------------
// Calcul de la distance entre deux coordonnées GPS
// --------------------------------------------------

function calculateDistance(lat1, lng1, lat2, lng2) {

    const earthRadius = 6371;

    const latitudeDifference = (lat2 - lat1) * Math.PI / 180;
    const longitudeDifference = (lng2 - lng1) * Math.PI / 180;

    const a =
        Math.sin(latitudeDifference / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(longitudeDifference / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadius * c;
}


// --------------------------------------------------
// Formatage de la distance
// --------------------------------------------------

function formatDistance(distance) {

    if (distance < 1) {
        return `${Math.round(distance * 1000)} m`;
    }

    return `${distance.toFixed(1).replace(".", ",")} km`;
}


// --------------------------------------------------
// Charger tous les JSON
// --------------------------------------------------

async function loadAllData() {

    const requests = cities.map(async (city) => {

        try {

            const response = await fetch(city.file);

            if (!response.ok) {
                throw new Error(`Impossible de charger ${city.file}`);
            }

            const data = await response.json();

            return data;

        } catch (error) {

            console.error(error);

            return null;
        }
    });

    const results = await Promise.all(requests);

    return results.filter(data => data !== null);
}


// --------------------------------------------------
// Transformer les données en une seule liste
// --------------------------------------------------

function createNearbyPlaces(data) {

    const places = [];

    data.forEach(city => {

        // Les lieux touristiques
        if (city.lieux) {

            city.lieux.forEach(place => {

                places.push({
                    name: place.name,
                    category: place.category,
                    type: "lieu",
                    city: city.ville,
                    lat: place.lat,
                    lng: place.lng
                });

            });
        }


        // Les restaurants
        if (city.restaurants) {

            city.restaurants.forEach(restaurant => {

                places.push({
                    name: restaurant.name,
                    category: restaurant.category,
                    type: "restaurant",
                    city: city.ville,
                    lat: restaurant.lat,
                    lng: restaurant.lng,
                    url: restaurant.url
                });

            });
        }

    });

    return places;
}


// --------------------------------------------------
// Géolocalisation
// --------------------------------------------------

async function locateUser() {

    if (!navigator.geolocation) {

        locationStatus.textContent =
            "La géolocalisation n'est pas disponible sur votre appareil.";

        return;
    }

    locateButton.disabled = true;
    locateButton.textContent = "📍 Localisation...";

    locationStatus.textContent =
        "Recherche des lieux autour de vous...";


    navigator.geolocation.getCurrentPosition(

        async (position) => {

            const userLatitude = position.coords.latitude;
            const userLongitude = position.coords.longitude;


            try {

                const data = await loadAllData();

                const places = createNearbyPlaces(data);


                // Calculer la distance de chaque lieu
                const nearbyPlaces = places.map(place => {

                    const distance = calculateDistance(
                        userLatitude,
                        userLongitude,
                        place.lat,
                        place.lng
                    );

                    return {
                        ...place,
                        distance
                    };

                });


                // Trier du plus proche au plus éloigné
                nearbyPlaces.sort((a, b) => a.distance - b.distance);


                // Afficher les 5 lieux les plus proches
                displayNearbyPlaces(nearbyPlaces.slice(0, 5));


                locationStatus.textContent =
                    `${nearbyPlaces.length} lieux trouvés autour de vous.`;


                locateButton.textContent = "📍 Actualiser ma position";

            } catch (error) {

                console.error(error);

                locationStatus.textContent =
                    "Une erreur est survenue lors de la recherche des lieux.";

                locateButton.textContent = "📍 Me localiser";
            }


            locateButton.disabled = false;
        },


        (error) => {

            console.error(error);

            locateButton.disabled = false;
            locateButton.textContent = "📍 Me localiser";

            if (error.code === 1) {

                locationStatus.textContent =
                    "La localisation a été refusée. Vous pouvez continuer à explorer le guide.";

            } else {

                locationStatus.textContent =
                    "Impossible de déterminer votre position.";
            }
        },

        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
        }
    );
}


// --------------------------------------------------
// Affichage des résultats
// --------------------------------------------------

function displayNearbyPlaces(places) {

    nearbyList.innerHTML = "";


    if (places.length === 0) {

        nearbyList.innerHTML = `
            <p>Aucun lieu n'a été trouvé à proximité.</p>
        `;

        return;
    }


    places.forEach(place => {

        const icon = place.type === "restaurant"
            ? "🍽️"
            : "📍";


        const card = document.createElement("a");

        card.className = "nearby-card";

        card.href = "#";


        card.innerHTML = `
            <div class="nearby-icon">${icon}</div>

            <div class="nearby-content">
                <h3>${place.name}</h3>
                <p>
                    ${formatDistance(place.distance)}
                    · ${place.category}
                    · ${place.city}
                </p>
            </div>

            <span class="nearby-arrow">→</span>
        `;


        nearbyList.appendChild(card);
    });
}


// --------------------------------------------------
// Bouton
// --------------------------------------------------

locateButton.addEventListener("click", locateUser);