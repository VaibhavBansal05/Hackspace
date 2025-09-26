// // File: /netlify/functions/get-journey-briefing.js

// // You'll need to run "npm install @google/generative-ai" in your project folder
// const { GoogleGenerativeAI } = require("@google/generative-ai");

// // Get your API key from Netlify's environment variables
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY2);

// exports.handler = async function (event, context) {
//   if (event.httpMethod !== "POST") {
//     return { statusCode: 405, body: "Method Not Allowed" };
//   }

//   try {
//     const { metarData, sigmetData, route } = JSON.parse(event.body);
//     if (!metarData || !route) {
//       return { statusCode: 400, body: "Missing weather data or route" };
//     }

//     const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });

//     const prompt = `
//     You are an expert aviation dispatcher. Analyze the following weather data for a flight from ${route[0]} to ${route[route.length - 1]}.

//     METAR Data (Airport Weather Reports):
//     ${JSON.stringify(metarData, null, 2)}

//     Active SIGMETs (In-Flight Hazard Warnings):
//     ${JSON.stringify(sigmetData, null, 2)}

//     Based on all the provided data, generate a concise, 5-sentence journey summary that concludes whether it is safe or unsafe to travel.
//     - Start your response with "Safe to travel:", "Travel with caution:", or "Unsafe to travel:".
//     - Clearly explain the main complications or hazards (e.g., IFR conditions at destination, widespread thunderstorms en route, severe turbulence).
//     - Be direct and do not add conversational fluff.
//     `;

//     const result = await model.generateContent(prompt);
//     const summaryText = result.response.text();

//     return {
//       statusCode: 200,
//       body: JSON.stringify({ summary: summaryText }),
//     };
//   } catch (error) {
//     console.error("Error calling Gemini API:", error);
//     return { statusCode: 500, body: "Error generating journey briefing." };
//   }
// };


// File: netlify/functions/get_journey-briefing.js

// Import the Groq library
const Groq = require("groq-sdk");

// Initialize the Groq client with your API key
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { metarData, sigmetData, route } = JSON.parse(event.body);

    const userPrompt = `
      Analyze the following METAR and SIGMET data for the flight route: ${route.join(" -> ")}.

      METAR Data (Airport Conditions):
      ${JSON.stringify(metarData, null, 2)}

      SIGMET Data (Significant En-route Weather):
      ${JSON.stringify(sigmetData, null, 2)}
    `;

    // Make the API call to Groq
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert aviation meteorologist providing a go/no-go flight briefing. Provide a concise, one-paragraph summary (under 80 words). Start your summary with one of three phrases: "Safe to proceed:", "Travel with caution:", or "Unsafe to proceed:". Briefly explain the reason for your assessment.`,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      // Use the Llama 3 70-billion parameter model
      model: "llama3.1-8b-instant",
    });

    // Extract the summary text from the response
    const summaryText = completion.choices[0]?.message?.content || "No summary available.";

    // Send the summary back to the frontend
    return {
      statusCode: 200,
      body: JSON.stringify({ summary: summaryText }),
    };

  } catch (error) {
    console.error("Error calling Groq API:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to get AI briefing from Groq." }),
    };
  }
};