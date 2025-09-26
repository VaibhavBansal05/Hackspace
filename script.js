// // Get references to our HTML elements
// const routeInput = document.getElementById('route-input');
// const getWeatherBtn = document.getElementById('get-weather-btn');
// const loader = document.getElementById('loader');
// const finalSummaryDiv = document.getElementById('final-summary');
// const weatherSummaryDiv = document.getElementById('weather-summary');

// const AWC_API_BASE_URL = 'https://aviationweather.gov/api/data/';
// const YOUR_FUNCTION_URL = '/.netlify/functions/get_journey-briefing';

// getWeatherBtn.addEventListener('click', handleGetWeather);

// async function handleGetWeather() {
//     const routeString = routeInput.value.trim();
//     if (!routeString) {
//         // --- CHANGE HERE ---
//         // We no longer pass the element to displayError
//         displayError("Please enter at least one ICAO code.");
//         return;
//     }
//     const icaoCodes = routeString.split(',').map(code => code.trim().toUpperCase()).filter(Boolean);

//     finalSummaryDiv.innerHTML = '';
//     weatherSummaryDiv.innerHTML = '';
//     loader.style.display = 'block';

//     try {
//         const [metarData, sigmetData] = await Promise.all([
//             fetchMetarData(icaoCodes),
//             fetchSigmetData()
//         ]);

//         const response = await fetch(YOUR_FUNCTION_URL, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ metarData, sigmetData, route: icaoCodes })
//         });

//         if (!response.ok) {
//             const errorText = await response.text();
//             throw new Error(`The AI briefing server failed: ${errorText}`);
//         }
        
//         const { summary } = await response.json();
//         displayFinalSummary(summary);
//         displayDetailedCards(metarData);

//     } catch (error) {
//         console.error("Error during briefing process:", error);
//         // --- CHANGE HERE ---
//         displayError(error.message);
//     } finally {
//         loader.style.display = 'none';
//     }
// }

// function displayFinalSummary(summary) {
//     let summaryClass = 'alert-info';
//     if (summary.startsWith('Unsafe')) summaryClass = 'alert-danger';
//     if (summary.startsWith('Travel with caution')) summaryClass = 'alert-warning';
//     if (summary.startsWith('Safe')) summaryClass = 'alert-success';
//     finalSummaryDiv.innerHTML = `<div class="alert ${summaryClass}"><h3>Journey Assessment</h3><p>${summary}</p></div>`;
// }

// function displayDetailedCards(metarData) {
//     let html = '<h2>Detailed Airport Conditions</h2>';
//     metarData.forEach(metar => {
//         const flightCategory = metar.fltcat || 'N/A';
//         const categoryClass = flightCategory.toLowerCase();
//         html += `
//             <div class="metar-card ${categoryClass}">
//                 <h3>
//                     <span>${metar.icaoId} - ${metar.reportTime.split('T')[1].replace('Z', 'Z')}</span>
//                     <span class="flight-category">${flightCategory}</span>
//                 </h3>
//                 <details>
//                     <summary>View Raw Data</summary>
//                     <p><code>${metar.rawOb}</code></p>
//                 </details>
//             </div>
//         `;
//     });
//     weatherSummaryDiv.innerHTML = html;
// }

// async function fetchMetarData(icaoCodes) {
//     const url = `${AWC_API_BASE_URL}metar?ids=${icaoCodes.join(',')}&format=json`;
//     try {
//         const response = await fetch(url);
//         if (!response.ok) {
//             throw new Error(`Failed to fetch METAR data. Status: ${response.status}`);
//         }
//         return await response.json();
//     } catch (error) {
//         console.error("METAR Fetch Error:", error);
//         throw error;
//     }
// }

// async function fetchSigmetData() {
//     const url = `${AWC_API_BASE_URL}airsigmet?format=json`;
//     try {
//         const response = await fetch(url);
//         if (!response.ok) {
//             throw new Error(`Failed to fetch SIGMET data. Status: ${response.status}`);
//         }
//         return await response.json();
//     } catch (error) {
//         console.error("SIGMET Fetch Error:", error);
//         throw error;
//     }
// }

// // --- FINAL CORRECTED FUNCTION ---
// function displayError(message) {
//     // This function now always puts the error in the main summary div.
//     finalSummaryDiv.innerHTML = `<div class="alert alert-danger">${message}</div>`;
// }





























