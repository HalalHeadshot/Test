import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";
import extractFactCheckableClaims from "./semantic-filter.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function analyzeClaims(transcript) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not found");
  }

  const claims = await extractFactCheckableClaims(transcript);

  if (!claims || claims.length === 0) {
    return [];
  }

  // 🔒 YOUR PROMPT — UNCHANGED
  const prompt = `
You are a neutral debate analyst.

You will receive a JSON array of extracted factual claims from a political transcript.
Each element has this structure:
   - "claim": "exact claim text",
   - "reason": "why this needs fact-checking",
   - "confidence": "high|medium|low"
Your tasks:
1. Read and understand all claims.
2. Write a clear, well-structured analytical summary (2–4 short paragraphs) that:
   - Groups related claims together by topic.
   - Explains what each group of claims suggests about the speaker's main points.
   - Avoids adding new facts that are not implied by the claims.
3. Keep a neutral, descriptive tone (no opinions, no fact-checking).
4. Do NOT repeat the JSON or list claims one by one; synthesize them into smooth prose.

Input format:
- You will receive ONLY a JSON array (no extra text around it).

Output format:
- Mention a link to the source you referred to determine whether given source is accurate or inaccurate.
- On the first line in capital letters mention "INACCURATE" whenever received statement is factually false.
- Return ONLY the final written analysis as plain text (no JSON, no bullets, no markdown).

Claims:
${JSON.stringify(claims, null, 2)}

Return ONLY valid JSON in this structure:
[
  {
    "claim": "...",
    "analysis": "...",
    "verdict": "true | false | uncertain"
  }
]
`;

  const client = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = client.getGenerativeModel({
    model: "gemini-2.5-flash-lite"
  });

  const res = await model.generateContent(prompt);
  const text = res.response.text();

  const cleaned = text.replace(/```json\n?|```/g, "").trim();
  return JSON.parse(cleaned);
}

export default analyzeClaims;
