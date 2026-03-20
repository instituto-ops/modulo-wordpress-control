require('dotenv').config({ path: '../.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');
(async () => {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const models = ["gemini-2.0-flash", "gemini-2.0-pro-exp-02-05"];
        for (const m of models) {
            try {
                const model = genAI.getGenerativeModel({ model: m });
                const result = await model.generateContent("Respond 'OK'");
                console.log(`SUCCESS WITH ${m}: ${result.response.text()}`);
            } catch (e) { console.log(`FAILED WITH ${m}`); }
        }
    } catch (e) { console.error(e); }
})();