// // Get references to our HTML elements
// const routeInput = document.getElementById('route-input');
// const getWeatherBtn = document.getElementById('get-weather-btn');
// const loader = document.getElementById('loader');
// const finalSummaryDiv = document.getElementById('final-summary');
// const weatherSummaryDiv = document.getElementById('weather-summary');

// const AWC_API_BASE_URL = 'https://aviationweather.gov/api/data/';
// const YOUR_FUNCTION_URL = '/.netlify/functions/get_journey-briefing';

// getWeatherBtn.addEventListener('click', handleGetWeather);

// // --- Functions to fetch weather data ---
// async function fetchMetarData(icaoCodes) {
//     const url = `${AWC_API_BASE_URL}metar?ids=${icaoCodes.join(',')}&format=json`;
//     try {
//         const response = await fetch(url);
//         if (!response.ok) throw new Error(`Failed to fetch METAR data. Status: ${response.status}`);
//         return await response.json();
//     } catch (error) {
//         console.error("METAR Fetch Error:", error);
//         throw error;
//     }
// }

// async function fetchTafData(icaoCodes) {
//     const url = `${AWC_API_BASE_URL}taf?ids=${icaoCodes.join(',')}&format=json`;
//     try {
//         const response = await fetch(url);
//         if (!response.ok) throw new Error(`Failed to fetch TAF data. Status: ${response.status}`);
//         return await response.json();
//     } catch (error) {
//         console.error("TAF Fetch Error:", error);
//         throw error;
//     }
// }

// async function fetchSigmetData() {
//     const url = `${AWC_API_BASE_URL}airsigmet?format=json`;
//     try {
//         const response = await fetch(url);
//         if (!response.ok) throw new Error(`Failed to fetch SIGMET data. Status: ${response.status}`);
//         return await response.json();
//     } catch (error) {
//         console.error("SIGMET Fetch Error:", error);
//         throw error;
//     }
// }

// // async function fetchPirepData(icaoCodes) {
// //     let url;
// //     // If only one airport, search in a radius. If more than one, search along the route.
// //     if (icaoCodes.length === 1) {
// //         url = `${AWC_API_BASE_URL}pirep?format=json&hoursBeforeNow=1&distance=150&location=${icaoCodes[0]}`;
// //     } else {
// //         // The 'route' parameter only accepts two points. We'll use the first and last airports from the input.
// //         const origin = icaoCodes[0];
// //         const destination = icaoCodes[icaoCodes.length - 1];
// //         url = `${AWC_API_BASE_URL}pirep?format=json&hoursBeforeNow=1&distance=50&route=${origin},${destination}`;
// //     }

// //     try {
// //         const response = await fetch(url);
// //         if (!response.ok) throw new Error(`Failed to fetch PIREP data. Status: ${response.status}`);
// //         return await response.json();
// //     } catch (error) {
// //         console.error("PIREP Fetch Error:", error);
// //         throw error;
// //     }
// // }
// async function fetchPirepData() {
//     // FINAL FIX: The route/location parameters are unreliable.
//     // We will fetch all recent PIREPs and let the AI filter for relevance.
//     const url = `${AWC_API_BASE_URL}pirep?format=json&hoursBeforeNow=1`;
//     try {
//         const response = await fetch(url);
//         if (!response.ok) throw new Error(`Failed to fetch PIREP data. Status: ${response.status}`);
//         return await response.json();
//     } catch (error) {
//         console.error("PIREP Fetch Error:", error);
//         throw error;
//     }
// }


// // --- Main application logic ---
// async function handleGetWeather() {
//     const routeString = routeInput.value.trim();
//     if (!routeString) {
//         displayError("Please enter at least one ICAO code.");
//         return;
//     }
//     const icaoCodes = routeString.split(',').map(code => code.trim().toUpperCase()).filter(Boolean);

//     finalSummaryDiv.innerHTML = '';
//     weatherSummaryDiv.innerHTML = '';
//     loader.style.display = 'block';

//     try {
//         // Fetch all available data sources concurrently
//         const [metarData, tafData, sigmetData, pirepData] = await Promise.all([
//             fetchMetarData(icaoCodes),
//             fetchTafData(icaoCodes),
//             fetchSigmetData(),
//             fetchPirepData(icaoCodes)
//         ]);

