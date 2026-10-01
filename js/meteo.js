const weatherCity = document.getElementById('weatherCity');
const weatherContainer = document.getElementById('weather');

const weatherCodes = {
    0: 'Ciel dégagé',
    1: 'Principalement dégagé',
    2: 'Partiellement nuageux',
    3: 'Couvert',
    45: 'Brouillard',
    48: 'Brouillard givrant',
    51: 'Bruine légère',
    53: 'Bruine',
    55: 'Bruine forte',
    61: 'Pluie faible',
    63: 'Pluie',
    65: 'Forte pluie',
    71: 'Neige faible',
    73: 'Neige',
    75: 'Forte neige',
    80: 'Averses faibles',
    81: 'Averses',
    82: 'Fortes averses',
    95: 'Orage',
    96: 'Orage avec grêle',
    99: 'Orage avec forte grêle'
};


async function loadWeather() {

    const [latitude, longitude] = weatherCity.value.split(',');

    weatherContainer.innerHTML = `
        <p>Chargement de la météo...</p>
    `;

    try {

        const url =
            `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${latitude}` +
            `&longitude=${longitude}` +
            `&current=temperature_2m,weather_code,wind_speed_10m` +
            `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
            `&timezone=Europe%2FParis` +
            `&forecast_days=5`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Erreur API météo');
        }

        const data = await response.json();

        displayWeather(data);

    } catch (error) {

        console.error(error);

        weatherContainer.innerHTML = `
            <p>
                Impossible de récupérer les informations météo.
            </p>
        `;
    }
}


function displayWeather(data) {

    const current = data.current;
    const daily = data.daily;

    const currentDescription =
        weatherCodes[current.weather_code] || 'Conditions inconnues';

    let html = `
        <div class="weather-current">

            <div class="weather-temperature">
                ${Math.round(current.temperature_2m)}°C
            </div>

            <div class="weather-description">
                <strong>${currentDescription}</strong>
                <span>
                    Vent : ${Math.round(current.wind_speed_10m)} km/h
                </span>
            </div>

        </div>

        <div class="weather-forecast">
    `;


    for (let i = 0; i < daily.time.length; i++) {

        const date = new Date(daily.time[i]);

        const day = date.toLocaleDateString('fr-FR', {
            weekday: 'short',
            day: 'numeric'
        });

        const description =
            weatherCodes[daily.weather_code[i]] || '';


        html += `
            <div class="weather-day">

                <strong>${day}</strong>

                <span>
                    ${description}
                </span>

                <span>
                    ${Math.round(daily.temperature_2m_max[i])}°
                    /
                    ${Math.round(daily.temperature_2m_min[i])}°
                </span>

            </div>
        `;
    }

    html += `
        </div>
    `;

    weatherContainer.innerHTML = html;
}


weatherCity.addEventListener('change', loadWeather);

loadWeather();

const tidePort = document.getElementById('tidePort');

const tideDives = document.getElementById('tide-dives');
const tideTrouville = document.getElementById('tide-trouville');


function updateTidePort() {

    tideDives.classList.remove('active');
    tideTrouville.classList.remove('active');

    if (tidePort.value === 'dives') {
        tideDives.classList.add('active');
    }

    if (tidePort.value === 'trouville') {
        tideTrouville.classList.add('active');
    }
}


tidePort.addEventListener('change', updateTidePort);

updateTidePort();