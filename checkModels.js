// checkModels.js

// Load environment variables from .env file
require('dotenv').config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Get the API key from the environment variables
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set in the .env file");
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  console.log("Fetching available models...\n");
  try {
    // The listModels() method returns an array of model objects
    const result = await genAI.getGenerativeModel({model: ""}).listModels();
    
    console.log("Models available for generateContent:");
    console.log("------------------------------------");

    result.models.forEach(model => {
      // Check if the model supports the 'generateContent' method
      if (model.supportedGenerationMethods.includes("generateContent")) {
        console.log(model.name); // e.g., "models/gemini-1.0-pro"
      }
    });

  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();