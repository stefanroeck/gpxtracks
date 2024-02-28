
// Remember weatherdata once fetched.
const weatherDataCache = [];

/**
 * 
 * @param {number} lat 
 * @param {number} lng 
 * @param {string} day, e.g. "2022-03-14" 
 * @returns {object}
 */
export const getWeather = (lat, lng, day) => {
    const existing = weatherDataCache.find(w => w.lat === lat && w.lng === lng && w.day === day);
    if (existing) {
        console.debug('Returning from cache', existing);
        return Promise.resolve(existing);
    } else {
        console.debug('Fetching weather data', lat, lng, day);
        return fetch(`https://archive-api.open-meteo.com/v1/era5?latitude=${lat}&longitude=${lng}&start_date=${day}&end_date=${day}&daily=weathercode,temperature_2m_max&timezone=CET`)
            .then(async response => {
                if (!response.ok) {
                    return Promise.resolve({
                        temperature: 'n/a',
                        weatherCode: 0,
                    });
                }
                const weatherData = await response.json();
                const temperature = weatherData.daily.temperature_2m_max[0] !== null ? weatherData.daily.temperature_2m_max[0] + weatherData.daily_units.temperature_2m_max : "";
                const result = {
                    lat,
                    lng,
                    day,
                    temperature,
                    weatherCode: weatherData.daily.weathercode[0],
                };
                weatherDataCache.push(result);
                return result;
            });
    }
}

/**
 * @param {string} weatherCode, see https://open-meteo.com/en/docs#api-documentation
 * @returns {string} Weather Symbol
 */
export const weatherCodeToSymbol = (weatherCode) => {
    switch (weatherCode) {
        case 0:
        case 1:
        case 2:
        case 3:
            return '🌤';
        case 45:
        case 48:
        case 51:
        case 53:
        case 55:
            return '🌥';
        case 61:
        case 63:
        case 65:
        case 66:
        case 67:
            return '🌧';
        case 71:
        case 73:
        case 75:
        case 77:
        case 85:
        case 86:
            return '🌨';
        case 95:
        case 96:
        case 99:
            return '🌩';
        default:
            console.log("Unknown weatherCode", weatherCode);
            return '?';
    }
}