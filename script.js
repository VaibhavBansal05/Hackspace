// Global variables
let currentFlightPlan = null;
let altitudeChart = null;

// --- API & Constants ---
const AWC_API_BASE_URL = 'https://aviationweather.gov/api/data/';
// This path assumes you're deploying on Netlify. Change if using another service.
const YOUR_FUNCTION_URL = '/.netlify/functions/get_journey-briefing';

// Airport database (sample data)
const airportDatabase = {
    'KLAX': { lat: 33.9425, lon: -118.4081, name: 'Los Angeles Intl' },
    'KDEN': { lat: 39.8617, lon: -104.6731, name: 'Denver Intl' },
    'KJFK': { lat: 40.6398, lon: -73.7789, name: 'John F Kennedy Intl' },
    'KORD': { lat: 41.9742, lon: -87.9073, name: 'Chicago OHare' },
    'KATL': { lat: 33.6367, lon: -84.4281, name: 'Atlanta Hartsfield' },
    'KBOS': { lat: 42.3656, lon: -71.0096, name: 'Boston Logan' },
    'KSEA': { lat: 47.4502, lon: -122.3088, name: 'Seattle Tacoma' },
    'KMIA': { lat: 25.7959, lon: -80.2870, name: 'Miami Intl' },
    'KPHX': { lat: 33.4373, lon: -112.0078, name: 'Phoenix Sky Harbor' },
    'KLAS': { lat: 36.0840, lon: -115.1537, name: 'Las Vegas McCarran' }
};

// --- Application Initialization ---
document.addEventListener('DOMContentLoaded', function() {
    initializeTabSwitching();
    initializeEventListeners();
});

// --- UI Functionality ---
function initializeTabSwitching() {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
}

function switchTab(tabName) {
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
    document.getElementById(`${tabName}-tab`).classList.remove('hidden');
}

function initializeEventListeners() {
    // Listen for typing in airport inputs
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('airport-input')) {
            validateAirportInput(e.target);
        }
    });

    // **FIX ADDED**: Connect the button on the "Weather Brief" tab
    document.getElementById('get-weather-btn').addEventListener('click', handleGetWeatherFromTab);
}

// --- Airport Input Management ---
function addAirportInput() {
    const container = document.getElementById('airports-container');
    const index = container.children.length;
    const inputGroup = document.createElement('div');
    inputGroup.className = 'airport-input-group';
    inputGroup.innerHTML = `
        <input type="text" class="airport-input" placeholder="Waypoint ${index - 1} (ICAO)" data-index="${index}">
        <button class="btn remove-btn" onclick="removeAirportInput(this)">×</button>
    `;
    container.appendChild(inputGroup);
}

function removeAirportInput(button) {
    const container = document.getElementById('airports-container');
    if (container.children.length > 2) {
        button.parentElement.remove();
        updateAirportPlaceholders();
    }
}

function updateAirportPlaceholders() {
    const inputs = document.querySelectorAll('#airports-container .airport-input');
    inputs.forEach((input, index) => {
        if (index === 0) input.placeholder = 'Departure Airport (ICAO)';
        else if (index === inputs.length - 1) input.placeholder = 'Arrival Airport (ICAO)';
        else input.placeholder = `Waypoint ${index} (ICAO)`;
        input.dataset.index = index;
    });
}

function validateAirportInput(input) {
    const value = input.value.toUpperCase();
    input.value = value;
    if (value.length === 4 && /^[A-Z]{4}$/.test(value)) {
        input.style.borderColor = '#22c55e';
        if (airportDatabase[value]) input.title = airportDatabase[value].name;
    } else if (value.length > 0) {
        input.style.borderColor = '#ef4444';
        input.title = 'Enter valid 4-letter ICAO code';
    } else {
        input.style.borderColor = '#e5e7eb';
        input.title = '';
    }
}

// --- Core Flight Plan Generation ---
async function generateFlightPlan() {
    const airports = Array.from(document.querySelectorAll('#airports-container .airport-input'))
        .map(input => input.value.trim().toUpperCase()).filter(Boolean);

    if (airports.length < 2) {
        displayError('Please enter at least departure and arrival airports', 'final-summary');
        return;
    }

    const invalidAirports = airports.filter(code => !airportDatabase[code]);
    if (invalidAirports.length > 0) {
        displayError(`Unknown airports: ${invalidAirports.join(', ')}`, 'final-summary');
        return;
    }

    showLoader(true);
    clearPreviousResults();

    try {
        currentFlightPlan = {
            route: airports,
            distance: calculateDistance(airports),
            flightTime: calculateFlightTime(airports),
            fuelRequired: calculateFuelRequired(airports),
            safeAltitudes: generateSafeAltitudes(airports),
        };
        
        // Fetch weather briefing from our serverless function
        const weatherBriefing = await getWeatherBriefing(airports);
        
        // Display all results
        displayFlightPlan(currentFlightPlan);
        displaySummaries(currentFlightPlan);
        updateStatistics(currentFlightPlan);
        displayWeatherBriefing(weatherBriefing);
        
    } catch (error) {
        console.error('Error generating flight plan:', error);
        displayError('Failed to generate flight plan: ' + error.message, 'final-summary');
    } finally {
        showLoader(false);
    }
}

