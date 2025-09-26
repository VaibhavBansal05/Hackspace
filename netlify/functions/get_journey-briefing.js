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


// // File: netlify/functions/get_journey-briefing.js

// // Import the Groq library
// const Groq = require("groq-sdk");

// // Initialize the Groq client with your API key
// const groq = new Groq({
//   apiKey: process.env.GROQ_API_KEY,
// });

// exports.handler = async function (event) {
//   if (event.httpMethod !== "POST") {
//     return { statusCode: 405, body: "Method Not Allowed" };
//   }

//   try {
//     const { metarData, sigmetData, route } = JSON.parse(event.body);

//     const userPrompt = `
//       Analyze the following METAR and SIGMET data for the flight route: ${route.join(" -> ")}.

//       METAR Data (Airport Conditions):
//       ${JSON.stringify(metarData, null, 2)}

//       SIGMET Data (Significant En-route Weather):
//       ${JSON.stringify(sigmetData, null, 2)}
//     `;

//     // Make the API call to Groq
//     const completion = await groq.chat.completions.create({
//       messages: [
//         {
//           role: "system",
//           content: `You are an expert aviation meteorologist providing a go/no-go flight briefing. Provide a concise, one-paragraph summary (under 80 words). Start your summary with one of three phrases: "Safe to proceed:", "Travel with caution:", or "Unsafe to proceed:". Briefly explain the reason for your assessment.`,
//         },
//         {
//           role: "user",
//           content: userPrompt,
//         },
//       ],
//       // Use the Llama 3 70-billion parameter model
//       model: "llama3.1-8b-instant",
//     });

//     // Extract the summary text from the response
//     const summaryText = completion.choices[0]?.message?.content || "No summary available.";

//     // Send the summary back to the frontend
//     return {
//       statusCode: 200,
//       body: JSON.stringify({ summary: summaryText }),
//     };

//   } catch (error) {
//     console.error("Error calling Groq API:", error);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: "Failed to get AI briefing from Groq." }),
//     };
//   }
// };













// // File: netlify/functions/get_journey-briefing.js

// // Import the Replicate library
// const Replicate = require("replicate");

// // Initialize the Replicate client with your API token
// const replicate = new Replicate({
//   auth: process.env.REPLICATE_API_TOKEN,
// });

// exports.handler = async function (event) {
//   if (event.httpMethod !== "POST") {
//     return { statusCode: 405, body: "Method Not Allowed" };
//   }

//   try {
//     const { metarData, sigmetData, route } = JSON.parse(event.body);

//     // We combine the system and user prompts for Replicate's input format
//     const input = {
//       top_p: 0.9,
//       prompt: `
//         [INST] You are an expert aviation meteorologist providing a go/no-go flight briefing. Provide a concise, one-paragraph summary (under 80 words). Start your summary with one of three phrases: "Safe to proceed:", "Travel with caution:", or "Unsafe to proceed:". Briefly explain the reason for your assessment. [/INST]

//         Analyze the following METAR and SIGMET data for the flight route: ${route.join(" -> ")}.

//         METAR Data (Airport Conditions):
//         ${JSON.stringify(metarData, null, 2)}

//         SIGMET Data (Significant En-route Weather):
//         ${JSON.stringify(sigmetData, null, 2)}
//       `,
//       temperature: 0.6,
//       max_new_tokens: 256,
//     };

//     // Make the API call to Replicate using the official Llama 3 70B model
//     const output = await replicate.run(
//       "meta/meta-llama-3-8b-instruct",
//       { input }
//     );

//     // The output is an array of strings; we join them to form the full summary.
//     const summaryText = output.join("");

//     return {
//       statusCode: 200,
//       body: JSON.stringify({ summary: summaryText }),
//     };

//   } catch (error) {
//     console.error("Error calling Replicate API:", error);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: "Failed to get AI briefing from Replicate." }),
//     };
//   }
// };


















// // File: netlify/functions/get_journey-briefing.js

// const { OpenAI } = require("openai");

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// exports.handler = async function (event) {
//   if (event.httpMethod !== "POST") {
//     return { statusCode: 405, body: "Method Not Allowed" };
//   }

//   try {
//     const { metarData, sigmetData, route } = JSON.parse(event.body);

//     const userPrompt = `
//       Analyze the following METAR and SIGMET data for the flight route: ${route.join(" -> ")}.
      
//       METAR Data (Airport Conditions):
//       ${JSON.stringify(metarData, null, 2)}

