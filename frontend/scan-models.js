require('dotenv').config({ path: '../.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');
(async () => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const names = [
        "gemini-1.5-flash", "gemini-1.5-flash-001", "gemini-1.5-flash-002",
        "gemini-1.5-pro", "gemini-1.5-pro-001", "gemini-1.5-pro-002",
        "gemini-1.5-flash-latest", "gemini-1.5-pro-latest",
        "gemini-2.0-flash-exp", "gemini-2.0-flash", "gemini-2.0-pro-exp-02-05"
    ];
    for (const name of names) {
        try {
            const model = genAI.getGenerativeModel({ model: name });
            await model.generateContent("test");
            console.log(`✅ ${name}`);
        } catch (e) {
            console.log(`❌ ${name} (${e.status || e.message})`);
        }
    }
})();