// **FIX ADDED**: Function to handle the weather tab button
async function handleGetWeatherFromTab() {
    const routeString = document.getElementById('route-input').value.trim();
    if (!routeString) {
        displayError("Please enter ICAO codes.", 'final-summary');
        return;
    }
    const icaoCodes = routeString.split(',').map(code => code.trim().toUpperCase()).filter(Boolean);
    
    showLoader(true);
    clearPreviousResults();
    
    try {
        const briefing = await getWeatherBriefing(icaoCodes);
        displayWeatherBriefing(briefing);
    } catch (error) {
        console.error("Error during weather briefing process:", error);
        displayError(error.message, 'final-summary');
    } finally {
        showLoader(false);
    }
}

// --- Weather Briefing Functionality ---
async function getWeatherBriefing(icaoCodes) {
    try {
        const [metarData, tafData, sigmetData] = await Promise.all([
            fetchMetarData(icaoCodes),
            fetchTafData(icaoCodes),
            fetchSigmetData(),
        ]);

        const response = await fetch(YOUR_FUNCTION_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ metarData, tafData, sigmetData, route: icaoCodes })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`The AI briefing server failed: ${errorText}`);
        }
        
        const { summary } = await response.json();
        return { summary, metarData, tafData };

    } catch (error) {
        // Display a non-critical error so the flight plan can still show
        displayError(`Could not retrieve AI weather briefing: ${error.message}`, 'weather-summary');
        return null; // Return null so the calling function knows it failed
    }
}

async function fetchMetarData(icaoCodes) {
    const url = `${AWC_API_BASE_URL}metar?ids=${icaoCodes.join(',')}&format=json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch METAR data. Status: ${response.status}`);
    return await response.json();
}

async function fetchTafData(icaoCodes) {
    const url = `${AWC_API_BASE_URL}taf?ids=${icaoCodes.join(',')}&format=json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch TAF data. Status: ${response.status}`);
    return await response.json();
}

async function fetchSigmetData() {
    const url = `${AWC_API_BASE_URL}airsigmet?format=json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch SIGMET data. Status: ${response.status}`);
    return await response.json();
}


// --- Calculation Functions ---
function calculateDistance(airports) {
    let totalDistance = 0;
    for (let i = 0; i < airports.length - 1; i++) {
        const from = airportDatabase[airports[i]];
        const to = airportDatabase[airports[i + 1]];
        if (from && to) {
            totalDistance += haversineDistance(from.lat, from.lon, to.lat, to.lon);
        }
    }
    return Math.round(totalDistance);
}

function calculateFlightTime(airports) {
    const distance = calculateDistance(airports);
    const aircraftType = document.getElementById('aircraft-type').value;
    const groundSpeed = { 'light': 120, 'turboprop': 200, 'jet': 400, 'airliner': 450 }[aircraftType] || 150;
    return (distance / groundSpeed).toFixed(1);
}

function calculateFuelRequired(airports) {
    const fuelFlow = { 'light': 8, 'turboprop': 40, 'jet': 120, 'airliner': 800 }[document.getElementById('aircraft-type').value] || 12;
    const flightTime = parseFloat(calculateFlightTime(airports));
    return Math.round(fuelFlow * flightTime * 1.3); // 30% reserve
}

function generateSafeAltitudes(airports) {
    const cruiseAlt = parseInt(document.getElementById('cruise-altitude').value);
    return {
        profile: airports.map((_, i) => ({
            altitude: cruiseAlt + (Math.sin(i * 0.5) * 1000), // Simulate minor altitude changes
            distance: i > 0 ? calculateDistance(airports.slice(0, i + 1)) : 0
        }))
    };
}


// --- Display Functions ---
function displayFlightPlan(plan) {
    const mapContainer = document.getElementById('flight-map');
    mapContainer.innerHTML = `
        <div style="padding: 2rem; text-align: center;">
            <h3 style="color: #1e3a8a; margin-bottom: 1rem;">Flight Route</h3>
            <p style="font-weight: 600;">${plan.route.join(' → ')}</p>
        </div>`;
}

