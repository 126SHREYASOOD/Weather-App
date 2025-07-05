document.addEventListener("DOMContentLoaded", function () {
    async function getWeather() {
        const city = document.getElementById('city').value;
        const apiKey = '54fb46753c8f2ce2707672c7b85df3e1'; // Replace with your actual API key
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;

        try {
            const geoResponse = await fetch(geoUrl);
            const geoData = await geoResponse.json();

            if (geoData.length === 0) {
                document.getElementById('weatherInfo').innerHTML = `<p style="color:red;">City not found!</p>`;
                return;
            }

            const lat = geoData[0].lat;
            const lon = geoData[0].lon;

            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

            const [weatherResponse, forecastResponse] = await Promise.all([
                fetch(weatherUrl),
                fetch(forecastUrl)
            ]);

            const weatherData = await weatherResponse.json();
            const forecastData = await forecastResponse.json();

            if (weatherData.cod === 200) {
                document.getElementById('weatherInfo').innerHTML = `
                    <h3>${weatherData.name}, ${weatherData.sys.country}</h3>
                    <p>Temperature: ${weatherData.main.temp}°C</p>
                    <p>Weather: ${weatherData.weather[0].description}</p>
                    <p>Humidity: ${weatherData.main.humidity}%</p>
                `;
            }

            if (forecastData.cod === "200") {
                let forecastHtml = "<h3>7-Day Forecast</h3>";
                const dailyForecast = {};

                // Extract daily data (OpenWeatherMap returns 3-hour intervals)
                forecastData.list.forEach(entry => {
                    const date = new Date(entry.dt * 1000).toDateString();
                    if (!dailyForecast[date]) {
                        dailyForecast[date] = {
                            temp: entry.main.temp,
                            description: entry.weather[0].description,
                            icon: entry.weather[0].icon
                        };
                    }
                });

                // Generate HTML for forecast
                Object.keys(dailyForecast).slice(0, 7).forEach(date => {
                    const day = dailyForecast[date];
                    forecastHtml += `
                        <div class="forecast-day">
                            <p><strong>${date}</strong></p>
                            <img src="https://openweathermap.org/img/wn/${day.icon}.png" alt="${day.description}">
                            <p>Temp: ${day.temp}°C</p>
                            <p>${day.description}</p>
                        </div>
                    `;
                });

                document.getElementById('forecast').innerHTML = forecastHtml;
            } else {
                document.getElementById('forecast').innerHTML = `<p style="color:red;">Forecast data unavailable.</p>`;
            }
        } catch (error) {
            console.error("Error fetching weather data:", error);
        }
    }

    window.getWeather = getWeather;
});

