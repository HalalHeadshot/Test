import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

export async function factCheck(text) {
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

  return JSON.parse(response);
}