function displaySummaries(plan) {
    const summary = `
        Flight from ${plan.route[0]} to ${plan.route[plan.route.length - 1]} covers ${plan.distance}nm, with an estimated time of ${plan.flightTime} hours. 
        Recommended cruise is ${parseInt(document.getElementById('cruise-altitude').value)}ft. Fuel requirement is ${plan.fuelRequired} gallons (30% reserve).`;
    const technical = `<strong>Route:</strong> ${plan.route.join(' → ')} (${plan.distance}nm)<br>
        <strong>Performance:</strong> FL${Math.round(parseInt(document.getElementById('cruise-altitude').value)/100)} @ ${ { 'light': 120, 'turboprop': 200, 'jet': 400, 'airliner': 450 }[document.getElementById('aircraft-type').value] || 150}kts<br>
        <strong>Fuel:</strong> ${plan.fuelRequired}gal total, est. flow ${{ 'light': 8, 'turboprop': 40, 'jet': 120, 'airliner': 800 }[document.getElementById('aircraft-type').value] || 12}gph`;

    document.getElementById('final-summary').innerHTML = `
        <div class="summary-card"><h3>📋 Flight Plan Summary</h3><p>${summary}</p></div>
        <div class="technical-summary"><h4>🔧 Technical Brief</h4><p>${technical}</p></div>`;
}

function updateStatistics(plan) {
    document.getElementById('total-distance').textContent = plan.distance;
    document.getElementById('flight-time').textContent = plan.flightTime + 'h';
    document.getElementById('fuel-required').textContent = plan.fuelRequired;
    updateAltitudeChart(plan.safeAltitudes.profile);
}

function updateAltitudeChart(profile) {
    const ctx = document.getElementById('altitude-chart').getContext('2d');
    if (altitudeChart) altitudeChart.destroy();
    altitudeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: profile.map((p, i) => i === 0 ? 'DEP' : i === profile.length - 1 ? 'ARR' : `WPT${i}`),
            datasets: [{
                label: 'Flight Altitude (ft)',
                data: profile.map(p => Math.round(p.altitude)),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        }
    });
}

function displayWeatherBriefing(briefing) {
    if (!briefing) return; // Exit if briefing failed
    const container = document.getElementById('weather-summary');
    let html = displayWeatherAssessment(briefing.summary);
    html += displayMetarCards(briefing.metarData);
    html += displayTafCards(briefing.tafData);
    container.innerHTML = html;
}

function displayWeatherAssessment(summary) {
    let summaryClass = 'alert-info';
    if (summary.includes('Unsafe')) summaryClass = 'alert-danger';
    if (summary.includes('caution')) summaryClass = 'alert-warning';
    if (summary.includes('Safe')) summaryClass = 'alert-success';
    return `<div class="alert ${summaryClass}"><h3>AI Weather Assessment</h3><p>${summary}</p></div>`;
}

function displayMetarCards(metarData) {
    if (!metarData || metarData.length === 0) return '';
    let html = '<h2>Airport Conditions (METAR)</h2>';
    metarData.forEach(metar => {
        const categoryClass = (metar.fltcat || 'N/A').toLowerCase();
        html += `<div class="metar-card ${categoryClass}">
                    <h3><span>${metar.icaoId}</span><span class="flight-category">${metar.fltcat || 'N/A'}</span></h3>
                    <details><summary>View Raw Data</summary><p><code>${metar.rawOb}</code></p></details>
                </div>`;
    });
    return html;
}

function displayTafCards(tafData) {
    if (!tafData || tafData.length === 0) return '';
    let html = '<h2>Airport Forecasts (TAF)</h2>';
    tafData.forEach(taf => {
        html += `<div class="taf-card">
                    <h3>${taf.icaoId}</h3>
                    <details><summary>View Raw Data</summary><p><code>${taf.rawTAF}</code></p></details>
                </div>`;
    });
    return html;
}

// --- Utility Functions ---
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 3440.065; // Nautical miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

function showLoader(show) {
    document.getElementById('loader').classList.toggle('hidden', !show);
}

function clearPreviousResults() {
    document.getElementById('final-summary').innerHTML = '';
    document.getElementById('weather-summary').innerHTML = '';
    document.getElementById('total-distance').textContent = '--';
    document.getElementById('flight-time').textContent = '--';
    document.getElementById('fuel-required').textContent = '--';
    if (altitudeChart) {
        altitudeChart.destroy();
        altitudeChart = null;
    }
}

function displayError(message, elementId) {
    document.getElementById(elementId).innerHTML = `<div class="alert alert-danger"><h3>⚠️ Error</h3><p>${message}</p></div>`;
}

// Dummy functions for buttons not yet implemented to prevent errors
function optimizeRoute() {
    alert('Route optimization is not yet implemented.');
}