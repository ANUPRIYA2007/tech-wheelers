/**
 * Crop Dairy — AI Gateway Service (Gemini + IndicTrans2 Neural Translation)
 * SIH 2026: Hero Assistant
 */

import { translateText } from './translationEngine';

const SYSTEM_PROMPT = `
You are Hero, an expert AI Farming & Procurement Assistant for the Crop Dairy platform (SIH 2026).
Your job is to assist Indian farmers with procurement centres, slot booking, live queue position, 
crop quality checks, MSP prices, payment timelines, and weather advice.
Be respectful, clear, encouraging, and provide step-by-step instructions.
`;

// Domain knowledge responses in canonical English
function getDomainFallbackResponse(prompt) {
  const query = prompt.toLowerCase();

  if (query.includes('queue') || query.includes('token') || query.includes('position')) {
    return "🌾 **Queue Status**: Your token TK-104 is currently position #3 at Procurement Centre. Estimated wait time is approx 36 mins. Counter #2 will call your token soon. Please reach 10 minutes prior!";
  }

  if (query.includes('slot') || query.includes('book') || query.includes('appointment')) {
    return "📅 **Slot Booking**: Go to 'My Slots' page, select your nearby procurement centre, pick an available date & time slot, and click 'Confirm Booking'. Digital token will be generated instantly!";
  }

  if (query.includes('moisture') || query.includes('quality') || query.includes('paddy') || query.includes('grade')) {
    return "🌾 **Quality & Moisture Requirement**: For Paddy Grade A, maximum allowed moisture is 17%. Ideal moisture content for instant approval and MSP rate ₹2,203/quintal is 14% - 15%. Dry your crop well before visiting!";
  }

  if (query.includes('payment') || query.includes('money') || query.includes('bank') || query.includes('dbt')) {
    return "💳 **Payment Status**: Payments are transferred directly to your Aadhaar-linked bank account (DBT) within 48 to 72 hours after procurement verification. You can check transaction reference numbers under 'Payments'.";
  }

  if (query.includes('weather') || query.includes('rain')) {
    return "⛅ **Weather Advice**: Clear sky with 31°C expected today. Great condition for grain drying and transport. No rain predicted for the next 48 hours.";
  }

  return "🤖 **Hero Assistant**: I'm here to help you with procurement centres, slot booking, live queue tracking, moisture guidelines, and payment updates. What would you like to know?";
}

export async function askHeroAI(userMessage, language = 'en') {
  const googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  let responseText = '';

  if (googleApiKey && googleApiKey.length > 10 && !googleApiKey.startsWith('AQ.')) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${googleApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\nUser question (${language}): ${userMessage}` }] }]
        })
      });
      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) responseText = text;
      }
    } catch (e) {
      console.warn("Gemini API call failed, switching to IndicTrans2 domain fallback:", e);
    }
  }

  if (!responseText) {
    responseText = getDomainFallbackResponse(userMessage);
  }

  // IndicTrans2 Neural Translation to Target Language
  return await translateText(responseText, 'en', language);
}
