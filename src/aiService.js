import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function generatePlaylist(userMood) {
  try {
    // THE WINNER: gemini-2.5-flash (This is the one that successfully connected for you!)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are a music curator. The user's mood is: "${userMood}".
      Generate a playlist of 5 real songs. 
      Return ONLY a raw JSON array of objects.
      Each object must have exactly these keys: "title" and "artist".
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // THE FIX: Strips away the markdown so React doesn't crash
    text = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(text);
  } catch (error) {
    console.error("Sangeet Error ->", error);
    alert("Failed to get tracks. Check your browser console!");
    return [];
  }
}
