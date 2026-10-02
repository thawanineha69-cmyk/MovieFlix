const API_KEY = "70e64992fc0c63ab54e1bd0d2d298256";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const weatherResult = document.getElementById("weatherResult");


// Search button
searchBtn.addEventListener("click", getWeather);


// Enter key
cityInput.addEventListener("keypress", function (event) {

    if (event.key === "Enter") {
        getWeather();
    }

});


async function getWeather() {

    const city = cityInput.value.trim();

    if (city === "") {

        weatherResult.innerHTML = `
            <div class="weather-error">
                ⚠️ Please enter a city name.
            </div>
        `;

        return;
    }


    weatherResult.innerHTML = `
        <div class="loading">
            🌤️ Loading weather...
        </div>
    `;


    const URL =
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;


    try {

        const response = await fetch(URL);

        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message || "Weather data not found"
            );

        }


        // API data

        const cityName = data.name;

        const country = data.sys.country;

        const temperature = Math.round(data.main.temp);

        const feelsLike = Math.round(data.main.feels_like);

        const humidity = data.main.humidity;

        const windSpeed = data.wind.speed;

        const description = data.weather[0].description;

        const icon = data.weather[0].icon;


        // Weather icon

        const iconURL =
            `https://openweathermap.org/img/wn/${icon}@4x.png`;


        weatherResult.innerHTML = `

            <div class="weather-card">

                <!-- Card Header -->

                <div class="weather-card-header">

                    <div>

                        <h2>
                            📍 ${cityName}, ${country}
                        </h2>

                        <p>
                            Current Weather
                        </p>

                    </div>


                    <div class="weather-status">

                        <img
                            src="${iconURL}"
                            alt="${description}"
                        >

                        <span>
                            ${description}
                        </span>

                    </div>

                </div>


                <!-- Main Weather -->

                <div class="weather-main">

                    <div class="weather-icon-large">

                        <img
                            src="${iconURL}"
                            alt="${description}"
                        >

                    </div>


                    <div class="temperature-section">

                        <h3>
                            ${temperature}°C
                        </h3>

                        <p>
                            🌡️ Feels like
                            <strong>${feelsLike}°C</strong>
                        </p>

                    </div>


                    <div class="weather-description">

                        <h3>
                            ${capitalize(description)}
                        </h3>

                        <p>
                            Current weather conditions
                            in ${cityName}.
                        </p>

                    </div>

                </div>


                <!-- Weather Information -->

                <div class="weather-info">


                    <div class="weather-info-box">

                        <div class="info-icon humidity-icon">
                            💧
                        </div>

                        <div>

                            <span>
                                Humidity
                            </span>

                            <strong>
                                ${humidity}%
                            </strong>

                        </div>

                    </div>


                    <div class="weather-info-box">

                        <div class="info-icon wind-icon">
                            💨
                        </div>

                        <div>

                            <span>
                                Wind Speed
                            </span>

                            <strong>
                                ${windSpeed} m/s
                            </strong>

                        </div>

                    </div>


                    <div class="weather-info-box">

                        <div class="info-icon temperature-icon">
                            🌡️
                        </div>

                        <div>

                            <span>
                                Feels Like
                            </span>

                            <strong>
                                ${feelsLike}°C
                            </strong>

                        </div>

                    </div>


                </div>

            </div>

        `;

    }

    catch (error) {

        console.error(error);

        weatherResult.innerHTML = `

            <div class="weather-error">

                <div class="error-icon">
                    ⚠️
                </div>

                <h3>
                    Weather Not Found
                </h3>

                <p>
                    ${error.message}
                </p>

                <small>
                    Please check the city name and try again.
                </small>

            </div>

        `;

    }

}


// Capitalize description

function capitalize(text) {

    return text
        .split(" ")
        .map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(" ");

}