//         // Send data to the serverless function
//         const response = await fetch(YOUR_FUNCTION_URL, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ metarData, tafData, sigmetData, pirepData, route: icaoCodes })
//         });

//         if (!response.ok) {
//             const errorText = await response.text();
//             throw new Error(`The AI briefing server failed: ${errorText}`);
//         }
        
//         const { summary } = await response.json();
        
//         // Display results
//         displayFinalSummary(summary);
//         displayDetailedCards({ metarData, tafData, pirepData });

//     } catch (error) {
//         console.error("Error during briefing process:", error);
//         displayError(error.message);
//     } finally {
//         loader.style.display = 'none';
//     }
// }

// // --- Functions to display data on the page ---
// function displayFinalSummary(summary) {
//     let summaryClass = 'alert-info';
//     if (summary.startsWith('Unsafe')) summaryClass = 'alert-danger';
//     if (summary.startsWith('Travel with caution')) summaryClass = 'alert-warning';
//     if (summary.startsWith('Safe')) summaryClass = 'alert-success';
//     finalSummaryDiv.innerHTML = `<div class="alert ${summaryClass}"><h3>Journey Assessment</h3><p>${summary}</p></div>`;
// }

// function displayDetailedCards({ metarData, tafData, pirepData }) {
//     let html = '';
//     html += displayMetarCards(metarData);
//     html += displayTafCards(tafData);
//     html += displayPirepCards(pirepData);
//     weatherSummaryDiv.innerHTML = html;
// }

// function displayMetarCards(metarData) {
//     if (!metarData || metarData.length === 0) return '';
//     let html = '<h2>Airport Conditions (METAR)</h2>';
//     metarData.forEach(metar => {
//         const flightCategory = metar.fltcat || 'N/A';
//         const categoryClass = flightCategory.toLowerCase();
//         html += `
//             <div class="metar-card ${categoryClass}">
//                 <h3>
//                     <span>${metar.icaoId} - ${metar.reportTime.split('T')[1].replace('Z', 'Z')}</span>
//                     <span class="flight-category">${flightCategory}</span>
//                 </h3>
//                 <details>
//                     <summary>View Raw Data</summary>
//                     <p><code>${metar.rawOb}</code></p>
//                 </details>
//             </div>
//         `;
//     });
//     return html;
// }

// function displayTafCards(tafData) {
//     if (!tafData || tafData.length === 0) return '';
//     let html = '<h2>Airport Forecasts (TAF)</h2>';
//     tafData.forEach(taf => {
//         html += `
//             <div class="taf-card">
//                 <h3>${taf.icaoId} - Valid ${taf.issueTime.split('T')[1].replace('Z', 'Z')}</h3>
//                 <p><code>${taf.rawTAF}</code></p>
//             </div>
//         `;
//     });
//     return html;
// }

// function displayPirepCards(pirepData) {
//     if (!pirepData || pirepData.length === 0) return '<h2>Pilot Reports (PIREP)</h2><p>No PIREPs found along the route.</p>';
//     let html = '<h2>Recent Pilot Reports (PIREP)</h2>';
//     pirepData.slice(0, 5).forEach(pirep => {
//         html += `
//             <div class="pirep-card">
//                 <h3>${pirep.reportType} at ${pirep.obsTime.split('T')[1].replace('Z', 'Z')}</h3>
//                 <p><code>${pirep.rawReport}</code></p>
//             </div>
//         `;
//     });
//     return html;
// }

// function displayError(message) {
//     finalSummaryDiv.innerHTML = `<div class="alert alert-danger">${message}</div>`;
// }





















// Get references to our HTML elements
const routeInput = document.getElementById('route-input');
const getWeatherBtn = document.getElementById('get-weather-btn');
const loader = document.getElementById('loader');
const finalSummaryDiv = document.getElementById('final-summary');
const weatherSummaryDiv = document.getElementById('weather-summary');

const AWC_API_BASE_URL = 'https://aviationweather.gov/api/data/';
const YOUR_FUNCTION_URL = '/.netlify/functions/get_journey-briefing';

getWeatherBtn.addEventListener('click', handleGetWeather);

