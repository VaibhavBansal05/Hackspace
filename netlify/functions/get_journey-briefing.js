// File: /netlify/functions/get_journey-briefing.js

// Import the Hugging Face Inference library
const { HfInference } = require("@huggingface/inference");

// Initialize the client with your token from environment variables
const hf = new HfInference(process.env.HUGGINGFACE_TOKEN);

exports.handler = async function (event) {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // Get the weather data sent from the browser
    const { metarData, tafData, sigmetData, route } = JSON.parse(event.body);

    // Create a detailed prompt for the AI model
    const userPrompt = `
      Generate a flight briefing for the route: ${route.join(" -> ")}.

      1. SIGMETs (Active Aviation Warnings):
      ${JSON.stringify(sigmetData, null, 2)}

      2. METARs (Current Airport Conditions):
      ${JSON.stringify(metarData, null, 2)}
      
      3. TAFs (Airport Forecasts):
      ${JSON.stringify(tafData, null, 2)}
    `;

    // Make the API call to Hugging Face using the chatCompletion method
    const response = await hf.chatCompletion({
      // Use a powerful and free open-source model
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      messages: [
        {
          role: "system",
          content: `You are an expert aviation meteorologist providing a go/no-go flight briefing. Provide a concise, one-paragraph summary (under 80 words). Start your summary with one of three phrases: "Safe to proceed:", "Travel with caution:", or "Unsafe to proceed:". Briefly explain the main reason for your assessment based on the most critical data.`,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      max_tokens: 250,
    });

    // Extract the response text
    const summaryText = response.choices[0].message.content;

    // Send the summary back to the browser
    return {
      statusCode: 200,
      body: JSON.stringify({ summary: summaryText }),
    };

  } catch (error) {
    console.error("Error calling Hugging Face API:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to get AI briefing from Hugging Face." }),
    };
  }
};