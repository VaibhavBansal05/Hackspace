# ✈️ Advanced Flight Planning & AI Weather Briefing System

> 🏆 **Hackathon Quarter-Finalist Project**  
> *This robust application was built entirely from scratch within a grueling 48-hour hackathon, propelling our team to the quarter-finals.*

A sophisticated, full-stack web application designed for pilots and aviation enthusiasts. This system provides comprehensive route planning functionality, real-time aviation weather data (METAR, TAF, SIGMET), and uses an AI model to generate a crucial GO/NO-GO flight safety assessment.

## 🌟 Key Features
- **Dynamic Route Planning:** Calculate distances (using the Haversine formula), fuel requirements, and flight times based on selected aircraft profiles (Light, Turboprop, Jet, Airliner).
- **Altitude Profiling:** Automatically generate and visualize the flight's altitude profile using Chart.js.
- **Real-Time Weather Integration:** Fetches live METAR, TAF, and SIGMET data directly from the official **AWC (Aviation Weather Center) API**.
- **AI-Powered Go/No-Go Assessment:** Uses the powerful Hugging Face `Mistral-7B-Instruct-v0.2` via a Netlify serverless function to parse complex weather data and give an expert meteorological briefing.
- **Interactive UI:** Smooth, responsive, tab-based navigation designed with advanced CSS for maximum usability.

## 🏗️ Technical Architecture 

### Frontend
- **HTML5 & CSS3:** Structural foundation and highly responsive, glassmorphic UI elements featuring a gradient backdrop and distinct visualization cards for different flight rules (VFR, MVFR, IFR, LIFR).
- **Vanilla JavaScript (`script.js`):** 
  - Manages UI state, tab switching, and input validation without strict framework dependencies.
  - Generates mathematical safety and distance metrics.
  - Interacts with Chart.js to render altitude graphs.
  - Concurrently fetches weather data from the Aviation Weather API and proxies it to the backend.

### Backend (Serverless)
- **Netlify Functions (`get_journey-briefing.js`):** 
  - A secure, serverless proxy that acts as the intermediary between the client and the Hugging Face Inference API. 
  - This prevents exposing private API keys to the client while aggregating weather payloads into an engineered prompt for the `Mistral-7B` model.

### AI & Data Providers
- **Hugging Face (`@huggingface/inference`):** Empowers the AI briefing aspect of the project using large language models.
- **AWC API:** Official US Government endpoint (`https://aviationweather.gov/api/data/`) for aeronautical meteorological data.

## 📂 Codebase Breakdown

- `index.html`: The core dashboard layout featuring three tabs (Flight Planning, Weather Brief, Charts & Analysis). Links external libraries (Three.js and Chart.js).
- `script.js`: The central powerhouse. Contains the logic for the flight computer (fuel, distance, speed calculations), API orchestration, and UI updates.
- `style.css`: Features complex styling including layout flexbox grids, active states, custom alert messages based on safety, and specific color-coded cards for weather conditions.
- `netlify/functions/get_journey-briefing.js`: The Node.js serverless function. Parses the `POST` request with weather context, constructs the AI prompt, calls the Mistral-7B model, and returns the briefing.
- `package.json`: Node dependencies primarily used for the backend APIs. Highlights various AI SDKs including Hugging Face, OpenAI, and Groq-sdk (allowing future integration expansions).
- `checkModels.js`: A developer utility script that uses the `@google/generative-ai` SDK to test and list available Gemini AI models based on the configured environment.

## 🚀 Installation & Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/VaibhavBansal05/Hackspace.git
   cd Hackspace
   ```

2. **Install Dependencies:**
   Install backend/Node SDK dependencies:
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your Hugging Face Access Token:
   ```env
   HUGGINGFACE_TOKEN=your_hugging_face_access_token_here
   ```
   *(Optional)* If you wish to run `checkModels.js`, you'll also need a `GEMINI_API_KEY`.

4. **Run using Netlify CLI (For testing the serverless function locally):**
   ```bash
   npm install netlify-cli -g
   netlify dev
   ```
   This simulates the Netlify environment natively on your machine, enabling seamless frontend-to-backend communication.

## 📖 Usage Guide

1. Navigate to the frontend UI.
2. In the **Flight Planning** tab, enter valid 4-letter ICAO codes (e.g., KLAX for Los Angeles, KJFK for New York).
3. Select your aircraft profile, cruise altitude, and preferences.
4. Click **Generate Flight Plan**. The app will calculate your statistics, draw an altitude profile in the **Charts** tab, and fetch a live weather briefing powered by AI in the **Weather Brief** tab.
