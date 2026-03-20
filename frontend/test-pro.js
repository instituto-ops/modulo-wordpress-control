require('dotenv').config({ path: '../.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');
(async () => {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
        const result = await model.generateContent("Oi, responda apenas 'OK'");
        console.log("SUCCESS:", result.response.text());
    } catch (e) { console.error("FAILED:", e); }
})();