// --- Functions to fetch weather data ---
async function fetchMetarData(icaoCodes) {
    const url = `${AWC_API_BASE_URL}metar?ids=${icaoCodes.join(',')}&format=json`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch METAR data. Status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("METAR Fetch Error:", error);
        throw error;
    }
}

async function fetchTafData(icaoCodes) {
    const url = `${AWC_API_BASE_URL}taf?ids=${icaoCodes.join(',')}&format=json`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch TAF data. Status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("TAF Fetch Error:", error);
        throw error;
    }
}

async function fetchSigmetData() {
    const url = `${AWC_API_BASE_URL}airsigmet?format=json`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch SIGMET data. Status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("SIGMET Fetch Error:", error);
        throw error;
    }
}

/*
async function fetchPirepData(icaoCodes) {
    // FINAL FIX: The route/location parameters are unreliable.
    // We will fetch all recent PIREPs and let the AI filter for relevance.
    const url = `${AWC_API_BASE_URL}pirep?format=json&hoursBeforeNow=1`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch PIREP data. Status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("PIREP Fetch Error:", error);
        throw error;
    }
}
*/


// --- Main application logic ---
async function handleGetWeather() {
    const routeString = routeInput.value.trim();
    if (!routeString) {
        displayError("Please enter at least one ICAO code.");
        return;
    }
    const icaoCodes = routeString.split(',').map(code => code.trim().toUpperCase()).filter(Boolean);

    finalSummaryDiv.innerHTML = '';
    weatherSummaryDiv.innerHTML = '';
    loader.style.display = 'block';

    try {
        // Fetch all data sources concurrently (PIREP removed)
        const [metarData, tafData, sigmetData] = await Promise.all([
            fetchMetarData(icaoCodes),
            fetchTafData(icaoCodes),
            fetchSigmetData(),
            // fetchPirepData(icaoCodes) // PIREP call removed
        ]);

        // Send data to the serverless function (PIREP removed)
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
        
        // Display results (PIREP removed)
        displayFinalSummary(summary);
        displayDetailedCards({ metarData, tafData });

    } catch (error) {
        console.error("Error during briefing process:", error);
        displayError(error.message);
    } finally {
        loader.style.display = 'none';
    }
}

// --- Functions to display data on the page ---
function displayFinalSummary(summary) {
    let summaryClass = 'alert-info';
    if (summary.startsWith('Unsafe')) summaryClass = 'alert-danger';
    if (summary.startsWith('Travel with caution')) summaryClass = 'alert-warning';
    if (summary.startsWith('Safe')) summaryClass = 'alert-success';
    finalSummaryDiv.innerHTML = `<div class="alert ${summaryClass}"><h3>Journey Assessment</h3><p>${summary}</p></div>`;
}

function displayDetailedCards({ metarData, tafData }) {
    let html = '';
    html += displayMetarCards(metarData);
    html += displayTafCards(tafData);
    // html += displayPirepCards(pirepData); // PIREP display call removed
    weatherSummaryDiv.innerHTML = html;
}

function displayMetarCards(metarData) {
    if (!metarData || metarData.length === 0) return '';
    let html = '<h2>Airport Conditions (METAR)</h2>';
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
    return html;
}

function displayTafCards(tafData) {
    if (!tafData || tafData.length === 0) return '';
    let html = '<h2>Airport Forecasts (TAF)</h2>';
    tafData.forEach(taf => {
        html += `
            <div class="taf-card">
                <h3>${taf.icaoId} - Valid ${taf.issueTime.split('T')[1].replace('Z', 'Z')}</h3>
                <p><code>${taf.rawTAF}</code></p>
            </div>
        `;
    });
    return html;
}

/*
function displayPirepCards(pirepData) {
    if (!pirepData || pirepData.length === 0) return '<h2>Pilot Reports (PIREP)</h2><p>No PIREPs found along the route.</p>';
    let html = '<h2>Recent Pilot Reports (PIREP)</h2>';
    pirepData.slice(0, 5).forEach(pirep => {
        html += `
            <div class="pirep-card">
                <h3>${pirep.reportType} at ${pirep.obsTime.split('T')[1].replace('Z', 'Z')}</h3>
                <p><code>${pirep.rawReport}</code></p>
            </div>
        `;
    });
    return html;
}
*/

function displayError(message) {
    finalSummaryDiv.innerHTML = `<div class="alert alert-danger">${message}</div>`;
}