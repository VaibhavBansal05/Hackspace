// Get references to our HTML elements
const routeInput = document.getElementById('route-input');
const getWeatherBtn = document.getElementById('get-weather-btn');
const loader = document.getElementById('loader');
const finalSummaryDiv = document.getElementById('final-summary');
const weatherSummaryDiv = document.getElementById('weather-summary');

const AWC_API_BASE_URL = 'https://aviationweather.gov/api/data/';
const YOUR_FUNCTION_URL = '/.netlify/functions/get-journey-briefing';

getWeatherBtn.addEventListener('click', handleGetWeather);

async function handleGetWeather() {
    const routeString = routeInput.value.trim();
    if (!routeString) {
        // --- CHANGE HERE ---
        // We no longer pass the element to displayError
        displayError("Please enter at least one ICAO code.");
        return;
    }
    const icaoCodes = routeString.split(',').map(code => code.trim().toUpperCase()).filter(Boolean);

    finalSummaryDiv.innerHTML = '';
    weatherSummaryDiv.innerHTML = '';
    loader.style.display = 'block';

    try {
        const [metarData, sigmetData] = await Promise.all([
            fetchMetarData(icaoCodes),
            fetchSigmetData()
        ]);

        const response = await fetch(YOUR_FUNCTION_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ metarData, sigmetData, route: icaoCodes })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`The AI briefing server failed: ${errorText}`);
        }
        
        const { summary } = await response.json();
        displayFinalSummary(summary);
        displayDetailedCards(metarData);

    } catch (error) {
        console.error("Error during briefing process:", error);
        // --- CHANGE HERE ---
        displayError(error.message);
    } finally {
        loader.style.display = 'none';
    }
}

function displayFinalSummary(summary) {
    let summaryClass = 'alert-info';
    if (summary.startsWith('Unsafe')) summaryClass = 'alert-danger';
    if (summary.startsWith('Travel with caution')) summaryClass = 'alert-warning';
    if (summary.startsWith('Safe')) summaryClass = 'alert-success';
    finalSummaryDiv.innerHTML = `<div class="alert ${summaryClass}"><h3>Journey Assessment</h3><p>${summary}</p></div>`;
}

function displayDetailedCards(metarData) {
    let html = '<h2>Detailed Airport Conditions</h2>';
    metarData.forEach(metar => {
        const flightCategory = metar.fltcat || 'N/A';
        const categoryClass = flightCategory.toLowerCase();
        html += `
            <div class="metar-card ${categoryClass}">
                <h3>
                    <span>${metar.icaoId} - ${metar.reportTime.split('T')[1].replace('Z', 'Z')}</span>
                    <span class="flight-category">${flightCategory}</span>
                </h3>
                <details>
                    <summary>View Raw Data</summary>
                    <p><code>${metar.rawOb}</code></p>
                </details>
            </div>
        `;
    });
    weatherSummaryDiv.innerHTML = html;
}

async function fetchMetarData(icaoCodes) {
    const url = `${AWC_API_BASE_URL}metar?ids=${icaoCodes.join(',')}&format=json`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch METAR data. Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("METAR Fetch Error:", error);
        throw error;
    }
}

async function fetchSigmetData() {
    const url = `${AWC_API_BASE_URL}airsigmet?format=json`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch SIGMET data. Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("SIGMET Fetch Error:", error);
        throw error;
    }
}

// --- FINAL CORRECTED FUNCTION ---
function displayError(message) {
    // This function now always puts the error in the main summary div.
    finalSummaryDiv.innerHTML = `<div class="alert alert-danger">${message}</div>`;
}