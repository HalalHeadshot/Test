import { GoogleGenerativeAI } from "@google/generative-ai";

export async function factCheck(text) {
  const apiKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "").trim();

  if (!apiKey) {
    console.error("❌ Missing GEMINI_API_KEY in environment variables");
    console.error("Available env vars:", Object.keys(process.env).filter(k => k.includes("GEMINI")));
    throw new Error("GEMINI_API_KEY not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const prompt = `
You are a fact-checking AI for a live debate.
Analyze the claim below.

Claim: "${text}"

Respond ONLY in valid JSON:
{
  "verdict": "TRUE | FALSE | PARTIALLY_TRUE | OPINION | UNSURE",
  "confidence": number between 0 and 1,
  "explanation": "short explanation"
}
`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  try {
    return JSON.parse(response);
  } catch (e) {
    console.error("Failed to parse JSON:", response);
    return {
      verdict: "UNSURE",
      confidence: 0,
      explanation: "Could not parse AI response"
    };
  }
}