//       SIGMET Data (Significant En-route Weather):
//       ${JSON.stringify(sigmetData, null, 2)}
//     `;

//     const completion = await openai.chat.completions.create({
//       messages: [
//         {
//           role: "system",
//           content: `You are an expert aviation meteorologist providing a go/no-go flight briefing. Provide a concise, one-paragraph summary (under 80 words). Start your summary with one of three phrases: "Safe to proceed:", "Travel with caution:", or "Unsafe to proceed:". Briefly explain the reason for your assessment.`,
//         },
//         {
//           role: "user",
//           content: userPrompt,
//         },
//       ],
//       // Use gpt-4o, OpenAI's latest and globally available model
//       model: "gpt-4o",
//     });
    
//     const summaryText = completion.choices[0].message.content;

//     return {
//       statusCode: 200,
//       body: JSON.stringify({ summary: summaryText }),
//     };

//   } catch (error) {
//     console.error("Error calling OpenAI API:", error);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: "Failed to get AI briefing from OpenAI." }),
//     };
//   }
// };\










// // File: netlify/functions/get_journey-briefing.js

// // Import the Hugging Face Inference library
// const { HfInference } = require("@huggingface/inference");

// // Initialize the client with your token
// const hf = new HfInference(process.env.HUGGINGFACE_TOKEN);

// exports.handler = async function (event) {
//   if (event.httpMethod !== "POST") {
//     return { statusCode: 405, body: "Method Not Allowed" };
//   }

//   try {
//     const { metarData, sigmetData, route } = JSON.parse(event.body);

//     // We format the prompt for the Mistral instruct model
//     const formattedPrompt = `
//       <s>[INST] You are an expert aviation meteorologist providing a go/no-go flight briefing. Provide a concise, one-paragraph summary (under 80 words). Start your summary with one of three phrases: "Safe to proceed:", "Travel with caution:", or "Unsafe to proceed:". Briefly explain the reason for your assessment. [/INST]</s>
//       [INST] Analyze the following METAR and SIGMET data for the flight route: ${route.join(" -> ")}.

//       METAR Data (Airport Conditions):
//       ${JSON.stringify(metarData, null, 2)}

//       SIGMET Data (Significant En-route Weather):
//       ${JSON.stringify(sigmetData, null, 2)} [/INST]
//     `;

//     // Make the API call to Hugging Face
//     const response = await hf.textGeneration({
//       // Use a powerful and popular open-source model
//       model: 'mistralai/Mistral-7B-Instruct-v0.2',
//       inputs: formattedPrompt,
//       parameters: {
//         max_new_tokens: 250,
//         temperature: 0.7,
//         top_p: 0.95,
//       }
//     });

//     const summaryText = response.generated_text;

//     return {
//       statusCode: 200,
//       body: JSON.stringify({ summary: summaryText }),
//     };

//   } catch (error) {
//     console.error("Error calling Hugging Face API:", error);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: "Failed to get AI briefing from Hugging Face." }),
//     };
//   }
// };









// // File: netlify/functions/get_journey-briefing.js

// const { HfInference } = require("@huggingface/inference");

// const hf = new HfInference(process.env.HUGGINGFACE_TOKEN);

// exports.handler = async function (event) {
//   if (event.httpMethod !== "POST") {
//     return { statusCode: 405, body: "Method Not Allowed" };
//   }

//   try {
//     const { metarData, sigmetData, route } = JSON.parse(event.body);

//     const userPrompt = `
//       Analyze the following METAR and SIGMET data for the flight route: ${route.join(" -> ")}.

//       METAR Data (Airport Conditions):
//       ${JSON.stringify(metarData, null, 2)}

//       SIGMET Data (Significant En-route Weather):
//       ${JSON.stringify(sigmetData, null, 2)}
//     `;

//     // Make the API call using the chatCompletion method
//     const response = await hf.chatCompletion({
//       // Use the same powerful and free open-source model
//       model: 'mistralai/Mistral-7B-Instruct-v0.2',
//       messages: [
//         {
//           role: "system",
//           content: `You are an expert aviation meteorologist providing a go/no-go flight briefing. Provide a concise, one-paragraph summary (under 80 words). Start your summary with one of three phrases: "Safe to proceed:", "Travel with caution:", or "Unsafe to proceed:". Briefly explain the reason for your assessment.`,
//         },
//         {
//           role: "user",
//           content: userPrompt,
//         },
//       ],
//       max_tokens: 250,
//     });

