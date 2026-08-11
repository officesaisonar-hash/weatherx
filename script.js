// =========================================
// WEATHERX
// Real-Time Weather Application
// =========================================

// =========================================
// API CONFIGURATION
// =========================================

const API_URL =
    "https://api.openweathermap.org/data/2.5/weather";

const FORECAST_URL =
    "https://api.openweathermap.org/data/2.5/forecast";


// =========================================
// DOM ELEMENTS
// =========================================

const cityInput =
    document.getElementById("cityInput");

const searchBtn =
    document.getElementById("searchBtn");

const locationBtn =
    document.getElementById("locationBtn");

const weatherContent =
    document.getElementById("weatherContent");

const emptyState =
    document.getElementById("emptyState");

const loading =
    document.getElementById("loading");

const errorMessage =
    document.getElementById("errorMessage");

const cityName =
    document.getElementById("cityName");

const weatherDate =
    document.getElementById("weatherDate");

const weatherIcon =
    document.getElementById("weatherIcon");

const temperature =
    document.getElementById("temperature");

const weatherDescription =
    document.getElementById("weatherDescription");

const feelsLike =
    document.getElementById("feelsLike");

const humidity =
    document.getElementById("humidity");

const windSpeed =
    document.getElementById("windSpeed");

const pressure =
    document.getElementById("pressure");

const visibility =
    document.getElementById("visibility");

const sunrise =
    document.getElementById("sunrise");

const sunset =
    document.getElementById("sunset");

const forecastContainer =
    document.getElementById("forecastContainer");

const recentSearches =
    document.getElementById("recentSearches");

const clearHistoryBtn =
    document.getElementById("clearHistoryBtn");


// =========================================
// SEARCH
// =========================================

searchBtn.addEventListener("click", handleSearch);


cityInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {

        handleSearch();

    }

});


async function handleSearch() {

    const city =
        cityInput.value.trim();

    if (!city) {

        showError(
            "Please enter a city name."
        );

        return;

    }

    await getWeather(city);

}


// =========================================
// GET WEATHER
// =========================================

async function getWeather(city) {

    clearError();

    showLoading();

    try {

        const url =
            `${API_URL}?q=${encodeURIComponent(city)}` +
            `&appid=${API_KEY}&units=metric`;

        const response =
            await fetch(url);

        if (!response.ok) {

            handleApiError(response.status);

        }

        const data =
            await response.json();

        displayWeather(data);

        saveRecentSearch(data.name);

        await getForecast(data.name);

    } catch (error) {

        hideLoading();

        showError(error.message);

    }

}


// =========================================
// API ERROR HANDLING
// =========================================

function handleApiError(status) {

    if (status === 401) {

        throw new Error(
            "Weather API key is invalid or inactive."
        );

    }

    if (status === 404) {

        throw new Error(
            "City not found. Please check the spelling."
        );

    }

    if (status === 429) {

        throw new Error(
            "Too many requests. Please try again later."
        );

    }

    throw new Error(
        "Unable to fetch weather data."
    );

}


// =========================================
// DISPLAY CURRENT WEATHER
// =========================================

function displayWeather(data) {

    emptyState.classList.add("hidden");

    loading.classList.add("hidden");

    weatherContent.classList.remove("hidden");


    // City
    cityName.textContent =
        `${data.name}, ${data.sys.country}`;


    // Date
    const currentDate =
        new Date();

    weatherDate.textContent =
        currentDate.toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                day: "numeric",
                month: "long"
            }
        );


    // Temperature
    temperature.textContent =
        Math.round(data.main.temp);


    // Feels like
    feelsLike.textContent =
        Math.round(data.main.feels_like);


    // Description
    weatherDescription.textContent =
        capitalizeFirstLetter(
            data.weather[0].description
        );


    // Weather condition
    const condition =
        data.weather[0].main;


    // Weather icon
    weatherIcon.textContent =
        getWeatherEmoji(condition);


    // Dynamic background
    changeWeatherTheme(condition);


    // Icon animation
    setWeatherIconAnimation(condition);


    // Humidity
    humidity.textContent =
        data.main.humidity;


    // Wind
    windSpeed.textContent =
        Math.round(
            data.wind.speed * 3.6
        );


    // Pressure
    pressure.textContent =
        data.main.pressure;


    // Visibility
    visibility.textContent =
        Math.round(
            data.visibility / 1000
        );


    // Sunrise
    sunrise.textContent =
        formatTime(
            data.sys.sunrise
        );


    // Sunset
    sunset.textContent =
        formatTime(
            data.sys.sunset
        );

}


