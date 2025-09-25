// File: /netlify/functions/get-journey-briefing.js

// You'll need to run "npm install @google/generative-ai" in your project folder
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Get your API key from Netlify's environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY2);

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { metarData, sigmetData, route } = JSON.parse(event.body);
    if (!metarData || !route) {
      return { statusCode: 400, body: "Missing weather data or route" };
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });

    const prompt = `
    You are an expert aviation dispatcher. Analyze the following weather data for a flight from ${route[0]} to ${route[route.length - 1]}.

    METAR Data (Airport Weather Reports):
    ${JSON.stringify(metarData, null, 2)}

    Active SIGMETs (In-Flight Hazard Warnings):
    ${JSON.stringify(sigmetData, null, 2)}

    Based on all the provided data, generate a concise, 5-sentence journey summary that concludes whether it is safe or unsafe to travel.
    - Start your response with "Safe to travel:", "Travel with caution:", or "Unsafe to travel:".
    - Clearly explain the main complications or hazards (e.g., IFR conditions at destination, widespread thunderstorms en route, severe turbulence).
    - Be direct and do not add conversational fluff.
    `;

    const result = await model.generateContent(prompt);
    const summaryText = result.response.text();

    return {
      statusCode: 200,
      body: JSON.stringify({ summary: summaryText }),
    };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return { statusCode: 500, body: "Error generating journey briefing." };
  }
};