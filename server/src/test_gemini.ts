import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config({ path: 'server/.env' });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function testModels() {
  const models = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-1.5-flash-latest'];
  for (const model of models) {
    try {
      console.log(`Testing model: ${model}...`);
      const res = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: 'Hello, reply with OK' }] }]
      });
      console.log(`Model ${model} SUCCESS:`, res.text);
      return model;
    } catch (e: any) {
      console.error(`Model ${model} error:`, e.message);
    }
  }
}

testModels();