// =========================================
// FORECAST
// =========================================

async function getForecast(city) {

    try {

        const url =
            `${FORECAST_URL}?q=${encodeURIComponent(city)}` +
            `&appid=${API_KEY}&units=metric`;

        const response =
            await fetch(url);

        if (!response.ok) {

            throw new Error(
                "Forecast unavailable."
            );

        }

        const data =
            await response.json();

        displayForecast(data);

    } catch (error) {

        console.error(
            "Forecast error:",
            error
        );

    }

}


// =========================================
// DISPLAY FORECAST
// =========================================

function displayForecast(data) {

    forecastContainer.innerHTML = "";

    const dailyForecast = [];


    data.list.forEach((forecast) => {

        const date =
            new Date(
                forecast.dt * 1000
            );

        const hour =
            date.getHours();


        // Select afternoon forecast
        if (hour >= 11 && hour <= 14) {

            dailyForecast.push(
                forecast
            );

        }

    });


    dailyForecast
        .slice(0, 5)
        .forEach((forecast) => {

            const card =
                document.createElement("div");

            card.className =
                "forecast-card";


            const date =
                new Date(
                    forecast.dt * 1000
                );


            card.innerHTML = `
                <p class="forecast-day">
                    ${date.toLocaleDateString(
                        "en-IN",
                        { weekday: "short" }
                    )}
                </p>

                <div class="forecast-icon">
                    ${getWeatherEmoji(
                        forecast.weather[0].main
                    )}
                </div>

                <p class="forecast-temp">
                    ${Math.round(
                        forecast.main.temp
                    )}°C
                </p>

                <p class="forecast-description">
                    ${capitalizeFirstLetter(
                        forecast.weather[0]
                            .description
                    )}
                </p>
            `;


            forecastContainer.appendChild(
                card
            );

        });

}


// =========================================
// WEATHER EMOJI
// =========================================

function getWeatherEmoji(condition) {

    const weather =
        condition.toLowerCase();


    if (weather.includes("clear")) {
        return "☀️";
    }

    if (weather.includes("cloud")) {
        return "☁️";
    }

    if (weather.includes("rain")) {
        return "🌧️";
    }

    if (weather.includes("drizzle")) {
        return "🌦️";
    }

    if (weather.includes("thunderstorm")) {
        return "⛈️";
    }

    if (weather.includes("snow")) {
        return "❄️";
    }

    if (
        weather.includes("mist") ||
        weather.includes("fog") ||
        weather.includes("haze")
    ) {
        return "🌫️";
    }

    return "🌤️";

}


// =========================================
// WEATHER THEME
// =========================================

function changeWeatherTheme(condition) {

    document.body.classList.remove(
        "weather-clear",
        "weather-clouds",
        "weather-rain",
        "weather-thunderstorm",
        "weather-snow",
        "weather-mist"
    );


    const weather =
        condition.toLowerCase();


    if (weather.includes("clear")) {

        document.body.classList.add(
            "weather-clear"
        );

    } else if (weather.includes("cloud")) {

        document.body.classList.add(
            "weather-clouds"
        );

    } else if (
        weather.includes("rain") ||
        weather.includes("drizzle")
    ) {

        document.body.classList.add(
            "weather-rain"
        );

    } else if (
        weather.includes("thunderstorm")
    ) {

        document.body.classList.add(
            "weather-thunderstorm"
        );

    } else if (
        weather.includes("snow")
    ) {

        document.body.classList.add(
            "weather-snow"
        );

    } else if (
        weather.includes("mist") ||
        weather.includes("fog") ||
        weather.includes("haze")
    ) {

        document.body.classList.add(
            "weather-mist"
        );

    } else {

        document.body.classList.add(
            "weather-clouds"
        );

    }

}


// =========================================
// WEATHER ICON ANIMATION
// =========================================

