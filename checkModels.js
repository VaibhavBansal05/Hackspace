require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set in your .env file");
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listMyModels() {
  console.log("Attempting to fetch your available models...");

  try {
    const result = await genAI.getGenerativeModel({model: ""}).listModels();
    
    let foundModels = false;
    console.log("------------------------------------");
    console.log("Models you can use for 'generateContent':");
    
    result.models.forEach(model => {
      if (model.supportedGenerationMethods.includes("generateContent")) {
        console.log(" ->", model.name); // e.g., "models/gemini-1.0-pro"
        foundModels = true;
      }
    });

    if (!foundModels) {
        console.log("\n--> No models supporting generateContent found for your API key.");
    }
    console.log("------------------------------------");

  } catch (error) {
    console.error("\nCRITICAL ERROR: Failed to list models.");
    console.error("This likely means there is a fundamental issue with your Google Cloud Project or API Key permissions.");
    console.error("Full error details:", error.message);
  }
}

listMyModels();