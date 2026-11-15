const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view');

let currentHolidays = [];
let currentEvents = [];
let currentWeekends = [];

function isSaved(id) {
    return savedPlans.some(plan => plan.id === id);
}


navItems.forEach(item => {
    item.addEventListener('click', (event) => {
        event.preventDefault();
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        views.forEach(view => {
            view.classList.remove('active');
        });
        const viewName = item.dataset.view;
        document.getElementById(`${viewName}-view`).classList.add('active');

        if (viewName === 'my-plans') {        
            displaySavedPlans();
        }
    });

});

async function fetchData() {
    try {
        const response = await fetch("https://date.nager.at/api/v3/AvailableCountries");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
fetchData().then(data => {
    if (data) {
        const countryList = document.getElementById('global-country');
        countryList.innerHTML = '<option value="">Select Country</option>';
        document.getElementById('stat-countries').textContent = data.length;   
        data.forEach(country => {
            const listItem = document.createElement('option');
            listItem.textContent = `${country.name} (${country.countryCode})`;
            listItem.value = country.countryCode;
            countryList.appendChild(listItem);
        });

        countryList.value = 'EG'; 
    }
});


async function fetchHolidays(countryCode, year) {
    try {
        const response = await fetch(
            `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error fetching holidays:', error);
        return [];
    }
}

function displayHolidays(holidays) {
    document.getElementById('stat-holidays').textContent = holidays.length;
    const holidayList = document.getElementById('holidays-content');

    holidayList.innerHTML = '';

    holidays.forEach((holiday, index) => {
        const date = new Date(holiday.date + 'T00:00:00');   
        const heart = isSaved(`holiday-${holiday.date}`) ? 'fa-solid' : 'fa-regular';
        const listItem = document.createElement('div');

        listItem.className = 'holiday-card';

        listItem.innerHTML = `
      <div class="holiday-card-header">
      <div class="holiday-date-box">
        <span class="day">${date.getDate()}</span>
        <span class="month">${date.toLocaleString('en-US', { month: 'short' })}</span>
      </div>
      <button class="holiday-action-btn" data-save="holiday" data-index="${index}">
        <i class="${heart} fa-heart"></i>
      </button>
    </div>

      <h3>${holiday.localName}</h3>
      <p class="holiday-name">${holiday.name}</p>

      <div class="holiday-card-footer">
        <span class="holiday-day-badge">
          <i class="fa-regular fa-calendar"></i>
          ${date.toLocaleString('en-US', { weekday: 'long' })}
        </span>

        <span class="holiday-type-badge">Public</span>
      </div>
    `;

        holidayList.appendChild(listItem);
    });
}

async function loadHolidays() {
    const countryCode = document.getElementById('global-country').value;
    const year = document.getElementById('global-year').value;

    if (!countryCode || !year) {
        return;
    }

    const holidays = await fetchHolidays(countryCode, year);
    currentHolidays = holidays;
    displayHolidays(holidays);
}


loadHolidays();


const REST_COUNTRIES_API_KEY = "rc_live_d2abaca362134303b142f56f52ecd817";



function displayCountryInfo(country) {
    const countryInfo = document.getElementById('dashboard-country-info');
    countryInfo.innerHTML = '';
    const flag = country.flags.png;
    const name = country.name.common;
    const officialName = country.name.official;
    const region = country.region;
    const subregion = country.subregion;
    countryInfo.innerHTML = `
  <div class="dashboard-country-header">
    <img src="${flag}" alt="${name}" class="dashboard-country-flag">

    <div class="dashboard-country-title">
      <h3>${name}</h3>
      <p class="official-name">${officialName}</p>
      <span class="region">
        <i class="fa-solid fa-location-dot"></i>
        ${region} • ${subregion}
      </span>
    </div>
  </div>
`;
    countryInfo.innerHTML += `
  <div class="dashboard-country-grid">

    <div class="dashboard-country-detail">
      <i class="fa-solid fa-building-columns"></i>
      <span class="label">Capital</span>
      <span class="value">${country.capital?.[0] || 'N/A'}</span>
    </div>

    <div class="dashboard-country-detail">
      <i class="fa-solid fa-users"></i>
      <span class="label">Population</span>
      <span class="value">${country.population.toLocaleString()}</span>
    </div>

    <div class="dashboard-country-detail">
      <i class="fa-solid fa-ruler-combined"></i>
      <span class="label">Area</span>
      <span class="value">${country.area?.toLocaleString() || 'N/A'} km²</span>
    </div>

    <div class="dashboard-country-detail">
      <i class="fa-solid fa-globe"></i>
      <span class="label">Continent</span>
      <span class="value">${country.region}</span>
    </div>

  </div>
`;
    countryInfo.innerHTML += `
  <div class="dashboard-country-extras">

    <div class="dashboard-country-extra">
      <h4><i class="fa-solid fa-coins"></i> Currency</h4>
      <div class="extra-tags">
        <span class="extra-tag">
          ${Object.values(country.currencies || {})
            .map(currency => `${currency.name} (${currency.symbol || ''})`)
            .join(', ') || 'N/A'}
        </span>
      </div>
    </div>

    <div class="dashboard-country-extra">
      <h4><i class="fa-solid fa-language"></i> Languages</h4>
      <div class="extra-tags">
        <span class="extra-tag">
          ${Object.values(country.languages || {}).join(', ') || 'N/A'}
        </span>
      </div>
    </div>

    <div class="dashboard-country-extra">
      <h4><i class="fa-solid fa-map-location-dot"></i> Neighbors</h4>
      <div class="extra-tags">
        <span class="extra-tag border-tag">
          ${country.borders?.join(', ') || 'No neighbors'}
        </span>
      </div>
    </div>

  </div>
`;
}
async function loadCountryInfo() {
    const countryCode = document.getElementById('global-country').value;
    if (!countryCode) return;
    const country = await fetchCountryInfo(countryCode);

    if (country) {
        displayCountryInfo(country);
    }
}

loadCountryInfo();


const EXCHANGE_RATE_API_KEY = "db37588f1d9d93bbb6528caa";
const TICKETMASTER_API_KEY = "YOUR_TICKETMASTER_KEY";







async function fetchEventInfo(countryCode, city) {
    try {
        const response = await fetch(
            `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${TICKETMASTER_API_KEY}&countryCode=${countryCode}&city=${encodeURIComponent(city)}&size=20`
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        return data._embedded?.events || [];

    } catch (error) {
        console.error('Error fetching event info:', error);
        return [];
    }
}
// function displayEventInfo(events) {
//     const eventList = document.getElementById('events-content');
//     eventList.innerHTML = '';
//     events.forEach((event, index) => {

//         const date = new Date(event.dates.start.localDate + 'T00:00:00');
//         const heart = isSaved(`event-${event.id}`) ? 'fa-solid' : 'fa-regular';
//         const listItem = document.createElement('div');
//         listItem.className = 'dashboard-event-card';
//         listItem.innerHTML = `
//       <div class="dashboard-event-card-header">
//         <div class="dashboard-event-date-box">
//           <span class="day">${new Date(event.dates.start.localDate).getDate()}</span>
//           <span class="month">${new Date(event.dates.start.localDate).toLocaleString('en-US', { month: 'short' })}</span>
//         </div>
//         <button class="holiday-action-btn" data-save="event" data-index="${index}">
//           <i class="${heart} fa-heart"></i>
//         </button>
//       </div>

//       <h3>${event.name}</h3>
// <p class="event-name">${event._embedded?.venues?.[0]?.name || 'Location not available'}</p>

//       <div class="dashboard-event-card-footer">
//         <span class="event-day-badge">
//           <i class="fa-regular fa-calendar"></i>
//           ${new Date(event.dates.start.localDate).toLocaleString('en-US', { weekday: 'long' })}
//         </span>
//         <span class="event-type-badge">Public</span>
//       </div>
//     `;
//         eventList.appendChild(listItem);
//     });
// }
async function loadEventInfo() {
    const countryCode = document.getElementById('global-country').value;
    if (!countryCode) return;

    const city = document.getElementById('global-city').value;       
    const events = await fetchEventInfo(countryCode, city);          
    currentEvents = events || [];
    if (events) {
        displayEventInfo(events);
        document.getElementById('stat-events').textContent = events.length;   
    }
}

loadEventInfo();



// async function fetchWeatherInfo(latitude, longitude) {
//     try {
//         const response = await fetch(
//             `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,uv_index&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`
//         );
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const data = await response.json();
//         return data;
//     } catch (error) {
//         console.error('Error fetching weather info:', error);
//     }
// }
function getWeatherDescription(code) {
    if (code === 0) return 'Clear Sky';
    if (code <= 3) return 'Partly Cloudy';
    if (code <= 48) return 'Foggy';
    if (code <= 57) return 'Drizzle';
    if (code <= 67) return 'Rain';
    if (code <= 77) return 'Snow';
    if (code <= 82) return 'Rain Showers';
    if (code <= 86) return 'Snow Showers';
    if (code <= 99) return 'Thunderstorm';

    return 'Unknown';
}
    // function displayWeatherInfo(weather, countryName) {
    //     const weatherInfo = document.getElementById('weather-content');

    //     weatherInfo.innerHTML = `
    //     <div class="dashboard-weather-header">
    //       <h3>${countryName}</h3>
    //       <p class="weather-description">
    //         ${getWeatherDescription(weather.current.weather_code)}
    //       </p>
    //     </div>

    //     <div class="dashboard-weather-details">
    //       <div class="dashboard-weather-detail">
    //         <i class="fa-solid fa-temperature-high"></i>
    //         <span class="label">Temperature</span>
    //         <span class="value">${weather.current.temperature_2m} °C</span>
    //       </div>
    //        <div class="dashboard-weather-detail">
    //   <i class="fa-solid fa-temperature-half"></i>
    //   <span class="label">Feels Like</span>
    //   <span class="value">${weather.current.apparent_temperature} °C</span>
    // </div>
    //       <div class="dashboard-weather-detail">
    //         <i class="fa-solid fa-wind"></i>
    //         <span class="label">Wind Speed</span>
    //         <span class="value">${weather.current.wind_speed_10m} km/h</span>
    //       </div>

    //       <div class="dashboard-weather-detail">
    //         <i class="fa-solid fa-tint"></i>
    //         <span class="label">Humidity</span>
    //         <span class="value">${weather.current.relative_humidity_2m} %</span>
    //       </div>

    //       <div class="dashboard-weather-detail">
    //         <i class="fa-solid fa-sun"></i>
    //         <span class="label">UV Index</span>
    //         <span class="value">${weather.current.uv_index}</span>
    //       </div>
    //       <div class="dashboard-weather-detail">
    //   <i class="fa-solid fa-temperature-arrow-up"></i>
    //   <span class="label">Max Temperature</span>
    //   <span class="value">${weather.daily.temperature_2m_max[0]} °C</span>
    // </div>

    // <div class="dashboard-weather-detail">
    //   <i class="fa-solid fa-temperature-arrow-down"></i>
    //   <span class="label">Min Temperature</span>
    //   <span class="value">${weather.daily.temperature_2m_min[0]} °C</span>
    // </div>
    // <div class="dashboard-weather-detail">
    //   <i class="fa-solid fa-cloud-rain"></i>
    //   <span class="label">Rain Chance</span>
    //   <span class="value">
    //     ${weather.hourly.precipitation_probability[0]} %
    //   </span>
    // </div>
    //       <div class="dashboard-weather-detail">
    //   <i class="fa-solid fa-sun"></i>
    //   <span class="label">Sunrise</span>
    //   <span class="value">
    //     ${new Date(weather.daily.sunrise[0]).toLocaleTimeString('en-US', {
    //         hour: '2-digit',
    //         minute: '2-digit'
    //     })}
    //   </span>
    // </div>

    // <div class="dashboard-weather-detail">
    //   <i class="fa-solid fa-moon"></i>
    //   <span class="label">Sunset</span>
    //   <span class="value">
    //     ${new Date(weather.daily.sunset[0]).toLocaleTimeString('en-US', {
    //         hour: '2-digit',
    //         minute: '2-digit'
    //     })}
    //   </span>
    // </div>
    //     </div>
    //   `;
    // }
    // async function loadWeatherInfo() {
    //     const countryCode = document.getElementById('global-country').value;
    //     if (!countryCode) return;
    //     const country = await fetchCountryInfo(countryCode);

    //     if (country && country.latlng) {
    //         const latitude = country.latlng[0];
    //         const longitude = country.latlng[1];

    //         const weather = await fetchWeatherInfo(latitude, longitude);

    //         if (weather) {
    //             displayWeatherInfo(weather, country.name.common);
    //         }
    //     }
    // }

// loadWeatherInfo();


async function fetchweekdayHolidays(countryCode, year) {
    try {
        const response = await fetch(
            `https://date.nager.at/api/v3/LongWeekend/${year}/${countryCode}`
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error fetching weekday holidays:', error);
        return [];
    }
 }
// function displayLongWeekends(weekends) {
//     const container = document.getElementById('lw-content');

//     container.innerHTML = '';

//     weekends.forEach((weekend, index) => {
//         const heart = isSaved(`longweekend-${weekend.countryCode}-${weekend.startDate}`) ? 'fa-solid' : 'fa-regular';
//         const startDate = new Date(weekend.startDate + 'T00:00:00');
//         const endDate = new Date(weekend.endDate + 'T00:00:00');



//         const start = startDate.toLocaleDateString('en-US', {
//             month: 'short',
//             day: 'numeric'
//         });

//         const end = endDate.toLocaleDateString('en-US', {
//             month: 'short',
//             day: 'numeric',
//             year: 'numeric'
//         });

//         const card = document.createElement('div');
//         card.className = 'lw-card';

//         card.innerHTML = `
//       <div class="lw-card-header">
//         <span class="lw-badge">
//           <i class="fa-solid fa-calendar-days"></i>
//           ${weekend.dayCount} Days
//         </span>
//         <button class="holiday-action-btn" data-save="longweekend" data-index="${index}">
//     <i class="${heart} fa-heart"></i>
//   </button>
//       </div>

//       <h3>Long Weekend #${index + 1}</h3>

//       <div class="lw-dates">
//         <i class="fa-regular fa-calendar"></i>
//         ${start} - ${end}
//       </div>

//       <div class="lw-info-box ${weekend.needBridgeDay ? 'warning' : 'success'}">
//         <i class="fa-solid ${weekend.needBridgeDay ? 'fa-info-circle' : 'fa-check-circle'}"></i>
//         ${weekend.needBridgeDay
//                 ? 'Requires taking a bridge day off'
//                 : 'No extra days off needed!'}
//       </div>
//     `;

//         container.appendChild(card);
//     });
// }
async function loadLongWeekends() {
    const countryCode = document.getElementById('global-country').value;
    const year = document.getElementById('global-year').value;

    if (!countryCode || !year) {
        return;
    }

    const weekends = await fetchweekdayHolidays(countryCode, year);
    weekends.forEach(w => { w.countryCode = countryCode; });
    currentWeekends = weekends;
    displayLongWeekends(weekends);
}


loadLongWeekends();



async function fetchCurrencyInfo(countryCode) {
    try {
        const response = await fetch(
            "https://api.frankfurter.dev/v1/latest?base=USD"
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        return data.rates || {};

    } catch (error) {
        console.error('Error fetching currency info:', error);
        return {};
    }
}

function displayCurrencyInfo(currencies) {
    const currencyList = document.getElementById('dashboard-currency-info');

    currencyList.innerHTML = '';

    Object.entries(currencies).forEach(([code, rate]) => {
        const listItem = document.createElement('div');

        listItem.className = 'dashboard-currency-card';

        listItem.innerHTML = `
      <h3>${code}</h3>
      <p class="currency-symbol">
        1 USD = ${rate} ${code}
      </p>
    `;

        currencyList.appendChild(listItem);
    });
}
async function loadCurrencyInfo() {
    const countryCode = document.getElementById('global-country').value;

    // Get selected country information
    const country = await fetchCountryInfo(countryCode);

    if (!country || !country.currencies) {
        return;
    }

    // Get exchange rates
    const rates = await fetchCurrencyInfo();

    if (!rates) {
        return;
    }

    // Get country's currency code
    const currencyCode = Object.keys(country.currencies)[0];

    // Get currency rate
    const rate = rates[currencyCode];

    if (rate) {
        displayCurrencyInfo({
            [currencyCode]: rate
        });
    }
}


loadCurrencyInfo();


async function fetchSuntimesInfo(latitude, longitude) {
    try {
        const response = await fetch(
            `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&formatted=0`
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.status !== 'OK') {
            throw new Error('Unable to fetch sunrise and sunset data');
        }
        return data.results;
    } catch (error) {
        console.error('Error fetching suntimes info:', error);
    }
}

// function displaySuntimesInfo(suntimes, countryName, timezone) {
//     const suntimesInfo = document.getElementById('sun-times-content');

//     suntimesInfo.innerHTML = `
//     <h3>${countryName}</h3>

//     <div class="dashboard-suntimes-detail">
//       <i class="fa-solid fa-sun"></i>
//       <span class="label">Sunrise</span>
//       <span class="value">
//         ${new Date(suntimes.sunrise).toLocaleTimeString('en-US', {
//         hour: '2-digit',
//         minute: '2-digit',
//         timeZone: timezone
//     })}
//       </span>
//     </div>

//     <div class="dashboard-suntimes-detail">
//       <i class="fa-solid fa-moon"></i>
//       <span class="label">Sunset</span>
//       <span class="value">
//         ${new Date(suntimes.sunset).toLocaleTimeString('en-US', {
//         hour: '2-digit',
//         minute: '2-digit',
//         timeZone: timezone
//     })}
//       </span>
//     </div>

//     <div class="dashboard-suntimes-detail">
//       <i class="fa-regular fa-clock"></i>
//       <span class="label">Day Length</span>
//       <span class="value">
//         ${suntimes.day_length
//             ? `${Math.floor(suntimes.day_length / 3600)}h ${Math.floor((suntimes.day_length % 3600) / 60)}m`
//             : 'N/A'}
//       </span>
//     </div>
//   `;
// }

// async function loadSuntimesInfo() {
//     const countryCode = document.getElementById('global-country').value;
//     if (!countryCode) return;
//     const country = await fetchCountryInfo(countryCode);

//     if (country && country.latlng) {
//         const latitude = country.latlng[0];
//         const longitude = country.latlng[1];

//         const suntimes = await fetchSuntimesInfo(latitude, longitude);
//         const weather = await fetchWeatherInfo(latitude, longitude);

//         if (suntimes && weather) {
//             displaySuntimesInfo(suntimes, country.name.common, weather.timezone);
//         }
//     }
// }

// loadSuntimesInfo();



let savedPlans = JSON.parse(localStorage.getItem('savedPlans')) || [];

let currentFilter = 'all';


function updateSavedPlans() {
    localStorage.setItem('savedPlans', JSON.stringify(savedPlans));
}


function savePlan(type, title, date, description = '') {

    const plan = {
        id: Date.now(),
        type: type,
        title: title,
        date: date,
        description: description
    };

    savedPlans.push(plan);

    updateSavedPlans();
    refreshAll();
}


function displaySavedPlans() {

    const plansContent = document.getElementById('plans-content');

    plansContent.innerHTML = '';

    const filteredPlans = currentFilter === 'all'
        ? savedPlans
        : savedPlans.filter(plan => plan.type === currentFilter);

    if (filteredPlans.length === 0) {

        plansContent.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <i class="fa-solid fa-heart-crack"></i>
        </div>

        <h3>No Saved Plans Yet</h3>

        <p>
          Start exploring and save holidays, events, or long weekends you like!
        </p>

        <button class="btn-primary" id="start-exploring-btn">
          <i class="fa-solid fa-compass"></i>
          Start Exploring
        </button>
      </div>
    `;

        updatePlanCounts();
        return;
    }

    filteredPlans.forEach(plan => {

        const card = document.createElement('div');

        card.className = 'lw-card';

        card.innerHTML = `
      <div class="lw-card-header">

        <span class="lw-badge">
          ${plan.type}
        </span>

        <button class="delete-plan-btn" data-id="${plan.id}">
          <i class="fa-solid fa-trash"></i>
        </button>

      </div>

      <h3>${plan.title}</h3>

      <div class="lw-dates">
        <i class="fa-regular fa-calendar"></i>
        ${plan.date || 'Date not available'}
      </div>

      <p>${plan.description}</p>

    `;

        plansContent.appendChild(card);

    });

    updatePlanCounts();
}


function updatePlanCounts() {

    document.getElementById('filter-all-count').textContent =
        savedPlans.length;

    document.getElementById('filter-holiday-count').textContent =
        savedPlans.filter(plan => plan.type === 'holiday').length;

    document.getElementById('filter-event-count').textContent =
        savedPlans.filter(plan => plan.type === 'event').length;

    document.getElementById('filter-lw-count').textContent =
        savedPlans.filter(plan => plan.type === 'longweekend').length;

    const badge = document.getElementById('plans-count');
    badge.textContent = savedPlans.length;
    badge.classList.toggle('hidden', savedPlans.length === 0);

    document.getElementById('stat-saved').textContent = savedPlans.length;
}


const planFilterButtons = document.querySelectorAll('.plan-filter');

planFilterButtons.forEach(button => {

    button.addEventListener('click', () => {

        planFilterButtons.forEach(btn => {
            btn.classList.remove('active');
        });

        button.classList.add('active');

        currentFilter = button.dataset.filter;

        displaySavedPlans();

    });

});


document.getElementById('plans-content').addEventListener('click', event => {

    const deleteButton = event.target.closest('.delete-plan-btn');

    if (deleteButton) {

        const planId = deleteButton.dataset.id;

        savedPlans = savedPlans.filter(plan => plan.id !== planId);

        updateSavedPlans();
        refreshAll();

    }

});


document.getElementById('clear-all-plans-btn').addEventListener('click', () => {

    if (savedPlans.length === 0) {
        return;
    }

    const confirmDelete = confirm('Are you sure you want to delete all saved plans?');

    if (confirmDelete) {

        savedPlans = [];

        updateSavedPlans();
        displaySavedPlans();

    }

});


document.getElementById('plans-content').addEventListener('click', event => {

    if (event.target.closest('#start-exploring-btn')) {

        document.querySelector('[data-view="dashboard"]').click();

    }

});


displaySavedPlans();




async function loadCities() {
    const countryCode = document.getElementById('global-country').value;
    if (!countryCode) return;

    const country = await fetchCountryInfo(countryCode);
    if (!country) return;

    const capital = country.capital?.[0] || 'N/A';
    const citySelect = document.getElementById('global-city');

    citySelect.innerHTML = '';

    const option = document.createElement('option');
    option.value = capital;
    option.textContent = capital;
    citySelect.appendChild(option);
}

document.getElementById('global-country').addEventListener('change', loadCities);
loadCities();




function updateSelectedDestination() {
    const select = document.getElementById('global-country');
    const countryCode = select.value;
    if (!countryCode) return;

    const countryName = select.options[select.selectedIndex].textContent.split(' (')[0];
    const city = document.getElementById('global-city').value;
    const year = document.getElementById('global-year').value;

    // الصندوق اللي في الـ Dashboard
    document.getElementById('selected-country-flag').src =
        `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`;
    document.getElementById('selected-country-name').textContent = countryName;
    document.getElementById('selected-city-name').textContent = `• ${city}`;
    document.getElementById('selected-destination').classList.remove('hidden');

    // الـ badges في باقي الصفحات
    document.querySelectorAll('.current-selection-badge').forEach(badge => {
        const hasCity = badge.querySelector('.selection-city');
        const hasYear = badge.querySelector('.selection-year');

        badge.innerHTML = `
      <img src="https://flagcdn.com/w40/${countryCode.toLowerCase()}.png" alt="${countryName}" class="selection-flag">
      <span>${countryName}</span>
      ${hasCity ? `<span class="selection-city">• ${city}</span>` : ''}
      ${hasYear ? `<span class="selection-year">${year}</span>` : ''}
    `;
    });
}

document.getElementById('global-search-btn').addEventListener('click', async () => {
    const countryCode = document.getElementById('global-country').value;

    if (!countryCode) {
        Swal.fire('Please select a country first');
        return;
    }

    const loading = document.getElementById('loading-overlay');
    loading.classList.remove('hidden');

    try {
        await loadCities();            
        await loadCountryInfo();
        await loadHolidays();
        await loadLongWeekends();
        await loadEventInfo();
        await loadWeatherInfo();
        await loadSuntimesInfo();

        updateSelectedDestination();
    } finally {
        loading.classList.add('hidden');  
    }
});

document.getElementById('clear-selection-btn').addEventListener('click', () => {
    document.getElementById('global-country').value = '';
    document.getElementById('selected-destination').classList.add('hidden');
});



function buildPlan(type, index) {
    if (type === 'holiday') {
        const h = currentHolidays[index];
        return {
            id: `holiday-${h.date}`,
            type: 'holiday',
            title: h.localName,
            date: h.date,
            description: h.name
        };
    }

    if (type === 'event') {
        const e = currentEvents[index];
        return {
            id: `event-${e.id}`,
            type: 'event',
            title: e.name,
            date: e.dates.start.localDate,
            description: e._embedded?.venues?.[0]?.name || ''
        };
    }

    const w = currentWeekends[index];
    return {
        id: `longweekend-${w.startDate}`,
        type: 'longweekend',
        title: `Long Weekend (${w.dayCount} days)`,
        date: `${w.startDate} → ${w.endDate}`,
        description: w.needBridgeDay ? 'Requires a bridge day off' : 'No extra days off needed'
    };
}

function togglePlan(type, index) {
    const plan = buildPlan(type, index);

    if (isSaved(plan.id)) {
        savedPlans = savedPlans.filter(p => p.id !== plan.id);
    } else {
        savedPlans.push(plan);
    }

    updateSavedPlans();
    refreshAll();
}

function refreshAll() {
    displayHolidays(currentHolidays);
    displayEventInfo(currentEvents);
    displayLongWeekends(currentWeekends);
    displaySavedPlans();
}

document.addEventListener('click', event => {
    const saveButton = event.target.closest('[data-save]');
    if (saveButton) {
        togglePlan(saveButton.dataset.save, Number(saveButton.dataset.index));
    }
});


function getSelectedCity() {
    return document.getElementById('global-city').value || '';
}

function getSelectedCountryName() {
    const select = document.getElementById('global-country');
    if (select.selectedIndex < 0) return '';
    return select.options[select.selectedIndex].textContent.split(' (')[0];
}

function getCoordinates(country) {
    if (country.capitalInfo && country.capitalInfo.latlng) {
        return country.capitalInfo.latlng;
    }
    return country.latlng;
}

function weatherMeta(code) {
    if (code === 0) return { text: 'Clear sky', icon: 'fa-sun', css: 'weather-sunny' };
    if (code <= 2) return { text: 'Partly cloudy', icon: 'fa-cloud-sun', css: 'weather-cloudy' };
    if (code === 3) return { text: 'Overcast', icon: 'fa-cloud', css: 'weather-cloudy' };
    if (code <= 48) return { text: 'Foggy', icon: 'fa-smog', css: 'weather-cloudy' };
    if (code <= 67) return { text: 'Rain', icon: 'fa-cloud-rain', css: 'weather-rainy' };
    if (code <= 77) return { text: 'Snow', icon: 'fa-snowflake', css: 'weather-snowy' };
    if (code <= 82) return { text: 'Rain showers', icon: 'fa-cloud-showers-heavy', css: 'weather-rainy' };
    if (code <= 86) return { text: 'Snow showers', icon: 'fa-snowflake', css: 'weather-snowy' };
    return { text: 'Thunderstorm', icon: 'fa-cloud-bolt', css: 'weather-stormy' };
}



async function fetchCountryInfo(countryCode) {
    if (!countryCode) {
        console.warn("Country code is missing");
        return null;
    }

    try {
        const response = await fetch(
            `https://api.restcountries.com/countries/v5/codes.alpha_2/${countryCode.trim().toUpperCase()}`,
            {
                headers: {
                    Authorization: `Bearer ${REST_COUNTRIES_API_KEY}`
                }
            }
        );

        if (!response.ok) {
            const errorDetails = await response.json();
            console.error("API Error Details:", errorDetails);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const country = result.data?.objects?.[0];

        if (!country) return null;

        // Convert currencies
        const currencies = Array.isArray(country.currencies)
            ? Object.fromEntries(
                country.currencies.map(c => [
                    c.code,
                    { name: c.name, symbol: c.symbol }
                ])
            )
            : country.currencies || {};

        // Convert languages
        const languages = Array.isArray(country.languages)
            ? Object.fromEntries(
                country.languages.map((lang, index) => [
                    lang.code || index,
                    lang.name || lang.english_name || lang.native_name || ""
                ])
            )
            : country.languages || {};

        // Convert country data to the old structure
        return {
            name: {
                common: country.names?.common || "Unknown",
                official: country.names?.official || "Unknown"
            },

            flags: {
                png: country.flag?.url_png || "",
                svg: country.flag?.url_svg || ""
            },

            currencies: currencies,
            languages: languages,
            borders: country.borders || [],

            idd: {
                root: country.calling_codes?.[0] || "",
                suffixes: []
            },

            startOfWeek: country.date?.start_of_week || "monday",
            timezones: country.timezones || [],

            capital: (country.capitals || []).map(c => c.name),

            population: country.population || 0,
            area: country.area?.kilometers || 0,
            continents: country.continents || [],

            region: country.region || "",
            subregion: country.subregion || "",

            car: {
                side: country.cars?.driving_side || "N/A"
            },

            maps: {
                googleMaps: country.coordinates
                    ? `https://www.google.com/maps?q=${country.coordinates.lat},${country.coordinates.lng}`
                    : "#"
            }
        };

    } catch (error) {
        console.error("Error fetching country info:", error);
        return null;
    }
}

function updateCountryClock() {
    const el = document.getElementById('country-local-time');
    if (!el) return;

    const match = /UTC([+-])(\d{2}):(\d{2})/.exec(window.countryTimezone || '');
    let offsetMinutes = 0;
    if (match) {
        const sign = match[1] === '-' ? -1 : 1;
        offsetMinutes = sign * (Number(match[2]) * 60 + Number(match[3]));
    }

    const time = new Date(Date.now() + offsetMinutes * 60000);
    el.textContent = time.toLocaleTimeString('en-US', { timeZone: 'UTC' });
}
setInterval(updateCountryClock, 1000);



function displayEventInfo(events) {
    const eventList = document.getElementById('events-content');
    eventList.innerHTML = '';

    if (!events || events.length === 0) {
        eventList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"><i class="fa-solid fa-ticket"></i></div>
        <h3>No events found</h3>
        <p>Try another country or city.</p>
      </div>`;
        return;
    }

    events.forEach((event, index) => {
        const date = new Date(event.dates.start.localDate + 'T00:00:00');
        const dateText = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const time = event.dates.start.localTime ? ` at ${event.dates.start.localTime.slice(0, 5)}` : '';
        const image = event.images?.[0]?.url || '';
        const category = event.classifications?.[0]?.segment?.name || 'Event';
        const venue = event._embedded?.venues?.[0]?.name || 'Location not available';
        const heart = isSaved(`event-${event.id}`) ? 'fa-solid' : 'fa-regular';

        const card = document.createElement('div');
        card.className = 'event-card';

        card.innerHTML = `
      <div class="event-card-image">
        <img src="${image}" alt="${event.name}">
        <span class="event-card-category">${category}</span>
        <button class="event-card-save" data-save="event" data-index="${index}">
          <i class="${heart} fa-heart"></i>
        </button>
      </div>
      <div class="event-card-body">
        <h3>${event.name}</h3>
        <div class="event-card-info">
          <div><i class="fa-regular fa-calendar"></i>${dateText}${time}</div>
          <div><i class="fa-solid fa-location-dot"></i>${venue}, ${getSelectedCity()}</div>
        </div>
        <div class="event-card-footer">
          <button class="btn-event" data-save="event" data-index="${index}">
            <i class="${heart} fa-heart"></i> Save
          </button>
          <a href="${event.url}" target="_blank" class="btn-buy-ticket">
            <i class="fa-solid fa-ticket"></i> Buy Tickets
          </a>
        </div>
      </div>
    `;

        eventList.appendChild(card);
    });
}



async function fetchWeatherInfo(latitude, longitude) {
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
            `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
            `&hourly=temperature_2m,weather_code` +
            `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max` +
            `&timezone=auto&forecast_days=7`
        );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching weather info:', error);
    }
}

function displayWeatherInfo(weather) {
    const container = document.getElementById('weather-content');
    const now = weather.current;
    const daily = weather.daily;
    const hourly = weather.hourly;
    const meta = weatherMeta(now.weather_code);
    const today = new Date(daily.time[0] + 'T00:00:00');

    let start = 0;
    for (let i = 0; i < hourly.time.length; i++) {
        if (hourly.time[i] >= now.time) {
            start = i;
            break;
        }
    }

    let hoursHtml = '';
    for (let i = start; i < start + 8 && i < hourly.time.length; i++) {
        const hMeta = weatherMeta(hourly.weather_code[i]);
        const label = i === start
            ? 'Now'
            : new Date(hourly.time[i]).toLocaleTimeString('en-US', { hour: 'numeric' });

        hoursHtml += `
      <div class="hourly-item ${i === start ? 'now' : ''}">
        <span class="hourly-time">${label}</span>
        <div class="hourly-icon"><i class="fa-solid ${hMeta.icon}"></i></div>
        <span class="hourly-temp">${Math.round(hourly.temperature_2m[i])}°</span>
      </div>`;
    }

    // الـ 7 أيام
    let daysHtml = '';
    for (let i = 0; i < daily.time.length; i++) {
        const dMeta = weatherMeta(daily.weather_code[i]);
        const date = new Date(daily.time[i] + 'T00:00:00');
        const rain = daily.precipitation_probability_max[i];

        daysHtml += `
      <div class="forecast-day ${i === 0 ? 'today' : ''}">
        <div class="forecast-day-name">
          <span class="day-label">${i === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
          <span class="day-date">${date.getDate()} ${date.toLocaleDateString('en-US', { month: 'short' })}</span>
        </div>
        <div class="forecast-icon"><i class="fa-solid ${dMeta.icon}"></i></div>
        <div class="forecast-temps">
          <span class="temp-max">${Math.round(daily.temperature_2m_max[i])}°</span>
          <span class="temp-min">${Math.round(daily.temperature_2m_min[i])}°</span>
        </div>
        <div class="forecast-precip">
          ${rain > 0 ? `<i class="fa-solid fa-droplet"></i><span>${rain}%</span>` : ''}
        </div>
      </div>`;
    }

    container.innerHTML = `
    <div class="weather-hero-card ${meta.css}">
      <div class="weather-location">
        <i class="fa-solid fa-location-dot"></i>
        <span>${getSelectedCity()}</span>
        <span class="weather-time">${today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
      </div>
      <div class="weather-hero-main">
        <div class="weather-hero-left">
          <div class="weather-hero-icon"><i class="fa-solid ${meta.icon}"></i></div>
          <div class="weather-hero-temp">
            <span class="temp-value">${Math.round(now.temperature_2m)}</span>
            <span class="temp-unit">°C</span>
          </div>
        </div>
        <div class="weather-hero-right">
          <div class="weather-condition">${meta.text}</div>
          <div class="weather-feels">Feels like ${Math.round(now.apparent_temperature)}°C</div>
          <div class="weather-high-low">
            <span class="high"><i class="fa-solid fa-arrow-up"></i> ${Math.round(daily.temperature_2m_max[0])}°</span>
            <span class="low"><i class="fa-solid fa-arrow-down"></i> ${Math.round(daily.temperature_2m_min[0])}°</span>
          </div>
        </div>
      </div>
    </div>

    <div class="weather-details-grid">
      <div class="weather-detail-card">
        <div class="detail-icon humidity"><i class="fa-solid fa-droplet"></i></div>
        <div class="detail-info"><span class="detail-label">Humidity</span><span class="detail-value">${now.relative_humidity_2m}%</span></div>
      </div>
      <div class="weather-detail-card">
        <div class="detail-icon wind"><i class="fa-solid fa-wind"></i></div>
        <div class="detail-info"><span class="detail-label">Wind</span><span class="detail-value">${now.wind_speed_10m} km/h</span></div>
      </div>
      <div class="weather-detail-card">
        <div class="detail-icon uv"><i class="fa-solid fa-sun"></i></div>
        <div class="detail-info"><span class="detail-label">UV Index</span><span class="detail-value">${daily.uv_index_max[0]}</span></div>
      </div>
      <div class="weather-detail-card">
        <div class="detail-icon precip"><i class="fa-solid fa-cloud-rain"></i></div>
        <div class="detail-info"><span class="detail-label">Precipitation</span><span class="detail-value">${daily.precipitation_probability_max[0]}%</span></div>
      </div>
    </div>

    <div class="weather-section">
      <h3 class="weather-section-title"><i class="fa-solid fa-clock"></i> Hourly Forecast</h3>
      <div class="hourly-scroll">${hoursHtml}</div>
    </div>

    <div class="weather-section">
      <h3 class="weather-section-title"><i class="fa-solid fa-calendar-week"></i> 7-Day Forecast</h3>
      <div class="forecast-list">${daysHtml}</div>
    </div>
  `;
}

async function loadWeatherInfo() {
    const countryCode = document.getElementById('global-country').value;
    if (!countryCode) return;

    const country = await fetchCountryInfo(countryCode);
    if (!country) return;

    const coords = getCoordinates(country);
    const weather = await fetchWeatherInfo(coords[0], coords[1]);

    if (weather) {
        displayWeatherInfo(weather);
    }
}



function displayLongWeekends(weekends) {
    const container = document.getElementById('lw-content');
    container.innerHTML = '';

    const arabCountries = ['EG', 'SA', 'AE', 'KW', 'QA', 'BH', 'OM', 'JO', 'IQ', 'DZ'];
    const countryCode = document.getElementById('global-country').value;
    const weekendDays = arabCountries.includes(countryCode) ? [5, 6] : [6, 0];

    weekends.forEach((weekend, index) => {
        const startDate = new Date(weekend.startDate + 'T00:00:00');
        const endDate = new Date(weekend.endDate + 'T00:00:00');
        const heart = isSaved(`longweekend-${weekend.startDate}`) ? 'fa-solid' : 'fa-regular';

        const start = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const end = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        let daysHtml = '';
        const day = new Date(startDate);
        while (day <= endDate) {
            const isWeekend = weekendDays.includes(day.getDay());
            daysHtml += `
        <div class="lw-day ${isWeekend ? 'weekend' : ''}">
          <span class="name">${day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
          <span class="num">${day.getDate()}</span>
        </div>`;
            day.setDate(day.getDate() + 1);
        }

        const card = document.createElement('div');
        card.className = 'lw-card';

        card.innerHTML = `
      <div class="lw-card-header">
        <span class="lw-badge"><i class="fa-solid fa-calendar-days"></i> ${weekend.dayCount} Days</span>
        <button class="holiday-action-btn" data-save="longweekend" data-index="${index}">
          <i class="${heart} fa-heart"></i>
        </button>
      </div>

      <h3>Long Weekend #${index + 1}</h3>

      <div class="lw-dates"><i class="fa-regular fa-calendar"></i> ${start} - ${end}</div>

      <div class="lw-info-box ${weekend.needBridgeDay ? 'warning' : 'success'}">
        <i class="fa-solid ${weekend.needBridgeDay ? 'fa-info-circle' : 'fa-check-circle'}"></i>
        ${weekend.needBridgeDay ? 'Requires taking a bridge day off' : 'No extra days off needed!'}
      </div>

      <div class="lw-days-visual">${daysHtml}</div>
    `;

        container.appendChild(card);
    });
}



function displaySuntimesInfo(suntimes, countryName, timezone) {
    const container = document.getElementById('sun-times-content');

    const fmt = iso => new Date(iso).toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', timeZone: timezone
    });

    const total = suntimes.day_length;
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const percent = ((total / 86400) * 100).toFixed(1);
    const dark = 86400 - total;
    const darkHours = Math.floor(dark / 3600);
    const darkMinutes = Math.floor((dark % 3600) / 60);
    const today = new Date();

    container.innerHTML = `
    <div class="sun-main-card">
      <div class="sun-main-header">
        <div class="sun-location">
          <h2><i class="fa-solid fa-location-dot"></i> ${getSelectedCity() || countryName}</h2>
          <p>Sun times for your selected location</p>
        </div>
        <div class="sun-date-display">
          <div class="date">${today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
          <div class="day">${today.toLocaleDateString('en-US', { weekday: 'long' })}</div>
        </div>
      </div>

      <div class="sun-times-grid">
        <div class="sun-time-card dawn"><div class="icon"><i class="fa-solid fa-moon"></i></div><div class="label">Dawn</div><div class="time">${fmt(suntimes.civil_twilight_begin)}</div><div class="sub-label">Civil Twilight</div></div>
        <div class="sun-time-card sunrise"><div class="icon"><i class="fa-solid fa-sun"></i></div><div class="label">Sunrise</div><div class="time">${fmt(suntimes.sunrise)}</div><div class="sub-label">Golden Hour Start</div></div>
        <div class="sun-time-card noon"><div class="icon"><i class="fa-solid fa-sun"></i></div><div class="label">Solar Noon</div><div class="time">${fmt(suntimes.solar_noon)}</div><div class="sub-label">Sun at Highest</div></div>
        <div class="sun-time-card sunset"><div class="icon"><i class="fa-solid fa-sun"></i></div><div class="label">Sunset</div><div class="time">${fmt(suntimes.sunset)}</div><div class="sub-label">Golden Hour End</div></div>
        <div class="sun-time-card dusk"><div class="icon"><i class="fa-solid fa-moon"></i></div><div class="label">Dusk</div><div class="time">${fmt(suntimes.civil_twilight_end)}</div><div class="sub-label">Civil Twilight</div></div>
        <div class="sun-time-card daylight"><div class="icon"><i class="fa-solid fa-hourglass-half"></i></div><div class="label">Day Length</div><div class="time">${hours}h ${minutes}m</div><div class="sub-label">Total Daylight</div></div>
      </div>
    </div>

    <div class="day-length-card">
      <h3><i class="fa-solid fa-chart-pie"></i> Daylight Distribution</h3>
      <div class="day-progress">
        <div class="day-progress-bar"><div class="day-progress-fill" style="width: ${percent}%"></div></div>
      </div>
      <div class="day-length-stats">
        <div class="day-stat"><div class="value">${hours}h ${minutes}m</div><div class="label">Daylight</div></div>
        <div class="day-stat"><div class="value">${percent}%</div><div class="label">of 24 Hours</div></div>
        <div class="day-stat"><div class="value">${darkHours}h ${darkMinutes}m</div><div class="label">Darkness</div></div>
      </div>
    </div>
  `;
}

async function loadSuntimesInfo() {
    const countryCode = document.getElementById('global-country').value;
    if (!countryCode) return;

    const country = await fetchCountryInfo(countryCode);
    if (!country) return;

    const coords = getCoordinates(country);
    const suntimes = await fetchSuntimesInfo(coords[0], coords[1]);
    const weather = await fetchWeatherInfo(coords[0], coords[1]);   // عشان نجيب الـ timezone

    if (suntimes) {
        displaySuntimesInfo(suntimes, country.name.common, weather ? weather.timezone : undefined);
    }
}



async function initCurrencyPage() {
    const rates = await fetchCurrencyInfo();

    if (!rates || Object.keys(rates).length === 0) {
        Swal.fire('Error', 'Could not load exchange rates', 'error');
        return;
    }

    window.currencyRates = rates;

    let names = null;
    try {
        names = new Intl.DisplayNames(['en'], { type: 'currency' });
    } catch (error) {
        names = null;
    }

    const getName = code => {
        try {
            return names ? names.of(code) : code;
        } catch (error) {
            return code;
        }
    };

    const codes = Object.keys(rates).sort();
    const options = codes.map(code => `<option value="${code}">${code} - ${getName(code)}</option>`).join('');

    document.getElementById('currency-from').innerHTML = options;
    document.getElementById('currency-to').innerHTML = options;
    document.getElementById('currency-from').value = 'USD';
    document.getElementById('currency-to').value = rates['EGP'] ? 'EGP' : codes[0];

    const popular = [
        { code: 'EUR', name: 'Euro', flag: 'eu' },
        { code: 'GBP', name: 'British Pound', flag: 'gb' },
        { code: 'EGP', name: 'Egyptian Pound', flag: 'eg' },
        { code: 'AED', name: 'UAE Dirham', flag: 'ae' },
        { code: 'SAR', name: 'Saudi Riyal', flag: 'sa' },
        { code: 'JPY', name: 'Japanese Yen', flag: 'jp' },
        { code: 'CAD', name: 'Canadian Dollar', flag: 'ca' },
        { code: 'INR', name: 'Indian Rupee', flag: 'in' }
    ];

    document.getElementById('popular-currencies').innerHTML = popular
        .filter(item => rates[item.code])
        .map(item => `
      <div class="popular-currency-card">
        <img src="https://flagcdn.com/w40/${item.flag}.png" alt="${item.code}" class="flag">
        <div class="info"><div class="code">${item.code}</div><div class="name">${item.name}</div></div>
        <div class="rate">${rates[item.code].toFixed(4)}</div>
      </div>`)
        .join('');

    convertCurrency();
}

function convertCurrency() {
    const rates = window.currencyRates;
    if (!rates) return;

    const amount = Number(document.getElementById('currency-amount').value) || 0;
    const from = document.getElementById('currency-from').value;
    const to = document.getElementById('currency-to').value;

    if (!rates[from] || !rates[to]) return;

    const rate = rates[to] / rates[from];
    const result = amount * rate;

    document.getElementById('currency-result').innerHTML = `
    <div class="conversion-display">
      <div class="conversion-from">
        <span class="amount">${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        <span class="currency-code">${from}</span>
      </div>
      <div class="conversion-equals"><i class="fa-solid fa-equals"></i></div>
      <div class="conversion-to">
        <span class="amount">${result.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        <span class="currency-code">${to}</span>
      </div>
    </div>
    <div class="exchange-rate-info">
      <p>1 ${from} = ${rate.toFixed(4)} ${to}</p>
      <small>Last updated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</small>
    </div>
  `;
}

function swapCurrencies() {
    const from = document.getElementById('currency-from');
    const to = document.getElementById('currency-to');
    const temp = from.value;
    from.value = to.value;
    to.value = temp;
    convertCurrency();
}

// async function loadCurrencyInfo() {
//     const countryCode = document.getElementById('global-country').value;
//     if (!countryCode) return;

//     const country = await fetchCountryInfo(countryCode);
//     if (!country || !country.currencies) return;

//     const code = Object.keys(country.currencies)[0];
//     const toSelect = document.getElementById('currency-to');

//     if (toSelect.querySelector(`option[value="${code}"]`)) {
//         toSelect.value = code;
//         convertCurrency();
//     }
// }

document.getElementById('convert-btn').addEventListener('click', convertCurrency);
document.getElementById('swap-currencies-btn').addEventListener('click', swapCurrencies);
document.getElementById('currency-amount').addEventListener('input', convertCurrency);
document.getElementById('currency-from').addEventListener('change', convertCurrency);
document.getElementById('currency-to').addEventListener('change', convertCurrency);
document.getElementById('global-search-btn').addEventListener('click', loadCurrencyInfo);

initCurrencyPage();




const viewTitles = {
    'dashboard': ['Dashboard', 'Welcome back! Ready to plan your next adventure?'],
    'holidays': ['Holidays', 'Public holidays for your destination'],
    'events': ['Events', 'Concerts, sports, theatre and more'],
    'weather': ['Weather', '7-day weather forecast'],
    'long-weekends': ['Long Weekends', 'Plan mini-trips around holidays'],
    'currency': ['Currency', 'Convert with live exchange rates'],
    'sun-times': ['Sun Times', 'Sunrise and sunset times'],
    'my-plans': ['My Plans', 'Everything you saved']
};

const viewPaths = {
    'dashboard': '/dashboard',
    'holidays': '/holidays',
    'events': '/events',
    'weather': '/weather',
    'long-weekends': '/long-weekends',
    'currency': '/currency',
    'sun-times': '/sun-times',
    'my-plans': '/plans'
};

function updateHeader(viewName) {
    document.getElementById('page-title').textContent = viewTitles[viewName][0];
    document.getElementById('page-subtitle').textContent = viewTitles[viewName][1];
}

function showViewByName(viewName) {
    if (!viewPaths[viewName]) {
        viewName = 'dashboard';
    }

    document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
    document.getElementById(`${viewName}-view`).classList.add('active');

    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.classList.toggle('active', nav.dataset.view === viewName);
    });

    updateHeader(viewName);

    if (viewName === 'my-plans') {
        displaySavedPlans();
    }
}

function getViewFromPath() {
    for (const name in viewPaths) {
        if (viewPaths[name] === window.location.pathname) {
            return name;
        }
    }
    return 'dashboard';
}

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        const viewName = item.dataset.view;
        updateHeader(viewName);
        history.pushState({ view: viewName }, '', viewPaths[viewName]);
        closeMobileSidebar();
    });
});

window.addEventListener('popstate', () => {
    showViewByName(getViewFromPath());
});

showViewByName(getViewFromPath());

function updateHeaderDateTime() {
    document.getElementById('current-datetime').textContent = new Date().toLocaleString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
}
updateHeaderDateTime();
setInterval(updateHeaderDateTime, 1000);

function closeMobileSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.add('hidden');
}

document.getElementById('mobile-menu-btn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebar-overlay').classList.remove('hidden');
});

document.getElementById('sidebar-overlay').addEventListener('click', closeMobileSidebar);





































