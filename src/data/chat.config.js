import { websiteContext } from "./chatKnowledge";

// API setup
const API_KEY = "AIzaSyAg_jzZHqk_YtAdTqpEjDniPtW-73wdcdU";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

export async function generateText(prompt) {
    try {
        if (!API_KEY || API_KEY === "YOUR_API_KEY") {
            throw new Error("Please provide a valid API key");
        }

        if (!prompt?.trim()) {
            throw new Error("Prompt cannot be empty");
        }

        const fullPrompt = `${websiteContext}\n\nUser question: ${prompt}\n\nYour helpful response:`;

        const requestOptions = {
            method: "POST",
            headers: { 
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: fullPrompt }]
                }],
                generationConfig: {
                    temperature: 1,
                    topP: 0.95,
                    topK: 40,
                    maxOutputTokens: 8192
                }
            })
        };

        const response = await fetch(API_URL, requestOptions);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            throw new Error("Invalid response format from API");
        }

        return data.candidates[0].content.parts[0].text;
        
    } catch (error) {
        console.error("ChatBot API Error:", error.message);
        throw new Error("Failed to generate response. Please try again later.");
    }
}
