// // AIzaSyD9PERbTQBeNI4CmZhfg7j8YVxVv9zcqaI

// --- NEW: Import the pipeline function directly from the library ---
import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1';

// Your final script.js file

const routeInput = document.getElementById('route-input');
const getWeatherBtn = document.getElementById('get-weather-btn');
const loader = document.getElementById('loader');
const finalSummaryDiv = document.getElementById('final-summary');
const weatherSummaryDiv = document.getElementById('weather-summary');

const AWC_API_BASE_URL = 'https://aviationweather.gov/api/data/';

// This special path works automatically on Netlify
const YOUR_FUNCTION_URL = '/.netlify/functions/get-journey-briefing';

getWeatherBtn.addEventListener('click', handleGetWeather);

// The rest of the script.js file remains the same as the one provided for Replit...
// ...
let summarizer = null;

async function initializeSummarizer() {
    try {
        console.log('Starting AI model download...');
        
        const progress_callback = (progress) => {
            console.log(`Model loading progress:`, progress);
            getWeatherBtn.textContent = `AI Model Loading... (${Math.round(progress.progress)}%)`;
        };
        
        // The pipeline function is now imported, so this will work.
        summarizer = await pipeline('summarization', 'Xenova/distilbart-cnn-6-6', { progress_callback });
        
        console.log('AI model loaded successfully.');
        getWeatherBtn.disabled = false;
        getWeatherBtn.textContent = 'Get Summary';
    } catch (error) {
        console.error("Error loading AI model:", error);
        weatherSummaryDiv.innerHTML = `<div class="alert alert-danger">Could not load the AI model. Please refresh the page.</div>`;
    }
}

// Disable the button initially and show a loading message
getWeatherBtn.disabled = true;
getWeatherBtn.textContent = 'AI Model Loading...';
initializeSummarizer();

// Add the main click event listener
getWeatherBtn.addEventListener('click', handleGetWeather);

async function handleGetWeather() {
    const routeString = routeInput.value.trim();
    if (!routeString) {
        displayError("Please enter at least one ICAO code.");
        return;
    }
    const icaoCodes = routeString.split(',').map(code => code.trim().toUpperCase()).filter(Boolean);

    weatherSummaryDiv.innerHTML = '';
    loader.style.display = 'block';

    try {
        const [metarData, sigmetData] = await Promise.all([
            fetchMetarData(icaoCodes),
            fetchSigmetData()
        ]);
        await generateWeatherSummary(metarData, sigmetData);
    } catch (error) {
        console.error("Failed to fetch weather data:", error);
        displayError("Could not retrieve weather data. Please check the ICAO codes and try again.");
    } finally {
        loader.style.display = 'none';
    }
}

async function fetchMetarData(icaoCodes) {
    const url = `${API_BASE_URL}metar?ids=${icaoCodes.join(',')}&format=json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`METAR API request failed`);
    return await response.json();
}

async function fetchSigmetData() {
    const url = `${API_BASE_URL}airsigmet?format=json`;
    const response = await fetch(url);
    if (!response.ok) {
        console.error(`SIGMET API request failed`);
        return [];
    }
    return await response.json();
}

async function generateWeatherSummary(metarData, sigmetData) {
    let html = '';
    if (sigmetData.length > 0) {
        html += `<div class="alert alert-warning"><h3>Active SIGMETs</h3>`;
        sigmetData.forEach(sigmet => { html += `<p><strong>${sigmet.hazard.toUpperCase()}:</strong> ${sigmet.rawAirSigmet}</p>`; });
        html += `</div>`;
    } else {
        html += `<div class="alert alert-success"><h3>No Active SIGMETs</h3><p>No significant meteorological hazards reported.</p></div>`;
    }

    metarData.forEach(metar => {
        const flightCategory = metar.fltcat || 'N/A';
        const categoryClass = flightCategory.toLowerCase();
        html += `
            <div class="metar-card ${categoryClass}">
                <h3>
                    <span>${metar.icaoId} - ${metar.reportTime.split('T')[1].replace('Z', 'Z')}</span>
                    <span class="flight-category">${flightCategory}</span>
                </h3>
                <div class="human-summary" id="summary-${metar.icaoId}"><p><em>Generating summary...</em></p></div>
                <details>
                    <summary>View Raw Data</summary>
                    <p><code>${metar.rawOb}</code></p>
                </details>
            </div>
        `;
    });
    weatherSummaryDiv.innerHTML = html;

    for (const metar of metarData) {
        const summaryDiv = document.getElementById(`summary-${metar.icaoId}`);
        if (summarizer && summaryDiv) {
            try {
                let result = await summarizer(metar.rawOb, { max_length: 40, min_length: 10 });
                summaryDiv.innerHTML = `<p>${result[0].summary_text}</p>`;
            } catch(e) {
                summaryDiv.innerHTML = `<p>Could not generate summary.</p>`;
            }
        }
    }
}

function displayError(message) {
    weatherSummaryDiv.innerHTML = `<div class="alert alert-danger">${message}</div>`;
}