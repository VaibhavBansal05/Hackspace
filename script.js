// Your final script.js file

const routeInput = document.getElementById('route-input');
const getWeatherBtn = document.getElementById('get-weather-btn');
const loader = document.getElementById('loader');
const finalSummaryDiv = document.getElementById('final-summary');
const weatherSummaryDiv = document.getElementById('weather-summary');

const AWC_API_BASE_URL = 'https://aviationweather.gov/api/data/';

// This special path works automatically on Netlify to call your back-end function
const YOUR_FUNCTION_URL = '/.netlify/functions/get-journey-briefing';


getWeatherBtn.addEventListener('click', handleGetWeather);

async function handleGetWeather() {
    const routeString = routeInput.value.trim();
    if (!routeString) {
        displayError("Please enter at least one ICAO code.", finalSummaryDiv);
        return;
    }
    const icaoCodes = routeString.split(',').map(code => code.trim().toUpperCase()).filter(Boolean);

    // Clear previous results
    finalSummaryDiv.innerHTML = '';
    weatherSummaryDiv.innerHTML = '';
    loader.style.display = 'block';

    try {
        // 1. Fetch all raw data from aviationweather.gov
        const [metarData, sigmetData] = await Promise.all([
            fetchMetarData(icaoCodes),
            fetchSigmetData()
        ]);

        // 2. Send all data to our Netlify server for the final summary
        const response = await fetch(YOUR_FUNCTION_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ metarData, sigmetData, route: icaoCodes })
        });

        if (!response.ok) {
            throw new Error('The AI briefing server failed to respond. Check the function logs on Netlify.');
        }
        
        const { summary } = await response.json();

        // 3. Display the final AI-generated summary
        displayFinalSummary(summary);

        // 4. Display the detailed per-airport cards for reference
        displayDetailedCards(metarData);

    } catch (error) {
        console.error("Error during briefing process:", error);
        displayError(error.message, finalSummaryDiv);
    } finally {
        loader.style.display = 'none';
    }
}

function displayFinalSummary(summary) {
    let summaryClass = 'alert-info'; // Default
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

// Helper functions to fetch data from AWC with better logging
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

function displayError(message, element) {
    element.innerHTML = `<div class="alert alert-danger">${message}</div>`;
}