function setWeatherIconAnimation(condition) {

    weatherIcon.classList.remove(
        "sunny",
        "rainy",
        "stormy",
        "snowy"
    );


    const weather =
        condition.toLowerCase();


    if (weather.includes("clear")) {

        weatherIcon.classList.add(
            "sunny"
        );

    } else if (
        weather.includes("rain") ||
        weather.includes("drizzle")
    ) {

        weatherIcon.classList.add(
            "rainy"
        );

    } else if (
        weather.includes("thunderstorm")
    ) {

        weatherIcon.classList.add(
            "stormy"
        );

    } else if (
        weather.includes("snow")
    ) {

        weatherIcon.classList.add(
            "snowy"
        );

    }

}


// =========================================
// FORMAT TIME
// =========================================

function formatTime(timestamp) {

    const date =
        new Date(timestamp * 1000);

    return date.toLocaleTimeString(
        "en-IN",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


// =========================================
// CAPITALIZE TEXT
// =========================================

function capitalizeFirstLetter(text) {

    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

}


// =========================================
// LOADING
// =========================================

function showLoading() {

    emptyState.classList.add(
        "hidden"
    );

    weatherContent.classList.add(
        "hidden"
    );

    loading.classList.remove(
        "hidden"
    );

}


function hideLoading() {

    loading.classList.add(
        "hidden"
    );

}


// =========================================
// ERROR
// =========================================

function showError(message) {

    errorMessage.textContent =
        message;

}


function clearError() {

    errorMessage.textContent = "";

}


// =========================================
// RECENT SEARCHES
// =========================================

function saveRecentSearch(city) {

    let searches =
        JSON.parse(
            localStorage.getItem(
                "weatherSearches"
            )
        ) || [];


    searches =
        searches.filter(
            item =>
                item.toLowerCase() !==
                city.toLowerCase()
        );


    searches.unshift(city);


    searches =
        searches.slice(0, 5);


    localStorage.setItem(
        "weatherSearches",
        JSON.stringify(searches)
    );


    displayRecentSearches();

}


// =========================================
// DISPLAY RECENT SEARCHES
// =========================================

function displayRecentSearches() {

    const searches =
        JSON.parse(
            localStorage.getItem(
                "weatherSearches"
            )
        ) || [];


    recentSearches.innerHTML = "";


    searches.forEach((city) => {

        const button =
            document.createElement(
                "button"
            );


        button.className =
            "recent-city";


        button.textContent =
            city;


        button.addEventListener(
            "click",
            () => {

                cityInput.value =
                    city;

                getWeather(city);

            }
        );


        recentSearches.appendChild(
            button
        );

    });

}


// =========================================
// CLEAR HISTORY
// =========================================

clearHistoryBtn.addEventListener(
    "click",
    () => {

        localStorage.removeItem(
            "weatherSearches"
        );

        displayRecentSearches();

    }
);


// =========================================
// CURRENT LOCATION
// =========================================

locationBtn.addEventListener(
    "click",
    () => {

        if (!navigator.geolocation) {

            showError(
                "Geolocation is not supported by your browser."
            );

            return;

        }


        showLoading();


        navigator.geolocation.getCurrentPosition(
            (position) => {

                const {
                    latitude,
                    longitude
                } = position.coords;


                getWeatherByCoordinates(
                    latitude,
                    longitude
                );

            },

            () => {

                hideLoading();

                showError(
                    "Unable to access your location."
                );

            }
        );

    }
);


// =========================================
// WEATHER BY COORDINATES
// =========================================

async function getWeatherByCoordinates(
    latitude,
    longitude
) {

    try {

        const url =
            `${API_URL}?lat=${latitude}` +
            `&lon=${longitude}` +
            `&appid=${API_KEY}` +
            `&units=metric`;


        const response =
            await fetch(url);


        if (!response.ok) {

            handleApiError(
                response.status
            );

        }


        const data =
            await response.json();


        displayWeather(data);


        saveRecentSearch(
            data.name
        );


        await getForecast(
            data.name
        );


    } catch (error) {

        hideLoading();

        showError(
            error.message
        );

    }

}


// =========================================
// INITIALIZE APP
// =========================================

displayRecentSearches();
