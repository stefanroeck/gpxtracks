
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
                const result = {
                    lat,
                    lng,
                    day,
                    temperature: weatherData.daily.temperature_2m_max[0] + weatherData.daily_units.temperature_2m_max,
                    weatherCode: weatherData.daily.weathercode[0],
                };
                weatherDataCache.push(result);
                return result;
            });
    }
}