//     // Extract the response from the correct place
//     const summaryText = response.choices[0].message.content;

//     return {
//       statusCode: 200,
//       body: JSON.stringify({ summary: summaryText }),
//     };

//   } catch (error) {
//     console.error("Error calling Hugging Face API:", error);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: "Failed to get AI briefing from Hugging Face." }),
//     };
//   }
// };















// // File: netlify/functions/get_journey-briefing.js

// const { HfInference } = require("@huggingface/inference");

// const hf = new HfInference(process.env.HUGGINGFACE_TOKEN);

// exports.handler = async function (event) {
//   if (event.httpMethod !== "POST") {
//     return { statusCode: 405, body: "Method Not Allowed" };
//   }

//   try {
//     // Destructure all four data types from the request
//     const { metarData, tafData, sigmetData, pirepData, route } = JSON.parse(event.body);

//     // Create the new, more detailed prompt for the AI
//     const formattedPrompt = `
//       <s>[INST] You are an expert aviation meteorologist. Your task is to provide a go/no-go flight briefing.
//       Analyze all the provided weather data. Prioritize your analysis in the following order of importance: SIGMETs, METARs, TAFs, then PIREPs.
//       Provide a concise, one-paragraph summary (under 80 words).
//       Start your summary with one of three phrases: "Safe to proceed:", "Travel with caution:", or "Unsafe to proceed:".
//       Briefly explain the main reason for your assessment based on the most critical data. [/INST]</s>
//       [INST] Generate a flight briefing for the route: ${route.join(" -> ")}.

//       1. SIGMETs (Active Aviation Warnings):
//       ${JSON.stringify(sigmetData, null, 2)}

//       2. METARs (Current Airport Conditions):
//       ${JSON.stringify(metarData, null, 2)}
      
//       3. TAFs (Airport Forecasts):
//       ${JSON.stringify(tafData, null, 2)}

//       4. PIREPs (Recent Pilot Reports):
//       ${JSON.stringify(pirepData, null, 2)} [/INST]
//     `;
    
//     const response = await hf.textGeneration({
//       model: 'mistralai/Mistral-7B-Instruct-v0.2',
//       inputs: formattedPrompt,
//       parameters: {
//         max_new_tokens: 250,
//         temperature: 0.7,
//         top_p: 0.95,
//       }
//     });

//     const summaryText = response.generated_text;

//     return {
//       statusCode: 200,
//       body: JSON.stringify({ summary: summaryText }),
//     };

//   } catch (error) {
//     console.error("Error calling Hugging Face API:", error);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: "Failed to get AI briefing from Hugging Face." }),
//     };
//   }
// };





















// // File: netlify/functions/get_journey-briefing.js

// const { HfInference } = require("@huggingface/inference");

// const hf = new HfInference(process.env.HUGGINGFACE_TOKEN);

// exports.handler = async function (event) {
//   if (event.httpMethod !== "POST") {
//     return { statusCode: 405, body: "Method Not Allowed" };
//   }

//   try {
//     const { metarData, tafData, sigmetData, pirepData, tfrData, route } = JSON.parse(event.body);

//     const formattedPrompt = `
//       <s>[INST] You are an expert aviation meteorologist. Your task is to provide a go/no-go flight briefing.
//       Analyze all the provided weather and flight restriction data. Prioritize your analysis in the following order of importance: TFRs, SIGMETs, METARs, TAFs, then PIREPs. A TFR or a severe SIGMET should be the primary reason for an "Unsafe" briefing.
//       Provide a concise, one-paragraph summary (under 80 words).
//       Start your summary with one of three phrases: "Safe to proceed:", "Travel with caution:", or "Unsafe to proceed:".
//       Briefly explain the main reason for your assessment based on the most critical data. [/INST]</s>
//       [INST] Generate a flight briefing for the route: ${route.join(" -> ")}.

//       1. TFRs (Temporary Flight Restrictions - HIGHEST PRIORITY):
//       ${JSON.stringify(tfrData, null, 2)}

//       2. SIGMETs (Active Aviation Warnings):
//       ${JSON.stringify(sigmetData, null, 2)}

//       3. METARs (Current Airport Conditions):
//       ${JSON.stringify(metarData, null, 2)}
      
//       4. TAFs (Airport Forecasts):
//       ${JSON.stringify(tafData, null, 2)}

//       5. PIREPs (Recent Pilot Reports):
//       ${JSON.stringify(pirepData, null, 2)} [/INST]
//     `;
    
