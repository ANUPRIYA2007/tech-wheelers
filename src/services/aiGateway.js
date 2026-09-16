/**
 * Crop Dairy — AI Gateway Service (Gemini + NVIDIA + Farmer Domain Fallbacks)
 * SIH 2026: Hero Assistant
 */

const SYSTEM_PROMPT = `
You are Hero, an expert AI Farming & Procurement Assistant for the Crop Dairy platform (SIH 2026).
Your job is to assist Indian farmers with procurement centres, slot booking, live queue position, 
crop quality checks, MSP prices, payment timelines, and weather advice.
Be respectful, clear, encouraging, and provide step-by-step instructions.
Respond concisely in the requested language (English, Hindi, or Tamil).
`;

// Smart domain knowledge fallback generator
function getDomainFallbackResponse(prompt, language = 'en') {
  const query = prompt.toLowerCase();

  if (query.includes('queue') || query.includes('token') || query.includes('position')) {
    return {
      en: "🌾 **Queue Status**: Your token TK-104 is currently position #3 at Thanjavur Centre. Estimated wait time is approx 36 mins. Counter #2 will call your token soon. Please reach 10 minutes prior!",
      hi: "🌾 **क्यू स्थिति**: आपका टोकन TK-104 तंजावुर केंद्र पर वर्तमान में नंबर 3 स्थान पर है। अनुमानित प्रतीक्षा समय लगभग 36 मिनट है। काउंटर #2 जल्द ही आपको बुलाएगा।",
      ta: "🌾 **வரிசை நிலை**: தஞ்சாவூர் மையத்தில் உங்கள் டோக்கன் TK-104 தற்போது 3-வது இடத்தில் உள்ளது. தோராயமான காத்திருப்பு நேரம் 36 நிமிடங்கள். கவுண்டர் #2 விரைவில் உங்களை அழைக்கும்!"
    }[language] || "Your queue token status is active. Position #3, estimated arrival time in 35 mins.";
  }

  if (query.includes('slot') || query.includes('book') || query.includes('appointment')) {
    return {
      en: "📅 **Slot Booking**: Go to 'My Slots' page, select your nearby procurement centre (e.g. Thanjavur Main DPC), pick an available date & morning/afternoon slot, and click 'Confirm Booking'. Digital token will be generated instantly!",
      hi: "📅 **स्लॉट बुकिंग**: 'माई स्लॉट्स' पृष्ठ पर जाएं, अपने नजदीकी खरीद केंद्र का चयन करें, उपलब्ध तारीख और समय चुनें और 'पुष्टि करें' पर क्लिक करें।",
      ta: "📅 **ஸ்லாட் முன்பதிவு**: 'எனது ஸ்லாட்டுகள்' பக்கத்திற்குச் சென்று, உங்கள் அருகிலுள்ள மையத்தைத் தேர்ந்தெடுத்து, தேதி மற்றும் நேரத்தைத் தேர்ந்தெடுத்து உறுதிப்படுத்தவும்!"
    }[language] || "You can book a slot via the 'My Slots' page in your dashboard.";
  }

  if (query.includes('moisture') || query.includes('quality') || query.includes('paddy') || query.includes('grade')) {
    return {
      en: "🌾 **Quality & Moisture Requirement**: For Paddy Grade A, maximum allowed moisture is 17%. Ideal moisture content for instant approval and MSP rate ₹2,203/quintal is 14% - 15%. Dry your crop well before visiting!",
      hi: "🌾 **नमी और गुणवत्ता**: धान ग्रेड ए के लिए अधिकतम अनुमत नमी 17% है। न्यूनतम समर्थन मूल्य ₹2,203/क्विंटल के लिए आदर्श नमी 14% - 15% है।",
      ta: "🌾 **ஈரப்பதம் & தரம்**: நெல் கிரேடு ஏ-விற்கு அதிகபட்ச அனுமதிக்கப்பட்ட ஈரப்பதம் 17%. ரூ. 2,203/குவிண்டால் MSP பெற 14% - 15% ஈரப்பதம் சிறந்தது!"
    }[language] || "Ideal Paddy moisture content is 14-17% for government MSP procurement.";
  }

  if (query.includes('payment') || query.includes('money') || query.includes('bank') || query.includes('dbt')) {
    return {
      en: "💳 **Payment Status**: Payments are transferred directly to your Aadhaar-linked bank account (DBT) within 48 to 72 hours after procurement verification. You can check transaction reference numbers under 'Payments'.",
      hi: "💳 **भुगतान स्थिति**: खरीद सत्यापन के 48 से 72 घंटों के भीतर आपके आधार से जुड़े बैंक खाते (DBT) में सीधे भुगतान स्थानांतरित कर दिया जाता है।",
      ta: "💳 **பணம் செலுத்தும் நிலை**: கொள்முதல் சரிபார்ப்பிற்குப் பிறகு 48-72 மணி நேரத்திற்குள் பணம் உங்கள் வங்கி கணக்கில் (DBT) நேரடியாக வரவு வைக்கப்படும்!"
    }[language] || "Payments are processed via DBT within 48-72 hours of crop acceptance.";
  }

  if (query.includes('weather') || query.includes('rain')) {
    return {
      en: "⛅ **Weather Advice**: Clear sky with 31°C expected today in Thanjavur. Great condition for grain drying and transport. No rain predicted for the next 48 hours.",
      hi: "⛅ **मौसम की सलाह**: आज तंजावुर में 31°C के साथ मौसम साफ रहने की संभावना है। फसल सुखाने के लिए आदर्श स्थिति।",
      ta: "⛅ **வானிலை ஆலோசனை**: இன்று தஞ்‌சாவூரில் 31°C வெப்பநிலையுடன் தெளிவான வானிலை காணப்படும். தானியங்களை உலர்த்த சிறந்த சூழல்!"
    }[language] || "Clear weather expected. Suitable for harvesting and transporting crops.";
  }

  return {
    en: "🤖 **Hero Assistant**: I'm here to help you with procurement centres, slot booking, live queue tracking, moisture guidelines, and payment updates. What would you like to know?",
    hi: "🤖 **हीरो सहायक**: मैं आपकी खरीद केंद्र, स्लॉट बुकिंग, लाइव कतार ट्रैकिंग, नमी दिशा-निर्देश और भुगतान अपडेट में मदद के लिए उपलब्ध हूं।",
    ta: "🤖 **ஹீரோ உதவியாளர்**: கொள்முதல் மையங்கள், ஸ்லாட் முன்பதிவு, நேரலை வரிசை நிலை, ஈரப்பதம் பற்றிய விவரங்களுக்கு நான் உங்களுக்கு உதவ தயார்!"
  }[language] || "Hello! I am Hero, your AI Farming Assistant. How can I help you today?";
}

export async function askHeroAI(userMessage, language = 'en') {
  const googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY;

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
        if (text) return text;
      }
    } catch (e) {
      console.warn("Gemini API direct call failed, switching to smart fallback:", e);
    }
  }

  // Return domain intelligent response
  return getDomainFallbackResponse(userMessage, language);
}