//     const response = await hf.textGeneration({
//       model: 'mistralai/Mistral-7B-Instruct-v0.2',
//       inputs: formattedPrompt,
//       parameters: {
//         max_new_tokens: 250,
//         temperature: 0.7,
//         top_p: 0.95,
//       }
//     });

//     const summaryText = response.generated_text;

//     return {
//       statusCode: 200,
//       body: JSON.stringify({ summary: summaryText }),
//     };

//   } catch (error) {
//     console.error("Error calling Hugging Face API:", error);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: "Failed to get AI briefing from Hugging Face." }),
//     };
//   }
// };






















// // File: netlify/functions/get_journey-briefing.js

// const { HfInference } = require("@huggingface/inference");

// const hf = new HfInference(process.env.HUGGINGFACE_TOKEN);

// exports.handler = async function (event) {
//   if (event.httpMethod !== "POST") {
//     return { statusCode: 405, body: "Method Not Allowed" };
//   }

//   try {
//     const { metarData, tafData, sigmetData, pirepData, route } = JSON.parse(event.body);

//     const formattedPrompt = `
//       <s>[INST] You are an expert aviation meteorologist. Your task is to provide a go/no-go flight briefing.
//       Analyze all the provided weather data. Prioritize your analysis in the following order of importance: SIGMETs, METARs, TAFs, then PIREPs.
//       Provide a concise, one-paragraph summary (under 80 words).
//       Start your summary with one of three phrases: "Safe to proceed:", "Travel with caution:", or "Unsafe to proceed:".
//       Briefly explain the main reason for your assessment based on the most critical data. [/INST]</s>
//       [INST] Generate a flight briefing for the route: ${route.join(" -> ")}.

//       1. SIGMETs (Active Aviation Warnings):
//       ${JSON.stringify(sigmetData, null, 2)}

//       2. METARs (Current Airport Conditions):
//       ${JSON.stringify(metarData, null, 2)}
      
//       3. TAFs (Airport Forecasts):
//       ${JSON.stringify(tafData, null, 2)}

//       4. PIREPs (Recent Pilot Reports):
//       ${JSON.stringify(pirepData, null, 2)} [/INST]
//     `;
    
//     const response = await hf.textGeneration({
//       model: 'mistralai/Mistral-7B-Instruct-v0.2',
//       inputs: formattedPrompt,
//       parameters: {
//         max_new_tokens: 250,
//         temperature: 0.7,
//         top_p: 0.95,
//       }
//     });

//     const summaryText = response.generated_text;

//     return {
//       statusCode: 200,
//       body: JSON.stringify({ summary: summaryText }),
//     };

//   } catch (error) {
//     console.error("Error calling Hugging Face API:", error);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: "Failed to get AI briefing from Hugging Face." }),
//     };
//   }
// };











// netlify/functions/get_journey-briefing.js
const fetch = require("node-fetch");

exports.handler = async (event, context) => {
  try {
    const { metarData, tafData, sigmetData, route } = JSON.parse(event.body);

    // Format the aviation briefing prompt
    const formattedPrompt = `
      You are an aviation briefing assistant. Generate a structured pilot-friendly journey weather briefing.
      
      Route: ${route}

      Weather Data:
      ------------------------
      1. SIGMETs (Significant Weather Information):
      ${JSON.stringify(sigmetData, null, 2)}

      2. METARs (Current Observations):
      ${JSON.stringify(metarData, null, 2)}

      3. TAFs (Terminal Forecasts):
      ${JSON.stringify(tafData, null, 2)}

      ------------------------
      Please summarize this into a clear, professional flight briefing with:
      - Key hazards (storms, turbulence, icing, visibility)
      - Weather trends
      - Any significant alerts pilots should note
    `;

    // // Call Hugging Face Inference API
    // const HF_API_URL =
    //   "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";

    // Call Hugging Face Inference API
    const HF_API_URL =
      "https://api-inference.huggingface.co/models/facebook/bart-large-cnn";
    const HF_API_KEY = process.env.HF_API_KEY;

    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: formattedPrompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          return_full_text: false,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Hugging Face API error:", errorText);
      throw new Error("Failed to get AI briefing from Hugging Face.");
    }

    const data = await response.json();
    const aiBriefing = data[0]?.generated_text || "No briefing generated.";

    return {
      statusCode: 200,
      body: JSON.stringify({ briefing: aiBriefing }),
    };
  } catch (error) {
    console.error("Server error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "The AI briefing server failed: " + error.message,
      }),
    };
  }
};
